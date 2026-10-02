import { useCallback, useEffect, useRef, useState } from "react";
import { BellRing, ChevronDown, Loader2, MessageCircle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCallNow } from "@/hooks/useCallNow";
import { useRequestWhatsAppCallPermission } from "@/hooks/useWhatsAppPermission";
import type { MotherProfile } from "@/hooks/useMother";
import {
  askBlockedLabel,
  askHeldLabel,
  permissionLabel,
  permissionWindowLabel,
} from "@/lib/whatsappPermission";

const ITEM =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-gray-900 transition-colors hover:bg-black/[0.04] disabled:pointer-events-none disabled:opacity-50";

/** Closes the menu on an outside mousedown or Escape while it's open. */
function useDismiss(open: boolean, rootRef: React.RefObject<HTMLDivElement | null>, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, rootRef, close]);
}

/** "Call now" split into phone / WhatsApp, plus the WhatsApp permission ask. */
export function CallNowMenu({
  mother,
  disabled,
  onChanged,
}: {
  mother: MotherProfile;
  disabled: boolean;
  onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { callNow, isPending } = useCallNow(mother.id, onChanged);
  // Owned here, not by the menu item: its post-failure cooloff must outlive
  // the menu closing.
  const permission = useRequestWhatsAppCallPermission(mother.id, onChanged);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);

  const toggle = () => {
    // Refresh on OPEN rather than polling: her WhatsApp permission changes on
    // a Meta webhook this tab never sees, and only matters when about to call.
    if (!open) onChanged();
    setOpen((o) => !o);
  };

  const call = (route: "phone" | "whatsapp") => {
    setOpen(false);
    void callNow(route);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        size="sm"
        onClick={toggle}
        disabled={disabled || isPending}
        aria-haspopup="menu"
        aria-expanded={open}
        title={disabled ? "Cannot call. Consent withdrawn." : "Trigger an immediate check-in call."}
      >
        {isPending ? <Loader2 className="animate-spin" /> : <PhoneCall />}
        Call now
        <ChevronDown className="opacity-70" />
      </Button>

      {open && <CallNowItems mother={mother} permission={permission} onCall={call} />}
    </div>
  );
}

type PermissionAsk = ReturnType<typeof useRequestWhatsAppCallPermission>;

function CallNowItems({
  mother,
  permission,
  onCall,
}: {
  mother: MotherProfile;
  permission: PermissionAsk;
  onCall: (route: "phone" | "whatsapp") => void;
}) {
  const wc = mother.whatsappCall;
  const whatsappAvailable = wc?.available ?? false;
  const windowLabel = permissionWindowLabel(wc?.permissionStatus, wc?.permissionExpiresAt);

  return (
    <div
      role="menu"
      className="absolute right-0 bottom-full z-20 mb-2 w-72 rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5"
    >
      <button type="button" role="menuitem" className={ITEM} onClick={() => onCall("phone")}>
        <PhoneCall className="size-3.5" />
        Phone call
      </button>
      <button
        type="button"
        role="menuitem"
        className={ITEM}
        disabled={!whatsappAvailable}
        onClick={() => onCall("whatsapp")}
      >
        <MessageCircle className="size-3.5" />
        WhatsApp call
        <span className="ml-auto text-[10px] text-gray-400">
          {whatsappAvailable ? windowLabel : permissionLabel(wc?.permissionStatus)}
        </span>
      </button>
      {/* Only while blocked on her permission — re-asking a granted mother
          would burn one of Meta's two weekly slots for nothing. */}
      {!whatsappAvailable && <AskPermissionItem mother={mother} permission={permission} />}
    </div>
  );
}

function AskPermissionItem({ mother, permission }: { mother: MotherProfile; permission: PermissionAsk }) {
  const { requestPermission, isPending: isAsking, blocked } = permission;
  const wc = mother.whatsappCall;
  const canAsk = wc?.canRequestPermission ?? false;

  return (
    <button
      type="button"
      role="menuitem"
      className={ITEM}
      disabled={!canAsk || isAsking || blocked !== null}
      onClick={() => void requestPermission()}
    >
      {isAsking ? <Loader2 className="size-3.5 animate-spin" /> : <BellRing className="size-3.5" />}
      Ask her to allow WhatsApp calls
      {(blocked !== null || !canAsk) && (
        <span className="ml-auto text-[10px] text-gray-400">
          {askHeldLabel(blocked) ?? askBlockedLabel(wc?.canRequestReason) ?? "unavailable"}
        </span>
      )}
    </button>
  );
}

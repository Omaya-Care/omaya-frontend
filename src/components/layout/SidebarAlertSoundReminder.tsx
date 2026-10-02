import { useState } from "react";
import { Link } from "react-router-dom";
import { BellOff, X } from "lucide-react";
import { useAlertSoundEnabled } from "@/hooks/useAlertSound";
import { usePermissions } from "@/hooks/usePermissions";
import { isExpertAccount } from "@/lib/auth";
import { cn } from "@/lib/utils";

/**
 * Bottom-of-sidebar nudge, shown only to `escalate`-capable clinicians who have
 * MUTED the escalation chime — it's the de-facto real-time notifier. Dismissible
 * for this page load only (deliberately not persisted), so a still-muted
 * clinician is reminded again next session. Reads the shared mute store, so
 * turning sound on anywhere (Settings, the notifications panel, the first-login
 * prompt) hides it live.
 */
export function SidebarAlertSoundReminder({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  /** Close the mobile drawer when the link is followed. */
  onNavigate?: () => void;
}) {
  const { can } = usePermissions();
  const soundOn = useAlertSoundEnabled();
  const [dismissed, setDismissed] = useState(false);

  if (!can("escalate") || isExpertAccount() || soundOn || dismissed) return null;

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-1 rounded-lg bg-[#F7E8F0] py-1.5 text-[#7A2850]",
        collapsed ? "justify-center px-0" : "justify-between pl-2.5 pr-1",
      )}
    >
      <Link
        to="/settings?section=notifications"
        onClick={onNavigate}
        aria-label="Alert sound is off — open notification settings"
        title={collapsed ? "Alert sound is off" : undefined}
        className="flex min-w-0 items-center gap-2 text-xs font-medium transition-colors hover:text-[#5E1E3D]"
      >
        <BellOff size={15} strokeWidth={1.75} className="shrink-0" />
        {!collapsed && <span className="truncate">Alert sound is off</span>}
      </Link>
      {!collapsed && (
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss alert sound reminder"
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-[#7A2850]/60 transition-colors hover:bg-black/[0.04] hover:text-[#7A2850]"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

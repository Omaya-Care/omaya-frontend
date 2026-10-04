import { useState } from "react";
import { BellRing } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { isExpertAccount } from "@/lib/auth";
import {
  hasSeenAlertPrompt,
  isAlertSoundEnabled,
  markAlertPromptSeen,
  setAlertSoundEnabled,
} from "@/lib/alert-prefs";

/** Whether the one-time prompt has anything left to offer. */
function shouldOffer(): boolean {
  if (hasSeenAlertPrompt()) return false;
  // Nothing to ask if OS notifications are already denied AND the chime is on.
  // (Read-only — this runs during render, so it records nothing.)
  const notifDenied = typeof Notification !== "undefined" && Notification.permission === "denied";
  return !(notifDenied && isAlertSoundEnabled());
}

/**
 * One-time first-login prompt offering to turn on the escalation chime (and,
 * via `unlock`, OS-notification permission) on a real user gesture — audio is
 * gated by the autoplay policy and notifications need an explicit grant.
 *
 * Only for roles with `escalate`, and only once ever: every dismissal path
 * records "seen". Writes go through the shared alert-prefs store, so the
 * notifications panel, the Settings toggle and the sidebar reminder all follow.
 * Mounted once in AppLayout, which owns the `useEscalationSound` instance.
 */
export function AlertSoundPrompt({ unlock }: { unlock: () => void }) {
  const { can } = usePermissions();
  // An expert-roster account never polls /alerts, so a chime prompt is noise.
  const canEscalate = can("escalate") && !isExpertAccount();
  // `undecided` until permissions load and we've checked once; the check runs
  // during render (no effect) and only the first time `escalate` is granted.
  const [decision, setDecision] = useState<"undecided" | "open" | "closed">("undecided");
  if (canEscalate && decision === "undecided") {
    setDecision(shouldOffer() ? "open" : "closed");
  }

  const dismiss = () => {
    markAlertPromptSeen();
    setDecision("closed");
  };

  const enable = () => {
    // Inside the click gesture, so unlock() may resume audio + ask permission.
    unlock();
    setAlertSoundEnabled(true);
    markAlertPromptSeen();
    setDecision("closed");
  };

  return (
    <Dialog open={canEscalate && decision === "open"} onOpenChange={(o) => !o && dismiss()}>
      <DialogContent className="max-w-sm rounded-2xl sm:rounded-2xl">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2 text-lg font-medium text-gray-900">
            <BellRing className="size-[18px] shrink-0 text-[#7A2850]" />
            Turn on alert sounds?
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed text-gray-500">
            While Omaya is open in a browser tab, it plays a chime and — with your permission —
            shows a desktop notification the moment a mother's check-in is flagged crisis or
            elevated, even if the tab isn't in focus. You can change this any time in Settings.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-2 gap-2 sm:gap-2">
          <Button variant="outline" onClick={dismiss}>
            Not now
          </Button>
          <Button onClick={enable}>
            <BellRing />
            Enable alert sounds
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

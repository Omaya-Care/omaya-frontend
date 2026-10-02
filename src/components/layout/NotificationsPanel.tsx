import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, BellOff, BellRing, X } from "lucide-react";
import type { AlertRow } from "@/hooks/useAlerts";
import { useAlertSoundEnabled } from "@/hooks/useAlertSound";
import { seenKey } from "@/hooks/useSeenAlerts";
import { setAlertSoundEnabled } from "@/lib/alert-prefs";
import { cn } from "@/lib/utils";
import { formatTimeLeft, lastUpdatedLabel } from "@/components/escalations/alert-display";

/** Right-hand notifications drawer. Open escalation alerts are the
 *  notifications — the same GET /alerts?status=open poll AppLayout runs. */
export function NotificationsPanel({
  open,
  onClose,
  alerts,
  loading,
  failed,
  stale,
  lastSuccessAt,
  forbidden,
  audioBlocked,
  unlock,
  seen,
  onSeen,
}: {
  open: boolean;
  onClose: () => void;
  alerts: AlertRow[];
  loading: boolean;
  failed: boolean;
  /** The live feed has failed repeatedly — rows below may be out of date. */
  stale: boolean;
  lastSuccessAt: number | null;
  /** 403 on /alerts — this role can't see escalations, so "all caught up"
   *  would be a false all-clear. */
  forbidden: boolean;
  audioBlocked: boolean;
  unlock: () => void;
  seen: Set<string>;
  onSeen: (alert: AlertRow) => void;
}) {
  const navigate = useNavigate();
  const soundOn = useAlertSoundEnabled();
  // Audible only when the pref is ON *and* the autoplay gate is crossed — the
  // label must never claim sound is armed while it's silently blocked.
  const effectivelyOn = soundOn && !audioBlocked;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function toggleSound() {
    if (effectivelyOn) {
      setAlertSoundEnabled(false);
    } else {
      setAlertSoundEnabled(true);
      unlock(); // user gesture — crosses the autoplay gate + asks OS-notification permission
    }
  }

  function openAlerts(alert?: AlertRow) {
    if (alert) onSeen(alert);
    onClose();
    navigate(alert ? `/escalations?alert=${encodeURIComponent(alert.id)}` : "/escalations");
  }

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <aside
        aria-label="Notifications"
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed bottom-2 right-2 top-2 z-50 flex w-96 max-w-[calc(100vw-1rem)] flex-col rounded-2xl bg-white shadow-xl",
          "transition-transform duration-200 ease-out motion-reduce:transition-none",
          open ? "translate-x-0" : "translate-x-[calc(100%+1rem)]",
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-2xl font-normal tracking-tight text-foreground">Notifications</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleSound}
              aria-label={`Alert sound ${effectivelyOn ? "on" : "off"}`}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-[#7A2850] hover:bg-[#F7E8F0]"
            >
              {effectivelyOn ? <BellRing size={13} /> : <BellOff size={13} />}
              {effectivelyOn ? "Disable alert sound" : "Enable alert sound"}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-2">
          {!forbidden && failed && alerts.length > 0 && (
            <p
              role="alert"
              className={cn(
                "mx-3 mb-2 rounded-lg px-3 py-2 text-xs",
                stale ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800",
              )}
            >
              {stale ? "Live alerts paused — this list may be out of date." : "Couldn't refresh alerts."}{" "}
              {lastUpdatedLabel(lastSuccessAt)}.
            </p>
          )}
          {forbidden ? (
            <Empty title="No notifications" body="Escalation alerts go to staff who handle escalations." />
          ) : failed && alerts.length === 0 ? (
            <Empty title="Couldn't load alerts" body="Retrying automatically — check your connection." />
          ) : loading ? (
            <Empty title="Loading alerts…" pulse />
          ) : alerts.length === 0 ? (
            <Empty title="You're all caught up" body="Crisis and elevated alerts will appear here." />
          ) : (
            alerts.map((a) => {
              const overdue = a.timeLeftMinutes <= 0;
              const isSeen = seen.has(seenKey(a));
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => openAlerts(a)}
                  className={cn(
                    "flex w-full items-start gap-2.5 border-b border-gray-100 px-4 py-2.5 text-left transition-colors last:border-b-0",
                    isSeen ? "bg-gray-50 opacity-60 hover:opacity-80" : "hover:bg-gray-50",
                  )}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-gray-900">{a.motherName}</span>
                      <span className={cn("shrink-0 text-xs font-medium", overdue ? "text-red-600" : "text-gray-400")}>
                        {formatTimeLeft(a.timeLeftMinutes)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {a.provisionalReason === "post_call_failed"
                        ? "Needs review"
                        : a.severity.charAt(0).toUpperCase() + a.severity.slice(1)}
                      {a.dayPostpartum != null && ` · Day ${a.dayPostpartum}`}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <button
          type="button"
          onClick={() => openAlerts()}
          className="border-t border-gray-100 px-4 py-2.5 text-center text-xs font-medium text-[#7A2850] hover:bg-gray-50"
        >
          View all escalations
        </button>
      </aside>
    </>
  );
}

function Empty({ title, body, pulse }: { title: string; body?: string; pulse?: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-4 py-10 text-center">
      <Bell size={22} className={cn("text-gray-300", pulse && "animate-pulse")} />
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {body && <p className="text-xs text-gray-400">{body}</p>}
    </div>
  );
}

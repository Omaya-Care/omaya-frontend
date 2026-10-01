import { useEffect, useRef } from "react";
import { WifiOff } from "lucide-react";
import { lastUpdatedLabel } from "@/components/escalations/alert-display";


/**
 * Persistent warning while the open-alerts poll keeps failing (review gate H2).
 * A failed poll keeps the last rows on screen, so without this a dead feed
 * looks exactly like a quiet one — and a new L4 in that window would neither
 * chime nor toast. Also tells a backgrounded tab once, via an OS notification
 * (when permitted), because nobody is looking at the banner.
 */
export function LiveAlertsPausedBanner({
  stale,
  lastSuccessAt,
}: {
  stale: boolean;
  lastSuccessAt: number | null;
}) {
  const notified = useRef(false);
  useEffect(() => {
    if (!stale) {
      notified.current = false;
      return;
    }
    if (notified.current || !document.hidden) return;
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    notified.current = true;
    try {
      const n = new Notification("Omaya Care: live alerts paused", {
        body: "The portal can't reach Omaya. New escalations won't sound until it reconnects.",
        tag: "omaya-alerts-paused",
        icon: "/android-chrome-192x192.png",
        requireInteraction: true,
      });
      n.onclick = () => {
        window.focus();
        n.close();
      };
    } catch {
      // Notifications can throw without a service worker; the banner remains.
    }
  }, [stale]);

  if (!stale) return null;
  return (
    <div
      role="alert"
      className="mb-2 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800"
    >
      <WifiOff className="mt-0.5 size-4 shrink-0" />
      <p>
        <span className="font-medium">Live alerts paused.</span> The portal can't reach Omaya, so new escalations
        won't appear or sound. {lastUpdatedLabel(lastSuccessAt)} — retrying automatically.
      </p>
    </div>
  );
}

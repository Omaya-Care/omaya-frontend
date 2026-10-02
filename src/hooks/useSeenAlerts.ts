import { useCallback, useState } from "react";
import type { AlertRow } from "@/hooks/useAlerts";

// Per-browser "seen" marks for clicked notifications. A convenience only —
// storage failures just mean the grey-out doesn't survive a refresh. Seen
// alerts stay listed (they're open until acknowledged) but drop out of the
// bell badge count.
const SEEN_KEY = "omaya_seen_alerts_v1";

export function seenKey(a: AlertRow): string {
  return a.id;
}

function loadSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]") as string[]);
  } catch {
    return new Set();
  }
}

/** Seen-state shared by the bell badge (AppLayout) and the panel's grey-out. */
export function useSeenAlerts(alerts: AlertRow[]) {
  const [seen, setSeen] = useState(loadSeen);

  const markSeen = useCallback(
    (alert: AlertRow) => {
      const key = seenKey(alert);
      if (seen.has(key)) return;
      // Keep only marks for alerts still in the list so the stored set can't grow forever.
      const live = new Set(alerts.map(seenKey));
      const next = new Set([...seen].filter((k) => live.has(k)));
      next.add(key);
      setSeen(next);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
      } catch {
        // best-effort
      }
    },
    [alerts, seen],
  );

  const unseenCount = alerts.filter((a) => !seen.has(seenKey(a))).length;
  return { seen, markSeen, unseenCount };
}

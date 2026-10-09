import { useCallback, useState } from "react";
import type { AlertRow } from "@/hooks/useAlerts";
import { getClinician } from "@/lib/auth";

// Per-browser "seen" marks for clicked notifications. A convenience only —
// storage failures just mean the grey-out doesn't survive a refresh. Seen
// alerts stay listed (they're open until acknowledged) but drop out of the
// bell badge count.
//
// Keyed per clinician: a shared ward monitor can change hands, and one
// clinician opening an alert must not silence the badge for the next.
const SEEN_KEY_PREFIX = "omaya_seen_alerts_v2:";

// Folds in severity so an alert that escalates under the same id (e.g.
// elevated → crisis) counts as unseen again — the upgrade is new information.
export function seenKey(a: AlertRow): string {
  return `${a.id}:${a.severity}`;
}

function loadSeen(storageKey: string | null): Set<string> {
  if (!storageKey) return new Set();
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((k) => typeof k === "string") : []);
  } catch {
    // Unreadable storage fails to "nothing seen" — the badge over-counts
    // rather than hiding an alert.
    return new Set();
  }
}

/** Seen-state shared by the bell badge (AppLayout) and the panel's grey-out. */
export function useSeenAlerts(alerts: AlertRow[]) {
  const clinicianId = getClinician()?.id;
  const storageKey = clinicianId ? `${SEEN_KEY_PREFIX}${clinicianId}` : null;
  const [state, setState] = useState(() => ({ storageKey, seen: loadSeen(storageKey) }));
  // A different clinician signed in on this browser: start from their marks.
  let seen = state.seen;
  if (state.storageKey !== storageKey) {
    seen = loadSeen(storageKey);
    setState({ storageKey, seen });
  }

  const markSeen = useCallback(
    (alert: AlertRow) => {
      const key = seenKey(alert);
      if (seen.has(key)) return;
      // Keep only marks for alerts still in the list so the stored set can't grow forever.
      const live = new Set(alerts.map(seenKey));
      const next = new Set([...seen].filter((k) => live.has(k)));
      next.add(key);
      setState({ storageKey, seen: next });
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify([...next]));
      } catch {
        // best-effort
      }
    },
    [alerts, seen, storageKey],
  );

  const unseenCount = alerts.filter((a) => !seen.has(seenKey(a))).length;
  return { seen, markSeen, unseenCount };
}

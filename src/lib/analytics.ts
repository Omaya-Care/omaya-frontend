// Product analytics for the hospital portal (Omaya tracking plan, KPI 8).
//
// The portal never talks to PostHog directly: it posts the event name and the
// row id to the Core API (`POST /analytics/portal-events`), which reads every
// other detail itself and forwards the event with the same safety filter as
// all server events. So no analytics key lives in the browser, nothing is
// autocaptured, and nothing is recorded.
//
// Fire-and-forget on its own `fetch`, NOT the shared axios client: that
// client toasts on 5xx and logs out on 401, and analytics must never show a
// clinician an error or end her session.

import { onSessionReset } from "./auth-api";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

type PortalEvent =
  | { event: "alert_viewed"; alert_id: string }
  | { event: "conversation_opened"; call_id: string };

// One report per row per session: re-renders, polling and toggling back to
// the same alert don't inflate the counts.
const reported = new Set<string>();
onSessionReset(() => reported.clear());

function send(body: PortalEvent, key: string): void {
  if (reported.has(key)) return;
  reported.add(key);
  try {
    void fetch(`${BASE_URL}/analytics/portal-events`, {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => undefined);
  } catch {
    // Never let analytics break the page.
  }
}

/** A clinician opened an alert. */
export function trackAlertViewed(alertId: string): void {
  send({ event: "alert_viewed", alert_id: alertId }, `alert:${alertId}`);
}

/** A clinician opened a call or WhatsApp transcript. */
export function trackConversationOpened(callId: string): void {
  send({ event: "conversation_opened", call_id: callId }, `call:${callId}`);
}

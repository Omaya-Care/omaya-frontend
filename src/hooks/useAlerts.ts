import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { api, extractApiError } from "@/lib/api";

export type AlertStatus = "open" | "acknowledged" | "resolved";

export interface AlertRow {
  id: string;
  callId: string;
  motherId: string;
  motherName: string;
  dayPostpartum: number | null;
  severity: string;
  createdAt: string;
  /** Negative once the SLA deadline has passed. */
  timeLeftMinutes: number;
  status: AlertStatus;
  /** Open L4 only: paged / unreached / blocked / pending; else not_applicable. */
  pageStatus: string;
  /** null = authoritative; "crisis" / "post_call_failed" = provisional row. */
  provisionalReason: string | null;
  acknowledgedAt: string | null;
  acknowledgedByName: string | null;
  resolvedAt: string | null;
  resolvedByName: string | null;
  /** What the clinician recorded doing, captured on resolve. */
  resolutionNote: string | null;
}

const POLL_MS = 15_000;
/** While the caller is 403'd, keep retrying slowly: access can come back
 *  (role re-grant, tenant restored) and the L4 feed must resume without a
 *  reload. Normal cadence returns on the first successful poll. */
export const FORBIDDEN_RETRY_MS = 60_000;
/** Consecutive failed polls before the live feed reads as paused (~30s). */
export const STALE_AFTER_FAILURES = 2;

function toRow(r: Record<string, unknown>): AlertRow {
  return {
    id: r.id as string,
    callId: r.call_id as string,
    motherId: r.mother_id as string,
    motherName: (r.mother_name as string) ?? "",
    dayPostpartum: (r.day_postpartum as number | null) ?? null,
    severity: (r.severity as string) ?? "",
    createdAt: (r.created_at as string) ?? "",
    timeLeftMinutes: (r.time_left_minutes as number) ?? 0,
    status: r.status as AlertStatus,
    pageStatus: (r.page_status as string) ?? "not_applicable",
    provisionalReason: (r.provisional_reason as string | null) ?? null,
    acknowledgedAt: (r.acknowledged_at as string | null) ?? null,
    acknowledgedByName: (r.acknowledged_by_name as string | null) ?? null,
    resolvedAt: (r.resolved_at as string | null) ?? null,
    resolvedByName: (r.resolved_by_name as string | null) ?? null,
    resolutionNote: (r.resolution_note as string | null) ?? null,
  };
}

/** History tabs show the newest HISTORY_LIMIT (the backend's default cap). */
export const HISTORY_LIMIT = 100;

const fetchRows = (status: AlertStatus) =>
  api
    .get("/alerts", { params: status === "open" ? { status } : { status, limit: HISTORY_LIMIT } })
    .then((res) => ((res.data?.alerts ?? []) as Record<string, unknown>[]).map(toRow));

// ── Open alerts: ONE shared poller ──────────────────────────────────────
// The bell, the chime and the Escalations "Open" tab all read this store, so
// a tab polls /alerts?status=open exactly once per 15s (ADR §25's budget) and
// an acknowledge/resolve refreshes all of them at once. Polls in a hidden tab
// too: the chime and OS notification are the point.

interface OpenState {
  rows: AlertRow[] | null;
  /** Consecutive failed polls; 0 after any success. */
  failures: number;
  /** ms epoch of the last successful poll; null until the first one. */
  lastSuccessAt: number | null;
  /** 403 — the caller's role lacks `escalate` (for now). Polling backs off to
   *  FORBIDDEN_RETRY_MS and recovers on the next success. */
  forbidden: boolean;
}

const INITIAL_OPEN: OpenState = { rows: null, failures: 0, lastSuccessAt: null, forbidden: false };
let openState: OpenState = INITIAL_OPEN;
const openListeners = new Set<() => void>();
let openTimer: number | undefined;
let openTimerMs = POLL_MS;
let openGeneration = 0;
// Latest-wins: only the most recently ISSUED poll may apply. An interval poll
// in flight when an ack triggers invalidateAlerts() can otherwise land last
// and bring the acknowledged alert back (and re-chime it).
let openSeq = 0;
// Seq of the newest poll the server ANSWERED (rows or a 403). A failure counts
// toward the paused state even from a superseded poll — the API timeout equals
// the 15s cadence, so on a slow link the next tick (or a tab return) supersedes
// every poll before it times out, and dropping those failures let a frozen
// feed pass for a live one with new L4 alerts never shown. A newer answer
// cancels it, and a superseded failure only ever counts: it never changes
// the forbidden state or the cadence.
let openAnsweredSeq = 0;

function setOpen(next: OpenState) {
  openState = next;
  openListeners.forEach((l) => l());
}

/** (Re)arm the shared poll interval at `ms`; no-op if already at that cadence. */
function scheduleOpen(ms: number) {
  if (openTimer !== undefined && openTimerMs === ms) return;
  window.clearInterval(openTimer);
  openTimerMs = ms;
  openTimer = window.setInterval(pollOpen, ms);
}

function pollOpen() {
  const gen = openGeneration;
  const seq = ++openSeq;
  const current = () => gen === openGeneration && seq === openSeq;
  fetchRows("open")
    .then((rows) => {
      if (!current()) return;
      openAnsweredSeq = seq;
      scheduleOpen(POLL_MS);
      setOpen({ rows, failures: 0, lastSuccessAt: Date.now(), forbidden: false });
    })
    .catch((err) => {
      if (gen !== openGeneration || seq < openAnsweredSeq) return;
      if (extractApiError(err).status === 403) {
        if (!current()) return;
        openAnsweredSeq = seq;
        // Back off, never stop: the layout keeps this subscription mounted,
        // so a stopped poller would leave the bell/chime dead until reload.
        scheduleOpen(FORBIDDEN_RETRY_MS);
        setOpen({ ...INITIAL_OPEN, rows: [], forbidden: true });
        return;
      }
      // Keep the last good rows, but count the failure: after
      // STALE_AFTER_FAILURES the UI must say the feed is paused, never let a
      // stale list pass for a live one. A non-403 failure is an outage, not a
      // permission answer: leave the forbidden state (whose `[]` is not a real
      // list) and its slow cadence, so the UI shows a paused feed instead.
      if (openState.forbidden) {
        if (!current()) return;
        scheduleOpen(POLL_MS);
        setOpen({ ...INITIAL_OPEN, failures: 1 });
        return;
      }
      setOpen({ ...openState, failures: openState.failures + 1 });
    });
}

// Hidden tabs get their timers throttled (to ~1/min in Chrome), so re-poll the
// moment the clinician comes back rather than up to a minute later.
function onOpenVisible() {
  if (!document.hidden && openTimer !== undefined) pollOpen();
}

function subscribeOpen(listener: () => void) {
  openListeners.add(listener);
  if (openListeners.size === 1) {
    scheduleOpen(POLL_MS);
    document.addEventListener("visibilitychange", onOpenVisible);
    pollOpen();
  }
  return () => {
    openListeners.delete(listener);
    if (openListeners.size === 0) {
      document.removeEventListener("visibilitychange", onOpenVisible);
      // Last reader gone (signed out / left the app): drop the data so the
      // next session starts clean and in-flight responses are ignored.
      window.clearInterval(openTimer);
      openTimer = undefined;
      openGeneration += 1;
      openState = INITIAL_OPEN;
    }
  };
}

/** Re-poll open alerts now — after an acknowledge/resolve, so the bell, the
 *  chime baseline and the Escalations list all drop the alert together. */
export function invalidateAlerts() {
  if (openListeners.size > 0) pollOpen();
}

const getOpen = () => openState;
const noopSubscribe = () => () => {};

// ── Acknowledged / resolved history: on demand ─────────────────────────

interface HistoryState {
  status: AlertStatus;
  rows: AlertRow[] | null;
  failed: boolean;
  forbidden: boolean;
}

/** GET /alerts?status=. `open` reads the shared 15s poller above. The history
 *  tabs are NOT polled (the list grows forever; the backend returns the newest
 *  100): they load on open, on `reload`, and when the window regains focus.
 *  A failed fetch is `failed`, never an empty list; a 403 is `forbidden`.
 *  `enabled: false` never requests at all and reads as `forbidden` (an
 *  expert-roster account has no hospital alerts to see). */
export function useAlerts(status: AlertStatus, enabled = true) {
  const isOpen = enabled && status === "open";
  const open = useSyncExternalStore(isOpen ? subscribeOpen : noopSubscribe, getOpen);

  const [history, setHistory] = useState<HistoryState | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => {
    if (status === "open") invalidateAlerts();
    else setTick((t) => t + 1);
  }, [status]);

  useEffect(() => {
    if (!enabled || status === "open") return;
    let cancelled = false;
    const load = () =>
      fetchRows(status)
        .then((rows) => {
          if (!cancelled) setHistory({ status, rows, failed: false, forbidden: false });
        })
        .catch((err) => {
          if (cancelled) return;
          if (extractApiError(err).status === 403) {
            setHistory({ status, rows: [], failed: false, forbidden: true });
            return;
          }
          setHistory((prev) => ({
            status,
            rows: prev?.status === status ? prev.rows : null,
            failed: true,
            forbidden: false,
          }));
        });
    const onFocus = () => {
      if (!document.hidden) load();
    };
    document.addEventListener("visibilitychange", onFocus);
    load();
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [status, tick, enabled]);

  if (!enabled) {
    return { data: [], loading: false, failed: false, forbidden: true, stale: false, lastSuccessAt: null, reload };
  }
  if (status === "open") {
    return {
      data: open.rows ?? [],
      loading: open.rows === null && open.failures === 0,
      failed: open.failures > 0,
      forbidden: open.forbidden,
      /** The live feed has failed STALE_AFTER_FAILURES polls in a row: what is
       *  on screen may be out of date and a new alert would not chime. */
      stale: !open.forbidden && open.failures >= STALE_AFTER_FAILURES,
      lastSuccessAt: open.lastSuccessAt,
      reload,
    };
  }
  const current = history && history.status === status ? history : null;
  return {
    data: current?.rows ?? [],
    loading: !current,
    failed: current?.failed ?? false,
    forbidden: current?.forbidden ?? false,
    stale: false,
    lastSuccessAt: null,
    reload,
  };
}

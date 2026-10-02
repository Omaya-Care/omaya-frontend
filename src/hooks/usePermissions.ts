import { useCallback, useEffect, useSyncExternalStore } from "react";
import { fetchMe, onSessionReset } from "@/lib/auth-api";
import { getClinician } from "@/lib/auth";

export interface RolePermissions {
  view_mothers: boolean;
  message_mothers: boolean;
  escalate: boolean;
  create_discharges: boolean;
  manage_staff: boolean;
}

export type Permission = keyof RolePermissions;

// One shared GET /auth/me for every consumer (route guard, sidebar, pages), so
// gating and nav never disagree and the request isn't repeated per component.
// Keyed by the signed-in clinician id so a different user signing in within
// the same SPA session never inherits the previous user's permissions.
//
// Fail closed, but never cache a failure: a failed /auth/me (timeout, 5xx)
// leaves the store unloaded with `error` set and retries on a backoff, so one
// blip can't lock a clinician out of gated pages until a hard reload. A 401 is
// the axios interceptor's job (it signs the user out), so it isn't retried.
interface PermState {
  owner: string | null;
  loaded: boolean;
  /** The last /auth/me attempt failed; a retry is scheduled. */
  error: boolean;
  perms: Partial<Record<Permission, boolean>>;
}

const NO_PERMS: PermState["perms"] = {};
/** Retry delays after consecutive failures; the last one repeats. */
export const PERMISSION_RETRY_MS = [2_000, 5_000, 15_000, 30_000];

const EMPTY: PermState = { owner: null, loaded: false, error: false, perms: {} };
let state: PermState = EMPTY;
let inflight: Promise<void> | null = null;
let failures = 0;
let retryTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((cb) => cb());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot() {
  return state;
}

function currentOwner(): string | null {
  return getClinician()?.id ?? null;
}

function clearRetry() {
  if (retryTimer !== null) clearTimeout(retryTimer);
  retryTimer = null;
}

/** A status retrying can't fix: 401 (the interceptor signs out), 403/404 (a
 *  suspended or deleted seat), any other 4xx except timeout/rate-limit. */
function isTerminal(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status !== undefined && status < 500 && status !== 408 && status !== 429;
}

function fetchPermissions(force = false): Promise<void> {
  const owner = currentOwner();
  if (!force && state.owner === owner && (state.loaded || inflight)) {
    return inflight ?? Promise.resolve();
  }
  if (state.owner !== owner) {
    clearRetry();
    failures = 0;
    state = { ...EMPTY, owner };
    emit();
  }
  clearRetry();
  const req: Promise<void> = fetchMe(force).then(
    (me) => {
      if (inflight !== req) return;
      inflight = null;
      if (currentOwner() !== owner) return;
      failures = 0;
      state = { owner, loaded: true, error: false, perms: (me.permissions as PermState["perms"]) ?? {} };
      emit();
    },
    (err: unknown) => {
      if (inflight !== req) return;
      inflight = null;
      if (currentOwner() !== owner) return;
      // Fail closed (grant nothing) but stay unloaded, so the next answer —
      // not this failure — decides access.
      state = { owner, loaded: false, error: true, perms: {} };
      emit();
      if (isTerminal(err) || owner === null) return;
      const delay = PERMISSION_RETRY_MS[Math.min(failures, PERMISSION_RETRY_MS.length - 1)];
      failures += 1;
      retryTimer = setTimeout(() => {
        retryTimer = null;
        void fetchPermissions();
      }, delay);
    },
  );
  inflight = req;
  return req;
}

/** Re-fetch /auth/me now (e.g. a "Retry" button). Restarts the backoff. */
export function retryPermissions(): Promise<void> {
  failures = 0;
  return fetchPermissions();
}

/** Re-fetch /auth/me — call after changing role permissions. Note /auth/me
 *  reports the permissions frozen into the session JWT, so an admin's own
 *  role changes only show up after they sign in again. */
export function refreshPermissions(): Promise<void> {
  return fetchPermissions(true);
}

/** Forget everything — on sign-in / set-password / change-password, so even
 *  the SAME user signing in again re-reads their (possibly changed) role. */
export function resetPermissions(): void {
  clearRetry();
  failures = 0;
  inflight = null;
  state = EMPTY;
  emit();
  // Anything still mounted (e.g. an in-app password change) re-reads now —
  // but not after sign-out, where it would only fire a doomed /auth/me.
  if (listeners.size > 0 && currentOwner() !== null) void fetchPermissions();
}
onSessionReset(resetPermissions);

/** Role permissions from GET /auth/me. Denies everything until loaded;
 *  `loading` is true until the first answer for the current user arrives;
 *  `error` is true while the last attempt failed (a retry is scheduled). */
export function usePermissions() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    void fetchPermissions();
  }, []);

  const isCurrent = snap.owner === currentOwner();
  const perms = isCurrent ? snap.perms : NO_PERMS;
  const can = useCallback(
    (perm: Permission | string) => Boolean((perms as Record<string, boolean>)[perm]),
    [perms],
  );

  return { can, loading: !isCurrent || !snap.loaded, error: isCurrent && snap.error };
}

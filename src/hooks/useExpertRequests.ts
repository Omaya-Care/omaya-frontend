import { useCallback, useEffect, useState } from "react";
import { api, extractApiError } from "@/lib/api";

// OMA-341 — the expert queue/thread surface (backend app/routers/expert_requests.py,
// app/schemas/expert_requests.py). Every response model there is extra="forbid";
// the request bodies below send exactly the fields the backend declares.

export type ExpertCategory =
  | "psychologist"
  | "lactation_consultant"
  | "postpartum_wellness_expert"
  | "other";

export type ExpertRequestStatus = "new" | "assigned" | "active" | "completed" | "cancelled";

export type ExpertRating = "good" | "okay" | "not_helpful";

export interface ExpertThreadMessage {
  id: string;
  speaker: "mother" | "expert";
  textBody: string;
  createdAt: string;
}

export interface ExpertRequestItem {
  id: string;
  category: ExpertCategory;
  questionText: string;
  /** Consent-gated: null unless she chose to share her details. */
  motherName: string | null;
  carePhase: string | null;
  language: string | null;
  status: ExpertRequestStatus;
  requestedAt: string;
  respondedAt: string | null;
  reported: boolean;
  rating: ExpertRating | null;
  /** Sorts to the front of the queue (self-harm auto-queue path only). */
  urgent: boolean;
}

export interface MyExpertRequestItem extends ExpertRequestItem {
  messageCount: number;
  lastMessage: ExpertThreadMessage | null;
}

export interface ExpertStats {
  requestsThisWeek: number;
  activeConversations: number;
  completedThisWeek: number;
  ratingGoodCount: number;
  ratingTotalCount: number;
}

export interface ExpertThread {
  request: ExpertRequestItem;
  messages: ExpertThreadMessage[];
}

type Raw = Record<string, unknown>;

function toThreadMessage(raw: Raw): ExpertThreadMessage {
  return {
    id: raw.id as string,
    speaker: raw.speaker as ExpertThreadMessage["speaker"],
    textBody: (raw.text_body as string) ?? "",
    createdAt: (raw.created_at as string) ?? "",
  };
}

function toRequestItem(raw: Raw): ExpertRequestItem {
  return {
    id: raw.id as string,
    category: raw.category as ExpertCategory,
    questionText: (raw.question_text as string) ?? "",
    motherName: (raw.mother_name as string | null) ?? null,
    carePhase: (raw.care_phase as string | null) ?? null,
    language: (raw.language as string | null) ?? null,
    status: raw.status as ExpertRequestStatus,
    requestedAt: (raw.requested_at as string) ?? "",
    respondedAt: (raw.responded_at as string | null) ?? null,
    reported: (raw.reported as boolean) ?? false,
    rating: (raw.rating as ExpertRating | null) ?? null,
    urgent: (raw.urgent as boolean) ?? false,
  };
}

function toMineItem(raw: Raw): MyExpertRequestItem {
  return {
    ...toRequestItem(raw),
    messageCount: (raw.message_count as number) ?? 0,
    lastMessage: raw.last_message ? toThreadMessage(raw.last_message as Raw) : null,
  };
}

const mapQueue = (data: Raw) => ((data?.requests ?? []) as Raw[]).map(toRequestItem);
const mapMine = (data: Raw) => ((data?.requests ?? []) as Raw[]).map(toMineItem);
const mapStats = (raw: Raw): ExpertStats => ({
  requestsThisWeek: (raw.requests_this_week as number) ?? 0,
  activeConversations: (raw.active_conversations as number) ?? 0,
  completedThisWeek: (raw.completed_this_week as number) ?? 0,
  ratingGoodCount: (raw.rating_good_count as number) ?? 0,
  ratingTotalCount: (raw.rating_total_count as number) ?? 0,
});
const mapThread = (raw: Raw): ExpertThread => ({
  request: toRequestItem(raw.request as Raw),
  messages: ((raw.messages ?? []) as Raw[]).map(toThreadMessage),
});

// Polling cadences carried over from the production portal: the queue and
// "mine" lists are live work queues (20s); an open thread polls for her next
// message (10s); the stats summary doesn't poll.
export const QUEUE_POLL_MS = 20_000;
export const THREAD_POLL_MS = 10_000;

// ── Cross-hook refresh ──────────────────────────────────────────────────
// No React Query here, so a mutation can't invalidate a cache. Instead every
// expert-request hook listens on this signal and refetches immediately — the
// claim/reply/complete helpers below fire it once their write lands.
const listeners = new Set<() => void>();

export function invalidateExpertRequests(): void {
  listeners.forEach((cb) => cb());
}

interface Resource<T> {
  path: string;
  data: T | null;
  failed: boolean;
  /** 403 — the role lacks the permission. Terminal: polling stops. */
  forbidden: boolean;
}

/** GET `path` (null = idle), polled every `pollMs` when set. A failed fetch is
 *  `failed`, never an empty result; the last good data survives a poll blip. */
function useExpertResource<T>(path: string | null, map: (raw: Raw) => T, pollMs: number | null) {
  const [state, setState] = useState<Resource<T> | null>(null);
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    listeners.add(reload);
    return () => {
      listeners.delete(reload);
    };
  }, [reload]);

  useEffect(() => {
    if (!path) return;
    let cancelled = false;
    let timer: number | undefined;
    const load = () =>
      api
        .get(path)
        .then((res) => {
          if (!cancelled) setState({ path, data: map(res.data as Raw), failed: false, forbidden: false });
        })
        .catch((err) => {
          if (cancelled) return;
          if (extractApiError(err).status === 403) {
            window.clearInterval(timer);
            setState({ path, data: null, failed: false, forbidden: true });
            return;
          }
          setState((prev) => ({
            path,
            data: prev?.path === path ? prev.data : null,
            failed: true,
            forbidden: false,
          }));
        });
    // Polls pause in a hidden tab (prod's React Query default) and catch up on
    // return. Matters most for the thread: every GET writes a PHI audit row.
    const poll = () => {
      if (!document.hidden) load();
    };
    const onVisible = () => {
      if (!document.hidden) load();
    };
    if (pollMs) {
      timer = window.setInterval(poll, pollMs);
      document.addEventListener("visibilitychange", onVisible);
    }
    load();
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [path, map, pollMs, tick]);

  const current = path && state?.path === path ? state : null;
  return {
    data: current?.data ?? null,
    loading: path != null && !current,
    failed: current?.failed ?? false,
    forbidden: current?.forbidden ?? false,
    reload,
  };
}

/** Unclaimed requests in the signed-in expert's category (RLS-filtered). */
export function useExpertQueue() {
  const r = useExpertResource("/expert-requests/queue", mapQueue, QUEUE_POLL_MS);
  return { ...r, data: r.data ?? [] };
}

/** The signed-in expert's own open (assigned/active) requests. */
export function useMyExpertRequests() {
  const r = useExpertResource("/expert-requests/mine", mapMine, QUEUE_POLL_MS);
  return { ...r, data: r.data ?? [] };
}

/** The signed-in expert's own summary — powers the expert dashboard. */
export function useExpertStats() {
  return useExpertResource("/expert-requests/stats", mapStats, null);
}

/** One conversation's messages; pass null to stay idle. */
export function useExpertThread(requestId: string | null) {
  return useExpertResource(
    requestId ? `/expert-requests/${encodeURIComponent(requestId)}/thread` : null,
    mapThread,
    THREAD_POLL_MS,
  );
}

// ── Mutations ───────────────────────────────────────────────────────────

const base = (requestId: string) => `/expert-requests/${encodeURIComponent(requestId)}`;

export interface ClaimResult {
  id: string;
  status: string;
  /** Whether the consent card reached the bridge. */
  sent: boolean;
  detail: string | null;
}

/** POST /{id}/claim (no body). Lands `assigned` — she must answer the consent
 *  card before /reply accepts anything (409 `awaiting_mother_consent`). */
export async function claimExpertRequest(requestId: string): Promise<ClaimResult> {
  // Refresh on failure too: a lost claim race (404) must drop the stale row.
  try {
    const res = await api.post(`${base(requestId)}/claim`);
    return res.data as ClaimResult;
  } finally {
    invalidateExpertRequests();
  }
}

export interface ReplyResult {
  id: string;
  status: string;
  /** False = recorded but may not have reached her WhatsApp. */
  sent: boolean;
  detail: string | null;
}

/** POST /{id}/reply with exactly `{ body }` (1–4000 chars). */
export async function replyToExpertRequest(requestId: string, body: string): Promise<ReplyResult> {
  const res = await api.post(`${base(requestId)}/reply`, { body });
  invalidateExpertRequests();
  return res.data as ReplyResult;
}

export interface CompleteResult {
  id: string;
  status: string;
  rating_prompt_sent: boolean;
}

/** POST /{id}/complete (no body). */
export async function completeExpertRequest(requestId: string): Promise<CompleteResult> {
  try {
    const res = await api.post(`${base(requestId)}/complete`);
    return res.data as CompleteResult;
  } finally {
    invalidateExpertRequests();
  }
}

/** POST /{id}/typing (no body) — fire-and-forget UX signal; errors swallowed. */
export function sendExpertTyping(requestId: string): void {
  api.post(`${base(requestId)}/typing`).catch(() => {});
}

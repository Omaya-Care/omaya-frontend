import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  ExpertRequestItem,
  ExpertThreadMessage,
  MyExpertRequestItem,
} from "../types";

function toThreadMessage(raw: Record<string, unknown>): ExpertThreadMessage {
  return {
    id: raw.id as string,
    speaker: raw.speaker as ExpertThreadMessage["speaker"],
    textBody: raw.text_body as string,
    createdAt: raw.created_at as string,
  };
}

function toExpertRequestItem(raw: Record<string, unknown>): ExpertRequestItem {
  return {
    id: raw.id as string,
    category: raw.category as ExpertRequestItem["category"],
    questionText: raw.question_text as string,
    motherName: (raw.mother_name as string | null) ?? null,
    carePhase: (raw.care_phase as string | null) ?? null,
    language: (raw.language as string | null) ?? null,
    status: raw.status as ExpertRequestItem["status"],
    requestedAt: raw.requested_at as string,
    respondedAt: (raw.responded_at as string | null) ?? null,
    reported: (raw.reported as boolean) ?? false,
    rating: (raw.rating as ExpertRequestItem["rating"]) ?? null,
    urgent: (raw.urgent as boolean) ?? false,
  };
}

function toMyExpertRequestItem(raw: Record<string, unknown>): MyExpertRequestItem {
  return {
    ...toExpertRequestItem(raw),
    messageCount: (raw.message_count as number) ?? 0,
    lastMessage: raw.last_message
      ? toThreadMessage(raw.last_message as Record<string, unknown>)
      : null,
  };
}

/** Unclaimed requests in the signed-in expert's category (RLS-filtered
 * server-side — "other" is a shared catch-all). */
export const useExpertQueue = () =>
  useQuery<ExpertRequestItem[]>({
    queryKey: ["expert-requests", "queue"],
    queryFn: async () => {
      const res = await api.get("/expert-requests/queue");
      const raw = (res.data.requests ?? []) as Record<string, unknown>[];
      return raw.map(toExpertRequestItem);
    },
    // Short poll so a newly-arrived request shows up without a manual refresh —
    // this is a live queue, not a page a clinician revisits deliberately.
    refetchInterval: 20_000,
  });

/** The signed-in expert's own open (assigned/active) requests. */
export const useMyExpertRequests = () =>
  useQuery<MyExpertRequestItem[]>({
    queryKey: ["expert-requests", "mine"],
    queryFn: async () => {
      const res = await api.get("/expert-requests/mine");
      const raw = (res.data.requests ?? []) as Record<string, unknown>[];
      return raw.map(toMyExpertRequestItem);
    },
    refetchInterval: 20_000,
  });

export interface ExpertStats {
  requestsThisWeek: number;
  activeConversations: number;
  completedThisWeek: number;
  ratingGoodCount: number;
  ratingTotalCount: number;
}

/** The signed-in expert's own summary — powers the expert Dashboard view. */
export const useExpertStats = () =>
  useQuery<ExpertStats>({
    queryKey: ["expert-requests", "stats"],
    queryFn: async () => {
      const res = await api.get("/expert-requests/stats");
      const raw = res.data as Record<string, unknown>;
      return {
        requestsThisWeek: raw.requests_this_week as number,
        activeConversations: raw.active_conversations as number,
        completedThisWeek: raw.completed_this_week as number,
        ratingGoodCount: raw.rating_good_count as number,
        ratingTotalCount: raw.rating_total_count as number,
      };
    },
  });

export const useExpertThread = (requestId: string) =>
  useQuery<{ request: ExpertRequestItem; messages: ExpertThreadMessage[] }>({
    queryKey: ["expert-requests", "thread", requestId],
    queryFn: async () => {
      const res = await api.get(`/expert-requests/${requestId}/thread`);
      return {
        request: toExpertRequestItem(res.data.request as Record<string, unknown>),
        messages: ((res.data.messages ?? []) as Record<string, unknown>[]).map(
          toThreadMessage,
        ),
      };
    },
    enabled: !!requestId,
    // A live conversation — poll for the mother's next message while open.
    refetchInterval: 10_000,
  });

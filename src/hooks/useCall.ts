import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface TranscriptTurn {
  speaker: "omaya" | "mother";
  text: string;
}

/** One danger sign the classifier detected — what raised the call's flag. */
export interface FlagReason {
  signal: string;
  description: string;
  /** Severity band the sign forces; null = unrecognised sign, needs review. */
  tier: string | null;
  /** How severe she reported it: mild / moderate / severe. */
  severity: string | null;
  /** Classifier confidence, 0–1; null when not reported. */
  confidence: number | null;
  /** The classifier wasn't sure this sign was present. */
  ambiguous: boolean;
}

export interface CallDetailData {
  id: string;
  motherId: string;
  motherName: string;
  scheduledAt: string;
  /** When the call actually connected; "" for a scheduled / never-connected call. */
  startedAt: string;
  callType: string;
  status: string;
  channel: string;
  direction: string;
  durationSeconds: number | null;
  dayInCare: number | null;
  deliveryType: string;
  severity: string;
  flagsRaised: number;
  endReason: string;
  summary: string;
  audioUrl: string;
  /** null = unknown (not captured), distinct from an explicit refusal. */
  recordingConsent: boolean | null;
  transcript: TranscriptTurn[];
  flagReasons: FlagReason[];
}

/** GET /calls/{id} — one call (or still-scheduled placement) with transcript. */
export function useCall(callId: string | null) {
  const [state, setState] = useState<{ id: string; data: CallDetailData | null } | null>(null);

  useEffect(() => {
    if (!callId) return;
    let cancelled = false;
    api
      .get(`/calls/${callId}`)
      .catch(() => null)
      .then((res) => {
        if (cancelled) return;
        const r = res?.data as Record<string, unknown> | undefined;
        setState({
          id: callId,
          data: r
            ? {
                id: r.id as string,
                motherId: r.mother_id as string,
                motherName: (r.mother_name as string) ?? "",
                scheduledAt: (r.scheduled_at as string) ?? "",
                startedAt: (r.started_at as string) ?? "",
                callType: (r.call_type as string) ?? "",
                status: (r.status as string) ?? "",
                channel: (r.channel as string) ?? "voice",
                direction: (r.direction as string) ?? "outbound",
                durationSeconds: (r.duration_seconds as number | null) ?? null,
                dayInCare: (r.day_in_care as number | null) ?? null,
                deliveryType: (r.delivery_type as string) ?? "",
                severity: (r.severity as string) ?? "",
                flagsRaised: (r.flags_raised as number) ?? 0,
                endReason: (r.end_reason as string) ?? "",
                summary: (r.summary as string) ?? "",
                audioUrl: (r.audio_url as string) ?? "",
                recordingConsent: typeof r.recording_consent === "boolean" ? r.recording_consent : null,
                transcript: (r.transcript as TranscriptTurn[]) ?? [],
                flagReasons: (r.flag_reasons as FlagReason[]) ?? [],
              }
            : null,
        });
      });
    return () => {
      cancelled = true;
    };
  }, [callId]);

  const current = state && state.id === callId ? state : null;
  return { data: current?.data ?? null, loading: !!callId && !current, failed: !!current && !current.data };
}

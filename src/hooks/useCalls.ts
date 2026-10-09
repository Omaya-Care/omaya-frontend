import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface CallRow {
  id: string;
  motherId: string;
  motherName: string;
  scheduledAt: string;
  status: string;
  severity: string;
  channel: string;
  /** "inbound" = she rang us; "outbound" = Omaya placed it. */
  direction: string;
  callType: string;
}

/** Which medium a list shows. "calls" = every voice conversation (phone,
 *  WhatsApp call, scheduled slot); "chats" = WhatsApp text conversations. */
export type CallKind = "calls" | "chats";

/** A WhatsApp TEXT conversation — the Chats page's rows. A WhatsApp CALL
 *  ("whatsapp_call") is a voice conversation and stays with the calls. */
export const isChat = (channel: string) => channel === "whatsapp";

/** GET /calls?all_dates=true&kind=<kind> — every call (and still-scheduled
 *  placement) of that kind across all days, oldest first. A failed fetch is
 *  reported as `failed`, never as an empty list. */
export function useCalls(kind: CallKind) {
  const [data, setData] = useState<CallRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/calls", { params: { all_dates: true, kind } })
      .then((res) => {
        if (cancelled) return;
        const raw = (res.data?.calls ?? []) as Record<string, unknown>[];
        // Re-applied client-side: a backend that predates `kind` ignores it
        // and returns the merged list, which must not leak across the tabs.
        const rows = raw.filter((r) => isChat((r.channel as string) ?? "voice") === (kind === "chats"));
        setFailed(false);
        setData(
          rows.map((r) => ({
            id: r.id as string,
            motherId: r.mother_id as string,
            motherName: (r.mother_name as string) ?? "",
            scheduledAt: (r.scheduled_at as string) ?? "",
            status: (r.status as string) ?? "",
            severity: (r.severity as string) ?? "",
            channel: (r.channel as string) ?? "voice",
            direction: (r.direction as string) ?? "outbound",
            callType: (r.call_type as string) ?? "",
          })),
        );
      })
      .catch(() => {
        if (cancelled) return;
        setFailed(true);
        setData((prev) => prev ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [version, kind]);

  return { data: data ?? [], loading: data === null, failed, reload };
}

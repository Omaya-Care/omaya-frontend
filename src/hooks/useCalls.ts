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

/** GET /calls?all_dates=true — every call (and still-scheduled placement)
 *  across all days, oldest first. A failed fetch is reported as `failed`,
 *  never as an empty list. */
export function useCalls() {
  const [data, setData] = useState<CallRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/calls", { params: { all_dates: true } })
      .then((res) => {
        if (cancelled) return;
        const rows = (res.data?.calls ?? []) as Record<string, unknown>[];
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
  }, [version]);

  return { data: data ?? [], loading: data === null, failed, reload };
}

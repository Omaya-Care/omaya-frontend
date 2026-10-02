import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface MotherRow {
  id: string;
  name: string;
  phone: string;
  /** null before delivery / when unknown — never shown as "Day 0". */
  dayPostpartum: number | null;
  severity: string;
  consentStatus: string;
  deliveryType: string;
}

/** GET /mothers — the hospital's full mother list (RLS-scoped server-side).
 *  A failed fetch is reported as `failed`, never as an empty list. */
export function useMothers() {
  const [data, setData] = useState<MotherRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/mothers")
      .then((res) => {
        if (cancelled) return;
        const rows = (res.data?.mothers ?? []) as Record<string, unknown>[];
        setFailed(false);
        setData(
          rows.map((r) => ({
            id: r.id as string,
            name: (r.name as string) ?? "",
            phone: (r.phone as string) ?? "",
            dayPostpartum: (r.day_postpartum as number | null) ?? null,
            severity: (r.severity as string) ?? "",
            consentStatus: (r.consent_status as string) ?? "",
            deliveryType: (r.delivery_type as string) ?? "",
          })),
        );
      })
      .catch(() => {
        if (cancelled) return;
        // Keep the last good rows (a reload after withdraw); flag the failure.
        setFailed(true);
        setData((prev) => prev ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { data: data ?? [], loading: data === null, failed, reload };
}

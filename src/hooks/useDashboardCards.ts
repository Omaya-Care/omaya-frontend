import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { fetchMe } from "@/lib/auth-api";

export interface RecentEscalation {
  id: string;
  motherName: string;
  /** null when unknown — never shown as "Day 0". */
  dayPostpartum: number | null;
  severity: string;
  timeLeftMinutes: number;
  createdAt: string;
  /** "blocked" = no page produced; "unreached" = nobody answered yet. */
  pageStatus: string;
}

export interface TodayCall {
  id: string;
  motherName: string;
  callType: string;
  status: string;
  scheduledAt: string;
  channel: string;
}

export interface ThisWeek {
  callsCompleted: number;
  escalationsResolved: number;
  newDischarges: number;
  avgResponseMinutes: number | null;
}

export interface DashboardCards {
  /** null when /mothers failed — the card shows "—", never a fake 0. */
  mothersInCare: number | null;
  /** null when /calls failed. */
  callsToday: number | null;
  /** The caller has `view_mothers` — gates the Mothers in care / Calls
   *  today cards and the Today's calls panel (/mothers and /calls 403
   *  without it, e.g. for a Coordinator). */
  canViewMothers: boolean;
  /** The caller has `escalate` — gates the Need attention card and the
   *  Recent escalations panel. */
  canEscalate: boolean;
  /** /dashboard/stats `alerts_needing_attention` (open L3/L4); null when the
   *  stats request failed or the caller lacks `escalate`. */
  needAttention: number | null;
  avgResponseMinutesL3L4: number | null;
  /** Open /alerts rows; null without `escalate` or when /alerts failed. */
  escalations: RecentEscalation[] | null;
  /** null when /dashboard/stats failed — the panel shows "--". */
  thisWeek: ThisWeek | null;
  /** null when /calls failed. */
  todayCalls: TodayCall[] | null;
  /** At least one request failed — the page offers a Retry. */
  failed: boolean;
}

/** The clinician's LOCAL calendar day as `YYYY-MM-DD` — the same day the
 *  dashboard header shows. `toISOString()` is the UTC day, which is a
 *  different date around midnight anywhere east/west of UTC. */
export const localDateParam = (d: Date = new Date()): string => format(d, "yyyy-MM-dd");

/** Same endpoints as the main portal dashboard: /mothers and /calls?date=
 *  (only with `view_mothers`), /alerts (only with `escalate` — alerts carry
 *  PHI and the backend 403s otherwise), and /dashboard/stats. A failed request leaves its fields null
 *  (rendered "—" / an error), never a zero. */
export function useDashboardCards() {
  const [data, setData] = useState<DashboardCards | null>(null);
  const [version, setVersion] = useState(0);
  const reload = useCallback(() => {
    setData(null);
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const today = localDateParam();

    (async () => {
      const me = await fetchMe().catch(() => null);
      const permissions = me?.permissions as Record<string, boolean> | undefined;
      const canEscalate = Boolean(permissions?.escalate);
      const canViewMothers = Boolean(permissions?.view_mothers);

      const [mothers, calls, alerts, stats] = await Promise.all([
        canViewMothers ? api.get("/mothers").catch(() => null) : Promise.resolve(null),
        canViewMothers ? api.get("/calls", { params: { date: today } }).catch(() => null) : Promise.resolve(null),
        canEscalate ? api.get("/alerts").catch(() => null) : Promise.resolve(null),
        api.get("/dashboard/stats").catch(() => null),
      ]);
      if (cancelled) return;

      const callRows = calls ? ((calls.data?.calls ?? []) as Record<string, unknown>[]) : null;
      const alertRows = (alerts?.data?.alerts ?? []) as Record<string, unknown>[];
      const motherRows = mothers
        ? ((mothers.data?.mothers ?? []) as { consent_status?: string }[])
        : null;
      setData({
        mothersInCare: motherRows
          ? motherRows.filter((m) => m.consent_status === "active").length
          : null,
        callsToday: callRows ? callRows.length : null,
        todayCalls: callRows
          ? callRows.map((r) => ({
              id: r.id as string,
              motherName: (r.mother_name as string) ?? "",
              callType: (r.call_type as string) ?? "",
              status: (r.status as string) ?? "",
              scheduledAt: (r.scheduled_at as string) ?? "",
              channel: (r.channel as string) ?? "voice",
            }))
          : null,
        canViewMothers,
        canEscalate,
        needAttention:
          canEscalate && stats ? (stats.data?.alerts_needing_attention ?? null) : null,
        avgResponseMinutesL3L4: stats?.data?.avg_response_minutes_l3l4 ?? null,
        thisWeek: stats
          ? {
              callsCompleted: stats.data?.this_week?.calls_completed ?? 0,
              escalationsResolved: stats.data?.this_week?.escalations_resolved ?? 0,
              newDischarges: stats.data?.this_week?.new_discharges ?? 0,
              avgResponseMinutes: stats.data?.this_week?.avg_response_minutes ?? null,
            }
          : null,
        escalations:
          canEscalate && alerts
            ? alertRows
                .map((r) => ({
                  id: r.id as string,
                  motherName: (r.mother_name as string) ?? "",
                  dayPostpartum: (r.day_postpartum as number | null) ?? null,
                  severity: (r.severity as string) ?? "routine",
                  timeLeftMinutes: (r.time_left_minutes as number) ?? 0,
                  createdAt: (r.created_at as string) ?? "",
                  pageStatus: (r.page_status as string) ?? "not_applicable",
                }))
                // /alerts is oldest-first; "recent" wants newest on top.
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            : null,
        failed:
          !me || !stats || (canViewMothers && (!mothers || !calls)) || (canEscalate && !alerts),
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [version]);

  return { data, loading: data === null, reload };
}

import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

interface ThisWeekStats {
  callsCompleted: number;
  escalationsResolved: number;
  newDischarges: number;
  avgResponseMinutes: number | null;
}

export interface DashboardStats {
  avgResponseMinutesL3L4: number | null;
  thisWeek: ThisWeekStats;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDashboardStats(raw: any): DashboardStats {
  return {
    avgResponseMinutesL3L4: raw.avg_response_minutes_l3l4 ?? null,
    thisWeek: {
      callsCompleted: raw.this_week?.calls_completed ?? 0,
      escalationsResolved: raw.this_week?.escalations_resolved ?? 0,
      newDischarges: raw.this_week?.new_discharges ?? 0,
      avgResponseMinutes: raw.this_week?.avg_response_minutes ?? null,
    },
  };
}

export const useDashboardStats = () =>
  useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return toDashboardStats(res.data);
    },
    staleTime: 60_000,
  });

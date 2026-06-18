import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { EscalationItem } from "../types";

export function toEscalation(raw: Record<string, unknown>): EscalationItem {
  return {
    id: raw.id as string,
    motherName: (raw.mother_name as string) ?? "",
    dayPostpartum: (raw.day_postpartum as number) ?? 0,
    severity: (raw.severity as EscalationItem["severity"]) ?? "routine",
    timeLeftMinutes: (raw.time_left_minutes as number) ?? 0,
  };
}

export const useEscalations = () => {
  return useQuery<EscalationItem[]>({
    queryKey: ["escalations"],
    queryFn: async () => {
      const response = await api.get("/alerts");
      return ((response.data.alerts as Record<string, unknown>[]) ?? []).map(
        toEscalation,
      );
    },
    refetchInterval: 60000,
  });
};

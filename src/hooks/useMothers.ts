import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Mother, CheckIn } from "../types";

function toCamelCase(raw: Record<string, unknown>): Mother {
  return {
    id: raw.id as string,
    name: raw.name as string,
    dayPostpartum: raw.day_postpartum as number,
    severity: raw.severity as Mother["severity"],
    midwife: (raw.midwife as string) ?? "",
    phone: raw.phone as string,
    hospital: raw.hospital as string,
    dischargeDate: raw.discharge_date as string,
    deliveryType: raw.delivery_type as Mother["deliveryType"],
    consentStatus: raw.consent_status as Mother["consentStatus"],
    lastInteraction: (raw.last_interaction as string) ?? "",
    note: (raw.note as string) ?? "",
    checkIns: ((raw.check_ins as Record<string, unknown>[]) ?? []).map(
      (ci): CheckIn => ({
        id: ci.id as string,
        date: ci.date as string,
        day: ci.day as number,
        summary: ci.summary as string,
        severity: ci.severity as CheckIn["severity"],
      }),
    ),
    currentFlag: (raw.current_flag as string) ?? undefined,
  };
}

export const useMothers = () => {
  return useQuery<Mother[]>({
    queryKey: ["mothers"],
    queryFn: async () => {
      const response = await api.get("/mothers");
      const raw = response.data.mothers as Record<string, unknown>[];
      return (raw ?? []).map(toCamelCase);
    },
  });
};

export const useMother = (id: string) => {
  return useQuery<Mother | null>({
    queryKey: ["mother", id],
    queryFn: async () => {
      const response = await api.get(`/mothers/${id}`);
      const raw = response.data as Record<string, unknown>;
      return raw ? toCamelCase(raw) : null;
    },
    enabled: !!id,
  });
};

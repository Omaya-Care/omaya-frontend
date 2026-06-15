import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { EscalationItem } from "../types";

export const useEscalations = () => {
  return useQuery<EscalationItem[]>({
    queryKey: ["escalations"],
    queryFn: async () => {
      const response = await api.get("/alerts");
      return response.data.alerts ?? [];
    },
    refetchInterval: 60000,
  });
};

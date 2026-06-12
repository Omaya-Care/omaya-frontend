import { useQuery } from "@tanstack/react-query";
import { escalations as mockEscalations } from "../data/escalations";
import { EscalationItem } from "../types";
// import { api } from "../lib/api";

/**
 * Hook to fetch pending escalations (alerts).
 */
export const useEscalations = () => {
  return useQuery<EscalationItem[]>({
    queryKey: ["escalations"],
    queryFn: async () => {
      // Real API: const response = await api.get("/alerts"); return response.data;
      return mockEscalations;
    },
    // Poll for new alerts every 60 seconds
    refetchInterval: 60000,
  });
};

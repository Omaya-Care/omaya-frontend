import { useQuery } from "@tanstack/react-query";
import { calls as mockCalls } from "../data/calls";
import { Call } from "../types";
// import { api } from "../lib/api";

/**
 * Hook to fetch the list of calls.
 */
export const useCalls = () => {
  return useQuery<Call[]>({
    queryKey: ["calls"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      // Real API: const response = await api.get("/calls"); return response.data;
      return mockCalls;
    },
  });
};

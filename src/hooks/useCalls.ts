import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Call } from "../types";

export const useCalls = () => {
  return useQuery<Call[]>({
    queryKey: ["calls"],
    queryFn: async () => {
      const response = await api.get("/calls");
      return response.data.calls ?? [];
    },
  });
};

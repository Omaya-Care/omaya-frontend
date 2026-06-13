import { useQuery } from "@tanstack/react-query";
import { mothers as mockMothers } from "../data/mothers";
import { Mother } from "../types";
// import { api } from "../lib/api";

/**
 * Hook to fetch the list of mothers.
 * Currently uses mock data as the GET /mothers endpoint is not in the spec yet.
 */
export const useMothers = () => {
  return useQuery<Mother[]>({
    queryKey: ["mothers"],
    queryFn: async () => {
      // When the API is ready, we will do:
      // const response = await api.get("/mothers");
      // return response.data;

      return mockMothers;
    },
  });
};

/**
 * Hook to fetch a single mother by ID.
 */
export const useMother = (id: string) => {
  return useQuery<Mother | null>({
    queryKey: ["mother", id],
    queryFn: async () => {
      return mockMothers.find((m) => m.id === id) || null;
    },
    enabled: !!id,
  });
};

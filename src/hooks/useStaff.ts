import { useQuery } from "@tanstack/react-query";
import { staffMembers as mockStaff } from "../data/staff";
import { StaffMember } from "../types";
// import { api } from "../lib/api";

/**
 * Hook to fetch staff members.
 */
export const useStaff = () => {
  return useQuery<StaffMember[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      // Real API: const response = await api.get("/admin/clinicians"); return response.data;
      return mockStaff;
    },
  });
};

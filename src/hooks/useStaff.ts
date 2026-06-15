import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { StaffMember, StaffRole, StaffStatus } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toStaffMember(raw: any): StaffMember {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role as StaffRole,
    status: raw.status as StaffStatus,
    lastActiveAt: raw.last_active_at ?? null,
    isCurrentUser: raw.is_current_user ?? false,
  };
}

export const useStaff = () =>
  useQuery<StaffMember[]>({
    queryKey: ["staff"],
    queryFn: async () => {
      const res = await api.get("/admin/clinicians");
      return (res.data.clinicians ?? []).map(toStaffMember);
    },
  });

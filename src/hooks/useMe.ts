import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Me, RolePermissions } from "../types";

export function toMe(raw: any): Me {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    role: raw.role,
    hospitalId: raw.hospital_id,
    hospitalName: raw.hospital_name,
    mustChangePassword: raw.must_change_password ?? false,
    permissions: raw.permissions as RolePermissions,
  };
}

export const useMe = () =>
  useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return toMe(res.data);
    },
  });

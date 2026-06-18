import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Me, RolePermissions } from "../types";

export function toMe(raw: Record<string, unknown>): Me {
  return {
    id: raw.id as Me["id"],
    name: raw.name as Me["name"],
    email: raw.email as Me["email"],
    role: raw.role as Me["role"],
    hospitalId: raw.hospital_id as Me["hospitalId"],
    hospitalName: raw.hospital_name as Me["hospitalName"],
    mustChangePassword: (raw.must_change_password as boolean) ?? false,
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

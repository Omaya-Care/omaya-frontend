import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Role, RolePermissions } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRole(raw: any): Role {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    isSystem: raw.is_system,
    permissions: raw.permissions as RolePermissions,
  };
}

export const useRoles = () =>
  useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await api.get("/admin/roles");
      return (res.data.roles ?? []).map(toRole);
    },
  });

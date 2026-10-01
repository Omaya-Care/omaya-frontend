import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { RolePermissions } from "@/hooks/usePermissions";

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: RolePermissions;
}

function toRole(raw: Record<string, unknown>): Role {
  return {
    id: raw.id as string,
    name: raw.name as string,
    description: (raw.description as string | null) ?? null,
    isSystem: raw.is_system as boolean,
    permissions: raw.permissions as RolePermissions,
  };
}

// Every mounted useRoles() reloads when a role mutation lands (the
// replacement for react-query's invalidateQueries(["roles"])).
const listeners = new Set<() => void>();

export function reloadRoles(): void {
  listeners.forEach((cb) => cb());
}

/** GET /admin/roles — system + custom roles with their permission sets. */
export function useRoles() {
  const [data, setData] = useState<Role[] | null>(null);
  const [isError, setIsError] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const cb = () => setVersion((v) => v + 1);
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    api
      .get("/admin/roles")
      .then((res) => {
        if (cancelled) return;
        const rows = (res.data?.roles ?? []) as Record<string, unknown>[];
        setData(rows.map(toRole));
        setIsError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setIsError(true);
        setData((d) => d ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  return { data: data ?? [], isLoading: data === null, isError, reload: reloadRoles };
}

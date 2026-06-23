import { createContext, use, useMemo, useCallback, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { api } from "../lib/api";
import { Me, RolePermissions } from "../types";
import { isAuthenticated } from "../lib/auth";
import { toMe } from "../hooks/useMe";

interface AuthContextValue {
  user: Me | undefined;
  permissions: RolePermissions;
  isLoading: boolean;
  can: (permission: keyof RolePermissions) => boolean;
}

const DEFAULT_PERMISSIONS: RolePermissions = {
  view_mothers: false,
  message_mothers: false,
  escalate: false,
  create_discharges: false,
  manage_staff: false,
};

const AuthContext = createContext<AuthContextValue>({
  user: undefined,
  permissions: DEFAULT_PERMISSIONS,
  isLoading: false,
  can: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  useLocation();
  const { data: user, isLoading } = useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return toMe(res.data);
    },
    enabled: isAuthenticated(),
    staleTime: 60_000,
  });

  const permissions = user?.permissions ?? DEFAULT_PERMISSIONS;

  const can = useCallback(
    (permission: keyof RolePermissions): boolean => permissions[permission],
    [permissions],
  );

  const value = useMemo(
    () => ({ user, permissions, isLoading, can }),
    [user, permissions, isLoading, can],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return use(AuthContext);
}

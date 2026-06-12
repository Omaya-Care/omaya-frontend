import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getMustChange } from "../../lib/auth";

/**
 * Gate for the authenticated app shell. Redirects to sign-in when there's
 * no session, and to /change-password when the seat still owes a forced
 * rotation (otherwise every protected API call would 403).
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  if (getMustChange()) {
    return <Navigate to="/change-password" replace />;
  }
  return <>{children}</>;
}

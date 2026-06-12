import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getMustChange } from "../../lib/auth";

/**
 * Gate for the API documentation: requires a signed-in session. The team
 * allowlist itself is enforced server-side — the backend's gated
 * `/openapi.json` returns 403 for a non-allowlisted email, and `Docs`
 * renders a "no access" state on that 403. The `docs_access` table is the
 * single source of truth; there's no email list in the client bundle.
 */
export function DocsGate({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/?next=%2Fdocs" replace />;
  }
  if (getMustChange()) {
    return <Navigate to="/change-password" replace />;
  }
  return <>{children}</>;
}

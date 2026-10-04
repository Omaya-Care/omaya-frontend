import { Navigate, Outlet } from "react-router-dom";
import { isExpertAccount } from "@/lib/auth";

/** Layout-route guard for expert-only pages (/expert-requests). Gated on
 *  account TYPE — the expert roster's hospital — not a role permission: an
 *  ordinary hospital clinician with view_mothers is not an expert. Reads the
 *  stored profile, the same source the sidebar uses, so nav and guard can't
 *  disagree (and a transient /auth/me failure can't lock an expert out). */
export function RequireExpert() {
  if (!isExpertAccount()) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

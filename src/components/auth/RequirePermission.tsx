import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Navigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { retryPermissions, usePermissions, type Permission } from "@/hooks/usePermissions";

/**
 * Layout-route guard for a role permission (from GET /auth/me). Mirrors the
 * source portal's `Protected` wrapper: while permissions are still loading it
 * renders a loader instead of mounting the page (so a legitimate admin is
 * never flash-redirected and the page never fetches/403s early); once loaded,
 * a missing permission redirects to /dashboard. If /auth/me failed (timeout,
 * 5xx) it neither mounts the page nor redirects: it says so and offers a retry
 * (the store also retries on its own backoff).
 */
export function RequirePermission({ permission }: { permission: Permission }) {
  const { can, loading, error } = usePermissions();
  const [retrying, setRetrying] = useState(false);

  if (error) {
    const retry = () => {
      setRetrying(true);
      void retryPermissions().finally(() => setRetrying(false));
    };
    return (
      <div role="alert" className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <p className="text-sm text-muted-foreground">Couldn&rsquo;t verify your access.</p>
        <Button variant="outline" size="sm" onClick={retry} disabled={retrying}>
          {retrying && <Loader2 className="animate-spin" size={14} aria-hidden="true" />}
          Retry
        </Button>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="animate-spin text-muted-foreground" size={24} aria-label="Loading" />
      </div>
    );
  }
  if (!can(permission)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SetupPassword from "./pages/SetupPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Mothers from "./pages/Mothers";
import Calls from "./pages/Calls";
import Chats from "./pages/Chats";
import Escalations from "./pages/Escalations";
import Settings from "./pages/Settings";
import NewMother from "./pages/NewMother";
import Staff from "./pages/Staff";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequirePermission } from "./components/auth/RequirePermission";
import { NotificationToaster } from "./components/layout/NotificationToaster";
import { RequireExpert } from "./components/auth/RequireExpert";
import ExpertRequests from "./pages/ExpertRequests";
import { ExpertDashboard } from "./components/expert-requests/ExpertDashboard";
import { isExpertAccount } from "./lib/auth";

// The API reference moved to the Blume docs site (Cloudflare Worker
// `omaya-api-docs`, with its own sign-in gate) on its own host.
const API_DOCS_URL = "https://docs.omayacare.com";

// Sentry-instrumented <SentryRoutes> — parameterized route names on errors/breadcrumbs.
const SentryRoutes = Sentry.withSentryReactRouterV7Routing(Routes);

// ErrorBoundary fallback. Deliberately shows NO error detail in the DOM; the
// detail goes to Sentry.
function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        The page hit an unexpected error. Please refresh, or sign in again.
      </p>
    </div>
  );
}

/** /dashboard: pick the view BEFORE either one's data hooks mount. An expert
 *  account has no mothers, so the hospital dashboard's /mothers, /calls,
 *  /alerts and /dashboard/stats requests must never fire for it. */
function DashboardRoute() {
  return isExpertAccount() ? <ExpertDashboard /> : <Dashboard />;
}

/** /docs: old bookmarks to the in-app API reference land on the external
 *  docs site. replace() so the dead /docs entry never sits in history. */
function DocsRedirect() {
  useEffect(() => {
    window.location.replace(API_DOCS_URL);
  }, []);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
        <SentryRoutes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/activate" element={<SetupPassword />} />
          <Route path="/reset" element={<SetupPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />

          {/* Protected app — one shared layout route, so the sidebar mounts
              once and is reused across every page below. */}
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<DashboardRoute />} />
            {/* Permission-gated pages (same map as the source portal's
                routePermissions): denied → /dashboard, loading → spinner. */}
            <Route element={<RequirePermission permission="view_mothers" />}>
              <Route path="/mothers" element={<Mothers />} />
              <Route path="/calls" element={<Calls />} />
              <Route path="/chats" element={<Chats />} />
            </Route>
            <Route element={<RequirePermission permission="manage_staff" />}>
              <Route path="/staff" element={<Staff />} />
            </Route>
            <Route path="/escalations" element={<Escalations />} />
            <Route path="/settings" element={<Settings />} />
            {/* Expert-roster accounts only (account type, not a permission). */}
            <Route element={<RequireExpert />}>
              <Route path="/expert-requests" element={<ExpertRequests />} />
            </Route>
            <Route element={<RequirePermission permission="create_discharges" />}>
              <Route path="/new-mother" element={<NewMother />} />
            </Route>
          </Route>
          {/* API docs moved off this app — redirect old bookmarks. */}
          <Route path="/docs" element={<DocsRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </SentryRoutes>
      </Sentry.ErrorBoundary>
      <NotificationToaster />
    </BrowserRouter>
  );
}

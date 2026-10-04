import { lazy, Suspense } from "react";
import * as Sentry from "@sentry/react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SetupPassword from "./pages/SetupPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import Mothers from "./pages/Mothers";
import Calls from "./pages/Calls";
import Escalations from "./pages/Escalations";
import Settings from "./pages/Settings";
import NewMother from "./pages/NewMother";
import Staff from "./pages/Staff";
import { AppLayout } from "./components/layout/AppLayout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { RequirePermission } from "./components/auth/RequirePermission";
import { NotificationToaster } from "./components/layout/NotificationToaster";
import { RequireExpert } from "./components/auth/RequireExpert";
import { DocsGate } from "./components/auth/DocsGate";
import DocsLoading from "./components/DocsLoading";
import ExpertRequests from "./pages/ExpertRequests";
import { ExpertDashboard } from "./components/expert-requests/ExpertDashboard";
import { isExpertAccount } from "./lib/auth";

// The Scalar API reference is heavy and only ever used on the docs.* host —
// code-split so it never rides in the main app bundle.
const Docs = lazy(() => import("./Docs"));

// The docs.* host (a Vercel alias of this same project) serves the API
// reference. It's a separate origin with its own session — users sign in
// there too; the docs gate (auth + the server-side `docs_access` allowlist)
// applies either way.
const isDocsHost = window.location.hostname.startsWith("docs.");

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

// API docs — gated by sign-in + the server-side `docs_access` allowlist.
// DocsGate requires a session; the gated backend `/openapi.json` returns 403
// for a non-allowlisted email, which Docs renders as a "No access" state.
const gatedDocs = (
  <DocsGate>
    <Suspense fallback={<DocsLoading />}>
      <Docs />
    </Suspense>
  </DocsGate>
);

export default function App() {
  if (isDocsHost) {
    // Docs host: only sign-in + the gated docs. Everything funnels to /docs
    // so the host never exposes the app surface.
    return (
      <BrowserRouter>
        <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
          <SentryRoutes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/docs" element={gatedDocs} />
            <Route path="*" element={<Navigate to="/docs" replace />} />
          </SentryRoutes>
        </Sentry.ErrorBoundary>
        <NotificationToaster />
      </BrowserRouter>
    );
  }


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
          {/* API docs — sign-in + server-side docs_access allowlist */}
          <Route path="/docs" element={gatedDocs} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </SentryRoutes>
      </Sentry.ErrorBoundary>
      <NotificationToaster />
    </BrowserRouter>
  );
}

import { lazy, Suspense, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import ForgotPassword from "./pages/ForgotPassword";
import SetupPassword from "./pages/SetupPassword";
import ChangePassword from "./pages/ChangePassword";
import Dashboard from "./pages/Dashboard";
import MothersPage from "./pages/Mothers";
import CallsPage from "./pages/Calls";
import StaffPage from "./pages/Staff";
import SettingsPage from "./pages/Settings";
import { AppShell } from "./components/layout";
import { RequireAuth } from "./components/auth/RequireAuth";
import { DocsGate } from "./components/auth/DocsGate";
import { DrawerProvider } from "./contexts/DrawerContext";
import { ErrorToast } from "./components/ui";
import DocsLoading from "./components/DocsLoading";

const Docs = lazy(() => import("./Docs"));

// The docs.* host (a Vercel alias of this same project) serves the API
// reference. It's a separate origin, so it has its own session — users
// sign in there too; the docs gate (auth + the server-side `docs_access`
// allowlist) applies either way.
const isDocsHost = window.location.hostname.startsWith("docs.");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

/** Protected page: requires a session, rendered inside the app shell. */
function Protected({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}

// API docs — gated by sign-in + the server-side `docs_access` allowlist.
// DocsGate requires a session; the gated backend `/openapi.json` returns
// 403 for a non-allowlisted email, which Docs renders as a "No access" state.
const gatedDocs = (
  <DocsGate>
    <Suspense fallback={<DocsLoading />}>
      <Docs />
    </Suspense>
  </DocsGate>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DrawerProvider>
          {isDocsHost ? (
            // Docs host: only sign-in + the gated docs. Everything funnels
            // to /docs so the host never exposes the app surface.
            <Routes>
              <Route path="/" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/docs" element={gatedDocs} />
              <Route path="*" element={<Navigate to="/docs" replace />} />
            </Routes>
          ) : (
            <Routes>
              {/* Public auth routes */}
              <Route path="/" element={<SignIn />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/activate" element={<SetupPassword />} />
              <Route path="/reset" element={<SetupPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />

              {/* Protected app */}
              <Route
                path="/dashboard"
                element={
                  <Protected>
                    <Dashboard />
                  </Protected>
                }
              />
              <Route
                path="/mothers"
                element={
                  <Protected>
                    <MothersPage />
                  </Protected>
                }
              />
              <Route
                path="/calls"
                element={
                  <Protected>
                    <CallsPage />
                  </Protected>
                }
              />
              <Route
                path="/staff"
                element={
                  <Protected>
                    <StaffPage />
                  </Protected>
                }
              />
              <Route
                path="/settings"
                element={
                  <Protected>
                    <SettingsPage />
                  </Protected>
                }
              />

              {/* API docs — sign-in + server-side docs_access allowlist */}
              <Route path="/docs" element={gatedDocs} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </DrawerProvider>
        <ErrorToast />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

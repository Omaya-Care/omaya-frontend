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
import { DrawerProvider } from "./contexts/DrawerContext";
import { ErrorToast } from "./components/ui";
import DocsLoading from "./components/DocsLoading";

const Docs = lazy(() => import("./Docs"));

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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <DrawerProvider>
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

            {/* Path-based docs access (the docs.* subdomain is handled in main.tsx) */}
            <Route
              path="/docs"
              element={
                <Suspense fallback={<DocsLoading />}>
                  <Docs />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DrawerProvider>
        <ErrorToast />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import MothersPage from "./pages/Mothers";
import CallsPage from "./pages/Calls";
import StaffPage from "./pages/Staff";
import SettingsPage from "./pages/Settings";
import { AppShell } from "./components/layout";
import { DrawerProvider } from "./contexts/DrawerContext";
import { ErrorToast } from "./components/ui";
import DocsLoading from "./components/DocsLoading";

const Docs = lazy(() => import("./Docs"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <DrawerProvider>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route
            path="/dashboard"
            element={
              <AppShell>
                <Dashboard />
              </AppShell>
            }
          />
          <Route
            path="/mothers"
            element={
              <AppShell>
                <MothersPage />
              </AppShell>
            }
          />
          <Route
            path="/calls"
            element={
              <AppShell>
                <CallsPage />
              </AppShell>
            }
          />
          <Route
            path="/staff"
            element={
              <AppShell>
                <StaffPage />
              </AppShell>
            }
          />
          <Route
            path="/settings"
            element={
              <AppShell>
                <SettingsPage />
              </AppShell>
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

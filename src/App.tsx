import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import MothersPage from "./pages/Mothers";
import CallsPage from "./pages/Calls";
import StaffPage from "./pages/Staff";
import SettingsPage from "./pages/Settings";
import { AppShell } from "./components/layout";
import { DrawerProvider } from "./contexts/DrawerContext";

export default function App() {
  return (
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DrawerProvider>
    </BrowserRouter>
  );
}

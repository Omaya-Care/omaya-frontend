import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import MothersPage from "./pages/Mothers";
import AddMother from "./pages/AddMother";
import NewDischarge from "./pages/NewDischarge";
import { AppShell } from "./components/layout";

export default function App() {
  return (
    <BrowserRouter>
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
        <Route path="/onboarding/add-mother" element={<AddMother />} />
        <Route path="/onboarding/discharge" element={<NewDischarge />} />
        {/* Redirect unknown routes to / for now */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

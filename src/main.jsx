// main.jsx — Vite entry point for Omaya Care Dashboard
import React from "react";
import { createRoot } from "react-dom/client";
import { useWindowWidth } from "./dash-foundation.jsx";
import { Dash } from "./dash-components.jsx";
import { DashScreens } from "./dash-screens.jsx";
import { MothersView } from "./dash-mothers.jsx";
import { CallsView } from "./dash-calls.jsx";
import { StaffView } from "./dash-staff.jsx";
import { SettingsView } from "./dash-settings.jsx";
import { AdminOverview } from "./dash-admin.jsx";

const CANVAS = "#F4F4F6";

function DashboardApp() {
  const w = useWindowWidth();
  const stack = w < 820;
  const [page, setPage] = React.useState("dashboard");

  const pages = {
    dashboard: () => (
      <div
        style={{
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          padding: `clamp(14px, 2.5vw, 30px) ${w >= 1280 ? 24 : 20}px 32px`,
          overflowY: "auto",
        }}
      >
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>
          <DashScreens.CohortOverview
            counts={{ L1: 98, L2: 30, L3: 11, L4: 3 }}
            inactive={12}
            week={{
              calls: 318,
              l3: 11,
              l4: 3,
              resolved: 12,
              breached: 1,
              response: "11m",
              discharges: 8,
            }}
            stack={stack}
          />
        </div>
      </div>
    ),
    mothers: () => <MothersView w={w} emptyClinic={false} />,
    calls: () => <CallsView w={w} />,
    staff: () => <StaffView w={w} />,
    settings: () => <SettingsView w={w} />,
    admin: () => <AdminOverview w={w} />,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        background: CANVAS,
      }}
    >
      {!stack && (
        <Dash.Sidebar
          rail={w < 1040}
          current={page}
          onNav={(id) => setPage(id)}
        />
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          {(pages[page] || pages.dashboard)()}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<DashboardApp />);

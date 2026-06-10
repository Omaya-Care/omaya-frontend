// dash-admin.jsx — Omaya Admin overview. Quiet numbers, muted surfaces, DPA export.
// Restrained + trustworthy; admin role only.
import React from "react";
import { OM, TK, Icons } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

// ---------------- atoms ----------------
function AdminPill() {
  return (
    <span
      style={{
        ...TK.badge,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        background: "#F1F1F4",
        color: OM.slate,
        borderRadius: 999,
        padding: "5px 13px 5px 10px",
        fontSize: 12.5,
        fontWeight: 600,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <Icons.shield size={14} sw={2} style={{ color: OM.tertiary }} />
      Administrators only
    </span>
  );
}

// dashboard-style stat card (mirrors the cohort dashboard cards)
function StatIconTile({ icon }) {
  const I = Icons[icon];
  return (
    <div
      style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        color: OM.tertiary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <I size={22} sw={2} />
    </div>
  );
}

function StatCard({ icon, label, value, sub }) {
  return (
    <UI.Card
      padding="p-6"
      style={{
        flex: "1 1 240px",
        minWidth: 0,
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 10,
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: OM.navy,
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
        <StatIconTile icon={icon} />
      </div>
      <div style={{ ...TK.statValue, marginTop: 22 }}>{value}</div>
      <div style={{ flex: 1, minHeight: 16 }} />
      <div style={{ fontSize: 13.5, color: OM.tertiary }}>{sub}</div>
    </UI.Card>
  );
}

// ---------------- DPA export ----------------
function PeriodSelect() {
  const [f, setF] = React.useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        defaultValue="90"
        style={{
          ...TK.btn.md,
          padding: "0 38px 0 14px",
          fontWeight: 500,
          appearance: "none",
          WebkitAppearance: "none",
          fontFamily: "var(--ui-font)",
          fontSize: 14,
          color: OM.slate,
          cursor: "pointer",
          background: f ? OM.surface : "#F4F4F6",
          outline: "none",
          border: `1px solid ${f ? OM.focus : "transparent"}`,
          boxShadow: f ? `0 0 0 3px ${OM.periBg}` : "none",
          transition: "background .12s, border-color .12s, box-shadow .12s",
        }}
      >
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="ytd">This year to date</option>
        <option value="all">All time</option>
      </select>
      <Icons.chevronDown
        size={17}
        sw={2}
        style={{
          color: OM.tertiary,
          position: "absolute",
          right: 13,
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

function ExportButton({ onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        ...TK.btn.lg,
        ...TK.btnPrimary,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        fontFamily: "var(--ui-font)",
        whiteSpace: "nowrap",
        transition: "background .12s",
        background: h ? OM.plumHover : OM.plum,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v12M7 11l5 4 5-4M5 21h14" />
      </svg>
      Export audit (DPA)
    </button>
  );
}

function ExportCard() {
  const [done, setDone] = React.useState(false);
  return (
    <UI.Card padding="p-6">
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Icons.shield
              size={19}
              sw={2}
              style={{ color: OM.slate, flexShrink: 0 }}
            />
            <h2 style={{ ...TK.sectionTitle, whiteSpace: "nowrap" }}>
              Export audit (DPA)
            </h2>
          </div>
          <p
            style={{
              margin: "10px 0 0",
              fontSize: 14,
              color: OM.slate,
              lineHeight: 1.6,
              maxWidth: 480,
              textWrap: "pretty",
            }}
          >
            Generate a Data Protection Act compliant record of access logs,
            check-ins, and escalations for the selected period.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <PeriodSelect />
          <ExportButton onClick={() => setDone(true)} />
        </div>
      </div>

      {/* trust line — own full-width row so it never crowds */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 18,
          paddingTop: 16,
          borderTop: TK.rowBorder,
          fontSize: 12.5,
          color: OM.tertiary,
          flexWrap: "wrap",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
        <span>Encrypted and recorded in the audit trail</span>
        <span style={{ color: OM.border }}>·</span>
        <span>
          Last export <span style={{ fontFamily: OM.mono }}>28 May 2025</span>
          , A. Mensah
        </span>
      </div>

      {done && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            marginTop: 16,
            padding: "11px 14px",
            borderRadius: 11,
            background: "#F1F6F2",
            border: "1px solid #E1EBE4",
            color: "#2C4A39",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 999,
              background: "#2E7D55",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icons.check size={14} sw={3} />
          </span>
          <span style={{ fontSize: 13.5 }}>
            Export started — a secure download link will be emailed to you
            shortly.
          </span>
        </div>
      )}
    </UI.Card>
  );
}

// ---------------- view ----------------
function AdminOverview({ w }) {
  const hp = w >= 1280 ? 24 : 20;
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: `clamp(14px, 2.5vw, 30px) ${hp}px 40px`,
      }}
    >
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 28,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 400,
              color: "#8A8A8A",
              marginBottom: 10,
            }}
          >
            Korle Bu Maternity
          </div>
          <h1 style={TK.pageTitle}>Admin overview</h1>
        </div>
        <div style={{ marginTop: 6 }}>
          <AdminPill />
        </div>
      </div>

      {/* dashboard-style stat cards */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: TK.gap.md }}>
        <StatCard
          icon="users"
          label="Mothers active"
          value="142"
          sub="Currently in monitoring"
        />
        <StatCard
          icon="phoneCall"
          label="Check-ins this week"
          value="318"
          sub="Mon to today"
        />
        <StatCard
          icon="clock"
          label="Late readmissions"
          value="3"
          sub="Within 30 days of discharge"
        />
        <StatCard
          icon="shield"
          label="Resolved within SLA"
          value="94%"
          sub="L3 & L4 alerts this week"
        />
      </div>

      {/* DPA export */}
      <div style={{ marginTop: TK.section.marginBottom }}>
        <ExportCard />
      </div>
    </div>
  );
}

export { AdminOverview };

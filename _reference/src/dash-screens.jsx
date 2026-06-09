// dash-screens.jsx — Omaya Dashboard sections, modern card/table language
// (Squarespace airy cards + tables · Fireflies metric grid). Color = acuity only.
import React from "react";
import { OM, SEV, Icons, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

// app-status (feedback/neutral) — NEVER severity
const CALL_STATUS = {
  inprogress: {
    label: "In progress",
    fg: "#166534",
    bg: "#F0FDF4",
    dot: "#166534",
    pulse: true,
  },
  upcoming: {
    label: "Upcoming",
    fg: "#B45309",
    bg: "#FEF3E2",
    dot: "#B45309",
  },
  completed: {
    label: "Completed",
    fg: "#065F46",
    bg: "#ECFDF5",
    dot: "#065F46",
  },
  missed: { label: "Missed", fg: "#C0392B", bg: "#FDECEA", dot: "#C0392B" },
};

// soft severity dot-pills — calmer register for the cohort tables (still triple-coded via label + dot + tint)
const SOFT_SEV = {
  L4: { bg: "#FDECEA", text: "#C0392B", dot: "#C0392B", label: "Crisis" },
  L3: { bg: "#FEF3E2", text: "#B45309", dot: "#B45309", label: "Elevated" },
  L2: { bg: "#EEF2FF", text: "#4338CA", dot: "#4338CA", label: "Monitor" },
  L1: { bg: "#ECFDF5", text: "#065F46", dot: "#065F46", label: "Routine" },
};
function SoftSevPill({ level }) {
  const s = SOFT_SEV[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: s.bg,
        color: s.text,
        borderRadius: 999,
        padding: "2px 10px",
        fontSize: 11,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {s.label}
    </span>
  );
}

// ---------- shared atoms ----------
function Card({ children, padding = 0, style, hoverable = false }) {
  return (
    <UI.Card padding={padding} style={style} hoverable={hoverable}>
      {children}
    </UI.Card>
  );
}

function CardHead({ title, meta, action, onAction }) {
  const [h, setH] = React.useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 14,
        padding: "24px 24px 14px",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h2 style={{ ...TK.sectionTitle, whiteSpace: "nowrap" }}>{title}</h2>
        {meta && (
          <div
            style={{
              fontSize: 13.5,
              color: OM.tertiary,
              marginTop: 4,
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </div>
        )}
      </div>
      {action && (
        <button
          type="button"
          onClick={onAction}
          onMouseEnter={() => setH(true)}
          onMouseLeave={() => setH(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            border: "none",
            background: "transparent",
            color: h ? OM.plum : OM.tertiary,
            cursor: "pointer",
            fontFamily: "var(--ui-font)",
            fontSize: 13.5,
            fontWeight: 600,
            whiteSpace: "nowrap",
            flexShrink: 0,
            transition: "color .12s",
          }}
        >
          {action}
          <Icons.arrowRight size={15} sw={2.2} />
        </button>
      )}
    </div>
  );
}

function ColHeaders({ cols }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: cols.map((c) => c.w).join(" "),
        gap: 16,
        padding: "0 20px 8px",
        borderBottom: TK.rowBorder,
      }}
    >
      {cols.map((c, i) => (
        <div key={i} style={{ ...TK.th, textAlign: c.align || "left" }}>
          {c.label}
        </div>
      ))}
    </div>
  );
}

function SeverityBadge({ level }) {
  const s = SEV[level];
  const I = Icons[s.icon];
  return (
    <span
      style={{
        ...TK.badge,
        gap: 5,
        background: s.solid ? s.base : s.tint,
        color: s.onTint,
      }}
    >
      <I size={12} sw={2.2} />
      {s.label}
    </span>
  );
}
function StatusPill({ status }) {
  const st = CALL_STATUS[status];
  return (
    <span style={{ ...TK.badge, background: st.bg, color: st.fg }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: st.dot,
          flexShrink: 0,
          animation: st.pulse ? "omPulse 1.4s ease-in-out infinite" : "none",
        }}
      />
      {st.label}
    </span>
  );
}

// ========== STAT CARDS ==========
function StatIconTile({ icon }) {
  const I = Icons[icon];
  return (
    <div
      style={{
        width: 40,
        height: 40,
        flexShrink: 0,
        background: "transparent",
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

function StatCard({ label, meta, value, footer, onView, icon }) {
  const [h, setH] = React.useState(false);
  return (
    <UI.Card
      padding="p-6"
      style={{
        flex: "1 1 240px",
        minWidth: 0,
        minHeight: 200,
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
        <div style={{ minWidth: 0 }}>
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
          {meta && (
            <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 3 }}>
              {meta}
            </div>
          )}
        </div>
        <StatIconTile icon={icon} />
      </div>
      <div style={{ ...TK.statValue, marginTop: 22 }}>{value}</div>
      <div style={{ flex: 1, minHeight: 18 }} />
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        {footer.kind === "status" ? (
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: footer.tone === "red" ? "#C5402B" : OM.tertiary,
            }}
          >
            {footer.text}
          </span>
        ) : (
          <button
            type="button"
            onClick={onView}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{
              border: "none",
              background: "transparent",
              color: h ? OM.plum : OM.slate,
              cursor: "pointer",
              fontFamily: "var(--ui-font)",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "underline",
              textUnderlineOffset: 3,
              transition: "color .12s",
            }}
          >
            View all
          </button>
        )}
      </div>
    </UI.Card>
  );
}

function StatRow({ stats, onNav }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: TK.gap.md }}>
      <StatCard
        label="Mothers in care"
        meta="Active right now"
        value={stats.active}
        icon="users"
        footer={{ kind: "link" }}
        onView={() => onNav("mothers")}
      />
      <StatCard
        label="Calls today"
        meta="Scheduled & completed"
        value={stats.callsToday}
        icon="phoneCall"
        footer={{ kind: "link" }}
        onView={() => onNav("calls")}
      />
      <StatCard
        label="Need attention"
        meta="L3 & L4 unacknowledged"
        value={stats.escalations}
        icon="bell"
        footer={
          stats.escalations > 0
            ? {
                kind: "status",
                text: `${stats.escalations} waiting`,
                tone: "red",
              }
            : { kind: "status", text: "All clear", tone: "muted" }
        }
        onView={() => onNav("mothers")}
      />
    </div>
  );
}

// ========== NEEDS ATTENTION (table card) ==========
const NEEDS_COLS = "minmax(160px,1.6fr) 1fr 168px 176px";

function ViewAllBtn({ onClick }) {
  const [vh, setVh] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setVh(true)}
      onMouseLeave={() => setVh(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        border: "none",
        background: "transparent",
        color: vh ? "#9A1D14" : "#B42318",
        cursor: "pointer",
        fontFamily: "var(--ui-font)",
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transition: "color .12s",
      }}
    >
      View all
      <Icons.chevronRight size={16} sw={2.2} />
    </button>
  );
}

function AlertRow({ a, last, acked, onOpen, onAck }) {
  const [h, setH] = React.useState(false);
  const [bh, setBh] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={() => onOpen && onOpen(a)}
      role="button"
      tabIndex={0}
      style={{
        display: "grid",
        gridTemplateColumns: NEEDS_COLS,
        gap: 16,
        alignItems: "center",
        padding: "12px 20px",
        borderBottom: last ? "none" : TK.rowBorder,
        background: h ? TK.rowHover : "transparent",
        cursor: "pointer",
        transition: "background .1s",
      }}
    >
      {/* mother + day */}
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 600,
            color: h ? OM.plum : OM.navy,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "color .1s",
          }}
        >
          {a.name}
        </div>
        <div
          style={{
            fontFamily: OM.mono,
            fontSize: 13,
            color: OM.tertiary,
            marginTop: 4,
          }}
        >
          Day {a.day}
        </div>
      </div>
      {/* severity */}
      <div>
        <SoftSevPill level={a.level} />
      </div>
      {/* SLA */}
      <div>
        <div
          style={{
            fontFamily: OM.mono,
            fontSize: 15.5,
            fontWeight: 600,
            color: acked ? OM.tertiary : OM.navy,
            lineHeight: 1.1,
          }}
        >
          {acked ? "—" : a.sla}
        </div>
        <div style={{ fontSize: 12.5, color: OM.tertiary, marginTop: 4 }}>
          {acked ? "Acknowledged" : "left within SLA"}
        </div>
      </div>
      {/* action — secondary outline, not primary */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAck && onAck(a.id);
          }}
          disabled={acked}
          onMouseEnter={() => setBh(true)}
          onMouseLeave={() => setBh(false)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            height: 40,
            padding: "0 18px",
            borderRadius: 9,
            border: `1px solid ${acked ? OM.border : bh ? OM.borderStrong : OM.border}`,
            background: acked ? "#F4F5F7" : bh ? "#F7F8FA" : OM.surface,
            color: acked ? OM.tertiary : OM.navy,
            cursor: acked ? "default" : "pointer",
            fontFamily: "var(--ui-font)",
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "background .12s, border-color .12s",
          }}
        >
          {acked ? (
            <React.Fragment>
              <Icons.check size={15} sw={2.4} />
              Acknowledged
            </React.Fragment>
          ) : (
            "Acknowledge"
          )}
        </button>
      </div>
    </div>
  );
}

function NeedsNow({ alerts, onView, onOpen, acked, onAck }) {
  const remaining = alerts.filter((a) => !(acked && acked[a.id])).length;
  const hdr = { ...TK.th, textAlign: "left" };
  return (
    <Card>
      {/* header — attention pill + view all */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          padding: "12px 18px 12px 20px",
          borderBottom: `1px solid ${OM.border}`,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            background: "#FCEEED",
            color: "#B42318",
            borderRadius: 999,
            padding: "4px 6px 4px 12px",
            fontSize: 13.5,
            fontWeight: 600,
          }}
        >
          Needs attention
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 22,
              height: 22,
              padding: "0 6px",
              borderRadius: 999,
              background: OM.surface,
              color: "#B42318",
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {remaining}
          </span>
        </span>
        <ViewAllBtn onClick={() => onView("mothers")} />
      </div>
      {alerts.length === 0 ? (
        <div style={{ padding: "22px 20px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: OM.navy }}>
            All mothers are doing well right now
          </div>
          <div style={{ fontSize: 13.5, color: OM.tertiary, marginTop: 4 }}>
            No escalations waiting on you.
          </div>
        </div>
      ) : (
        <React.Fragment>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: NEEDS_COLS,
              gap: 16,
              padding: "10px 20px",
              borderBottom: TK.rowBorder,
            }}
          >
            <div style={hdr}>Mother</div>
            <div style={hdr}>Severity</div>
            <div
              style={{
                ...TK.th,
                textAlign: "left",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icons.clock size={14} sw={2} />
              Time left
            </div>
            <div />
          </div>
          {alerts.map((a, i) => (
            <AlertRow
              key={a.id}
              a={a}
              last={i === alerts.length - 1}
              acked={!!(acked && acked[a.id])}
              onOpen={onOpen}
              onAck={onAck}
            />
          ))}
        </React.Fragment>
      )}
    </Card>
  );
}

// ========== TODAY'S CALLS (table card) ==========
function CallRow({ c, last }) {
  const [h, setH] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1.4fr 1fr auto",
        gap: 16,
        alignItems: "center",
        padding: "10px 20px",
        borderBottom: last ? "none" : TK.rowBorder,
        background: h ? TK.rowHover : "transparent",
        transition: "background .1s",
      }}
    >
      <div
        style={{
          fontFamily: OM.mono,
          fontSize: 13.5,
          fontWeight: 500,
          color: OM.slate,
        }}
      >
        {c.time}
      </div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: OM.navy,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {c.name}
      </div>
      <div style={{ fontSize: 13.5, color: OM.tertiary }}>
        {c.type} check-in
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <StatusPill status={c.status} />
      </div>
    </div>
  );
}

function TodaysCalls({ calls, onView }) {
  const done = calls.filter((c) => c.status === "completed").length;
  return (
    <Card>
      <CardHead
        title="Today's calls"
        meta={`${done} of ${calls.length} completed`}
        action="View all"
        onAction={() => onView("calls")}
      />
      <ColHeaders
        cols={[
          { label: "Time", w: "90px" },
          { label: "Mother", w: "1.4fr" },
          { label: "Call type", w: "1fr" },
          { label: "Status", w: "auto" },
        ]}
      />
      {calls.map((c, i) => (
        <CallRow key={c.id} c={c} last={i === calls.length - 1} />
      ))}
    </Card>
  );
}

// ========== COHORT OVERVIEW (Fireflies 2-col metric grid) ==========
function DistRow({ level, count, total, inactiveItem }) {
  const I = inactiveItem ? Icons.slashCircle : Icons[SEV[level].icon];
  const color = inactiveItem ? "#C2C8D2" : SEV[level].base;
  const label = inactiveItem ? "Inactive" : SEV[level].label;
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "118px 1fr 30px",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}
      >
        <span style={{ display: "inline-flex", color, flexShrink: 0 }}>
          <I size={16} sw={2} />
        </span>
        <span
          style={{ fontSize: 13.5, color: OM.slate, whiteSpace: "nowrap" }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          height: 8,
          background: "#F0F2F5",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: Math.max(pct, count > 0 ? 4 : 0) + "%",
            height: "100%",
            background: color,
            borderRadius: 999,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: OM.mono,
          fontSize: 14,
          fontWeight: 500,
          color: inactiveItem ? OM.tertiary : OM.navy,
          textAlign: "right",
        }}
      >
        {count}
      </div>
    </div>
  );
}

function MetricRow({ label, value, sub, last }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "13px 0",
        borderBottom: last ? "none" : `1px solid ${OM.borderSoft}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, color: OM.slate }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 12, color: OM.tertiary, marginTop: 1 }}>
            {sub}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: OM.mono,
          fontSize: 17,
          fontWeight: 500,
          color: OM.navy,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CohortOverview({ counts, inactive, week, stack }) {
  const total = counts.L4 + counts.L3 + counts.L2 + counts.L1 + inactive;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: stack ? "1fr" : "1fr 1fr",
        gap: 16,
      }}
    >
      <Card style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <h2 style={{ ...TK.sectionTitle }}>Severity distribution</h2>
          <span style={{ fontSize: 13, color: OM.tertiary }}>
            {total} mothers
          </span>
        </div>
        <div
          style={{ display: "flex", gap: 3, height: 10, marginBottom: 20 }}
        >
          {[
            ["L4", counts.L4],
            ["L3", counts.L3],
            ["L2", counts.L2],
            ["L1", counts.L1],
            ["x", inactive],
          ]
            .filter(([, c]) => c > 0)
            .map(([lv, c], i) => (
              <div
                key={i}
                style={{
                  flex: c,
                  background: lv === "x" ? "#D8DCE2" : SEV[lv].base,
                  borderRadius: 3,
                  minWidth: 6,
                }}
              />
            ))}
        </div>
        <div style={{ display: "grid", gap: 13 }}>
          <DistRow level="L4" count={counts.L4} total={total} />
          <DistRow level="L3" count={counts.L3} total={total} />
          <DistRow level="L2" count={counts.L2} total={total} />
          <DistRow level="L1" count={counts.L1} total={total} />
          <DistRow inactiveItem count={inactive} total={total} />
        </div>
      </Card>
      <Card style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h2 style={{ ...TK.sectionTitle }}>This week</h2>
          <span style={{ fontSize: 13, color: OM.tertiary }}>
            Mon – today
          </span>
        </div>
        <MetricRow
          label="Calls completed"
          sub="across the cohort"
          value={week.calls}
        />
        <MetricRow
          label="Escalations resolved"
          sub="L3 & L4 acknowledged"
          value={week.resolved}
        />
        <MetricRow
          label="New discharges"
          sub="mothers enrolled"
          value={week.discharges}
        />
        <MetricRow
          label="Avg. response time"
          sub="to L3 & L4 alerts"
          value={week.response}
          last
        />
      </Card>
    </div>
  );
}

const DashScreens = { StatRow, NeedsNow, TodaysCalls, CohortOverview };

export { DashScreens };

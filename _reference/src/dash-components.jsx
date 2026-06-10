// dash-components.jsx — Omaya Postpartum Cohort Dashboard components
import React from "react";
import { OM, SEV, SEV_RANK, Icons, IconsFilled, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

// ---------- shared bits ----------
function IconTile({ level, size = 40, radius = 10 }) {
  const s = SEV[level];
  const I = Icons[s.icon];
  const bg = s.solid ? s.base : s.tint;
  const fg = s.solid ? s.onTint : s.onTint;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <I size={Math.round(size * 0.5)} sw={2} />
    </div>
  );
}

function InactiveTile({ size = 40, radius = 10 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: "#EEF0F3",
        color: OM.tertiary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icons.slashCircle size={Math.round(size * 0.5)} sw={2} />
    </div>
  );
}

function SeverityBadge({ level }) {
  const s = SEV[level];
  const I = Icons[s.icon];
  const bg = s.solid ? s.base : s.tint;
  const fg = s.onTint;
  return (
    <span
      style={{
        ...TK.badge,
        gap: 5,
        background: bg,
        color: fg,
      }}
    >
      <I size={12} sw={2.2} />
      {s.label}
    </span>
  );
}

function NeutralPill({ children }) {
  return (
    <span
      style={{
        ...TK.badge,
        background: "#F3F4F6",
        color: "#6B7280",
      }}
    >
      {children}
    </span>
  );
}

// ---------- Sidebar (minimal shell: logo · plain nav · account + bell) ----------
function NavItem({ icon, label, id, current, onNav, rail }) {
  const [hover, setHover] = React.useState(false);
  const active = current === id;
  const I = active ? IconsFilled[icon] || Icons[icon] : Icons[icon];
  const color = active ? OM.navActive : hover ? OM.navInkHover : OM.navInk;
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onNav && onNav(id);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={rail ? label : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: rail ? 0 : "8px 12px",
        justifyContent: rail ? "center" : "flex-start",
        borderRadius: 10,
        textDecoration: "none",
        color,
        background: rail && active ? OM.plumTint : "transparent",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        letterSpacing: "-0.01em",
        transition: "color .12s ease",
      }}
    >
      <I size={24} sw={active ? 2.2 : 2} style={{ flexShrink: 0 }} />
      {!rail && <span>{label}</span>}
    </a>
  );
}

// Logo mark — soft rounded square with a plum half-disc, matching the reference
function LogoMark({ size = 52 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(155deg, #FBF0F5 0%, #F0DBE6 100%)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.8), 0 1px 2px rgba(30,18,26,0.08), 0 0 0 1px rgba(147,64,107,0.05)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: "30%",
          transform: "translateX(-50%)",
          width: size * 0.46,
          height: size * 0.23,
          borderTopLeftRadius: size * 0.46,
          borderTopRightRadius: size * 0.46,
          background: `linear-gradient(180deg, ${OM.plum} 0%, ${OM.plumPressed} 100%)`,
        }}
      />
    </div>
  );
}

function Sidebar({ rail, current, onNav }) {
  const [bellHover, setBellHover] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const width = rail ? 76 : 256;

  const userMenuItems = [
    { label: "Your profile", value: "settings", icon: "user" },
    { label: "Settings", value: "settings", icon: "settings" },
    { divider: true },
    { label: "Sign out", value: "logout", icon: "logout", danger: true },
  ];

  return (
    <aside
      style={{
        width,
        flexShrink: 0,
        height: "100%",
        boxSizing: "border-box",
        background: "#F5F6F8",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        padding: rail ? "24px 5px 24px 12px" : "26px 5px 26px 14px",
      }}
    >
      {/* logo */}
      <div
        style={{
          display: "flex",
          justifyContent: rail ? "center" : "flex-start",
          padding: rail ? 0 : "0 4px",
          marginBottom: 28,
        }}
      >
        <LogoMark size={rail ? 44 : 52} />
      </div>

      {/* nav */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <NavItem
          icon="home"
          label="Dashboard"
          id="dashboard"
          current={current}
          onNav={onNav}
          rail={rail}
        />
        <NavItem
          icon="users"
          label="Mothers"
          id="mothers"
          current={current}
          onNav={onNav}
          rail={rail}
        />
        <NavItem
          icon="phoneCall"
          label="Calls"
          id="calls"
          current={current}
          onNav={onNav}
          rail={rail}
        />
        <NavItem
          icon="user"
          label="Staff & Roles"
          id="staff"
          current={current}
          onNav={onNav}
          rail={rail}
        />
        <NavItem
          icon="shield"
          label="Admin"
          id="admin"
          current={current}
          onNav={onNav}
          rail={rail}
        />
        <NavItem
          icon="settings"
          label="Settings"
          id="settings"
          current={current}
          onNav={onNav}
          rail={rail}
        />
      </nav>

      <div style={{ flex: 1, minHeight: 24 }} />

      {/* account */}
      <div
        style={{
          position: "relative",
          borderTop: `1px solid ${OM.divider}`,
          paddingTop: 20,
          paddingLeft: rail ? 0 : 4,
          paddingRight: rail ? 0 : 4,
        }}
      >
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 13,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 0,
            justifyContent: rail ? "center" : "flex-start",
            textAlign: "left",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 999,
              background: "linear-gradient(150deg, #C99BB2 0%, #93406B 100%)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15.5,
              fontWeight: 600,
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            KB
          </div>
          {!rail && (
            <React.Fragment>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: OM.navInkHover,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    letterSpacing: "-0.01em",
                  }}
                >
                  K. Boateng
                </div>
                <div
                  style={{
                    fontSize: 14,
                    color: "#8A8A8A",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  k.boateng@korlebu.gh
                </div>
              </div>
              <Icons.chevronUp
                size={16}
                sw={2.2}
                style={{ color: OM.tertiary, flexShrink: 0 }}
              />
            </React.Fragment>
          )}
        </button>

        {menuOpen && (
          <UI.Popover
            items={userMenuItems}
            onSelect={(item) => {
              if (item.value === "logout") {
                window.location.href = "Omaya Sign-in.html";
              } else {
                onNav(item.value);
              }
            }}
            onClose={() => setMenuOpen(false)}
            width={rail ? 200 : 240}
            align={rail ? "left" : "left"}
            top={-180}
          />
        )}
      </div>
    </aside>
  );
}

// ---------- Full-width top header ----------
function GhostIconButton({ title, children }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 38,
        height: 38,
        borderRadius: 9,
        border: "none",
        background: hover ? "#F1F3F6" : "transparent",
        color: OM.slate,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "background .12s ease",
      }}
    >
      {children}
    </button>
  );
}

function TopHeader({
  rail,
  compact,
  current,
  onPrimary,
  subCrumb,
  hidePrimary,
}) {
  const [btnHover, setBtnHover] = React.useState(false);
  const [userHover, setUserHover] = React.useState(false);
  const leftZone = rail ? 76 : 264;
  const PAGE = {
    cohort: { crumb: "Dashboard", btn: "New discharge", btnShort: "New" },
    messages: { crumb: "Check-ins", btn: "New message", btnShort: "New" },
    mothers: { crumb: "All mothers", btn: "Add mother", btnShort: "Add" },
    discharges: {
      crumb: "Discharges",
      btn: "New discharge",
      btnShort: "New",
    },
    staff: {
      crumb: "Staff & roles",
      btn: "Invite teammate",
      btnShort: "Invite",
    },
    settings: { crumb: "Settings", btn: null, btnShort: null },
  };
  const page = PAGE[current] || PAGE.cohort;
  return (
    <header
      style={{
        flexShrink: 0,
        height: 56,
        display: "flex",
        alignItems: "stretch",
        background: OM.surface,
        borderBottom: `1px solid ${OM.border}`,
        zIndex: 20,
      }}
    >
      {/* brand zone — aligns with sidebar */}
      <div
        style={{
          width: leftZone,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          padding: rail ? 0 : "0 20px",
          justifyContent: rail ? "center" : "flex-start",
        }}
      >
        {!rail && (
          <span
            style={{
              fontSize: 19,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: OM.navy,
            }}
          >
            Omaya
          </span>
        )}
      </div>

      {/* main zone — breadcrumb + actions, aligned to the content column */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 clamp(14px, 2vw, 24px) 0 clamp(12px, 1.5vw, 20px)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            minWidth: 0,
          }}
        >
          {!compact && (
            <span
              style={{
                fontSize: 14,
                color: OM.tertiary,
                whiteSpace: "nowrap",
              }}
            >
              Korle Bu Maternity
            </span>
          )}
          {!compact && (
            <Icons.chevronRight
              size={15}
              sw={2}
              style={{ color: OM.borderStrong, flexShrink: 0 }}
            />
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: subCrumb ? 500 : 600,
              color: subCrumb ? OM.tertiary : OM.navy,
              whiteSpace: "nowrap",
            }}
          >
            {page.crumb}
          </span>
          {subCrumb && (
            <Icons.chevronRight
              size={15}
              sw={2}
              style={{ color: OM.borderStrong, flexShrink: 0 }}
            />
          )}
          {subCrumb && (
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: OM.navy,
                whiteSpace: "nowrap",
              }}
            >
              {subCrumb}
            </span>
          )}
        </div>
        <div style={{ flex: 1 }} />
        {page.btn && !hidePrimary && (
          <button
            type="button"
            onClick={onPrimary}
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              ...TK.btn.md,
              ...TK.btnPrimary,
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              cursor: "pointer",
              background: btnHover ? OM.plumHover : TK.btnPrimary.background,
              transition: "background .12s ease",
            }}
          >
            <Icons.plus size={17} sw={2.4} />
            {compact ? page.btnShort : page.btn}
          </button>
        )}
        <GhostIconButton title="Notifications">
          <Icons.bellMini size={19} sw={1.9} />
        </GhostIconButton>
        <button
          type="button"
          onMouseEnter={() => setUserHover(true)}
          onMouseLeave={() => setUserHover(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 38,
            padding: compact ? "0" : "0 8px 0 5px",
            width: compact ? 38 : "auto",
            justifyContent: "center",
            borderRadius: 9,
            border: "none",
            background: !compact && userHover ? "#F1F3F6" : "transparent",
            cursor: "pointer",
            flexShrink: 0,
            transition: "background .12s ease",
          }}
        >
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 999,
              background: OM.periBg,
              color: OM.periText,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12.5,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            KB
          </div>
          {!compact && (
            <div style={{ textAlign: "left", lineHeight: 1.2 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: OM.navy,
                  whiteSpace: "nowrap",
                }}
              >
                K. Boateng
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: OM.tertiary,
                  whiteSpace: "nowrap",
                }}
              >
                Midwife
              </div>
            </div>
          )}
          {!compact && (
            <Icons.chevronDown
              size={15}
              sw={2}
              style={{ color: OM.tertiary, flexShrink: 0 }}
            />
          )}
        </button>
      </div>
    </header>
  );
}

// ---------- Greeting + summary ----------
function GreetingHeader({ dateStr, greeting, total, needAttention }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontFamily: OM.mono,
          fontSize: 12.5,
          fontWeight: 500,
          letterSpacing: "0.04em",
          color: OM.tertiary,
          marginBottom: 8,
          textTransform: "uppercase",
        }}
      >
        {dateStr}
      </div>
      <h1 style={{ ...TK.pageTitle }}>{greeting}</h1>
      <p style={{ margin: "9px 0 0", fontSize: 14, color: OM.slate }}>
        <span
          style={{ fontFamily: OM.mono, fontWeight: 500, color: OM.navy }}
        >
          {total}
        </span>{" "}
        mothers in your care
        <span style={{ color: OM.borderStrong, margin: "0 8px" }}>·</span>
        <span
          style={{
            fontFamily: OM.mono,
            fontWeight: 500,
            color: needAttention > 0 ? OM.navy : OM.tertiary,
          }}
        >
          {needAttention}
        </span>{" "}
        {needAttention === 1 ? "needs" : "need"} attention
      </p>
    </div>
  );
}

// ---------- Cohort overview — calm distribution bar + restrained legend ----------
function LegendItem({ level, count, inactiveItem }) {
  const s = inactiveItem ? null : SEV[level];
  const color = inactiveItem ? OM.borderStrong : s.base;
  const I = inactiveItem ? Icons.slashCircle : Icons[s.icon];
  const label = inactiveItem ? "Inactive" : s.label;
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}
    >
      <span style={{ display: "inline-flex", color, flexShrink: 0 }}>
        <I size={17} sw={2} />
      </span>
      <span
        style={{
          fontFamily: OM.mono,
          fontSize: 16,
          fontWeight: 500,
          color: inactiveItem ? OM.tertiary : OM.navy,
          lineHeight: 1,
        }}
      >
        {count}
      </span>
      <span
        style={{ fontSize: 13.5, color: OM.tertiary, whiteSpace: "nowrap" }}
      >
        {label}
      </span>
    </div>
  );
}

function SeverityOverview({ counts, inactive }) {
  const total = counts.L4 + counts.L3 + counts.L2 + counts.L1 + inactive;
  const segs = [
    { c: counts.L4, color: SEV.L4.base },
    { c: counts.L3, color: SEV.L3.base },
    { c: counts.L2, color: SEV.L2.base },
    { c: counts.L1, color: SEV.L1.base },
    { c: inactive, color: "#D8DCE2" },
  ].filter((s) => s.c > 0);
  return (
    <UI.Card padding="p-6" style={{ marginBottom: 14 }}>
      {/* distribution bar */}
      <div style={{ display: "flex", gap: 3, height: 10, marginBottom: 16 }}>
        {segs.map((s, i) => (
          <div
            key={i}
            style={{
              flex: s.c,
              background: s.color,
              borderRadius: 3,
              minWidth: 6,
            }}
          />
        ))}
      </div>
      {/* legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 28px" }}>
        <LegendItem level="L4" count={counts.L4} />
        <LegendItem level="L3" count={counts.L3} />
        <LegendItem level="L2" count={counts.L2} />
        <LegendItem level="L1" count={counts.L1} />
        <LegendItem inactiveItem count={inactive} />
      </div>
    </UI.Card>
  );
}

// ---------- Action Required band ----------
function ActionBand({ mothers }) {
  const [hover, setHover] = React.useState(false);
  if (!mothers.length) return null;
  // highest severity present drives the spine
  const topLevel = mothers.reduce(
    (acc, m) =>
      SEV_RANK[m.level] > SEV_RANK[acc] ? m.level : acc,
    "L1",
  );
  const spine = SEV[topLevel].base;
  const names = mothers.map((m) => `${m.name} (Day ${m.day})`);
  const sentence =
    mothers.length === 1
      ? `${mothers[0].name} (Day ${mothers[0].day}) — ${mothers[0].note.toLowerCase()}.`
      : `${names.slice(0, -1).join(", ")} and ${names.slice(-1)} are waiting on you.`;
  return (
    <UI.Card
      padding="p-6"
      style={{
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        gap: 14,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: spine,
        }}
      />
      <IconTile level={topLevel} size={40} radius={10} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...TK.sectionTitle }}>Needs you now</div>
        <div style={{ fontSize: 14, color: OM.slate, marginTop: 2 }}>
          {sentence}
        </div>
      </div>
      <button
        type="button"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          ...TK.btn.md,
          ...TK.btnSecondary,
          flexShrink: 0,
          cursor: "pointer",
          background: hover ? "#F3F5F8" : TK.btnSecondary.background,
          border: hover
            ? `1px solid ${OM.borderStrong}`
            : TK.btnSecondary.border,
          transition: "background .12s ease, border-color .12s ease",
        }}
      >
        Review
      </button>
    </UI.Card>
  );
}

// ---------- Filter + sort row ----------
function Dropdown({ label }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...TK.btn.md,
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        borderRadius: 999,
        border: `1px solid ${hover ? OM.borderStrong : OM.border}`,
        background: hover ? "#F3F5F8" : OM.surface,
        color: OM.slate,
        cursor: "pointer",
        fontFamily: "var(--ui-font)",
        whiteSpace: "nowrap",
        transition: "background .12s ease, border-color .12s ease",
      }}
    >
      {label}
      <Icons.chevronDown size={15} sw={2} style={{ color: OM.tertiary }} />
    </button>
  );
}

function FilterSortRow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexWrap: "wrap",
      }}
    >
      <Dropdown label="All levels" />
      <Dropdown label="Most urgent" />
    </div>
  );
}

// ---------- Triage row + list ----------
function TriageRow({ m, last, showLast }) {
  const [hover, setHover] = React.useState(false);
  const inactive = m.status === "inactive";
  const spine = inactive ? OM.border : SEV[m.level].base;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "0 18px 0 22px",
        height: 78,
        cursor: "pointer",
        background: hover ? TK.rowHover : OM.surface,
        borderBottom: last ? "none" : TK.rowBorder,
        transition: "background .1s ease",
        opacity: inactive ? 0.72 : 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: spine,
        }}
      />
      {inactive ? (
        <InactiveTile size={40} radius={10} />
      ) : (
        <IconTile level={m.level} size={40} radius={10} />
      )}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            minWidth: 0,
          }}
        >
          <span
            style={{
              fontSize: 16.5,
              fontWeight: 600,
              color: OM.navy,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {m.name}
          </span>
          {inactive ? (
            <NeutralPill>Inactive</NeutralPill>
          ) : (
            <SeverityBadge level={m.level} />
          )}
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: OM.tertiary,
            marginTop: 3,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span
            style={{
              fontFamily: OM.mono,
              fontWeight: 500,
              color: inactive ? OM.tertiary : OM.slate,
            }}
          >
            Day {m.day}
          </span>
          <span style={{ margin: "0 7px", color: OM.border }}>·</span>
          {m.note}
        </div>
      </div>
      {showLast && (
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: OM.tertiary,
              marginBottom: 2,
              whiteSpace: "nowrap",
            }}
          >
            Last check-in
          </div>
          <div
            style={{
              fontFamily: OM.mono,
              fontSize: 13.5,
              fontWeight: 500,
              color: inactive ? OM.tertiary : OM.slate,
              whiteSpace: "nowrap",
            }}
          >
            {m.last}
          </div>
        </div>
      )}
      <Icons.chevronRight
        size={18}
        sw={2}
        style={{ color: OM.borderStrong, flexShrink: 0 }}
      />
    </div>
  );
}

function TriageList({ mothers, showLast }) {
  return (
    <UI.Card padding={0} style={{ overflow: "hidden" }}>
      {mothers.map((m, i) => (
        <TriageRow
          key={m.id}
          m={m}
          last={i === mothers.length - 1}
          showLast={showLast}
        />
      ))}
    </UI.Card>
  );
}

const Dash = {
  Sidebar,
  TopHeader,
  GreetingHeader,
  SeverityOverview,
  ActionBand,
  FilterSortRow,
  TriageList,
  SeverityBadge,
};

export { Dash };

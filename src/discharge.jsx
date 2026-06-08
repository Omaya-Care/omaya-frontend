// discharge.jsx — Omaya Two-Phase Enrollment Flow (Antenatal & Postpartum completion).
import React from "react";
import { OM, TK, useWindowWidth } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";
import { Dash } from "./dash-components.jsx";

const CANVAS = "#F4F4F6",
  LINE = "#E6E8EC",
  FIELD_BG = "#F1F1F4";
const GREEN = "#2E7D55",
  GREEN_BG = "#F0F8F3",
  GREEN_BD = "#CDE7D8";
const ERR = "#D92D20",
  ERR_BG = "#FEF3F2",
  ERR_TX = "#B42318",
  ERR_BD = "#F1B0AA";
const BLUE = "#24528C",
  BLUE_BG = "#EFF4FA",
  BLUE_BD = "#C8DAEE";

// ---------- internal atoms ----------
function I({ size = 22, sw = 1.9, children, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children}
    </svg>
  );
}
const IC = {
  Check: (p) => (
    <I {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </I>
  ),
  ArrowRight: (p) => (
    <I {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </I>
  ),
  ArrowLeft: (p) => (
    <I {...p}>
      <path d="M19 12H5M11 18l-6-6 6-6" />
    </I>
  ),
  X: (p) => (
    <I {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </I>
  ),
  User: (p) => (
    <I {...p}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </I>
  ),
  Phone: (p) => (
    <I {...p}>
      <path d="M7 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 5 5a2 2 0 0 1 2-2z" />
    </I>
  ),
  Calendar: (p) => (
    <I {...p}>
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M4 9h16M9 3v4M15 3v4" />
    </I>
  ),
  Pill: (p) => (
    <I {...p}>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <path d="M12 8v8" />
    </I>
  ),
  Drop: (p) => (
    <I {...p}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </I>
  ),
  Heart: (p) => (
    <I {...p}>
      <path d="M12 20s-7-4.6-7-9.6A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 2.8c0 5-7 9.6-7 9.6z" />
    </I>
  ),
  Shield: (p) => (
    <I {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9.5 12l1.7 1.7 3.3-3.4" />
    </I>
  ),
  Alert: (p) => (
    <I {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5M12 16h.01" />
    </I>
  ),
  Message: (p) => (
    <I {...p}>
      <path d="M21 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </I>
  ),
  CloudOff: (p) => (
    <I {...p}>
      <path d="M7 17a4 4 0 0 1-.5-7.97A5.5 5.5 0 0 1 16 7" />
      <path d="M19.5 12.6A3.5 3.5 0 0 1 18 19H9" />
      <path d="M3 3l18 18" />
    </I>
  ),
};

const HeartFilled = (p) => (
  <svg
    width={p.size || 22}
    height={p.size || 22}
    viewBox="0 0 24 24"
    fill="currentColor"
    style={p.style}
  >
    <path d="M12 20s-7-4.5-7-9.6A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 3.4c0 5.1-7 9.6-7 9.6z" />
  </svg>
);

function Btn({
  label,
  onClick,
  variant = "primary",
  icon,
  iconRight,
  disabled,
  full,
  style,
}) {
  const [h, setH] = React.useState(false);
  const IconC = icon ? IC[icon] : null;
  const RIcon = iconRight ? IC[iconRight] : null;
  const st = {
    primary: {
      bg: disabled ? "#E3CDD8" : h ? OM.plumHover : OM.plum,
      color: "#fff",
      border: "transparent",
    },
    ghost: {
      bg: h && !disabled ? "#EFEFF1" : "transparent",
      color: OM.slate,
      border: "transparent",
    },
    outline: {
      bg: h && !disabled ? "#F6F7F9" : "#fff",
      color: OM.navy,
      border: OM.border,
    },
  }[variant];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: full ? "100%" : "auto",
        height: 48,
        padding: "0 22px",
        borderRadius: 12,
        background: st.bg,
        color: st.color,
        border: `1px solid ${st.border}`,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "var(--ui-font)",
        fontSize: 15,
        fontWeight: 600,
        whiteSpace: "nowrap",
        transition: "background .12s",
        ...style,
      }}
    >
      {IconC && <IconC size={18} sw={2.1} />}
      {label}
      {RIcon && <RIcon size={18} sw={2.1} />}
    </button>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  icon,
  mono,
}) {
  const [f, setF] = React.useState(false);
  const IconC = icon ? IC[icon] : null;
  const border = error ? ERR_BD : f ? OM.focus : "transparent";
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: OM.navy,
          marginBottom: 7,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          height: 52,
          padding: "0 15px",
          background: error ? ERR_BG : f ? "#fff" : FIELD_BG,
          border: `1px solid ${border}`,
          borderRadius: 12,
          boxShadow: f
            ? `0 0 0 3px ${error ? "rgba(217,45,32,0.12)" : OM.periBg}`
            : "none",
          transition: "all .14s ease",
        }}
      >
        {IconC && (
          <IconC
            size={18}
            sw={1.9}
            style={{ color: error ? ERR : OM.tertiary, flexShrink: 0 }}
          />
        )}
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: mono ? OM.mono : "var(--ui-font)",
            fontSize: 15.5,
            color: OM.navy,
          }}
        />
      </div>
      {error ? (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            marginTop: 7,
            fontSize: 13,
            color: ERR_TX,
          }}
        >
          <IC.Alert size={14} sw={2} />
          {error}
        </span>
      ) : hint ? (
        <span
          style={{
            display: "block",
            marginTop: 7,
            fontSize: 13,
            color: OM.tertiary,
          }}
        >
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function Segmented({ label, value, onChange, options }) {
  return (
    <div>
      <span
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: OM.navy,
          marginBottom: 7,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", gap: 10 }}>
        {options.map(([k, l]) => {
          const a = value === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => onChange(k)}
              style={{
                flex: 1,
                height: 50,
                borderRadius: 12,
                cursor: "pointer",
                border: `1.5px solid ${a ? OM.plum : LINE}`,
                background: a ? OM.plumTint : "#fff",
                color: a ? OM.plum : OM.slate,
                fontFamily: "var(--ui-font)",
                fontSize: 14.5,
                fontWeight: a ? 600 : 500,
                transition: "all .12s ease",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CheckRow({ checked, onToggle, title, desc, icon, required, error }) {
  const [h, setH] = React.useState(false);
  const IconC = icon ? IC[icon] : null;
  const bd = error && !checked ? ERR_BD : checked ? GREEN_BD : LINE;
  const bg =
    error && !checked ? ERR_BG : checked ? GREEN_BG : h ? "#FAFAFB" : "#fff";
  return (
    <button
      type="button"
      onClick={onToggle}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        width: "100%",
        textAlign: "left",
        padding: "16px 16px",
        borderRadius: 13,
        border: `1.5px solid ${bd}`,
        background: bg,
        cursor: "pointer",
        transition: "all .12s ease",
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: checked ? GREEN : "#fff",
          border: `1.5px solid ${checked ? GREEN : OM.borderStrong}`,
          color: "#fff",
        }}
      >
        {checked && <IC.Check size={16} sw={2.6} />}
      </span>
      {IconC && (
        <IconC
          size={20}
          sw={1.9}
          style={{ color: checked ? GREEN : OM.tertiary, flexShrink: 0 }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: OM.navy }}>
            {title}
          </span>
          {required && (
            <span
              style={{
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: OM.plum,
                border: `1px solid ${OM.plum}`,
                borderRadius: 5,
                padding: "1px 6px",
              }}
            >
              Required
            </span>
          )}
        </div>
        {desc && (
          <div
            style={{
              fontSize: 13.5,
              color: OM.slate,
              marginTop: 3,
              lineHeight: 1.45,
            }}
          >
            {desc}
          </div>
        )}
      </div>
    </button>
  );
}

function ChipRow({ label, options, selected, onToggle, error }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <span
        style={{
          display: "block",
          fontSize: 14,
          fontWeight: 600,
          color: OM.navy,
          marginBottom: 10,
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => {
          const active = selected.includes(opt.key);
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => onToggle(opt.key)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 9,
                cursor: "pointer",
                border: `1.5px solid ${active ? OM.plum : LINE}`,
                background: active ? OM.plumTint : "#fff",
                color: active ? OM.plum : OM.slate,
                fontFamily: "var(--ui-font)",
                fontSize: 14,
                fontWeight: 500,
                transition: "all .12s",
              }}
            >
              {active && <IC.Check size={14} sw={3} />}
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && (
        <div
          style={{
            marginTop: 8,
            fontSize: 13,
            color: ERR_TX,
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <IC.Alert size={14} sw={2} />
          {error}
        </div>
      )}
    </div>
  );
}

function PhoneVerify({ phone, onVerified, error }) {
  const [code, setCode] = React.useState("");
  const [sent, setSent] = React.useState(false);
  return (
    <div
      style={{
        background: "#F9FAFB",
        border: `1px solid ${LINE}`,
        borderRadius: 12,
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, color: OM.navy }}>
          Verify phone number
        </div>
        {!sent && (
          <button
            type="button"
            onClick={() => setSent(true)}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: OM.plum,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Send test SMS
          </button>
        )}
      </div>
      {sent ? (
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: OM.slate }}>
            A test message was sent to{" "}
            <strong style={{ color: OM.navy }}>{phone}</strong>. Enter the
            4-digit code or read it back to her.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              maxLength={4}
              value={code}
              onChange={(e) => {
                const v = e.target.value;
                setCode(v);
                if (v.length === 4) onVerified(true);
              }}
              placeholder="0000"
              style={{
                width: 80,
                height: 40,
                textAlign: "center",
                borderRadius: 8,
                border: `1px solid ${error ? ERR : OM.border}`,
                fontFamily: OM.mono,
                fontSize: 16,
                outline: "none",
              }}
            />
            {code.length === 4 && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: GREEN,
                }}
              >
                <IC.Check size={20} sw={2.5} />
              </span>
            )}
          </div>
        </div>
      ) : (
        <p style={{ margin: "10px 0 0", fontSize: 13, color: OM.tertiary }}>
          Verifying ensures AI check-in calls and reminders reach her
          correctly.
        </p>
      )}
    </div>
  );
}

function FindMother({ onFound, onNew }) {
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState(null);
  const doSearch = () => {
    setLoading(true);
    setTimeout(() => {
      const found = [
        {
          id: "m1",
          name: "Ama Mensah",
          phone: "024 415 0992",
          age: 24,
          edd: "2026-06-05",
          gp: "G2 P1",
          risks: ["Prior C-section"],
          consent: { checkins: true, recording: true },
          phase: "antenatal",
        },
        {
          id: "m2",
          name: "Esi Boateng",
          phone: "020 112 3344",
          age: 29,
          edd: "2026-06-12",
          gp: "G1 P0",
          risks: [],
          consent: { checkins: true, recording: false },
          phase: "antenatal",
        },
      ].filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.phone.includes(search),
      );
      setResults(found);
      setLoading(false);
    }, 600);
  };
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <UI.Input
            leadingIcon="search"
            placeholder="Search name or phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Btn label="Find" onClick={doSearch} />
      </div>
      {loading && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div
            style={{
              display: "inline-block",
              width: 24,
              height: 24,
              border: "3px solid #f3f3f3",
              borderTop: `3px solid ${OM.plum}`,
              borderRadius: "50%",
              animation: "omPulse 1s linear infinite",
            }}
          />
        </div>
      )}
      {results && results.length > 0 && (
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => onFound(r)}
              style={{
                textAlign: "left",
                padding: "14px 16px",
                borderRadius: 12,
                border: `1.5px solid ${LINE}`,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{ fontSize: 15, fontWeight: 600, color: OM.navy }}
                >
                  {r.name}
                </div>
                <div style={{ fontSize: 13, color: OM.slate, marginTop: 2 }}>
                  {r.phone} · {r.gp}
                </div>
              </div>
              <IC.ArrowRight
                size={18}
                sw={2}
                style={{ color: OM.tertiary }}
              />
            </button>
          ))}
        </div>
      )}
      {results && results.length === 0 && (
        <div
          style={{
            padding: "24px",
            textAlign: "center",
            background: "#F9FAFB",
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 14, color: OM.slate }}>
            No record found.
          </div>
        </div>
      )}
      <div
        style={{
          borderTop: `1px solid ${LINE}`,
          paddingTop: 20,
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: OM.tertiary, marginBottom: 14 }}>
          Not enrolled before birth?
        </p>
        <Btn
          label="Enroll new mother"
          variant="outline"
          full
          onClick={onNew}
        />
      </div>
    </div>
  );
}

function CardShell({ children, maxWidth = 600 }) {
  return (
    <UI.Card
      padding="p-8"
      style={{ maxWidth, margin: "28px auto 0", borderRadius: 20 }}
    >
      {children}
    </UI.Card>
  );
}
function StepHead({ n, total = 5, title, sub }) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          fontFamily: OM.mono,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: OM.plum,
          textTransform: "uppercase",
        }}
      >
        Step {n} of {total}
      </div>
      <h2
        style={{
          margin: "8px 0 0",
          fontSize: 25,
          fontWeight: 600,
          color: OM.navy,
          letterSpacing: "-0.02em",
        }}
      >
        {title}
      </h2>
      {sub && (
        <p
          style={{
            margin: "9px 0 0",
            fontSize: 15,
            color: OM.slate,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
function IntroRow({ icon, title, sub }) {
  const IconC = IC[icon];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0",
        borderBottom: `1px solid ${OM.borderSoft}`,
      }}
    >
      <span
        style={{
          width: 42,
          height: 42,
          borderRadius: 11,
          flexShrink: 0,
          background: OM.periBg,
          color: OM.periText,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {IconC && <IconC size={21} sw={1.9} />}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: OM.navy }}>
          {title}
        </div>
        <div style={{ fontSize: 13.5, color: OM.tertiary, marginTop: 2 }}>
          {sub}
        </div>
      </div>
    </div>
  );
}
function SummaryRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 14,
        padding: "11px 0",
        borderBottom: `1px solid ${OM.borderSoft}`,
      }}
    >
      <span style={{ fontSize: 14, color: OM.tertiary }}>{label}</span>
      <span style={{ fontSize: 14.5, fontWeight: 600, color: OM.navy }}>
        {value}
      </span>
    </div>
  );
}
function Stepper({ step, steps, onJump, maxReached, compact }) {
  if (compact)
    return (
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div
          style={{ fontFamily: OM.mono, fontSize: 12, color: OM.tertiary }}
        >
          STEP {step} OF {steps.length}
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: OM.navy,
            marginTop: 4,
          }}
        >
          {steps[step - 1].label}
        </div>
      </div>
    );
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        maxWidth: 720,
        margin: "0 auto 32px",
      }}
    >
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < step,
          cur = n === step;
        const CheckIcon = IC.Check;
        return (
          <React.Fragment key={s.key}>
            <div
              onClick={() => n <= maxReached && onJump(n)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
                width: 70,
                cursor: n <= maxReached ? "pointer" : "default",
              }}
            >
              <span
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: done ? OM.plum : cur ? OM.plumTint : "#fff",
                  border: `1.5px solid ${done || cur ? OM.plum : "#D8D8DE"}`,
                  color: done ? "#fff" : cur ? OM.plum : OM.tertiary,
                }}
              >
                {done ? (
                  <CheckIcon size={17} sw={2.6} />
                ) : (
                  <span
                    style={{
                      fontFamily: OM.mono,
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    {n}
                  </span>
                )}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: cur ? 600 : 500,
                  color: cur ? OM.navy : OM.tertiary,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: n < step ? OM.plum : "#E2E2E7",
                  marginTop: 16,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ================= MAIN APP =================
function DischargeApp({ scenario, onScenario }) {
  const w = useWindowWidth();
  const stack = w < 820;
  const [flow, setFlow] = React.useState("start");
  const [step, setStep] = React.useState(1);
  const [maxReached, setMaxReached] = React.useState(1);
  const [tried, setTried] = React.useState(false);
  const [form, setForm] = React.useState({
    name: "",
    phone: "",
    age: "",
    edd: "",
    gp: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    dischargeDate: new Date().toISOString().split("T")[0],
    deliveryType: "vaginal",
    outcome: "live",
    risks: [],
    meds: [],
    consent: { checkins: false, recording: false },
    verified: false,
    fromRecord: false,
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleList = (k, val) =>
    set(
      k,
      form[k].includes(val)
        ? form[k].filter((x) => x !== val)
        : [...form[k], val],
    );

  const STEPS_A = [
    { key: "start", label: "Start" },
    { key: "details_a", label: "Details" },
    { key: "risks", label: "Risk flags" },
    { key: "consent", label: "Consent" },
    { key: "done_a", label: "Done" },
  ];
  const STEPS_B = [
    { key: "lookup", label: "Find mother" },
    { key: "details_b", label: "Delivery" },
    { key: "meds", label: "Meds" },
    { key: "outcome", label: "Outcome" },
    { key: "done_b", label: "Done" },
  ];
  const STEPS_DIRECT = [
    { key: "start", label: "Start" },
    { key: "details_a", label: "Details" },
    { key: "risks", label: "Risk flags" },
    { key: "consent", label: "Consent" },
    { key: "details_b", label: "Delivery" },
    { key: "meds", label: "Meds" },
    { key: "outcome", label: "Outcome" },
    { key: "done_b", label: "Done" },
  ];

  const currentSteps =
    flow === "antenatal"
      ? STEPS_A
      : flow === "postpartum"
        ? STEPS_B
        : flow === "direct"
          ? STEPS_DIRECT
          : [{ key: "init", label: "Omaya Care" }];
  const stepObj = currentSteps[step - 1] || {};

  const next = () => {
    if (
      stepObj.key === "details_a" &&
      (!form.name.trim() || !form.phone.trim() || !form.verified)
    ) {
      setTried(true);
      return;
    }
    if (stepObj.key === "consent" && !form.consent.checkins) {
      setTried(true);
      return;
    }
    if (
      stepObj.key === "details_b" &&
      (!form.deliveryDate || !form.deliveryType || !form.verified)
    ) {
      setTried(true);
      return;
    }
    setStep((s) => s + 1);
    setMaxReached((m) => Math.max(m, step + 1));
    setTried(false);
    window.scrollTo && window.scrollTo(0, 0);
  };
  const back = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const RISK_OPTIONS = [
    { key: "Prior C-section", label: "Prior C-section" },
    { key: "Hypertension/PE", label: "Hypertension/PE" },
    { key: "Diabetes/GDM", label: "Diabetes/GDM" },
    { key: "Multiple gestation", label: "Multiple gestation" },
    { key: "Sickle cell/Genotype", label: "Sickle cell/Genotype" },
    { key: "Prior loss", label: "Prior loss" },
    { key: "HIV", label: "HIV" },
    { key: "No known flags", label: "No known flags" },
  ];
  const MED_OPTIONS = [
    { key: "Pain relief", label: "Pain relief" },
    { key: "Antibiotics", label: "Antibiotics" },
    { key: "Iron & folic acid", label: "Iron & folic acid" },
    ...(form.deliveryType === "csection"
      ? [{ key: "Wound-care", label: "Wound-care" }]
      : []),
  ];

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
          current="mothers"
          onNav={() => {
            window.location.href = "Omaya Dashboard.html";
          }}
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
        <div
          style={{
            flexShrink: 0,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "0 clamp(18px,3vw,32px)",
            borderBottom: `1px solid ${LINE}`,
            background: "#fff",
          }}
        >
          <span
            style={{
              fontSize: 15.5,
              fontWeight: 600,
              color: OM.navy,
              letterSpacing: "-0.01em",
            }}
          >
            {flow === "antenatal"
              ? "Antenatal enrollment"
              : flow === "postpartum"
                ? "Postpartum completion"
                : "Enrollment"}
          </span>
          <a href="Omaya Dashboard.html" style={{ color: OM.tertiary }}>
            <IC.X size={20} sw={2} />
          </a>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <div
            style={{
              padding: "clamp(24px,4vw,40px) clamp(18px,4vw,32px) 56px",
            }}
          >
            {flow !== "start" && (
              <Stepper
                step={step}
                maxReached={maxReached}
                onJump={setStep}
                compact={stack}
                steps={currentSteps}
              />
            )}
            {flow === "start" && (
              <CardShell>
                <StepHead
                  title="New enrollment"
                  sub="Select phase."
                  total={1}
                  n={1}
                />
                <div style={{ display: "grid", gap: 12 }}>
                  <button
                    onClick={() => {
                      setFlow("antenatal");
                      setStep(1);
                    }}
                    style={{
                      textAlign: "left",
                      padding: "20px",
                      borderRadius: 13,
                      border: `1.5px solid ${LINE}`,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: OM.navy,
                      }}
                    >
                      Antenatal (ANC visit)
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setFlow("postpartum");
                      setStep(1);
                    }}
                    style={{
                      textAlign: "left",
                      padding: "20px",
                      borderRadius: 13,
                      border: `1.5px solid ${LINE}`,
                      background: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: OM.navy,
                      }}
                    >
                      Postpartum (Discharge)
                    </div>
                  </button>
                </div>
              </CardShell>
            )}
            {stepObj.key === "start" && (
              <CardShell>
                <StepHead
                  n={1}
                  total={currentSteps.length}
                  title="Overview"
                  sub="Follow-up enrollment."
                />
                <div style={{ borderTop: `1px solid ${OM.borderSoft}` }}>
                  <IntroRow
                    icon="User"
                    title="Her details"
                    sub="Clinical profile"
                  />
                  <IntroRow
                    icon="Shield"
                    title="Consent"
                    sub="Authorization"
                  />
                </div>
                <div style={{ marginTop: 28 }}>
                  <Btn
                    label="Begin"
                    iconRight="ArrowRight"
                    full
                    onClick={next}
                  />
                </div>
              </CardShell>
            )}
            {stepObj.key === "lookup" && (
              <CardShell>
                <StepHead
                  n={1}
                  total={currentSteps.length}
                  title="Find mother"
                  sub="Antenatal record lookup."
                />
                <FindMother
                  onFound={(r) => {
                    setForm((f) => ({
                      ...f,
                      ...r,
                      fromRecord: true,
                      verified: true,
                    }));
                    next();
                  }}
                  onNew={() => {
                    setFlow("direct");
                    setStep(1);
                  }}
                />
              </CardShell>
            )}
            {stepObj.key === "details_a" && (
              <CardShell>
                <StepHead
                  n={2}
                  total={currentSteps.length}
                  title="Her details"
                  sub="Core profile."
                />
                <div style={{ display: "grid", gap: 18 }}>
                  <Field
                    label="Mother's full name"
                    value={form.name}
                    onChange={(v) => set("name", v)}
                    placeholder="Name"
                    icon="User"
                  />
                  <Field
                    label="Phone number"
                    value={form.phone}
                    onChange={(v) => {
                      set("phone", v);
                      set("verified", false);
                    }}
                    placeholder="024 000 0000"
                    type="tel"
                    icon="Phone"
                    mono
                  />
                  <PhoneVerify
                    phone={form.phone}
                    onVerified={(v) => set("verified", v)}
                    error={tried && !form.verified}
                  />
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <Field
                      label="Age"
                      value={form.age}
                      onChange={(v) => set("age", v)}
                      type="number"
                      placeholder="Age"
                    />
                    <Field
                      label="EDD"
                      value={form.edd}
                      onChange={(v) => set("edd", v)}
                      type="date"
                      icon="Calendar"
                      mono
                    />
                  </div>
                </div>
                <div style={{ marginTop: 30 }}>
                  <Btn
                    label="Continue"
                    iconRight="ArrowRight"
                    full
                    onClick={next}
                  />
                </div>
              </CardShell>
            )}
            {stepObj.key === "risks" && (
              <CardShell>
                <StepHead
                  n={3}
                  total={currentSteps.length}
                  title="Risk flags"
                  sub="Clinical markers."
                />
                <ChipRow
                  label="Flags"
                  options={RISK_OPTIONS}
                  selected={form.risks}
                  onToggle={(k) => toggleList("risks", k)}
                />
                <div style={{ marginTop: 30 }}>
                  <Btn
                    label="Continue"
                    iconRight="ArrowRight"
                    full
                    onClick={next}
                  />
                </div>
              </CardShell>
            )}
            {stepObj.key === "consent" && (
              <CardShell>
                <StepHead
                  n={4}
                  total={currentSteps.length}
                  title="Consent"
                  sub="Authorization."
                />
                {form.fromRecord ? (
                  <div
                    style={{
                      padding: "16px",
                      borderRadius: 12,
                      background: GREEN_BG,
                      border: `1px solid ${GREEN_BD}`,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      marginBottom: 20,
                    }}
                  >
                    <IC.Check size={22} sw={2.5} style={{ color: GREEN }} />
                    <div
                      style={{
                        fontSize: 14,
                        color: "#166534",
                        fontWeight: 500,
                      }}
                    >
                      Consent confirmed.
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    <CheckRow
                      checked={form.consent.checkins}
                      onToggle={() =>
                        set("consent", {
                          ...form.consent,
                          checkins: !form.consent.checkins,
                        })
                      }
                      required
                      title="Calls & messages"
                      desc="Agrees to outreach."
                      icon="Message"
                    />
                    <CheckRow
                      checked={form.consent.recording}
                      onToggle={() =>
                        set("consent", {
                          ...form.consent,
                          recording: !form.consent.recording,
                        })
                      }
                      title="Recording"
                      desc="Optional recording."
                      icon="Phone"
                    />
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    marginTop: 30,
                  }}
                >
                  <Btn label="Back" variant="ghost" onClick={back} />
                  <Btn
                    label="Continue"
                    iconRight="ArrowRight"
                    onClick={next}
                  />
                </div>
              </CardShell>
            )}
            {stepObj.key === "details_b" && (
              <CardShell>
                <StepHead
                  n={flow === "postpartum" ? 2 : 5}
                  total={currentSteps.length}
                  title="Delivery"
                  sub="Timing."
                />
                <div style={{ display: "grid", gap: 18 }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                    }}
                  >
                    <Field
                      label="Delivery date"
                      value={form.deliveryDate}
                      onChange={(v) => set("deliveryDate", v)}
                      type="date"
                      icon="Calendar"
                      mono
                    />
                    <Field
                      label="Discharge date"
                      value={form.dischargeDate}
                      onChange={(v) => set("dischargeDate", v)}
                      type="date"
                      icon="Calendar"
                      mono
                    />
                  </div>
                  <Segmented
                    label="Type"
                    value={form.deliveryType}
                    onChange={(v) => set("deliveryType", v)}
                    options={[
                      ["vaginal", "Vaginal"],
                      ["csection", "C-section"],
                    ]}
                  />
                  <PhoneVerify
                    phone={form.phone}
                    onVerified={(v) => set("verified", v)}
                    error={tried && !form.verified}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    marginTop: 30,
                  }}
                >
                  <Btn label="Back" variant="ghost" onClick={back} />
                  <Btn
                    label="Continue"
                    iconRight="ArrowRight"
                    onClick={next}
                  />
                </div>
              </CardShell>
            )}
            {stepObj.key === "meds" && (
              <CardShell>
                <StepHead
                  n={flow === "postpartum" ? 3 : 6}
                  total={currentSteps.length}
                  title="Medications"
                  sub="Handed to mother."
                />
                <ChipRow
                  label="Meds"
                  options={MED_OPTIONS}
                  selected={form.meds}
                  onToggle={(k) => toggleList("meds", k)}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    marginTop: 30,
                  }}
                >
                  <Btn label="Back" variant="ghost" onClick={back} />
                  <Btn
                    label="Continue"
                    iconRight="ArrowRight"
                    onClick={next}
                  />
                </div>
              </CardShell>
            )}
            {stepObj.key === "outcome" && (
              <CardShell>
                <StepHead
                  n={flow === "postpartum" ? 4 : 7}
                  total={currentSteps.length}
                  title="Outcome"
                  sub="Gate."
                />
                <div style={{ display: "grid", gap: 12 }}>
                  <button
                    onClick={() => {
                      set("outcome", "live");
                      next();
                    }}
                    style={{
                      textAlign: "left",
                      padding: "20px",
                      borderRadius: 13,
                      border: `1.5px solid ${form.outcome === "live" ? OM.plum : LINE}`,
                      background:
                        form.outcome === "live" ? OM.plumTint : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Live birth
                  </button>
                  <button
                    onClick={() => {
                      set("outcome", "adverse");
                      next();
                    }}
                    style={{
                      textAlign: "left",
                      padding: "20px",
                      borderRadius: 13,
                      border: `1.5px solid ${form.outcome === "adverse" ? OM.plum : LINE}`,
                      background:
                        form.outcome === "adverse" ? OM.plumTint : "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Adverse outcome
                  </button>
                </div>
                <div style={{ marginTop: 30 }}>
                  <Btn label="Back" variant="ghost" onClick={back} />
                </div>
              </CardShell>
            )}
            {stepObj.key === "done_a" && (
              <CardShell maxWidth={560}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 999,
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#F2F4F7",
                      color: "#667085",
                    }}
                  >
                    <IC.Calendar size={34} sw={2.3} />
                  </div>
                  <h2
                    style={{
                      margin: "18px 0 0",
                      fontSize: 24,
                      fontWeight: 600,
                      color: OM.navy,
                    }}
                  >
                    Created
                  </h2>
                  <SummaryRow label="EDD" value={form.edd} />
                  <SummaryRow
                    label="Risks"
                    value={form.risks.join(", ") || "None"}
                  />
                </div>
                <div style={{ marginTop: 26, display: "grid", gap: 10 }}>
                  <a
                    href="Omaya Dashboard.html"
                    style={{ textDecoration: "none" }}
                  >
                    <Btn label="Back to dashboard" full />
                  </a>
                </div>
              </CardShell>
            )}
            {stepObj.key === "done_b" && (
              <CardShell maxWidth={560}>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      width: 66,
                      height: 66,
                      borderRadius: 999,
                      margin: "0 auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        form.outcome === "live" ? GREEN_BG : "#FDF2FA",
                      color: form.outcome === "live" ? GREEN : "#C11574",
                    }}
                  >
                    {form.outcome === "live" ? (
                      <IC.Check size={34} sw={2.3} />
                    ) : (
                      <HeartFilled size={34} />
                    )}
                  </div>
                  <h2
                    style={{
                      margin: "18px 0 0",
                      fontSize: 24,
                      fontWeight: 600,
                      color: OM.navy,
                    }}
                  >
                    {form.outcome === "live"
                      ? "Complete"
                      : "Bereavement track"}
                  </h2>
                  <SummaryRow
                    label="Delivery"
                    value={
                      form.deliveryType === "csection"
                        ? "C-section"
                        : "Vaginal"
                    }
                  />
                  <SummaryRow
                    label="Meds"
                    value={`${form.meds.length} items`}
                  />
                </div>
                <div style={{ marginTop: 26, display: "grid", gap: 10 }}>
                  <a
                    href="Omaya Dashboard.html"
                    style={{ textDecoration: "none" }}
                  >
                    <Btn label="Back to dashboard" full />
                  </a>
                </div>
              </CardShell>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export { DischargeApp };

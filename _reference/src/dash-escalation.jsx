// dash-escalation.jsx — Omaya escalation detail panel (one L3/L4 trigger)
// Three states: active · acknowledged · breached.
import React from "react";
import { OM, SEV, Icons, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

// ---- solid severity badge ----
function SevBadge({ level }) {
  const s = SEV[level];
  const I = Icons[s.icon];
  return (
    <span style={{ ...TK.badge, gap: 5, background: s.solid ? s.base : s.tint, color: s.onTint }}>
      <I size={12} sw={2.2} />
      {s.key} · {s.label}
    </span>
  );
}

function OctagonTile({ level, size = 46 }) {
  const s = SEV[level];
  const I = Icons[s.icon];
  return (
    <div style={{ width: size, height: size, borderRadius: 13, flexShrink: 0, background: s.solid ? s.base : s.tint, color: s.onTint, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <I size={Math.round(size * 0.52)} sw={2.1} />
    </div>
  );
}

function TranscriptQuote({ speaker, time, lines }) {
  return (
    <figure style={{ margin: 0, position: "relative", background: "#F8F6F4", borderRadius: 14, padding: "18px 20px 16px 22px" }}>
      <Icons.quote size={22} sw={2} style={{ color: "#D6C3B6", position: "absolute", top: 15, left: 18 }} />
      <blockquote style={{ margin: 0, padding: "2px 4px 0 30px" }}>
        {lines.map((ln, i) => (
          <p key={i} style={{ margin: i === 0 ? 0 : "7px 0 0", fontSize: 15.5, lineHeight: 1.55, color: "#3A2E27", fontWeight: 450, fontStyle: "italic", textWrap: "pretty" }}>{ln}</p>
        ))}
      </blockquote>
      <figcaption style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 13, paddingLeft: 30, fontSize: 12.5, color: "#8A7B70" }}>
        <span style={{ fontWeight: 600 }}>{speaker}</span>
        <span style={{ color: "#C9BBB0" }}>·</span>
        <span style={{ fontFamily: OM.mono }}>{time}</span>
        <span style={{ color: "#C9BBB0" }}>·</span>
        <span>AI check-in call</span>
      </figcaption>
    </figure>
  );
}

function SlaMeter({ pct, tone }) {
  const fill = tone === "breach" ? SEV.L4.base : tone === "warn" ? "#AE6845" : OM.slate;
  return (
    <div style={{ height: 6, background: "#EDEFF2", borderRadius: 999, overflow: "hidden", width: "100%" }}>
      <div style={{ width: Math.min(100, Math.max(4, pct * 100)) + "%", height: "100%", background: fill, borderRadius: 999, transition: "width .3s ease" }} />
    </div>
  );
}

function MetaLine({ icon, children, accent }) {
  const I = Icons[icon];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5, color: accent || OM.tertiary }}>
      <I size={16} sw={2} style={{ flexShrink: 0, color: accent || OM.borderStrong }} />
      <span>{children}</span>
    </div>
  );
}

function EscalationDetail({ state = "active", data, onAcknowledge, onClose }) {
  const d = data;
  const s = SEV[d.level];
  const ackd = state === "acknowledged";
  const breached = state === "breached";

  return (
    <UI.Card padding={0} hoverable={false} style={{ position: "relative", width: "100%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 3, background: s.base, flexShrink: 0 }} />
      {onClose && (
        <button type="button" aria-label="Close" onClick={onClose} style={{ position: "absolute", top: 16, right: 14, width: 34, height: 34, borderRadius: 9, border: "none", background: "transparent", color: OM.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      )}
      <div style={{ padding: "22px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <OctagonTile level={d.level} size={46} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={TK.pageTitle}>{d.name}</h2>
              <SevBadge level={d.level} />
            </div>
            <div style={{ fontSize: 13.5, color: OM.tertiary, marginTop: 4 }}>
              <span style={{ fontFamily: OM.mono, fontWeight: 500, color: OM.slate }}>Day {d.day}</span>
              <span style={{ margin: "0 7px", color: OM.border }}>·</span>
              {d.age} yrs
              <span style={{ margin: "0 7px", color: OM.border }}>·</span>
              {d.ward}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <MetaLine icon="clock">
            <span style={{ whiteSpace: "nowrap" }}>Triggered <span style={{ fontFamily: OM.mono, fontWeight: 500, color: OM.slate }}>{d.triggeredAgo}</span></span>
            <span style={{ color: OM.border, margin: "0 7px" }}>·</span>
            <span style={{ fontFamily: OM.mono, color: OM.tertiary, whiteSpace: "nowrap" }}>{d.triggeredAt}</span>
          </MetaLine>
        </div>
        <p style={{ margin: "12px 0 0", fontSize: 16.5, lineHeight: 1.45, fontWeight: 600, color: OM.navy, letterSpacing: "-0.01em", textWrap: "pretty" }}>{d.reason}</p>
        <div style={{ marginTop: 16, marginBottom: 22 }}>
          <div style={{ ...TK.secLabel, marginBottom: 9 }}>Triggering excerpt</div>
          <TranscriptQuote speaker={d.name} time={d.transcriptTime} lines={d.transcript} />
        </div>
      </div>

      {ackd && (
        <div style={{ background: "#F1F6F2", borderTop: `1px solid #E1EBE4`, padding: "13px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: "#2E7D55", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.check size={14} sw={3} /></span>
          <span style={{ fontSize: 13.5, color: "#2C4A39" }}>Acknowledged by <strong style={{ fontWeight: 600 }}>{d.ackBy}</strong><span style={{ color: "#A9C2B2", margin: "0 7px" }}>·</span><span style={{ fontFamily: OM.mono, whiteSpace: "nowrap" }}>{d.ackAt}</span></span>
        </div>
      )}
      {breached && (
        <div style={{ background: "#FBF1EF", borderTop: `1px solid #F0DAD4`, padding: "13px 24px", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: s.base, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.shield size={14} sw={2.2} /></span>
          <span style={{ fontSize: 13.5, color: "#6E3328" }}>Auto-escalated to <strong style={{ fontWeight: 600 }}>{d.oncall}</strong>, on-call clinician<span style={{ color: "#D9B6AD", margin: "0 7px" }}>·</span><span style={{ fontFamily: OM.mono }}>{d.breachAt}</span></span>
        </div>
      )}

      <div style={{ borderTop: `1px solid ${OM.border}`, padding: "16px 24px 18px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 18, background: "#FCFCFD" }}>
        <div style={{ minWidth: 0, flex: 1, maxWidth: 240 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
            <span style={{ ...TK.secLabel, marginBottom: 7 }}>Response SLA</span>
            <span style={{ fontSize: 11.5, color: OM.tertiary }}>{d.slaWindow}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 7, marginBottom: 9 }}>
            <span style={{ fontFamily: OM.mono, fontSize: 22, fontWeight: 600, letterSpacing: "0.01em", lineHeight: 1, color: breached ? s.base : ackd ? OM.tertiary : OM.navy }}>{breached ? "00:00" : d.countdown}</span>
            <span style={{ fontSize: 12.5, color: OM.tertiary }}>{breached ? "breached" : ackd ? "at acknowledgement" : "remaining"}</span>
          </div>
          <SlaMeter pct={d.slaPct} tone={breached ? "breach" : ackd ? "ok" : d.slaTone} />
        </div>
        <div style={{ flexShrink: 0 }}>
          {state === "active" && <AckButton onClick={onAcknowledge} />}
          {ackd && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 18px", borderRadius: 11, background: "#EEF3EF", border: "1px solid #DCE8E0", color: "#2C4A39", fontSize: 14.5, fontWeight: 600 }}>
              <Icons.check size={17} sw={2.6} />
              Acknowledged
            </div>
          )}
          {breached && <ReassignButton />}
        </div>
      </div>
    </UI.Card>
  );
}

function AckButton({ onClick }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...TK.btn.lg, ...TK.btnPrimary, background: h ? OM.plumHover : OM.plum, cursor: "pointer", fontFamily: "var(--ui-font)", whiteSpace: "nowrap", boxShadow: "0 1px 2px rgba(94,39,66,0.25)", transition: "background .12s ease" }}>
      <Icons.check size={17} sw={2.6} />
      Acknowledge
    </button>
  );
}

function ReassignButton() {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 46, padding: "0 20px", borderRadius: 11, border: `1px solid ${h ? OM.borderStrong : OM.border}`, background: h ? "#F3F5F8" : OM.surface, color: OM.navy, cursor: "pointer", fontFamily: "var(--ui-font)", fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", transition: "background .12s, border-color .12s" }}>
      <Icons.phoneCall size={16} sw={2} />
      Call clinician
    </button>
  );
}

function Modal({ data, state = "active", onAcknowledge, onClose }) {
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose && onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose && onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(20,26,38,0.46)", backdropFilter: "blur(1.5px)", fontFamily: "var(--ui-font)", overflowY: "auto" }}>
      <div style={{ width: 564, maxWidth: "100%", margin: "auto" }}>
        <EscalationDetail data={data} state={state} onAcknowledge={onAcknowledge} onClose={onClose} />
      </div>
    </div>
  );
}

const Escalation = { Modal };

export { EscalationDetail, Escalation };

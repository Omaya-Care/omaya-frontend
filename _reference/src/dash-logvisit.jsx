// dash-logvisit.jsx — Omaya "Log visit" modal over the mother record.
// Three states: empty · error (feedback red) · success (toast).
import React from "react";
import { OM, SEV, SEV_SOFT, Icons } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

const CANVAS = "#F4F4F6";
const CARD_SHADOW = "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.04)";
const FIELD_BG = "#F1F1F4";
const HAIR = "#F0F0F2";
const FB = {
  red: "#D92D20", redInk: "#B42318", redBg: "#FEF4F3", redBorder: "#F1C9C5",
  grn: "#2E7D55", grnBg: "#ECF6F0", grnBorder: "#CDE7D8",
};

const MOTHER = { name: "Ama Mensah", day: 7, level: "L4" };

function SoftSevPill({ level }) {
  const s = SEV_SOFT[level];
  const label = SEV[level].label;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: s.bg, color: s.text, borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 600, lineHeight: "16px", whiteSpace: "nowrap", flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

const META_TINT = { heart: "#B0608A", clock: "#5C8A6E", shield: "#4E79A8", phoneCall: "#C2902C" };

function MetaItem({ icon, label, value }) {
  const I = Icons[icon];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <I size={17} sw={2} style={{ flexShrink: 0, color: META_TINT[icon] }} />
        <span style={{ fontSize: 13.5, color: OM.tertiary, whiteSpace: "nowrap" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: OM.navy, marginTop: 7, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function RecordBackdrop() {
  const HIST = [
    { date: "06 Jun", rel: "Day 6", level: "L3", summary: "Reported a persistent headache and feeling dizzy when standing." },
    { date: "04 Jun", rel: "Day 4", level: "L2", summary: "Wound site sore but healing; advised on dressing changes." },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: CANVAS, padding: 22, overflow: "hidden" }}>
      <UI.Card padding="p-6" style={{ height: "100%", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <h1 style={{ margin: 0, fontSize: 29, fontWeight: 600, color: OM.navy, letterSpacing: "-0.025em" }}>{MOTHER.name}</h1>
          <SoftSevPill level={MOTHER.level} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px 32px", margin: "28px 0 6px" }}>
          <MetaItem icon="heart" label="Delivery type" value="Caesarean section" />
          <MetaItem icon="clock" label="Day in care" value="Day 7 postpartum" />
          <MetaItem icon="shield" label="Consent status" value="Active — monitoring" />
          <MetaItem icon="phoneCall" label="Last interaction" value="Day 6 call · yesterday" />
        </div>
        <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: OM.tertiary, margin: "28px 0 12px" }}>Recent check-ins</div>
        <div style={{ border: `1px solid ${OM.border}`, borderRadius: 16, overflow: "hidden" }}>
          {HIST.map((c, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 14, alignItems: "center", padding: "15px 20px", borderBottom: i === HIST.length - 1 ? "none" : `1px solid ${OM.borderSoft}` }}>
              <div>
                <div style={{ fontFamily: OM.mono, fontSize: 13.5, fontWeight: 500, color: OM.slate }}>{c.date}</div>
                <div style={{ fontFamily: OM.mono, fontSize: 11, color: OM.tertiary, marginTop: 2 }}>{c.rel}</div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: SEV[c.level].base, flexShrink: 0, marginTop: 6 }} />
                <span style={{ fontSize: 14, color: OM.slate, lineHeight: 1.5 }}>{c.summary}</span>
              </div>
            </div>
          ))}
        </div>
      </UI.Card>
    </div>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
      <label style={{ fontSize: 13.5, fontWeight: 600, color: OM.navy, letterSpacing: "-0.005em", whiteSpace: "nowrap" }}>
        {children}<span style={{ color: OM.plum, marginLeft: 3 }}>*</span>
      </label>
      {hint && <span style={{ fontSize: 12, color: OM.tertiary }}>{hint}</span>}
    </div>
  );
}

function ErrorLine({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, color: FB.redInk, fontSize: 12.5, fontWeight: 500 }}>
      <Icons.alertTriangle size={14} sw={2.2} style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

function fieldBoxStyle({ focused, error, multiline }) {
  return {
    width: "100%", boxSizing: "border-box", padding: multiline ? "12px 14px" : "0 14px",
    minHeight: multiline ? 74 : 50, height: multiline ? undefined : 50,
    borderRadius: 12, fontFamily: "var(--ui-font)", fontSize: 14.5, lineHeight: 1.5,
    color: OM.navy, background: error ? FB.redBg : focused ? OM.surface : FIELD_BG,
    border: `1px solid ${error ? FB.redBorder : focused ? OM.focus : "transparent"}`,
    boxShadow: error ? `0 0 0 3px rgba(217,45,32,0.10)` : focused ? `0 0 0 3px ${OM.periBg}` : "none",
    outline: "none", resize: "none", transition: "background .12s, border-color .12s, box-shadow .12s",
    display: "flex", alignItems: "center",
  };
}

function TextareaField({ label, hint, placeholder, value, error, focused }) {
  const box = fieldBoxStyle({ focused, error, multiline: true });
  return (
    <div>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <div style={{ ...box, alignItems: "flex-start" }}>
        <span style={{ color: value ? OM.navy : "#98A2B3", fontWeight: value ? 400 : 400, textWrap: "pretty" }}>{value || placeholder}</span>
        {focused && !value && <span style={{ width: 1.5, height: 18, background: OM.focus, marginLeft: 1, alignSelf: "flex-start", animation: "omCaret 1s step-end infinite" }} />}
      </div>
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function SelectField({ label, value, error }) {
  const box = fieldBoxStyle({ error, multiline: false });
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ ...box, justifyContent: "space-between" }}>
        <span style={{ color: value ? OM.navy : "#98A2B3" }}>{value || "Select next action…"}</span>
        <Icons.chevronDown size={18} sw={2} style={{ color: OM.tertiary, flexShrink: 0 }} />
      </div>
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function ModalButton({ kind, label, icon, onMouseState }) {
  const [h, setH] = React.useState(false);
  const I = icon ? Icons[icon] : null;
  const st = kind === "primary"
    ? { background: h ? OM.plumHover : OM.plum, color: "#fff", border: "none", boxShadow: "0 1px 2px rgba(94,39,66,0.22)" }
    : { background: h ? "#F4F5F7" : OM.surface, color: OM.navy, border: `1px solid ${h ? OM.borderStrong : OM.border}`, boxShadow: "none" };
  return (
    <button type="button" onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 44, padding: "0 20px", borderRadius: 10, cursor: "pointer", fontFamily: "var(--ui-font)", fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", transition: "background .12s, border-color .12s", ...st }}>
      {I && <I size={18} sw={2.3} />}
      {label}
    </button>
  );
}

function LogVisitModal({ state }) {
  const error = state === "error";
  const obs = error ? "Reviewed at bedside. Mood brighter than Day 6; reports headache has settled and is mobilising well." : "";
  const med = "";
  const next = "";
  return (
    <UI.Card role="dialog" aria-label="Log visit" padding={0} hoverable={false} style={{ width: 508, maxWidth: "92%", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "20px 22px 16px 24px", borderBottom: `1px solid ${HAIR}` }}>
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: OM.navy, letterSpacing: "-0.02em" }}>Log visit</h2>
          <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 3, whiteSpace: "nowrap" }}>{MOTHER.name}<span style={{ color: OM.border, margin: "0 6px" }}>·</span><span style={{ fontFamily: OM.mono }}>Day {MOTHER.day}</span></div>
        </div>
        <button type="button" aria-label="Close" style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "transparent", color: OM.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "16px 24px 0", padding: "11px 14px", borderRadius: 11, background: FB.redBg, border: `1px solid ${FB.redBorder}`, color: FB.redInk }}>
          <Icons.alertTriangle size={17} sw={2.2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>Add the missing details before saving.</span>
        </div>
      )}
      <div style={{ padding: "18px 24px 4px", display: "flex", flexDirection: "column", gap: 16 }}>
        <TextareaField label="Clinical observation" placeholder="What did you observe at this visit?" value={obs} focused={state === "empty"} error={error && !obs ? "Required." : null} />
        <TextareaField label="Medication / advice given" placeholder="What did you prescribe or advise?" value={med} error={error ? "Required." : null} />
        <SelectField label="Next action" value={next} error={error ? "Choose a next action." : null} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 24px 0", padding: "12px 14px", borderRadius: 11, background: "#F3F6F9", border: `1px solid #E4EAF0` }}>
        <span style={{ width: 30, height: 30, borderRadius: 8, background: OM.periBg, color: OM.periText, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.message size={17} sw={2} /></span>
        <span style={{ fontSize: 13, color: OM.slate, lineHeight: 1.45 }}>Saving sends <strong style={{ fontWeight: 600, color: OM.navy }}>{MOTHER.name}</strong> a plain-language summary within an hour.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 11, padding: "18px 24px 20px" }}>
        <ModalButton kind="secondary" label="Cancel" />
        <ModalButton kind="primary" label="Save visit" icon="check" />
      </div>
    </UI.Card>
  );
}

function SuccessToast() {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: 392, maxWidth: "90%", background: OM.surface, borderRadius: 14, padding: "15px 16px", border: `1px solid ${FB.grnBorder}`, boxShadow: "0 16px 40px -12px rgba(16,24,40,0.30), 0 4px 10px -6px rgba(16,24,40,0.20)" }}>
      <span style={{ width: 30, height: 30, borderRadius: 999, background: FB.grn, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><Icons.check size={17} sw={3} /></span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: OM.navy, letterSpacing: "-0.01em" }}>Visit logged</div>
        <div style={{ fontSize: 13, color: OM.slate, marginTop: 2, lineHeight: 1.45 }}>Summary on its way to {MOTHER.name}<span style={{ color: OM.border, margin: "0 6px" }}>·</span><span style={{ fontFamily: OM.mono, color: OM.tertiary }}>just now</span></div>
      </div>
      <button type="button" aria-label="Dismiss" style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: OM.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </div>
  );
}

function inputStyle({ focused, error, multiline }) {
  return {
    width: "100%", boxSizing: "border-box", display: "block", padding: multiline ? "12px 14px" : "0 14px",
    minHeight: multiline ? 74 : 50, height: multiline ? 74 : 50, borderRadius: 12,
    fontFamily: "var(--ui-font)", fontSize: 14.5, lineHeight: 1.5, color: OM.navy,
    background: error ? FB.redBg : focused ? OM.surface : FIELD_BG,
    border: `1px solid ${error ? FB.redBorder : focused ? OM.focus : "transparent"}`,
    boxShadow: error ? "0 0 0 3px rgba(217,45,32,0.10)" : focused ? `0 0 0 3px ${OM.periBg}` : "none",
    outline: "none", resize: "none", transition: "background .12s, border-color .12s, box-shadow .12s",
  };
}

function LiveTextarea({ label, placeholder, value, onChange, error }) {
  const [f, setF] = React.useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea rows={2} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} style={inputStyle({ focused: f, error, multiline: true })} />
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function LiveSelect({ label, value, onChange, error }) {
  const [f, setF] = React.useState(false);
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: "relative" }}>
        <select value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setF(true)} onBlur={() => setF(false)} style={{ ...inputStyle({ focused: f, error, multiline: false }), appearance: "none", WebkitAppearance: "none", paddingRight: 40, cursor: "pointer", color: value ? OM.navy : "#98A2B3" }}>
          <option value="">Select next action…</option>
          <option value="Routine follow-up">Routine follow-up</option>
          <option value="Earlier review">Earlier review</option>
          <option value="Refer">Refer</option>
        </select>
        <Icons.chevronDown size={18} sw={2} style={{ color: OM.tertiary, position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
      </div>
      {error && <ErrorLine>{error}</ErrorLine>}
    </div>
  );
}

function LiveButton({ kind, label, icon, onClick }) {
  const [h, setH] = React.useState(false);
  const I = icon ? Icons[icon] : null;
  const st = kind === "primary"
    ? { background: h ? OM.plumHover : OM.plum, color: "#fff", border: "none", boxShadow: "0 1px 2px rgba(94,39,66,0.22)" }
    : { background: h ? "#F4F5F7" : OM.surface, color: OM.navy, border: `1px solid ${h ? OM.borderStrong : OM.border}`, boxShadow: "none" };
  return (
    <button type="button" onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ display: "inline-flex", alignItems: "center", gap: 7, height: 44, padding: "0 20px", borderRadius: 10, cursor: "pointer", fontFamily: "var(--ui-font)", fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", transition: "background .12s, border-color .12s", ...st }}>
      {I && <I size={18} sw={2.3} />}
      {label}
    </button>
  );
}

function Dialog({ name, day, onClose, onSaved }) {
  const [obs, setObs] = React.useState("");
  const [med, setMed] = React.useState("");
  const [next, setNext] = React.useState("");
  const [tried, setTried] = React.useState(false);
  const errObs = tried && !obs.trim();
  const errMed = tried && !med.trim();
  const errNext = tried && !next;
  const hasError = errObs || errMed || errNext;

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const save = () => {
    if (!obs.trim() || !med.trim() || !next) { setTried(true); return; }
    onSaved();
  };

  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, background: "rgba(20,26,38,0.46)", backdropFilter: "blur(1.5px)", fontFamily: "var(--ui-font)" }}>
      <UI.Card role="dialog" aria-modal="true" aria-label="Log visit" padding={0} hoverable={false} style={{ width: 508, maxWidth: "100%", maxHeight: "92vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "20px 22px 16px 24px", borderBottom: `1px solid ${HAIR}`, position: "sticky", top: 0, background: OM.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, color: OM.navy, letterSpacing: "-0.02em" }}>Log visit</h2>
            <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 3, whiteSpace: "nowrap" }}>{name}<span style={{ color: OM.border, margin: "0 6px" }}>·</span><span style={{ fontFamily: OM.mono }}>Day {day}</span></div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: "none", background: "transparent", color: OM.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        {hasError && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, margin: "16px 24px 0", padding: "11px 14px", borderRadius: 11, background: FB.redBg, border: `1px solid ${FB.redBorder}`, color: FB.redInk }}>
            <Icons.alertTriangle size={17} sw={2.2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Add the missing details before saving.</span>
          </div>
        )}
        <div style={{ padding: "18px 24px 4px", display: "flex", flexDirection: "column", gap: 16 }}>
          <LiveTextarea label="Clinical observation" placeholder="What did you observe at this visit?" value={obs} onChange={setObs} error={errObs ? "Required." : null} />
          <LiveTextarea label="Medication / advice given" placeholder="What did you prescribe or advise?" value={med} onChange={setMed} error={errMed ? "Required." : null} />
          <LiveSelect label="Next action" value={next} onChange={setNext} error={errNext ? "Choose a next action." : null} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 24px 0", padding: "12px 14px", borderRadius: 11, background: "#F3F6F9", border: `1px solid #E4EAF0` }}>
          <span style={{ width: 30, height: 30, borderRadius: 8, background: OM.periBg, color: OM.periText, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icons.message size={17} sw={2} /></span>
          <span style={{ fontSize: 13, color: OM.slate, lineHeight: 1.45 }}>Saving sends <strong style={{ fontWeight: 600, color: OM.navy }}>{name}</strong> a plain-language summary within an hour.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 11, padding: "18px 24px 20px" }}>
          <LiveButton kind="secondary" label="Cancel" onClick={onClose} />
          <LiveButton kind="primary" label="Save visit" icon="check" onClick={save} />
        </div>
      </UI.Card>
    </div>
  );
}

function Toast({ name, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 4600); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 28, zIndex: 1100, display: "flex", justifyContent: "center", padding: "0 20px", pointerEvents: "none", fontFamily: "var(--ui-font)" }}>
      <div style={{ pointerEvents: "auto", display: "flex", alignItems: "flex-start", gap: 12, width: 392, maxWidth: "100%", background: OM.surface, borderRadius: 14, padding: "15px 16px", border: `1px solid ${FB.grnBorder}`, boxShadow: "0 16px 40px -12px rgba(16,24,40,0.30), 0 4px 10px -6px rgba(16,24,40,0.20)" }}>
        <span style={{ width: 30, height: 30, borderRadius: 999, background: FB.grn, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><Icons.check size={17} sw={3} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: OM.navy, letterSpacing: "-0.01em" }}>Visit logged</div>
          <div style={{ fontSize: 13, color: OM.slate, marginTop: 2, lineHeight: 1.45 }}>Summary on its way to {name}<span style={{ color: OM.border, margin: "0 6px" }}>·</span><span style={{ fontFamily: OM.mono, color: OM.tertiary }}>just now</span></div>
        </div>
        <button type="button" aria-label="Dismiss" onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "transparent", color: OM.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </div>
    </div>
  );
}

function Scene({ state }) {
  const success = state === "success";
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", fontFamily: "var(--ui-font)" }}>
      <RecordBackdrop />
      {!success && <div style={{ position: "absolute", inset: 0, background: "rgba(20,26,38,0.46)", backdropFilter: "blur(1.5px)" }} />}
      {!success ? (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}><LogVisitModal state={state} /></div>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, display: "flex", justifyContent: "center", padding: "0 20px" }}><SuccessToast /></div>
      )}
    </div>
  );
}

const LogVisit = { Scene, Dialog, Toast };

export { LogVisit };

// messages.jsx — Omaya message templates as real bubbles in a channel-agnostic phone frame.
import React from "react";

const PERI_BG   = "#E0E8F3";   // periwinkle tint — Omaya's bubbles
const PERI_INK  = "#1E3F66";   // deep periwinkle text on tint
const PERI_TEXT = "#24528C";   // periwinkle accent (actions)
const PERI_SOLID= "#3C6BA8";   // solid periwinkle for the one urgent action

const SCREEN_BG = "#EDEBE6";   // warm neutral conversation field
const HEADER_BG = "#FFFFFF";
const LINE      = "#E6E3DD";
const SLATE     = "#3A4658";
const TERTIARY  = "#8A8F9A";

// ---------- tiny inline icon set (self-contained, channel-agnostic) ----------
function Ico({ d, size = 20, sw = 1.8, fill = "none", style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"}
      strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={style}>
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}
const HeartFilled = (p) => (
  <svg width={p.size || 20} height={p.size || 20} viewBox="0 0 24 24" fill="currentColor" style={p.style}>
    <path d="M12 20s-7-4.5-7-9.6A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 3.4c0 5.1-7 9.6-7 9.6z" />
  </svg>
);
const Chevron = (p) => <Ico {...p} d="M15 6l-6 6 6 6" sw={2} />;
const PhoneG  = (p) => <Ico {...p} d="M7 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 5 5a2 2 0 0 1 2-2z" />;
const SendG   = (p) => <Ico {...p} d="M5 12h13M12 5l7 7-7 7" sw={2} />;
const PlusG   = (p) => <Ico {...p} d={["M12 6v12", "M6 12h12"]} sw={2} />;
const Check2  = (p) => <Ico {...p} d={["M2 13l3.5 3.5L13 9", "M11 13l1 1 7-7"]} sw={2} />;

// ---------- phone chrome ----------
function StatusBar() {
  return (
    <div style={{ position: "relative", height: 46, display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 22px", color: "#15171C", fontWeight: 600, fontSize: 14.5, letterSpacing: "0.01em" }}>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>9:41</span>
      <div style={{ position: "absolute", top: 8, left: "50%", transform: "translateX(-50%)", width: 88, height: 25, background: "#0C0D10", borderRadius: 20 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* signal */}
        <svg width="18" height="13" viewBox="0 0 18 13" fill="#15171C"><rect x="0" y="9" width="3" height="4" rx="1"/><rect x="5" y="6" width="3" height="7" rx="1"/><rect x="10" y="3" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="13" rx="1"/></svg>
        {/* wifi */}
        <svg width="17" height="13" viewBox="0 0 17 13" fill="#15171C"><path d="M8.5 2.2c2.7 0 5.2 1 7.1 2.7l-1.5 1.6A8 8 0 0 0 8.5 4.4 8 8 0 0 0 2.9 6.5L1.4 4.9A10.6 10.6 0 0 1 8.5 2.2zM8.5 6.6c1.5 0 2.9.6 4 1.5L8.5 12 4.5 8.1a6 6 0 0 1 4-1.5z"/></svg>
        {/* battery */}
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.6" y="0.6" width="22" height="11.8" rx="3" stroke="#15171C" strokeOpacity="0.4"/><rect x="2.2" y="2.2" width="16" height="8.6" rx="1.6" fill="#15171C"/><rect x="24" y="4" width="1.6" height="5" rx="0.8" fill="#15171C" fillOpacity="0.4"/></svg>
      </div>
    </div>
  );
}

function Header() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 14px 10px", background: HEADER_BG, borderBottom: `1px solid ${LINE}` }}>
      <span style={{ color: PERI_TEXT, display: "flex", marginLeft: -2 }}><Chevron size={24} /></span>
      <span style={{ width: 38, height: 38, borderRadius: 999, background: PERI_BG, color: PERI_TEXT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <HeartFilled size={19} />
      </span>
      <div style={{ minWidth: 0, flex: 1, lineHeight: 1.2 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: "#1A2536", letterSpacing: "-0.01em" }}>Omaya</div>
        <div style={{ fontSize: 12, color: TERTIARY, marginTop: 1 }}>Korle Bu Teaching Hospital</div>
      </div>
      <span style={{ color: PERI_TEXT, display: "flex" }}><PhoneG size={21} /></span>
    </div>
  );
}

function DateDivider() {
  return (
    <div style={{ textAlign: "center", margin: "4px 0 6px" }}>
      <span style={{ fontSize: 11.5, fontWeight: 600, color: TERTIARY, letterSpacing: "0.02em" }}>Today  9:41</span>
    </div>
  );
}

// ---------- message bubbles ----------
function Bubble({ from, children, meta }) {
  const mine = from === "mother";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start", maxWidth: "84%", alignSelf: mine ? "flex-end" : "flex-start" }}>
      <div style={{
        background: mine ? "#FFFFFF" : PERI_BG,
        color: mine ? SLATE : PERI_INK,
        border: mine ? `1px solid ${LINE}` : "none",
        borderRadius: mine ? "19px 19px 6px 19px" : "19px 19px 19px 6px",
        padding: "11px 14px", fontSize: 14.5, lineHeight: 1.5, letterSpacing: "-0.005em",
        textWrap: "pretty",
      }}>
        {children}
      </div>
      {meta && (
        <div style={{ fontSize: 10.5, color: TERTIARY, margin: mine ? "4px 4px 0 0" : "4px 0 0 4px", display: "flex", alignItems: "center", gap: 4 }}>
          {meta}{mine && <span style={{ color: PERI_TEXT, display: "flex" }}><Check2 size={14} sw={2.2} /></span>}
        </div>
      )}
    </div>
  );
}

// the single action — quick-reply chip(s)
function QuickReplies({ options }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, alignSelf: "flex-end", justifyContent: "flex-end", marginTop: 2 }}>
      {options.map((o, i) => (
        <span key={i} style={{ border: `1.5px solid ${PERI_TEXT}`, color: PERI_TEXT, background: "rgba(224,232,243,0.45)",
          borderRadius: 999, padding: "9px 15px", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>
          {o}
        </span>
      ))}
    </div>
  );
}

// the single action — solid call button (escalation)
function CallAction({ label }) {
  return (
    <div style={{ alignSelf: "stretch", marginTop: 4 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, background: PERI_SOLID, color: "#fff",
        borderRadius: 14, padding: "13px 16px", fontSize: 14.5, fontWeight: 600, letterSpacing: "0.005em",
        boxShadow: "0 6px 16px -8px rgba(60,107,168,0.7)" }}>
        <PhoneG size={18} sw={2} fill="none" /> {label}
      </div>
    </div>
  );
}

function InputBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 12px 11px", background: HEADER_BG, borderTop: `1px solid ${LINE}` }}>
      <span style={{ color: TERTIARY, display: "flex" }}><PlusG size={22} /></span>
      <div style={{ flex: 1, height: 36, borderRadius: 999, border: `1px solid ${LINE}`, background: "#F4F3EF", display: "flex", alignItems: "center", padding: "0 14px", fontSize: 13.5, color: TERTIARY }}>
        Message
      </div>
      <span style={{ width: 34, height: 34, borderRadius: 999, background: PERI_BG, color: PERI_TEXT, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <SendG size={18} />
      </span>
    </div>
  );
}

// ---------- assembled phone card ----------
function PhoneCard({ template }) {
  const t = template;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ width: 322, background: "#0C0D10", borderRadius: 46, padding: 11,
        boxShadow: "0 34px 70px -28px rgba(22,28,46,0.5), 0 10px 24px -14px rgba(22,28,46,0.35)" }}>
        <div style={{ background: SCREEN_BG, borderRadius: 36, overflow: "hidden", position: "relative" }}>
          <StatusBar />
          <Header />
          <div style={{ padding: "12px 13px 14px", display: "flex", flexDirection: "column", gap: 9 }}>
            <DateDivider />
            {t.bubbles.map((b, i) => (
              <Bubble key={i} from={b.from} meta={b.meta}>{b.text}</Bubble>
            ))}
            {t.action.kind === "chips" && <QuickReplies options={t.action.options} />}
            {t.action.kind === "call" && <CallAction label={t.action.label} />}
          </div>
          <InputBar />
        </div>
      </div>
      {/* trigger caption */}
      <div style={{ maxWidth: 300, textAlign: "center" }}>
        <div style={{ fontSize: 12.5, color: PERI_TEXT, fontWeight: 600, letterSpacing: "0.01em" }}>{t.trigger}</div>
        <div style={{ fontSize: 12, color: "#9A8E86", marginTop: 3, lineHeight: 1.4 }}>
          One action · {t.actionNote}
        </div>
      </div>
    </div>
  );
}

// ---------- the seven templates (real copy, Omaya voice) ----------
const TEMPLATES = [
  {
    id: "welcome",
    label: "1 · Welcome",
    trigger: "Sent the moment her discharge is saved",
    actionNote: "say hello back",
    bubbles: [
      { from: "omaya", text: "Hi Ama, I'm Omaya — your care companion from Korle Bu. Over the next few weeks I'll check in to see how you and baby are settling in at home.", meta: "Delivered" },
      { from: "omaya", text: "You can write to me here anytime, day or night. There's nothing too small to ask." },
    ],
    action: { kind: "chips", options: ["Hello, thank you"] },
  },
  {
    id: "postcall",
    label: "2 · Post-call summary",
    trigger: "Sent within an hour of each check-in call",
    actionNote: "set the one reminder",
    bubbles: [
      { from: "omaya", text: "It was lovely to talk with you today, Ama. You're doing really well, and so is baby.", meta: "Delivered" },
      { from: "omaya", text: "Just one thing to remember this week: take your tablets with a little food each morning until the pack is finished." },
    ],
    action: { kind: "chips", options: ["Remind me each morning"] },
  },
  {
    id: "reminder",
    label: "3 · Visit reminder",
    trigger: "Sent the day before a planned visit",
    actionNote: "keep the date",
    bubbles: [
      { from: "omaya", text: "Hi Ama, a gentle reminder — your next visit at Korle Bu is tomorrow, Thursday 5 June, at 10 in the morning.", meta: "Delivered" },
      { from: "omaya", text: "We're looking forward to seeing you and baby. Bring your little one along." },
    ],
    action: { kind: "chips", options: ["Add to my calendar"] },
  },
  {
    id: "escalation",
    label: "4 · Escalation alert",
    trigger: "Sent when a call shows she needs someone now",
    actionNote: "reach a midwife",
    bubbles: [
      { from: "omaya", text: "Ama, thank you for being so honest with me earlier. You don't have to carry any of this on your own.", meta: "Delivered" },
      { from: "omaya", text: "Akosua, a midwife at Korle Bu, is ready to talk with you right now. She's expecting your call." },
    ],
    action: { kind: "call", label: "Call Akosua now" },
  },
  {
    id: "twoway",
    label: "5 · Two-way auto-reply",
    trigger: "Sent the instant she writes back",
    actionNote: "be put through to someone",
    bubbles: [
      { from: "mother", text: "I've had more pain than yesterday and I'm a little worried.", meta: "9:39" },
      { from: "omaya", text: "Thank you for telling me, Ama. I've let your midwife at Korle Bu know, and someone will reach you today.", meta: "Delivered" },
      { from: "omaya", text: "If it suddenly feels much worse before then, please go straight in — don't wait." },
    ],
    action: { kind: "chips", options: ["Talk to someone now"] },
  },
  {
    id: "safety",
    label: "6 · Safety check",
    trigger: "Sent on a quiet morning, every so often",
    actionNote: "tell her how you are",
    bubbles: [
      { from: "omaya", text: "Morning, Ama. I'm just thinking of you today.", meta: "Delivered" },
      { from: "omaya", text: "How are you feeling in yourself — not baby, just you?" },
    ],
    action: { kind: "chips", options: ["Doing okay", "Up and down", "Finding it hard"] },
  },
  {
    id: "closure",
    label: "7 · Outreach closure",
    trigger: "Sent at the end of her six weeks with Omaya",
    actionNote: "keep the number close",
    bubbles: [
      { from: "omaya", text: "Ama, this is my last check-in with you. You've come such a long way these six weeks, and it's been a joy walking it with you.", meta: "Delivered" },
      { from: "omaya", text: "Korle Bu is always here whenever you need them. Take good care of yourself, and of baby." },
    ],
    action: { kind: "chips", options: ["Save Korle Bu's number"] },
  },
];

export { PhoneCard, TEMPLATES };

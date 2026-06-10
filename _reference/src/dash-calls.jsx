// dash-calls.jsx — Omaya Calls. Master-detail mirroring Mothers: call log list + call detail
// (summary, symptom tags, transcript).
import React from "react";
import { OM, SEV, SEV_SOFT, Icons, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

const CANVAS = "#F4F4F6";
const CARD_SHADOW =
  "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.04)";
const HAIR = "#F0F0F2";

const CALL_STATUS = {
  inprogress: { label: "In progress", fg: "#166534", bg: "#F0FDF4", dot: "#166534", pulse: true },
  completed: { label: "Completed", fg: "#065F46", bg: "#ECFDF5", dot: "#065F46" },
  upcoming: { label: "Upcoming", fg: "#B45309", bg: "#FEF3E2", dot: "#B45309" },
  missed: { label: "Missed", fg: "#C0392B", bg: "#FDECEA", dot: "#C0392B" },
};

const CALLS = [
  { id: "c1", name: "Esi Boateng", initials: "EB", type: "Day 3", date: "Today", time: "10:15", status: "inprogress", duration: "Live", level: "L3", phone: "0201 447 309", summary: "Esi reports feeling low and tearful since the birth. Sleep is broken and appetite reduced. No thoughts of harm. Flagged for a midwife call-back today.", tags: ["Low mood", "Tearful", "Poor sleep", "Low appetite"], transcript: [{ who: "Omaya", t: "Hello Esi, this is your Day 3 check-in. How have you been feeling since we last spoke?" }, { who: "Esi", t: "Honestly, not great. I've been feeling really low and I keep crying for no reason." }, { who: "Omaya", t: "I'm sorry to hear that. Thank you for telling me. Are you able to sleep when the baby sleeps?" }, { who: "Esi", t: "Not really. Even when she sleeps I just lie there. And I don't feel hungry at all." }, { who: "Omaya", t: "That sounds exhausting. These feelings are common but important to take seriously. I'm going to flag this for your midwife so she can check in with you today." }, { who: "Esi", t: "Okay. Thank you." }] },
  { id: "c2", name: "Akua Owusu", initials: "AO", type: "Day 2", date: "Today", time: "09:30", status: "completed", duration: "4m 12s", level: "L1", phone: "0277 612 884", summary: "Akua is recovering well. Baby is feeding regularly and her mood is positive. No concerns raised on this call.", tags: ["Feeding well", "Good mood", "No concerns"], transcript: [{ who: "Omaya", t: "Good morning Akua, this is your Day 2 check-in. How are you and baby doing?" }, { who: "Akua", t: "We're good, thank you. She's feeding well and I'm feeling much stronger today." }, { who: "Omaya", t: "That's lovely to hear. Any pain or bleeding you're worried about?" }, { who: "Akua", t: "No, everything feels normal. Just a little tired but that's expected." }, { who: "Omaya", t: "Completely normal. Rest when you can. I'll check in again in a few days." }] },
  { id: "c3", name: "Ama Mensah", initials: "AM", type: "Day 7", date: "Today", time: "11:45", status: "missed", duration: "No answer", level: "L4", phone: "0244 081 552", summary: "Ama did not answer her Day 7 check-in. Two follow-up attempts since yesterday have gone unanswered. Escalated for a midwife to reach her directly.", tags: ["No answer", "Escalated"], transcript: [] },
  { id: "c4", name: "Adwoa Darko", initials: "AD", type: "Day 6", date: "Yesterday", time: "15:10", status: "completed", duration: "3m 02s", level: "L1", phone: "0209 334 026", summary: "Adwoa is recovering well and mobile around the house. She chose to withdraw from further check-ins on this call.", tags: ["Recovering well", "Declined further calls"], transcript: [{ who: "Omaya", t: "Hello Adwoa, this is your Day 6 check-in. How are you feeling?" }, { who: "Adwoa", t: "Much better, thank you. I'm up and about now. I think I'm okay to stop the calls." }, { who: "Omaya", t: "Of course. I'll pass that on. You can always reach Korle Bu if anything changes." }] },
  { id: "c5", name: "Yaa Asante", initials: "YA", type: "Day 1", date: "Today", time: "14:00", status: "upcoming", duration: "Scheduled", level: "L1", phone: "0244 905 117", summary: "First scheduled check-in for Yaa, newly onboarded yesterday. The call has not taken place yet.", tags: ["First call"], transcript: [] },
  { id: "c6", name: "Efua Adjei", initials: "EA", type: "Week 2", date: "Today", time: "15:30", status: "upcoming", duration: "Scheduled", level: "L1", phone: "0264 220 781", summary: "Routine Week 2 check-in, not yet started.", tags: ["Routine"], transcript: [] },
];

const STATUS_FILTERS = [
  { value: "all", label: "All calls" },
  { value: "inprogress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "upcoming", label: "Upcoming" },
  { value: "missed", label: "Missed" },
];
const WHEN_FILTERS = [
  { value: "all", label: "Any time" },
  { value: "Today", label: "Today" },
  { value: "Yesterday", label: "Yesterday" },
];

// ---------------- atoms ----------------
function StatusPill({ status }) {
  const st = CALL_STATUS[status];
  return (
    <span style={{ ...TK.badge, background: st.bg, color: st.fg, flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: st.dot, flexShrink: 0, animation: st.pulse ? "omPulse 1.4s ease-in-out infinite" : "none" }} />
      {st.label}
    </span>
  );
}
function SevDot({ level }) {
  const s = SEV_SOFT[level];
  return (
    <span style={{ ...TK.badge, background: s.bg, color: s.text, flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot }} />
      {SEV[level].label}
    </span>
  );
}

// ---------------- left list ----------------
function ListRow({ c, selected, onSelect }) {
  const [h, setH] = React.useState(false);
  return (
    <button type="button" onClick={() => onSelect(c.id)}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: "relative", width: "100%", textAlign: "left",
        display: "block", border: "none", padding: "12px 16px",
        borderBottom: TK.rowBorder, cursor: "pointer",
        background: selected ? "#FCF7FA" : h ? TK.rowHover : OM.surface,
        transition: "background .12s", fontFamily: "var(--ui-font)",
      }}>
      {selected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: OM.plum, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: OM.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
        <StatusPill status={c.status} />
      </div>
      <div style={{ fontSize: 12, color: OM.tertiary, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        <span style={{ color: OM.tertiary }}>{c.type} check-in</span>
        <span style={{ margin: "0 7px", color: OM.borderStrong }}>·</span>
        <span style={{ fontFamily: OM.mono, color: OM.tertiary }}>{c.date}, {c.time}</span>
      </div>
    </button>
  );
}

function ListEmpty() {
  return (
    <div style={{ padding: "32px 20px", textAlign: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F1F1F4", color: OM.tertiary, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icons.phoneCall size={18} sw={2} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: OM.navy }}>No calls match</div>
      <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 4 }}>Try a different status or time.</div>
    </div>
  );
}

function ListCard({ stack, selectedId, onSelect, visible, search, setSearch, status, setStatus, when, setWhen }) {
  return (
    <UI.Card padding={0} style={{ width: stack ? "100%" : 392, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, padding: "16px 20px 0" }}>
        <h1 style={TK.pageTitle}>Calls</h1>
        <div style={{ marginTop: 14 }}>
          <UI.Input leadingIcon="search" placeholder="Search mother" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, margin: "10px 0 16px" }}>
          <UI.Dropdown flex value={status} onChange={setStatus} items={STATUS_FILTERS} width={200} />
          <UI.Dropdown flex value={when} onChange={setWhen} items={WHEN_FILTERS} width={180} align="right" />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", borderTop: TK.rowBorder }}>
        {visible.length === 0 ? <ListEmpty /> : visible.map((c) => <ListRow key={c.id} c={c} selected={c.id === selectedId} onSelect={onSelect} />)}
      </div>
    </UI.Card>
  );
}

// ---------------- right detail ----------------
function MetaItem({ icon, label, value }) {
  const I = Icons[icon];
  const tint = { phoneCall: "#C2902C", clock: "#5C8A6E", user: "#B0608A", activity: "#4E79A8" }[icon] || OM.tertiary;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <I size={18} sw={2} style={{ flexShrink: 0, color: tint }} />
        <span style={{ ...TK.metaLabel }}>{label}</span>
      </div>
      <div style={{ ...TK.metaValue, marginTop: 6 }}>{value}</div>
    </div>
  );
}
function Tag({ children }) {
  return <span style={{ display: "inline-flex", alignItems: "center", background: OM.periBg, color: OM.periText, borderRadius: 999, padding: "6px 13px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>;
}

function Detail({ c, stack, onBack }) {
  const pending = c.status === "upcoming";
  const SEC = TK.secLabel;
  return (
    <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", background: "#F5F4F2" }}>
      {stack && (
        <div style={{ flexShrink: 0, padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
          <button type="button" onClick={onBack} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...TK.btn.md, ...TK.btnSecondary, cursor: "pointer", fontFamily: "var(--ui-font)", padding: "0 12px 0 8px" }}>
            <Icons.chevronRight size={16} sw={2.2} style={{ transform: "rotate(180deg)" }} />
            All calls
          </button>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div style={{ maxWidth: 760, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Card 1 — Call header */}
          <UI.Card padding="p-6">
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: OM.navy, letterSpacing: "-0.02em" }}>{c.name}</h1>
              <StatusPill status={c.status} />
            </div>
            <div style={{ fontSize: 13.5, color: OM.tertiary, marginTop: 8 }}>
              <span style={{ fontWeight: 500, color: OM.slate }}>{c.type} check-in</span>
              <span style={{ margin: "0 8px", color: OM.borderStrong }}>·</span>
              <span style={{ fontFamily: OM.mono }}>{c.date}, {c.time}</span>
            </div>
          </UI.Card>
          {/* Card 2 — Call info */}
          <UI.Card padding="p-6">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
              <MetaItem icon="phoneCall" label="Phone" value={c.phone} />
              <MetaItem icon="clock" label="Duration" value={c.duration} />
              <MetaItem icon="activity" label="Outcome" value={<SevDot level={c.level} />} />
              <MetaItem icon="user" label="Day in care" value={c.type} />
            </div>
          </UI.Card>
          {/* Card 3 — Summary */}
          <UI.Card padding="p-6">
            <div style={SEC}>Summary</div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: OM.slate }}>{c.summary}</div>
          </UI.Card>
          {/* Card 4 — What came up */}
          {c.tags && c.tags.length > 0 && (
            <UI.Card padding="p-6">
              <div style={SEC}>What came up</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{c.tags.map((t, i) => <Tag key={i}>{t}</Tag>)}</div>
            </UI.Card>
          )}
          {/* Card 5 — Transcript */}
          <UI.Card padding={0} style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px 0" }}><div style={SEC}>Transcript</div></div>
            {c.transcript.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: OM.navy }}>{pending ? "Call hasn't taken place yet" : "No transcript"}</div>
                <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 4 }}>
                  {pending ? "The transcript will appear here once the call is completed." : "This call went unanswered, so there is no conversation to show."}
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
                {c.transcript.map((line, i) => {
                  const ai = line.who === "Omaya";
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: ai ? "flex-start" : "flex-end" }}>
                      <span style={{ fontFamily: OM.mono, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: OM.tertiary, marginBottom: 4, padding: "0 4px" }}>{line.who}</span>
                      <div style={{ maxWidth: "82%", fontSize: 14, lineHeight: 1.55, padding: "10px 14px", borderRadius: 14, background: ai ? "#F4F6F8" : OM.periBg, color: ai ? OM.slate : OM.periText, borderBottomLeftRadius: ai ? 4 : 14, borderBottomRightRadius: ai ? 14 : 4 }}>{line.t}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </UI.Card>
          {/* Action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 4px" }}>
            <button type="button" style={{ flex: 1, ...TK.btn.lg, ...TK.btnSecondary, cursor: "pointer", fontFamily: "var(--ui-font)" }}>View mother</button>
            <button type="button" style={{ flex: 1, ...TK.btn.lg, ...TK.btnPrimary, cursor: "pointer", fontFamily: "var(--ui-font)" }}>Call back</button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 4px 0", fontSize: 12, color: OM.tertiary }}>
            <Icons.shield size={13} sw={2} style={{ flexShrink: 0 }} />
            Transcripts are stored verbatim for audit and cannot be edited.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- view ----------------
function CallsView({ w }) {
  const stack = w < 900;
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [when, setWhen] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState("c1");
  const [showDetailOnStack, setShowDetailOnStack] = React.useState(false);
  const hp = w >= 1280 ? 24 : 20;

  const visible = CALLS.filter((c) => {
    if (status !== "all" && c.status !== status) return false;
    if (when !== "all" && c.date !== when) return false;
    if (search.trim() && !c.name.toLowerCase().includes(search.trim().toLowerCase())) return false;
    return true;
  });
  const call = visible.find((c) => c.id === selectedId) || visible[0] || CALLS[0];
  const select = (id) => { setSelectedId(id); setShowDetailOnStack(true); };
  const detailHidden = stack && !showDetailOnStack;
  const listHidden = stack && showDetailOnStack;

  return (
    <div style={{ height: "100%", width: "100%", boxSizing: "border-box", padding: `clamp(14px, 2.5vw, 30px) ${hp}px 32px` }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", height: "100%", display: "flex", flexDirection: stack ? "column" : "row", gap: 24 }}>
        {!listHidden && <ListCard stack={stack} selectedId={call ? call.id : null} onSelect={select} visible={visible} search={search} setSearch={setSearch} status={status} setStatus={setStatus} when={when} setWhen={setWhen} />}
        {!detailHidden && call && <Detail c={call} stack={stack} onBack={() => setShowDetailOnStack(false)} />}
      </div>
    </div>
  );
}

export { CallsView };

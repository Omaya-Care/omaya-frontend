// dash-mothers.jsx — Mothers master-detail. Two floating rounded cards on a grey canvas,
// styled to the reference order screen (spacing, filled controls, accent spine, sub-cards).
import React from "react";
import { OM, SEV, SEV_RANK, SEV_SOFT, Icons, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";
import { LogVisit } from "./dash-logvisit.jsx";

const CANVAS = "#F4F4F6";
const CARD_SHADOW =
  "0 1px 2px rgba(16,24,40,0.05), 0 1px 3px rgba(16,24,40,0.04)";
const FIELD_BG = "#F1F1F4";

// ---------------- sample cohort ----------------
const MOTHERS = [
  {
    id: "ama",
    name: "Ama Mensah",
    initials: "AM",
    level: "L4",
    day: 7,
    delivery: "Caesarean section",
    consent: "active",
    lastInteraction: "Day 6 call · yesterday",
    phone: "0244 081 552",
    note: "Missed scheduled check-in",
    flag: "Missed the Day 7 check-in call and has not responded to two follow-up attempts since yesterday.",
    history: [
      { date: "06 Jun", rel: "Day 6", level: "L3", summary: "Reported a persistent headache and feeling dizzy when standing." },
      { date: "04 Jun", rel: "Day 4", level: "L2", summary: "Wound site sore but healing; advised on dressing changes." },
      { date: "02 Jun", rel: "Day 2", level: "L1", summary: "Recovering well, baby feeding regularly, no concerns raised." },
    ],
  },
  {
    id: "esi",
    name: "Esi Boateng",
    initials: "EB",
    level: "L3",
    day: 3,
    delivery: "Vaginal delivery",
    consent: "active",
    lastInteraction: "Day 3 call · today",
    phone: "0201 447 309",
    note: "Low mood and tearful",
    flag: "Flagged for low mood on the Day 3 check-in. Midwife alerted and scheduled a call-back for today.",
    history: [
      { date: "03 Jun", rel: "Day 3", level: "L3", summary: "Reported feeling low, tearful, and unable to sleep since the birth." },
      { date: "01 Jun", rel: "Day 1", level: "L1", summary: "Welcomed to the programme. Baby feeding well, mother in good spirits." },
    ],
  },
  {
    id: "akua",
    name: "Akua Owusu",
    initials: "AO",
    level: "L1",
    day: 2,
    delivery: "Vaginal delivery",
    consent: "active",
    lastInteraction: "Day 2 call · today",
    phone: "0277 612 884",
    note: "Recovering well",
    flag: "No concerns on the Day 2 check-in. Baby feeding regularly. Routine monitoring only.",
    history: [
      { date: "03 Jun", rel: "Day 2", level: "L1", summary: "Recovering well, baby feeding regularly, no concerns raised." },
    ],
  },
  {
    id: "maame",
    name: "Maame Darko",
    initials: "MD",
    level: "L2",
    day: 11,
    delivery: "Caesarean section",
    consent: "active",
    lastInteraction: "Day 10 call · yesterday",
    phone: "0264 220 781",
    note: "Wound site concerns",
    flag: "Wound site concerns were raised on the Day 10 check-in. A follow-up visit has been scheduled.",
    history: [
      { date: "01 Jun", rel: "Day 10", level: "L2", summary: "Slight redness around incision site, no discharge or fever." },
      { date: "28 May", rel: "Day 6", level: "L1", summary: "Wound healing well, no pain. Baby feeding normally." },
      { date: "24 May", rel: "Day 2", level: "L1", summary: "Good recovery, mobilising with assistance." },
    ],
  },
  {
    id: "efua",
    name: "Efua Adjei",
    initials: "EA",
    level: "L3",
    day: 14,
    delivery: "Vaginal delivery",
    consent: "active",
    lastInteraction: "Week 2 call · today",
    phone: "0244 905 117",
    note: "BP elevated",
    flag: "Blood pressure was elevated during the Week 2 check-in. Flagged for a physician review before the next scheduled call.",
    history: [
      { date: "03 Jun", rel: "Week 2", level: "L3", summary: "BP 135/92. Mother reports occasional headaches but no visual disturbances." },
      { date: "27 May", rel: "Day 7", level: "L2", summary: "BP 130/85. Advised to monitor and rest. Scheduled earlier check-in." },
      { date: "20 May", rel: "Day 1", level: "L1", summary: "Enrolled after uncomplicated vaginal delivery. All vitals normal." },
    ],
  },
  {
    id: "adwoa",
    name: "Adwoa Darko",
    initials: "AD",
    level: "L1",
    day: 6,
    delivery: "Vaginal delivery",
    consent: "withdrawn",
    lastInteraction: "Day 6 call · yesterday",
    phone: "0209 334 026",
    note: "Withdrew from programme",
    flag: "Mother chose to withdraw from postpartum monitoring during her Day 6 call. Consent revoked.",
    history: [
      { date: "02 Jun", rel: "Day 6", level: "L1", summary: "Recovering well, chose to withdraw from further check-ins." },
      { date: "29 May", rel: "Day 3", level: "L1", summary: "Feeling good, no concerns. Baby latching well." },
    ],
  },
  {
    id: "abena",
    name: "Abena Owusu-Ansah",
    initials: "AO",
    level: "L1",
    day: 9,
    delivery: "Caesarean section",
    consent: "active",
    lastInteraction: "Day 8 call · 2 days ago",
    phone: "0277 883 419",
    note: "No concerns",
    flag: "All check-ins so far have been routine. No flags raised.",
    history: [
      { date: "31 May", rel: "Day 8", level: "L1", summary: "Continued good recovery, wound healing well." },
      { date: "25 May", rel: "Day 2", level: "L1", summary: "Mobilising well, baby feeding. No concerns." },
    ],
  },
  {
    id: "yaa",
    name: "Yaa Asante",
    initials: "YA",
    level: "L1",
    day: 1,
    delivery: "Vaginal delivery",
    consent: "active",
    lastInteraction: "Enrolled today",
    phone: "0264 220 781",
    note: "New enrolment",
    flag: "Newly onboarded today. First check-in scheduled for this afternoon. No flags yet.",
    history: [],
  },
  {
    id: "grace",
    name: "Grace Offei",
    initials: "GO",
    level: "L2",
    day: 16,
    delivery: "Vaginal delivery",
    consent: "active",
    lastInteraction: "Day 15 call · yesterday",
    phone: "0540 771 563",
    note: "Engorgement",
    flag: "Reports breast engorgement. Advised on feeding techniques and comfort measures on the Day 15 call.",
    history: [
      { date: "01 Jun", rel: "Day 15", level: "L2", summary: "Breast engorgement causing discomfort. Advised on warm compresses and frequent feeding." },
      { date: "28 May", rel: "Day 12", level: "L1", summary: "Latching improved, milk supply established. Mother feeling more confident." },
      { date: "22 May", rel: "Day 6", level: "L1", summary: "Initial latching difficulties — lactation support offered." },
    ],
  },
  {
    id: "ama2",
    name: "Ama Serwaa",
    initials: "AS",
    level: "L4",
    day: 16,
    delivery: "Caesarean section",
    consent: "active",
    lastInteraction: "Day 15 call · yesterday",
    phone: "0244 081 552",
    note: "Postpartum haemorrhage",
    flag: "Flagged after Day 15 call for heavy bleeding and severe pain. Escalated to senior physician. Crisis response initiated.",
    history: [
      { date: "01 Jun", rel: "Day 15", level: "L4", summary: "Reported heavy bleeding and severe lower abdominal pain. Urgent action required." },
      { date: "28 May", rel: "Day 12", level: "L2", summary: "Complained of ongoing lower back pain. Paracetamol prescribed." },
      { date: "22 May", rel: "Day 6", level: "L1", summary: "Normal recovery. Baby feeding and gaining weight. No concerns." },
    ],
  },
];

const STATUS_FILTERS = [
  { value: "all", label: "All levels" },
  { value: "L4", label: "Crisis" },
  { value: "L3", label: "Elevated" },
  { value: "L2", label: "Monitor" },
  { value: "L1", label: "Routine" },
];
const SORT_OPTIONS = [
  { value: "severity", label: "Most urgent" },
  { value: "day", label: "Day in care" },
  { value: "alpha", label: "Name (A–Z)" },
];

// ---------------- shared atoms ----------------
function SoftSevPill({ level }) {
  const s = SEV_SOFT[level];
  const label = SEV[level].label;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: s.bg, color: s.text, borderRadius: 999,
      padding: "2px 10px", fontSize: 11, fontWeight: 600,
      lineHeight: "16px", whiteSpace: "nowrap", flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function StatusPill({ label, color, bg }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: bg || "#EEF0F3", color: color || OM.slate, borderRadius: 999,
      padding: "3px 10px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color || OM.tertiary, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ---------------- left master list ----------------
function ListRow({ m, selected, onSelect }) {
  const [h, setH] = React.useState(false);
  const inactive = m.consent === "withdrawn" || m.consent === "deceased";
  return (
    <button type="button" onClick={() => onSelect(m.id)}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        position: "relative", width: "100%", textAlign: "left",
        display: "block", border: "none", padding: "14px 16px",
        borderBottom: TK.rowBorder, cursor: "pointer",
        background: selected ? "#FCF7FA" : h ? TK.rowHover : OM.surface,
        transition: "background .12s", fontFamily: "var(--ui-font)",
      }}>
      {selected && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: OM.plum, borderTopRightRadius: 3, borderBottomRightRadius: 3 }} />}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 999, flexShrink: 0,
          background: inactive ? "#EEF0F3" : OM.periBg,
          color: inactive ? OM.tertiary : OM.periText,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 600,
          opacity: inactive ? 0.65 : 1,
        }}>{m.initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: OM.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
            {!inactive && <SoftSevPill level={m.level} />}
          </div>
          <div style={{ fontSize: 12.5, color: OM.tertiary, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ fontFamily: OM.mono, fontWeight: 500, color: inactive ? OM.tertiary : OM.slate }}>Day {m.day}</span>
            <span style={{ margin: "0 7px", color: OM.borderStrong }}>·</span>
            {m.note}
          </div>
        </div>
      </div>
    </button>
  );
}

function Empty() {
  return (
    <div style={{ padding: "32px 20px", textAlign: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F1F1F4", color: OM.tertiary, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icons.users size={18} sw={2} />
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: OM.navy }}>No mothers match</div>
      <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 4 }}>Try a different level or sort.</div>
    </div>
  );
}

function MasterCard({ stack, selectedId, onSelect, visible, search, setSearch, sort, setSort, filter, setFilter }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <UI.Card padding={0} style={{ width: stack ? "100%" : 392, flexShrink: 0, height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ flexShrink: 0, padding: "16px 20px 0" }}>
        <h1 style={TK.pageTitle}>Mothers</h1>
        <div style={{ position: "relative", marginTop: 14 }}>
          <UI.Input leadingIcon="search" placeholder="Search mother" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, margin: "10px 0 16px" }}>
          <UI.Dropdown flex value={filter} onChange={setFilter} items={STATUS_FILTERS} width={200} />
          <UI.Dropdown flex value={sort} onChange={setSort} items={SORT_OPTIONS} width={180} align="right" />
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", borderTop: TK.rowBorder }}>
        {visible.length === 0 ? <Empty /> : visible.map((m) => (
          <ListRow key={m.id} m={m} selected={m.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </UI.Card>
  );
}

// ---------------- right detail ----------------
function MetaItem({ icon, label, value }) {
  const I = Icons[icon];
  const tint = { heart: "#B0608A", clock: "#5C8A6E", shield: "#4E79A8", phoneCall: "#C2902C" }[icon] || OM.tertiary;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <I size={17} sw={2} style={{ flexShrink: 0, color: tint }} />
        <span style={{ fontSize: 13.5, color: OM.tertiary, whiteSpace: "nowrap" }}>{label}</span>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 600, color: OM.navy, marginTop: 7, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function HistoryItem({ h, last }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "78px 1fr", gap: 14, alignItems: "center", padding: "15px 20px", borderBottom: last ? "none" : `1px solid ${OM.borderSoft}` }}>
      <div>
        <div style={{ fontFamily: OM.mono, fontSize: 13.5, fontWeight: 500, color: OM.slate }}>{h.date}</div>
        <div style={{ fontFamily: OM.mono, fontSize: 11, color: OM.tertiary, marginTop: 2 }}>{h.rel}</div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: SEV[h.level].base, flexShrink: 0, marginTop: 6 }} />
        <span style={{ fontSize: 14, color: OM.slate, lineHeight: 1.5 }}>{h.summary}</span>
      </div>
    </div>
  );
}

function DetailCard({ m, stack, onBack, activeTab, setActiveTab, onLogVisit }) {
  const SEC = TK.secLabel;
  return (
    <div style={{ flex: 1, minWidth: 0, height: "100%", display: "flex", flexDirection: "column", background: "#F5F4F2" }}>
      {stack && (
        <div style={{ flexShrink: 0, padding: "12px 16px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#fff" }}>
          <button type="button" onClick={onBack} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            ...TK.btn.md, ...TK.btnSecondary, cursor: "pointer",
            fontFamily: "var(--ui-font)", padding: "0 12px 0 8px",
          }}>
            <Icons.chevronRight size={16} sw={2.2} style={{ transform: "rotate(180deg)" }} />
            All mothers
          </button>
        </div>
      )}
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        <div style={{ maxWidth: 760, padding: 16, display: "flex", flexDirection: "column", gap: 10, margin: "0 auto" }}>
          {/* Card 1 — identity + flag */}
          <UI.Card padding="p-6">
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: OM.navy, letterSpacing: "-0.02em" }}>{m.name}</h1>
                  <SoftSevPill level={m.level} />
                </div>
                <p style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.55, color: OM.slate, textWrap: "pretty" }}>{m.flag}</p>
              </div>
              <button type="button" onClick={onLogVisit} style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                ...TK.btn.lg, ...TK.btnPrimary, cursor: "pointer", flexShrink: 0,
                fontFamily: "var(--ui-font)", whiteSpace: "nowrap",
              }}>
                <Icons.plus size={17} sw={2.4} />
                Log visit
              </button>
            </div>
          </UI.Card>

          {/* Card 2 — meta grid */}
          <UI.Card padding="p-6">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 24px" }}>
              <MetaItem icon="heart" label="Delivery type" value={m.delivery} />
              <MetaItem icon="clock" label="Day in care" value={`Day ${m.day} postpartum`} />
              <MetaItem icon="shield" label="Consent status" value={m.consent === "active" ? "Active — monitoring" : "Withdrawn"} />
              <MetaItem icon="phoneCall" label="Last interaction" value={m.lastInteraction} />
            </div>
          </UI.Card>

          {/* Card 3 — recent check-ins */}
          <UI.Card padding={0} style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: TK.rowBorder }}>
              <div style={SEC}>Recent check-ins</div>
            </div>
            {m.history.length === 0 ? (
              <div style={{ padding: "24px 20px", textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: OM.navy }}>No check-ins yet</div>
                <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 4 }}>History will appear once the first check-in is completed.</div>
              </div>
            ) : (
              m.history.map((h, i) => <HistoryItem key={i} h={h} last={i === m.history.length - 1} />)
            )}
          </UI.Card>

          {/* action buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 4px" }}>
            <button type="button" style={{ flex: 1, ...TK.btn.lg, ...TK.btnSecondary, cursor: "pointer", fontFamily: "var(--ui-font)" }}>
              <Icons.phoneCall size={16} sw={2} style={{ marginRight: 7 }} />
              Call mother
            </button>
            <button type="button" onClick={onLogVisit} style={{ flex: 1, ...TK.btn.lg, ...TK.btnPrimary, cursor: "pointer", fontFamily: "var(--ui-font)" }}>
              <Icons.plus size={17} sw={2.4} style={{ marginRight: 7 }} />
              Log visit
            </button>
          </div>

          {/* audit note */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 4px 0", fontSize: 12, color: OM.tertiary }}>
            <Icons.shield size={13} sw={2} style={{ flexShrink: 0 }} />
            All logs are recorded in the audit trail and cannot be edited after saving.
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------- view ----------------
function MothersView({ w, emptyClinic }) {
  const stack = w < 900;
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [sortKey, setSortKey] = React.useState("severity");
  const [selectedId, setSelectedId] = React.useState("ama");
  const [showDetailOnStack, setShowDetailOnStack] = React.useState(false);
  const [logOpen, setLogOpen] = React.useState(false);
  const [toast, setToast] = React.useState(null);
  const hp = w >= 1280 ? 24 : 20;

  // sort
  const order = (a, b) => {
    if (sortKey === "severity") return SEV_RANK[b.level] - SEV_RANK[a.level];
    if (sortKey === "day") return b.day - a.day;
    return a.name.localeCompare(b.name);
  };

  // filter
  let visible = filter === "all" ? MOTHERS : MOTHERS.filter((m) => m.level === filter);
  if (search.trim()) {
    const q = search.trim().toLowerCase();
    visible = visible.filter((m) => m.name.toLowerCase().includes(q));
  }
  visible.sort(order);
  const mother = visible.find((m) => m.id === selectedId) || visible[0] || null;

  const select = (id) => {
    setSelectedId(id);
    setShowDetailOnStack(true);
  };
  const detailHidden = stack && !showDetailOnStack;
  const listHidden = stack && showDetailOnStack;

  return (
    <div style={{ height: "100%", width: "100%", boxSizing: "border-box", padding: `clamp(14px, 2.5vw, 30px) ${hp}px 32px` }}>
      {emptyClinic ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center" }}>
          <div>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "#F1F1F4", color: OM.tertiary, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Icons.users size={24} sw={2} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: OM.navy }}>No mothers yet</div>
            <div style={{ fontSize: 14, color: OM.tertiary, marginTop: 6, maxWidth: 340, lineHeight: 1.5 }}>
              Mothers will appear here once they've been enrolled through a discharge.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 1180, margin: "0 auto", height: "100%", display: "flex", flexDirection: stack ? "column" : "row", gap: 24 }}>
          {!listHidden && (
            <MasterCard stack={stack} selectedId={mother ? mother.id : null} onSelect={select}
              visible={visible} search={search} setSearch={setSearch}
              sort={sortKey} setSort={setSortKey} filter={filter} setFilter={setFilter} />
          )}
          {!detailHidden && mother && (
            <DetailCard m={mother} stack={stack} onBack={() => setShowDetailOnStack(false)}
              activeTab={null} setActiveTab={() => {}}
              onLogVisit={() => setLogOpen(true)} />
          )}
        </div>
      )}
      {logOpen && (
        <LogVisit.Dialog
          name={mother ? mother.name : ""}
          day={mother ? mother.day : 0}
          onClose={() => setLogOpen(false)}
          onSaved={() => { setLogOpen(false); setToast(mother ? mother.name : ""); }}
        />
      )}
      {toast && (
        <LogVisit.Toast name={toast} onClose={() => setToast(null)} />
      )}
    </div>
  );
}

export { MothersView };

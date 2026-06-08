// dash-settings.jsx — Omaya Settings. Profile, clinic profile, notifications.
import React from "react";
import { OM, Icons, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

function GroupHeader({ title, sub }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={TK.sectionTitle}>{title}</h2>
      {sub && <p style={{ margin: "7px 0 0", ...TK.body, lineHeight: 1.5, maxWidth: 580, textWrap: "pretty" }}>{sub}</p>}
    </div>
  );
}
function Card({ children, pad = "p-6", style }) {
  return <UI.Card padding={pad} style={style}>{children}</UI.Card>;
}

function ToggleRow({ title, desc, on, onChange, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderBottom: last ? "none" : `1px solid #F0F0F2` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: OM.navy }}>{title}</div>
        <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 3, lineHeight: 1.45 }}>{desc}</div>
      </div>
      <UI.Toggle on={on} onChange={onChange} />
    </div>
  );
}

function SaveBar({ onSave, saved }) {
  const [h, setH] = React.useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 14, marginTop: 16 }}>
      {saved && <span style={{ fontSize: 13.5, color: "#2C5840", display: "inline-flex", alignItems: "center", gap: 6 }}><Icons.check size={16} sw={2.6} />Saved</span>}
      <button type="button" onClick={onSave} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{ ...TK.btn.lg, ...TK.btnPrimary, background: h ? OM.plumHover : OM.plum, cursor: "pointer", fontFamily: "var(--ui-font)", transition: "background .12s" }}>Save changes</button>
    </div>
  );
}

function SettingsView({ w }) {
  const [name, setName] = React.useState("K. Boateng");
  const [email, setEmail] = React.useState("k.boateng@korlebu.gh");
  const [phone, setPhone] = React.useState("+233 20 456 7890");
  const [clinic, setClinic] = React.useState("Korle Bu Maternity");
  const [unit, setUnit] = React.useState("Maternity A");
  const [city, setCity] = React.useState("Accra");
  const [saved, setSaved] = React.useState(false);
  const [notif, setNotif] = React.useState({ elevated: true, missed: true, daily: true, weekly: false });

  const setN = (k) => () => { setNotif((prev) => ({ ...prev, [k]: !prev[k] })); setSaved(false); };
  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "24px 20px 40px" }}>
      <h1 style={{ ...TK.pageTitle, margin: "0 0 30px" }}>Settings</h1>
      <section style={{ marginBottom: 40 }}>
        <GroupHeader title="Your profile" sub="Your account details and how you sign in." />
        <Card pad="20px 24px">
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22 }}>
            <div style={{ width: 56, height: 56, borderRadius: 999, background: "linear-gradient(150deg, #C99BB2 0%, #93406B 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 600, flexShrink: 0 }}>KB</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: OM.navy }}>{name}</div>
              <div style={{ fontSize: 13.5, color: OM.tertiary, marginTop: 2 }}>Administrator · Korle Bu Maternity</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: w < 600 ? "1fr" : "1fr 1fr", gap: 16 }}>
            <UI.Field label="Full name" value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
            <UI.Field label="Work email" value={email} onChange={(e) => { setEmail(e.target.value); setSaved(false); }} trailingIcon="help" />
            <UI.Field label="Role" value="Administrator" disabled hint="Roles are set by an administrator in Staff & roles." />
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button type="button" style={{ ...TK.btn.md, ...TK.btnSecondary, cursor: "pointer", fontFamily: "var(--ui-font)" }}>Change password</button>
            </div>
          </div>
        </Card>
      </section>
      <section style={{ marginBottom: 40 }}>
        <GroupHeader title="Clinic profile" sub="Details for Korle Bu Maternity. These appear on exports and in messages to mothers." />
        <Card pad="20px 24px">
          <div style={{ display: "grid", gridTemplateColumns: w < 600 ? "1fr" : "1fr 1fr", gap: 16 }}>
            <UI.Field label="Clinic name" value={clinic} onChange={(e) => { setClinic(e.target.value); setSaved(false); }} />
            <UI.Field label="Unit" value={unit} onChange={(e) => { setUnit(e.target.value); setSaved(false); }} />
            <UI.Field label="City" value={city} onChange={(e) => { setCity(e.target.value); setSaved(false); }} />
            <UI.Field label="Support phone" value={phone} onChange={(e) => { setPhone(e.target.value); setSaved(false); }} />
          </div>
        </Card>
      </section>
      <section>
        <GroupHeader title="Notifications" sub="Choose what you're alerted about. Crisis alerts cannot be turned off." />
        <Card style={{ overflow: "hidden" }}>
          <ToggleRow title="Crisis alerts (L4)" desc="Always on. A mother in crisis needs an immediate response." on={true} onChange={() => {}} />
          <ToggleRow title="Elevated alerts (L3)" desc="When a mother's check-in is flagged as elevated." on={notif.elevated} onChange={setN("elevated")} />
          <ToggleRow title="Missed check-ins" desc="When a scheduled call goes unanswered." on={notif.missed} onChange={setN("missed")} />
          <ToggleRow title="Daily summary email" desc="A morning digest of your cohort." on={notif.daily} onChange={setN("daily")} />
          <ToggleRow title="Weekly report" desc="Cohort trends and resolved escalations, every Monday." on={notif.weekly} onChange={setN("weekly")} last />
        </Card>
        <SaveBar onSave={save} saved={saved} />
      </section>
    </div>
  );
}

export { SettingsView };

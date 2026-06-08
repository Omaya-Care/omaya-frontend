// dash-staff.jsx — Omaya Staff & Roles. Dashboard-style table + add/invite staff + editable roles matrix.
import React from "react";
import { OM, Icons, TK } from "./dash-foundation.jsx";
import { UI } from "./dash-ui.jsx";

const INITIAL_ROLES = [
  { key: "admin", label: "Administrator", desc: "Manages staff, settings & clinic profile", removable: false },
  { key: "physician", label: "Physician", desc: "Reviews alerts, escalations & discharges", removable: false },
  { key: "midwife", label: "Midwife", desc: "Monitors mothers & sends check-ins", removable: false },
  { key: "coordinator", label: "Coordinator", desc: "Handles intake & discharge admin", removable: false },
];

const INITIAL_STAFF = [
  { id: 1, name: "Kwame Boateng", email: "k.boateng@korlebu.gov.gh", role: "admin", status: "active", last: "Just now", you: true },
  { id: 2, name: "Efua Asante", email: "e.asante@korlebu.gov.gh", role: "physician", status: "active", last: "12m ago" },
  { id: 3, name: "Comfort Owusu", email: "c.owusu@korlebu.gov.gh", role: "midwife", status: "active", last: "1h ago" },
  { id: 4, name: "Abena Mensah", email: "a.mensah@korlebu.gov.gh", role: "midwife", status: "active", last: "3h ago" },
  { id: 5, name: "Joseph Adjei", email: "j.adjei@korlebu.gov.gh", role: "coordinator", status: "invited", last: "Invite sent" },
  { id: 6, name: "Grace Darko", email: "g.darko@korlebu.gov.gh", role: "midwife", status: "suspended", last: "8 May" },
];

const INITIAL_PERMS = [
  { label: "View mothers & alerts", roles: { admin: true, physician: true, midwife: true, coordinator: false } },
  { label: "Message mothers", roles: { admin: false, physician: true, midwife: true, coordinator: false } },
  { label: "Escalate & resolve alerts", roles: { admin: false, physician: true, midwife: true, coordinator: false } },
  { label: "Create discharges", roles: { admin: true, physician: true, midwife: true, coordinator: true } },
  { label: "Manage staff & roles", roles: { admin: true, physician: false, midwife: false, coordinator: false } },
];

function initials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

// ---------------- atoms ----------------
function RolePill({ label }) {
  return <span style={{ ...TK.badge, background: "#F3F4F6", color: "#6B7280" }}>{label}</span>;
}
function StatusPill({ status }) {
  const map = {
    active: { bg: "#F0FDF4", fg: "#166534", dot: "#166534", label: "Active" },
    invited: { bg: "#FEF3E2", fg: "#B45309", dot: "#B45309", label: "Invited" },
    suspended: { bg: "#F3F4F6", fg: "#6B7280", dot: "#6B7280", label: "Suspended" },
  };
  const s = map[status];
  return (
    <span style={{ ...TK.badge, background: s.bg, color: s.fg }}>
      <span style={{ ...TK.dot, background: s.dot }} />
      {s.label}
    </span>
  );
}

function Segmented({ value, onChange, items }) {
  return (
    <div style={{ display: "inline-flex", background: "#EEF0F3", borderRadius: 10, padding: 3, gap: 2, flexWrap: "wrap" }}>
      {items.map(([k, label, n]) => {
        const active = value === k;
        return (
          <button key={k} type="button" onClick={() => onChange(k)} style={{
            border: "none", cursor: "pointer", borderRadius: 8, padding: "6px 13px",
            fontFamily: "var(--ui-font)", fontSize: 13, fontWeight: active ? 600 : 500,
            background: active ? OM.surface : "transparent", color: active ? OM.navy : OM.tertiary,
            boxShadow: active ? "0 1px 2px rgba(30,45,66,0.08)" : "none",
            transition: "background .12s, color .12s", whiteSpace: "nowrap",
          }}>
            {label}
            {typeof n === "number" && <span style={{ fontFamily: OM.mono, marginLeft: 6, fontSize: 12, color: active ? OM.tertiary : OM.borderStrong }}>{n}</span>}
          </button>
        );
      })}
    </div>
  );
}

const STAFF_COLS = "minmax(200px,2fr) 150px 124px 104px 40px";
function ColHeaders() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: STAFF_COLS, gap: 16, padding: "12px 20px", borderBottom: TK.rowBorder }}>
      <div style={TK.th}>Name</div>
      <div style={TK.th}>Role</div>
      <div style={TK.th}>Status</div>
      <div style={{ ...TK.th, textAlign: "right" }}>Last active</div>
      <div />
    </div>
  );
}

function StaffRow({ s, role, last, onAction }) {
  const [hover, setHover] = React.useState(false);
  const [menu, setMenu] = React.useState(false);
  const muted = s.status !== "active";
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: "relative", display: "grid", gridTemplateColumns: STAFF_COLS, gap: 16,
      alignItems: "center", padding: "0 20px", height: 64,
      background: hover ? TK.rowHover : OM.surface, borderBottom: last ? "none" : TK.rowBorder,
      transition: "background .1s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, minWidth: 0 }}>
        <div style={{ width: 40, height: 40, borderRadius: 999, flexShrink: 0, background: OM.periBg, color: OM.periText, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, opacity: muted ? 0.7 : 1 }}>{initials(s.name)}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 15.5, fontWeight: 600, color: OM.navy, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</span>
            {s.you && <span style={{ fontSize: 11, fontWeight: 600, color: OM.tertiary, background: "#EEF0F3", borderRadius: 5, padding: "1px 6px" }}>You</span>}
          </div>
          <div style={{ fontFamily: OM.mono, fontSize: 12.5, color: OM.tertiary, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.email}</div>
        </div>
      </div>
      <div><RolePill label={role ? role.label : s.role} /></div>
      <div><StatusPill status={s.status} /></div>
      <div style={{ fontFamily: OM.mono, fontSize: 13, color: OM.tertiary, textAlign: "right", whiteSpace: "nowrap" }}>{s.last}</div>
      <div style={{ position: "relative", display: "flex", justifyContent: "flex-end" }}>
        <button type="button" aria-label="More" onClick={() => setMenu((m) => !m)} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: menu ? "#EEF0F3" : "transparent", color: OM.tertiary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
        </button>
        {menu && (
          <UI.Popover width={180} align="right" top={38} onClose={() => setMenu(false)} onSelect={() => {}} items={[
            { label: "Edit role", icon: "user", onClick: () => onAction("edit", s) },
            { label: s.status === "suspended" ? "Reactivate" : "Suspend", icon: "slashCircle", onClick: () => onAction("suspend", s) },
            { divider: true },
            { label: "Remove", icon: "logout", danger: true, onClick: () => onAction("remove", s) },
          ]} />
        )}
      </div>
    </div>
  );
}

function RolesReference({ roles, perms, onTogglePerm, onAddRole, onRenameRole, onRemoveRole }) {
  const [editing, setEditing] = React.useState(false);
  return (
    <UI.Card padding={0} style={{ overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "16px 20px", borderBottom: TK.rowBorder }}>
        <div>
          <div style={TK.sectionTitle}>Roles &amp; permissions</div>
          <div style={{ fontSize: 13, color: OM.tertiary, marginTop: 3 }}>What each role can do in the portal.</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <button type="button" onClick={() => setEditing((e) => !e)} style={{
            height: 38, padding: "0 14px", borderRadius: 9, border: `1px solid ${editing ? OM.plum : OM.border}`,
            background: editing ? OM.plumTint : OM.surface, color: editing ? OM.plum : OM.navy,
            cursor: "pointer", fontFamily: "var(--ui-font)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap",
          }}>{editing ? "Done" : "Edit"}</button>
          <button type="button" onClick={onAddRole} style={{
            display: "inline-flex", alignItems: "center", gap: 6, height: 38,
            padding: "0 14px 0 11px", borderRadius: 9, border: "none",
            background: OM.plum, color: "#fff", cursor: "pointer",
            fontFamily: "var(--ui-font)", fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap",
          }}><Icons.plus size={16} sw={2.4} />Add role</button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 120 + roles.length * 120 }}>
          <thead>
            <tr>
              <th style={{ ...TK.th, textAlign: "left", padding: "12px 20px", borderBottom: TK.rowBorder, verticalAlign: "bottom" }}>Permission</th>
              {roles.map((r) => (
                <th key={r.key} style={{ ...TK.th, padding: "12px 20px", borderBottom: TK.rowBorder, whiteSpace: "nowrap", verticalAlign: "bottom" }}>
                  {editing ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                      <input value={r.label} onChange={(e) => onRenameRole(r.key, e.target.value)} style={{
                        width: 104, textAlign: "center", height: 32, borderRadius: 8,
                        border: `1px solid ${OM.border}`, background: OM.surface,
                        fontFamily: "var(--ui-font)", fontSize: 12.5, fontWeight: 600, color: OM.navy, outline: "none",
                      }} />
                      {r.removable ? (
                        <button type="button" onClick={() => onRemoveRole(r.key)} style={{ border: "none", background: "transparent", color: "#B42318", cursor: "pointer", fontSize: 11.5, fontWeight: 600 }}>Remove</button>
                      ) : <span style={{ fontSize: 11, color: OM.borderStrong }}>core</span>}
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", fontSize: 12.5, fontWeight: 600, color: OM.slate }}>{r.label}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {perms.map((p, i) => (
              <tr key={i}>
                <td style={{ ...TK.td, padding: "12px 20px", borderBottom: i === perms.length - 1 ? "none" : TK.rowBorder }}>{p.label}</td>
                {roles.map((r) => {
                  const on = !!p.roles[r.key];
                  return (
                    <td key={r.key} style={{ ...TK.td, textAlign: "center", padding: "12px 20px", borderBottom: i === perms.length - 1 ? "none" : TK.rowBorder }}>
                      {editing ? (
                        <button type="button" onClick={() => onTogglePerm(i, r.key)} style={{
                          width: 26, height: 26, borderRadius: 7, cursor: "pointer",
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          border: `1.5px solid ${on ? OM.plum : OM.borderStrong}`,
                          background: on ? OM.plum : OM.surface, color: "#fff", transition: "all .12s",
                        }}>{on && <Icons.check size={15} sw={3} />}</button>
                      ) : on ? (
                        <span style={{ display: "inline-flex", color: "#2E7D55" }}><Icons.circleCheck size={18} sw={2} /></span>
                      ) : (
                        <span style={{ color: OM.border, fontSize: 16 }}>–</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </UI.Card>
  );
}

function AddStaffModal({ roles, onClose, onAdd }) {
  const [mode, setMode] = React.useState("invite");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState("midwife");
  const submit = () => {
    onAdd({ name: name || (mode === "invite" ? "New teammate" : "New staff member"), email: email || "name@korlebu.gov.gh", role, status: mode === "invite" ? "invited" : "active", last: mode === "invite" ? "Invite sent" : "Just added" });
  };
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(30,45,66,0.32)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 470, maxWidth: "100%", background: OM.surface, borderRadius: 16, boxShadow: "0 24px 60px rgba(30,45,66,0.28)", overflow: "hidden" }}>
        <div style={{ padding: "22px 24px 0" }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: OM.navy, letterSpacing: "-0.01em" }}>Add a staff member</div>
          <div style={{ fontSize: 14, color: OM.tertiary, marginTop: 5 }}>Invite them by email, or create the account directly.</div>
        </div>
        <div style={{ padding: "18px 24px 4px" }}>
          <div style={{ display: "inline-flex", background: "#EEF0F3", borderRadius: 10, padding: 3, gap: 2 }}>
            {[["invite", "Invite by email"], ["create", "Create directly"]].map(([k, label]) => {
              const active = mode === k;
              return (
                <button key={k} type="button" onClick={() => setMode(k)} style={{
                  border: "none", cursor: "pointer", borderRadius: 8, padding: "7px 15px",
                  fontFamily: "var(--ui-font)", fontSize: 13, fontWeight: active ? 600 : 500,
                  background: active ? OM.surface : "transparent", color: active ? OM.navy : OM.tertiary,
                  boxShadow: active ? "0 1px 2px rgba(30,45,66,0.08)" : "none",
                }}>{label}</button>
              );
            })}
          </div>
        </div>
        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <UI.Field label="Full name" placeholder="e.g. Abena Mensah" value={name} onChange={(e) => setName(e.target.value)} />
          <UI.Field label="Work email" placeholder="name@korlebu.gov.gh" value={email} onChange={(e) => setEmail(e.target.value)} hint={mode === "invite" ? "They'll get an email to set up their own password." : "You'll set a temporary password they change on first sign-in."} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: OM.navy, marginBottom: 7 }}>Role</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {roles.map((r) => {
                const active = role === r.key;
                return (
                  <button key={r.key} type="button" onClick={() => setRole(r.key)} style={{
                    textAlign: "left", cursor: "pointer", borderRadius: 10, padding: "10px 12px",
                    border: `1.5px solid ${active ? OM.plum : OM.border}`,
                    background: active ? OM.plumTint : OM.surface, transition: "all .12s",
                  }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? OM.plum : OM.navy }}>{r.label}</div>
                    <div style={{ fontSize: 11.5, color: OM.tertiary, marginTop: 2, lineHeight: 1.35 }}>{r.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${OM.borderSoft}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ ...TK.btn.lg, ...TK.btnSecondary, cursor: "pointer" }}>Cancel</button>
          <button type="button" onClick={submit} style={{ ...TK.btn.lg, ...TK.btnPrimary, cursor: "pointer" }}>{mode === "invite" ? "Send invite" : "Create account"}</button>
        </div>
      </div>
    </div>
  );
}

function AddRoleModal({ onClose, onCreate }) {
  const [name, setName] = React.useState("");
  const [desc, setDesc] = React.useState("");
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(30,45,66,0.32)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: 440, maxWidth: "100%", background: OM.surface, borderRadius: 16, boxShadow: "0 24px 60px rgba(30,45,66,0.28)", overflow: "hidden" }}>
        <div style={{ padding: "22px 24px 0" }}>
          <div style={{ fontSize: 19, fontWeight: 600, color: OM.navy, letterSpacing: "-0.01em" }}>Add a role</div>
          <div style={{ fontSize: 14, color: OM.tertiary, marginTop: 5 }}>New roles start with no permissions. Grant them in the matrix.</div>
        </div>
        <div style={{ padding: "18px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          <UI.Field label="Role name" placeholder="e.g. Lactation consultant" value={name} onChange={(e) => setName(e.target.value)} />
          <UI.Field label="Description" placeholder="What this role is responsible for" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div style={{ padding: "16px 24px", borderTop: `1px solid ${OM.borderSoft}`, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" onClick={onClose} style={{ ...TK.btn.lg, ...TK.btnSecondary, cursor: "pointer" }}>Cancel</button>
          <button type="button" onClick={() => onCreate(name.trim() || "New role", desc.trim() || "Custom role")} style={{ ...TK.btn.lg, ...TK.btnPrimary, cursor: "pointer" }}>Create role</button>
        </div>
      </div>
    </div>
  );
}

function StaffView({ w }) {
  const [filter, setFilter] = React.useState("all");
  const [staff, setStaff] = React.useState(INITIAL_STAFF);
  const [roles, setRoles] = React.useState(INITIAL_ROLES);
  const [perms, setPerms] = React.useState(INITIAL_PERMS);
  const [addStaff, setAddStaff] = React.useState(false);
  const [addRole, setAddRole] = React.useState(false);
  const hp = w >= 1280 ? 24 : 20;

  const roleByKey = (k) => roles.find((r) => r.key === k);
  const counts = { all: staff.length };
  roles.forEach((r) => { counts[r.key] = staff.filter((s) => s.role === r.key).length; });
  const rows = filter === "all" ? staff : staff.filter((s) => s.role === filter);

  const onAddStaff = (data) => { setStaff((list) => [...list, { ...data, id: Date.now() }]); setAddStaff(false); };
  const onStaffAction = (action, s) => {
    if (action === "suspend") setStaff((list) => list.map((x) => x.id === s.id ? { ...x, status: x.status === "suspended" ? "active" : "suspended" } : x));
    if (action === "remove") setStaff((list) => list.filter((x) => x.id !== s.id));
  };
  const onTogglePerm = (pi, rk) => setPerms((list) => list.map((p, i) => i === pi ? { ...p, roles: { ...p.roles, [rk]: !p.roles[rk] } } : p));
  const onRenameRole = (k, label) => setRoles((list) => list.map((r) => r.key === k ? { ...r, label } : r));
  const onRemoveRole = (k) => {
    setRoles((list) => list.filter((r) => r.key !== k));
    setPerms((list) => list.map((p) => { const nr = { ...p.roles }; delete nr[k]; return { ...p, roles: nr }; }));
    if (filter === k) setFilter("all");
  };
  const onCreateRole = (label, desc) => {
    const key = "role_" + Date.now();
    setRoles((list) => [...list, { key, label, desc, removable: true }]);
    setPerms((list) => list.map((p) => ({ ...p, roles: { ...p.roles, [key]: false } })));
    setAddRole(false);
  };

  const segItems = [["all", "All", counts.all], ...roles.map((r) => [r.key, r.label + "s", counts[r.key]])];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: `clamp(14px, 2.5vw, 30px) ${hp}px 32px` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 22 }}>
        <div>
          <h1 style={TK.pageTitle}>Staff &amp; roles</h1>
          <p style={{ margin: "9px 0 0", fontSize: 15, color: OM.slate }}>
            <span style={{ fontFamily: OM.mono, fontWeight: 500, color: OM.navy }}>{staff.filter((s) => s.status === "active").length}</span> active
            <span style={{ color: OM.borderStrong, margin: "0 8px" }}>·</span>
            <span style={{ fontFamily: OM.mono, fontWeight: 500, color: OM.tertiary }}>{staff.filter((s) => s.status === "invited").length}</span> invited
          </p>
        </div>
        <button type="button" onClick={() => setAddStaff(true)} style={{ ...TK.btn.lg, ...TK.btnPrimary, display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", whiteSpace: "nowrap" }}>
          <Icons.plus size={18} sw={2.4} />
          Add staff member
        </button>
      </div>
      <div style={{ marginBottom: 14 }}><Segmented value={filter} onChange={setFilter} items={segItems} /></div>
      <UI.Card padding={0} style={{ marginBottom: 28, overflow: "hidden" }}>
        <ColHeaders />
        {rows.length === 0 ? (
          <div style={{ padding: "40px 22px", textAlign: "center", fontSize: 14, color: OM.tertiary }}>No one in this role yet.</div>
        ) : (
          rows.map((s, i) => <StaffRow key={s.id} s={s} role={roleByKey(s.role)} last={i === rows.length - 1} onAction={onStaffAction} />)
        )}
      </UI.Card>
      <RolesReference roles={roles} perms={perms} onTogglePerm={onTogglePerm} onAddRole={() => setAddRole(true)} onRenameRole={onRenameRole} onRemoveRole={onRemoveRole} />
      {addStaff && <AddStaffModal roles={roles} onClose={() => setAddStaff(false)} onAdd={onAddStaff} />}
      {addRole && <AddRoleModal onClose={() => setAddRole(false)} onCreate={onCreateRole} />}
    </div>
  );
}

export { StaffView };

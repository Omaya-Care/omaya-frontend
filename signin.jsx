// signin.jsx — Omaya Hospital Portal sign-in form (reusable, two states)
import React from "react";

const OM = {
  plum: "#7A2850",
  plumHover: "#662344",
  plumPressed: "#43192D",
  plumTint: "#F1E1E9",
  navy: "#1E2D42",
  slate: "#2C3E5C",
  tertiary: "#717D94",
  canvas: "#F7F9FB",
  surface: "#FFFFFF",
  border: "#D0D4DA",
  borderStrong: "#B0B6C2",
  periBg: "#E0E8F3",
  periText: "#24528C",
  focus: "#3879CC",
  errBase: "#D92D20",
  errBg: "#FEF3F2",
  errText: "#B42318",
  errBorder: "#F0A8A2",
};

function OmayaMark({ size = 56 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: 14,
      background: OM.plum,
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 1px 2px rgba(67,25,45,0.18)",
    }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 40 40" fill="none"
        stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 35 C20 27 20 17 20 7" />
        <path d="M20 11 C16.5 8.2 13.2 8.2 10.8 10.4" />
        <path d="M20 11 C23.5 8.2 26.8 8.2 29.2 10.4" />
        <path d="M20 19 C15.2 16 11 16.4 8 19.4" />
        <path d="M20 19 C24.8 16 29 16.4 32 19.4" />
        <path d="M20 27 C14.2 24 9.8 24.8 6.8 28.2" />
        <path d="M20 27 C25.8 24 30.2 24.8 33.2 28.2" />
      </svg>
    </div>
  );
}

function EyeIcon({ off }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
      <path d="M16.681 16.673A8.717 8.717 0 0 1 12 18c-3.6 0-6.6-2-9-6 1.272-2.12 2.712-3.678 4.32-4.674m2.86-1.146A9.055 9.055 0 0 1 12 6c3.6 0 6.6 2 9 6-.666 1.11-1.379 2.067-2.138 2.87" />
      <path d="M3 3l18 18" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 12a2 2 0 1 0 4 0 2 2 0 0 0-4 0" />
      <path d="M21 12c-2.4 4-5.4 6-9 6s-6.6-2-9-6c2.4-4 5.4-6 9-6s6.6 2 9 6" />
    </svg>
  );
}

function AlertCircle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function Field({ label, type, placeholder, value, invalid, trailing, autoComplete }) {
  const [focused, setFocused] = React.useState(false);
  const bg = invalid ? OM.errBg : (focused ? "#FFFFFF" : "#F2F4F7");
  const borderColor = invalid ? OM.errBorder : (focused ? OM.focus : "#E4E7EC");
  const ring = focused
    ? `0 0 0 4px ${invalid ? "rgba(217,45,32,0.12)" : "rgba(56,121,204,0.18)"}`
    : "none";
  return (
    <label style={{ display: "block" }}>
      <span style={{
        display: "block", marginBottom: 7,
        fontSize: 14, lineHeight: "20px", fontWeight: 500, color: OM.navy,
      }}>{label}</span>
      <div style={{
        display: "flex", alignItems: "center",
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 12,
        boxShadow: ring,
        transition: "box-shadow .15s ease, border-color .15s ease, background .15s ease",
        height: 48, paddingLeft: 14, paddingRight: trailing ? 6 : 14,
      }}>
        <input
          type={type}
          defaultValue={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent",
            fontFamily: "var(--ui-font)", fontSize: 16, lineHeight: "24px",
            color: OM.navy, padding: 0,
          }}
        />
        {trailing}
      </div>
    </label>
  );
}

function OmayaSignIn({ state = "default" }) {
  const invalid = state === "error";
  const [showPw, setShowPw] = React.useState(false);
  const [btnHover, setBtnHover] = React.useState(false);
  return (
    <div style={{
      width: "100%", height: "100%", minHeight: "100dvh", boxSizing: "border-box",
      background: "#FFFFFF",
      fontFamily: "var(--ui-font)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "clamp(24px, 6vw, 56px) clamp(20px, 5vw, 32px)",
    }}>
      <div style={{ width: "100%", maxWidth: 384 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
          <span style={{
            fontFamily: "var(--ui-font)", fontSize: 12, lineHeight: "16px",
            fontWeight: 500, letterSpacing: "0.16em", textTransform: "uppercase",
            color: OM.periText, whiteSpace: "nowrap",
          }}>Hospital Portal</span>
          <h1 style={{
            margin: "16px 0 0", fontSize: "clamp(30px, 8vw, 36px)", lineHeight: 1.2, fontWeight: 600,
            letterSpacing: "-0.02em", color: OM.navy, whiteSpace: "nowrap",
          }}>Sign in</h1>
          <p style={{
            margin: "10px 0 0", fontSize: 16, lineHeight: "24px", fontWeight: 400, color: OM.slate, whiteSpace: "nowrap",
          }}>Welcome back.</p>
        </div>
        {invalid && (
          <div role="alert" style={{
            display: "flex", alignItems: "center", gap: 10,
            background: OM.errBg, border: `1px solid ${OM.errBorder}`, borderRadius: 12,
            padding: "11px 14px", marginBottom: 20, color: OM.errText,
          }}>
            <AlertCircle />
            <span style={{ fontSize: 14, lineHeight: "20px", fontWeight: 500 }}>
              Email or password is incorrect. Please try again.
            </span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field
            label="Email"
            type="email"
            placeholder="you@clinic.org"
            value={invalid ? "k.mensah@korlebu.gov.gh" : ""}
            invalid={invalid}
            autoComplete="username"
          />
          <Field
            label="Password"
            type={showPw ? "text" : "password"}
            placeholder="Enter your password"
            value={invalid ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : ""}
            invalid={invalid}
            autoComplete="current-password"
            trailing={
              <button type="button" aria-label={showPw ? "Hide password" : "Show password"}
                onClick={() => setShowPw(v => !v)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 36, height: 36, borderRadius: 6, border: "none",
                  background: "transparent", color: OM.tertiary, cursor: "pointer",
                }}>
                <EyeIcon off={showPw} />
              </button>
            }
          />
          <button type="button"
            onMouseEnter={() => setBtnHover(true)}
            onMouseLeave={() => setBtnHover(false)}
            style={{
              marginTop: 6, height: 48, width: "100%", borderRadius: 12, border: "none",
              background: btnHover ? OM.plumHover : OM.plum, color: "#FFFFFF",
              fontFamily: "var(--ui-font)", fontSize: 16, fontWeight: 600,
              letterSpacing: "0.01em", cursor: "pointer",
              transition: "background .15s ease",
            }}>Sign in</button>
        </div>
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <a href="#" style={{
            fontSize: 14, lineHeight: "20px", fontWeight: 500, color: OM.periText,
            textDecoration: "none",
          }}>Forgot password?</a>
        </div>
      </div>
    </div>
  );
}

export { OmayaSignIn };

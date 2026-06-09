// dash-foundation.jsx — Omaya tokens, severity system, Tabler-style outline icons
// Exposes: window.OM, window.SEV, window.Icons, window.useWindowWidth, window.TK

export const OM = {
  plum: "#93406B",
  plumHover: "#7C3459",
  plumPressed: "#5E2742",
  plumTint: "#F3E5EC",
  navy: "#1E2D42",
  slate: "#2C3E5C",
  tertiary: "#717D94",
  canvas: "#F5F6F8",
  surface: "#FFFFFF",
  sidebarBg: "#FAFAFA",
  navActive: "#93406B",
  navInk: "#3F3F3F",
  navInkHover: "#1A1A1A",
  divider: "#E5E5E5",
  border: "#E6E8EC",
  borderSoft: "#EEF0F3",
  borderStrong: "#C6CAD2",
  periBg: "#E0E8F3",
  periText: "#24528C",
  focus: "#3879CC",
  mono: '"Geist Mono", ui-monospace, monospace',
};

// ---- Shared design tokens (Untitled UI Kit–inspired) ----
export const TK = {
  // Card: shadow-sm only, rounded-xl, subtle border
  card: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #F2F4F7",
    boxShadow: "0 1px 2px 0 rgba(16,24,40,0.06)",
    transition: "box-shadow 0.2s ease",
  },
  cardHover: {
    boxShadow:
      "0 4px 8px -2px rgba(16,24,40,0.1), 0 2px 4px -2px rgba(16,24,40,0.06)",
  },

  // Table
  th: { fontSize: 12, fontWeight: 600, color: "#475467" },
  td: { fontSize: 14, fontWeight: 500, color: "#344054" },
  tdMuted: { fontSize: 14, fontWeight: 400, color: "#667085" },
  rowHover: "#F9FAFB",
  rowBorder: "1px solid #F2F4F7",

  // Typography
  pageTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    letterSpacing: "-0.01em",
    color: "#1D2939",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 600,
    color: "#1D2939",
    letterSpacing: "-0.01em",
  },
  body: { fontSize: 14, fontWeight: 400, color: "#475467" },
  bodySmall: { fontSize: 13, fontWeight: 400, color: "#667085" },

  // Buttons
  btn: {
    sm: {
      height: 36,
      borderRadius: 8,
      padding: "0 14px",
      fontWeight: 600,
      fontSize: 13,
    },
    md: {
      height: 40,
      borderRadius: 8,
      padding: "0 16px",
      fontWeight: 600,
      fontSize: 14,
    },
    lg: {
      height: 44,
      borderRadius: 10,
      padding: "0 20px",
      fontWeight: 600,
      fontSize: 14,
    },
  },
  btnPrimary: { background: OM.plum, color: "#fff", border: "none" },
  btnSecondary: {
    background: "#fff",
    color: "#344054",
    border: "1px solid #D0D5DD",
  },
  btnGhost: { background: "transparent", color: "#344054", border: "none" },

  // Stat card metric values
  statValue: {
    fontSize: 44,
    fontWeight: 600,
    color: "#1D2939",
    letterSpacing: "-0.03em",
    lineHeight: 1,
  },

  // Badge base (soft pill)
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    padding: "2px 10px",
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  dot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },

  // Spacing
  gap: { sm: 8, md: 16, lg: 24, xl: 32 },
  section: { marginBottom: 28 },

  // Meta item labels
  metaLabel: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    color: "#667085",
  },
  metaValue: { fontSize: 14, fontWeight: 500, color: "#1D2939" },

  // Section label (uppercase heading inside cards)
  secLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "#717D94",
    marginBottom: 10,
  },
};
window.TK = TK;

// Severity — clinical meaning ONLY. Triple-coded: tint + icon + label.
// Tuned to a dusty, muted register that harmonises with the plum primary.
export const SEV = {
  L4: {
    key: "L4",
    label: "Crisis",
    base: "#9C3B2C",
    tint: "#9C3B2C",
    onTint: "#FFFFFF",
    solid: true,
    icon: "alertOctagon",
  },
  L3: {
    key: "L3",
    label: "Elevated",
    base: "#AE6845",
    tint: "#F2E8E1",
    onTint: "#693A24",
    solid: false,
    icon: "alertTriangle",
  },
  L2: {
    key: "L2",
    label: "Monitor",
    base: "#B2924F",
    tint: "#F1EDE0",
    onTint: "#5F4C1B",
    solid: false,
    icon: "eye",
  },
  L1: {
    key: "L1",
    label: "Routine",
    base: "#7C9A84",
    tint: "#EAEFEB",
    onTint: "#3C5240",
    solid: false,
    icon: "circleCheck",
  },
};
window.SEV = SEV;

// rank for sort L4 -> L1, inactive last
export const SEV_RANK = { L4: 4, L3: 3, L2: 2, L1: 1 };
window.SEV_RANK = SEV_RANK;

// record states — standard triple-coded treatment
export const MOTHER_STATUS = {
  antenatal: {
    label: "Antenatal",
    bg: "#F2F4F7",
    fg: "#344054",
    dot: "#667085",
    sub: "Dormant",
  },
  postpartum: {
    label: "Active",
    bg: "#ECFDF5",
    fg: "#065F46",
    dot: "#065F46",
    sub: "Postpartum",
  },
  bereavement: {
    label: "Bereavement",
    bg: "#FDF2FA",
    fg: "#C11574",
    dot: "#C11574",
    sub: "Sensitive",
  },
};
window.MOTHER_STATUS = MOTHER_STATUS;

// soft dot-pill palette — calmer cohort register, shared across screens (still triple-coded: label + dot + tint)
export const SEV_SOFT = {
  L4: { bg: "#FDECEA", text: "#C0392B", dot: "#C0392B" },
  L3: { bg: "#FEF3E2", text: "#B45309", dot: "#B45309" },
  L2: { bg: "#EEF2FF", text: "#4338CA", dot: "#4338CA" },
  L1: { bg: "#ECFDF5", text: "#065F46", dot: "#065F46" },
};
window.SEV_SOFT = SEV_SOFT;

// ---- Icons (Tabler-style outline, 24 viewBox, stroke=currentColor) ----
function Svg({ size = 24, sw = 2, children, style }) {
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

export const Icons = {
  search: (p) => (
    <Svg {...p}>
      <circle cx="10" cy="10" r="7" />
      <path d="M21 21l-5.2-5.2" />
    </Svg>
  ),
  plus: (p) => (
    <Svg {...p}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  ),
  chevronRight: (p) => (
    <Svg {...p}>
      <path d="M9 18l6-6-6-6" />
    </Svg>
  ),
  chevronDown: (p) => (
    <Svg {...p}>
      <path d="M6 9l6 6 6-6" />
    </Svg>
  ),
  chevronUp: (p) => (
    <Svg {...p}>
      <path d="M18 15l-6-6-6 6" />
    </Svg>
  ),

  users: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8" />
      <path d="M20.5 20a5.5 5.5 0 0 0-3.5-5.1" />
    </Svg>
  ),
  heart: (p) => (
    <Svg {...p}>
      <path d="M12 20s-7-4.6-7-9.6A3.9 3.9 0 0 1 12 7a3.9 3.9 0 0 1 7 2.8c0 5-7 9.6-7 9.6z" />
    </Svg>
  ),
  clipboard: (p) => (
    <Svg {...p}>
      <rect x="8" y="3" width="8" height="4" rx="1.2" />
      <path d="M16 5h2a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
    </Svg>
  ),
  message: (p) => (
    <Svg {...p}>
      <path d="M21 14a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </Svg>
  ),
  settings: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 13a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  ),
  alertOctagon: (p) => (
    <Svg {...p}>
      <path d="M8.6 3h6.8L21 8.6v6.8L15.4 21H8.6L3 15.4V8.6z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </Svg>
  ),
  alertTriangle: (p) => (
    <Svg {...p}>
      <path d="M12 4.2a1.4 1.4 0 0 1 1.2.7l7 12a1.4 1.4 0 0 1-1.2 2.1H5a1.4 1.4 0 0 1-1.2-2.1l7-12a1.4 1.4 0 0 1 1.2-.7z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </Svg>
  ),
  eye: (p) => (
    <Svg {...p}>
      <path d="M2 12c2.4-4 5.6-6 10-6s7.6 2 10 6c-2.4 4-5.6 6-10 6s-7.6-2-10-6z" />
      <circle cx="12" cy="12" r="2.6" />
    </Svg>
  ),
  circleCheck: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.2l2.3 2.3 4.7-4.7" />
    </Svg>
  ),
  slashCircle: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M5.6 5.6l12.8 12.8" />
    </Svg>
  ),
  logout: (p) => (
    <Svg {...p}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  ),
  bell: (p) => (
    <Svg {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </Svg>
  ),
  selector: (p) => (
    <Svg {...p}>
      <path d="M8 9l4-4 4 4M8 15l4 4 4-4" />
    </Svg>
  ),
  shield: (p) => (
    <Svg {...p}>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9.5 12l1.8 1.8 3.4-3.6" />
    </Svg>
  ),
  panelLeft: (p) => (
    <Svg {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="M9 4v16" />
    </Svg>
  ),
  bellMini: (p) => (
    <Svg {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </Svg>
  ),
  help: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.7-2 2-2 3" />
      <path d="M12 17h.01" />
    </Svg>
  ),
  activity: (p) => (
    <Svg {...p}>
      <path d="M3 12h4l2.5-7 4 14 2.5-7H21" />
    </Svg>
  ),
  home: (p) => (
    <Svg {...p}>
      <path d="M4 11l8-7 8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
    </Svg>
  ),
  phoneCall: (p) => (
    <Svg {...p}>
      <path d="M7 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 5 5a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  compass: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </Svg>
  ),
  userPlus: (p) => (
    <Svg {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M18 8v6M15 11h6" />
    </Svg>
  ),
  user: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </Svg>
  ),
  clock: (p) => (
    <Svg {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l3 2" />
    </Svg>
  ),
  quote: (p) => (
    <Svg {...p}>
      <path d="M9 7H5a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3M19 7h-4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h2v3" />
    </Svg>
  ),
  check: (p) => (
    <Svg {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Svg>
  ),
  arrowRight: (p) => (
    <Svg {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  ),
  phoneIncoming: (p) => (
    <Svg {...p}>
      <path d="M7 3h3l1.5 5-2 1.5a12 12 0 0 0 5 5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A17 17 0 0 1 5 5a2 2 0 0 1 2-2z" />
    </Svg>
  ),
  dots: (p) => (
    <Svg {...p}>
      <circle cx="5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="19" cy="12" r="1.4" />
    </Svg>
  ),
};
window.Icons = Icons;

// ---- Filled icon variants (solid silhouettes) — used for the ACTIVE sidebar item ----
function SvgFilled({ size = 24, children, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
      style={style}
    >
      {children}
    </svg>
  );
}

export const IconsFilled = {
  home: (p) => (
    <SvgFilled {...p}>
      <path d="M11.03 2.6a1.5 1.5 0 0 1 1.94 0l7.5 6.43c.34.29.53.71.53 1.16V19a2 2 0 0 1-2 2h-4v-5.5a3 3 0 0 0-6 0V21H5a2 2 0 0 1-2-2v-8.81c0-.45.19-.87.53-1.16z" />
    </SvgFilled>
  ),
  users: (p) => (
    <SvgFilled {...p}>
      <path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M16.4 13c-.78 0-1.52.16-2.2.45A6.48 6.48 0 0 1 16 17.7c0 .46-.05.9-.15 1.3H21a1.5 1.5 0 0 0 1.5-1.5A4.5 4.5 0 0 0 18 13z" />
      <path d="M9 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M9 13.5c-3.18 0-5.75 2.13-5.75 5.25 0 .69.56 1.25 1.25 1.25h9c.69 0 1.25-.56 1.25-1.25 0-3.12-2.57-5.25-5.75-5.25z" />
    </SvgFilled>
  ),
  phoneCall: (p) => (
    <SvgFilled {...p}>
      <path d="M9 3a1 1 0 0 1 .93.63l2 5a1 1 0 0 1-.28 1.13l-1.67 1.34a10.5 10.5 0 0 0 3.92 3.92l1.34-1.67a1 1 0 0 1 1.13-.28l5 2A1 1 0 0 1 21 16v4a2 2 0 0 1-2 2 17 17 0 0 1-17-17 2 2 0 0 1 2-2z" />
    </SvgFilled>
  ),
  user: (p) => (
    <SvgFilled {...p}>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
      <path d="M12 13.5c-4.07 0-7.5 2.7-7.5 6.25 0 .69.56 1.25 1.25 1.25h12.5c.69 0 1.25-.56 1.25-1.25 0-3.55-3.43-6.25-7.5-6.25z" />
    </SvgFilled>
  ),
  settings: (p) => (
    <SvgFilled {...p}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.65 4.08a.72.72 0 0 0 1.08.45c2.44-1.49 5.23 1.3 3.74 3.74a.72.72 0 0 0 .45 1.08c2.78.67 2.78 4.62 0 5.29a.72.72 0 0 0-.45 1.08c1.49 2.44-1.3 5.23-3.74 3.75a.72.72 0 0 0-1.08.44c-.67 2.78-4.62 2.78-5.29 0a.72.72 0 0 0-1.08-.45c-2.44 1.49-5.23-1.3-3.75-3.74a.72.72 0 0 0-.44-1.08c-2.78-.67-2.78-4.62 0-5.29a.72.72 0 0 0 .45-1.08c-1.49-2.44 1.3-5.23 3.74-3.75a.72.72 0 0 0 1.08-.44c.67-2.78 4.62-2.78 5.29 0zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"
      />
    </SvgFilled>
  ),
  shield: (p) => (
    <SvgFilled {...p}>
      <path d="M11.3 2.18a2 2 0 0 1 1.4 0l6 2.25A2 2 0 0 1 20 6.3V11c0 5.05-3.36 8.4-7.66 9.93a1 2 0 0 1-.68.12 1 1 0 0 1-.68-.12C6.36 19.4 3 16.05 3 11V6.3a2 2 0 0 1 1.3-1.87zM16 9.2a1 1 0 0 0-1.5-1.32l-3.2 3.4-1.3-1.3A1 1 0 1 0 8.6 11.4l2 2a1 1 0 0 0 1.46-.04z" />
    </SvgFilled>
  ),
};
window.IconsFilled = IconsFilled;

export function useWindowWidth() {
  const [w, setW] = React.useState(
    typeof window !== "undefined" ? window.innerWidth : 1280,
  );
  React.useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}
window.useWindowWidth = useWindowWidth;

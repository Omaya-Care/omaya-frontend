// Single source of truth for severity colors. Tailwind classes resolve to the
// `severity` tokens in tailwind.config.js (mirrors docs/AI_CONTEXT.md).
const SEVERITY_TOKENS: Record<
  string,
  { bg: string; fg: string; border: string; dot: string }
> = {
  crisis: {
    bg: "bg-severity-crisis-bg",
    fg: "text-severity-crisis-fg",
    border: "border-severity-crisis-bg",
    dot: "bg-severity-crisis-fg",
  },
  elevated: {
    bg: "bg-severity-elevated-bg",
    fg: "text-severity-elevated-fg",
    border: "border-severity-elevated-bg",
    dot: "bg-severity-elevated-fg",
  },
  monitor: {
    bg: "bg-severity-monitor-bg",
    fg: "text-severity-monitor-fg",
    border: "border-severity-monitor-bg",
    dot: "bg-severity-monitor-fg",
  },
  routine: {
    bg: "bg-severity-routine-bg",
    fg: "text-severity-routine-fg",
    border: "border-severity-routine-bg",
    dot: "bg-severity-routine-fg",
  },
  inactive: {
    bg: "bg-severity-inactive-bg",
    fg: "text-severity-inactive-fg",
    border: "border-severity-inactive-bg",
    dot: "bg-severity-inactive-fg",
  },
};

export function getSeverityTokens(severity: string) {
  return SEVERITY_TOKENS[severity] ?? SEVERITY_TOKENS.inactive;
}

export function getSeverityBadgeClass(severity: string) {
  const t = getSeverityTokens(severity);
  return `${t.bg} ${t.fg} ${t.border}`;
}

// Left-accent border for list rows (e.g. MotherListItem).
export function getSeverityBorderClass(severity: string) {
  const map: Record<string, string> = {
    crisis: "border-l-severity-crisis-fg",
    elevated: "border-l-severity-elevated-fg",
    monitor: "border-l-severity-monitor-fg",
    routine: "border-l-severity-routine-fg",
    inactive: "border-l-severity-inactive-fg",
  };
  return map[severity] ?? "border-l-transparent";
}

export function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      // done → neutral grey
      return "bg-gray-100 text-gray-600 border-gray-100";
    case "in_progress":
      // live now → brand pink (was green)
      return "bg-primary-100 text-primary-700 border-primary-100";
    case "upcoming":
      // scheduled → soft amber (pending), keeps the palette brand-adjacent
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "missed":
      return "bg-red-100 text-red-600 border-red-100";
    default:
      return "bg-gray-100 text-gray-600 border-gray-100";
  }
}

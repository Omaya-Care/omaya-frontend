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

export function getStatusDotClass(status: string): string {
  switch (status) {
    case "completed":   return "bg-gray-400";
    case "in_progress": return "bg-primary";
    case "upcoming":    return "bg-yellow-500";
    case "missed":      return "bg-red-500";
    default:            return "bg-gray-400";
  }
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

// OMA-341 — expert_requests.status is a distinct vocabulary from Call's
// (new/assigned/active/completed/cancelled, not completed/in_progress/
// upcoming/missed), kept as its own named export rather than adding cases
// to getStatusBadgeClass/getStatusDotClass above and risking a collision if
// the two vocabularies ever both need a value the other already claimed.
export function getExpertRequestStatusBadgeClass(status: string): string {
  switch (status) {
    case "new":
      // unclaimed, waiting → soft amber (pending), same token as Call's "upcoming"
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "assigned":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "active":
      // live conversation → brand pink, same token as Call's "in_progress"
      return "bg-primary-100 text-primary-700 border-primary-100";
    case "completed":
      return "bg-gray-100 text-gray-600 border-gray-100";
    case "cancelled":
      return "bg-red-100 text-red-600 border-red-100";
    default:
      return "bg-gray-100 text-gray-600 border-gray-100";
  }
}

export function getExpertRequestStatusLabel(status: string): string {
  switch (status) {
    case "new": return "Unclaimed";
    case "assigned": return "Assigned";
    case "active": return "Active";
    case "completed": return "Completed";
    case "cancelled": return "Cancelled";
    default: return status;
  }
}

// Matches the mother-facing category picker's row titles verbatim
// (whatsapp_reply_engine.py's EXPERT_CATEGORY_ROWS) so a clinician sees the
// same name the mother tapped.
export function getExpertCategoryLabel(category: string): string {
  switch (category) {
    case "psychologist": return "Psychologist";
    case "lactation_consultant": return "Lactation consultant";
    case "postpartum_wellness_expert": return "Postpartum wellness";
    case "other": return "Something else";
    default: return category;
  }
}

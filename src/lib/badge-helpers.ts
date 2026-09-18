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

// The WhatsApp channel badge. Extracted from CallListItem/CallDetail, where
// these exact classes were inlined and duplicated.
export const CHANNEL_BADGE_CLASS = "border-emerald-200 bg-emerald-50 text-emerald-700";

// The "Incoming" badge for a call the mother placed. Deliberately not red
// (reads as `missed`) and not emerald (reads as WhatsApp) — sky is unused
// elsewhere in this palette, so it carries no inherited meaning.
export const DIRECTION_BADGE_CLASS = "border-sky-200 bg-sky-50 text-sky-700";

// Whether to show the "Incoming" badge — ONE rule, deliberately with no
// channel special-case.
//
// An earlier version suppressed the badge for WhatsApp text episodes on the
// grounds that they are inbound by construction, so the badge told the
// clinician nothing. That was true but it desynced the badge from the direction
// FILTER, which kept matching those rows: filtering "Incoming" returned a list
// of WhatsApp conversations that were not visibly incoming. A filter returning
// rows the UI does not mark is the same class of untruth this whole change
// exists to remove, just moved from the label to the filter.
//
// So: badge and filter now answer "is this row incoming?" identically. The
// redundancy on WhatsApp rows is the accepted cost of having exactly one rule
// that cannot drift. The backend's channel-first LABEL rule is unaffected and
// complementary — the label says what KIND of interaction it was, the badge
// says who started it.
export function showsIncomingBadge(direction: "inbound" | "outbound" | undefined): boolean {
  return direction === "inbound";
}

// Direction filter predicate. `direction` is optional on the wire so the UI
// stays correct against a backend that predates it — the `?? "outbound"` is
// load-bearing: without it an "Outgoing" filter against an older backend
// matches NOTHING and reads to a clinician as data loss.
export function matchesDirectionFilter(
  direction: "inbound" | "outbound" | undefined,
  filter: string,
): boolean {
  if (filter === "all") return true;
  return (direction ?? "outbound") === filter;
}

export const SEVERITY_CLASS: Record<string, string> = {
  crisis: "bg-severity-crisis-bg text-severity-crisis-fg",
  elevated: "bg-severity-elevated-bg text-severity-elevated-fg",
  monitor: "bg-severity-monitor-bg text-severity-monitor-fg",
  routine: "bg-severity-routine-bg text-severity-routine-fg",
  inactive: "bg-severity-inactive-bg text-severity-inactive-fg",
};

export function severityClass(severity: string): string {
  return SEVERITY_CLASS[severity] ?? "bg-gray-100 text-gray-500";
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** "some_value" → "Some Value". */
export function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

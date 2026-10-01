import type { AlertRow } from "@/hooks/useAlerts";

export function formatTimeLeft(minutes: number): string {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const span = h > 0 ? `${h}h ${m}m` : `${m}m`;
  return minutes < 0 ? `Overdue by ${span}` : `${span} left`;
}

export function timeLeftClass(minutes: number): string {
  if (minutes < 30) return "text-red-600";
  if (minutes <= 120) return "text-amber-600";
  return "text-gray-500";
}

/** On-call staff were never reached — the portal must tell the clinician. */
export function isUnreached(alert: Pick<AlertRow, "pageStatus">): boolean {
  return alert.pageStatus === "unreached" || alert.pageStatus === "blocked";
}

/** "Last updated 3:42 pm" for the live-alerts feed — or that nothing has
 *  loaded yet this session. */
export function lastUpdatedLabel(lastSuccessAt: number | null): string {
  if (lastSuccessAt === null) return "Not loaded yet";
  const t = new Date(lastSuccessAt).toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true });
  return `Last updated ${t}`;
}

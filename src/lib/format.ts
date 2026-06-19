/**
 * Format a response time in minutes to a compact "Xh Ym" string.
 * Returns "No data" when the value is null (no measurements yet).
 */
export function formatResponseMinutes(value: number | null | undefined): string {
  if (value == null) return "—";
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/**
 * Format a date string to Ghana locale DD/MM/YYYY.
 * Accepts ISO-8601 strings from the API or pass-through for pre-formatted values.
 */
export function formatDate(value: string): string {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;

  const d = new Date(value);
  if (isNaN(d.getTime())) return value;

  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format an ISO datetime to a compact Ghana-locale (UTC) "DD Mon, HH:MM",
 * e.g. "20 Jun, 09:00". Used for scheduled call times.
 */
export function formatDateTime(value: string): string {
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = MONTHS_SHORT[d.getUTCMonth()];
  const ampm = d.getUTCHours() >= 12 ? "PM" : "AM";
  const h12 = d.getUTCHours() % 12 || 12;
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month}, ${h12}:${mm} ${ampm}`;
}

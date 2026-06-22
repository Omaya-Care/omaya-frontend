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

/**
 * Format an E.164 phone number for display.
 * +233XXXXXXXXX → +233 XX XXX XXXX
 * 0XXXXXXXXX   → 0XX XXX XXXX
 * Anything else is returned as-is.
 */
export function formatPhone(value: string): string {
  if (!value) return value;
  const digits = value.replace(/\D/g, "");
  if (value.startsWith("+233") && digits.length === 12) {
    const n = digits.slice(3); // 9 digits after 233
    return `+233 ${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5)}`;
  }
  if (value.startsWith("0") && digits.length === 10) {
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  }
  return value;
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

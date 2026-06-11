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

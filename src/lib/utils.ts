import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Minutes → "1h 5m" / "45m" / "2h"; "—" when there's no data. */
export function formatResponseMinutes(value: number | null | undefined): string {
  if (value == null) return "—";
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

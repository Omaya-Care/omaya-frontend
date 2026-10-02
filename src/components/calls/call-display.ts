export const CHANNEL_LABEL: Record<string, string> = {
  voice: "Phone call",
  whatsapp_call: "WhatsApp call",
  whatsapp: "WhatsApp chat",
};

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

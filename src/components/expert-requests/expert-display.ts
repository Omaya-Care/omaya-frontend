// Display helpers for expert requests (OMA-341).

const STATUS_CLASS: Record<string, string> = {
  new: "bg-amber-50 text-amber-700",
  assigned: "bg-blue-50 text-blue-700",
  active: "bg-[#F7E8F0] text-[#7A2850]",
  completed: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-400",
};

const STATUS_LABEL: Record<string, string> = {
  new: "Unclaimed",
  assigned: "Assigned",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

// Matches the mother-facing category picker's row titles verbatim
// (whatsapp_reply_engine.py's EXPERT_CATEGORY_ROWS).
const CATEGORY_LABEL: Record<string, string> = {
  psychologist: "Psychologist",
  lactation_consultant: "Lactation consultant",
  postpartum_wellness_expert: "Postpartum wellness",
  other: "Something else",
};

export const RATING_LABEL: Record<string, string> = {
  good: "Good",
  okay: "Okay",
  not_helpful: "Not helpful",
};

export function expertStatusClass(status: string): string {
  return STATUS_CLASS[status] ?? "bg-gray-100 text-gray-500";
}

export function expertStatusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function expertCategoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}

export type ExpertTab = "queue" | "mine";

/** Deep link into /expert-requests — opens `tab`, and `requestId` within it. */
export function expertRequestLink(tab: ExpertTab, requestId?: string): string {
  const params = new URLSearchParams({ tab });
  if (requestId) params.set("request", requestId);
  return `/expert-requests?${params.toString()}`;
}

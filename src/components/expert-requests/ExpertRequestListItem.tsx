import { formatDateTime } from "@/lib/format";
import type { ExpertRequestItem, MyExpertRequestItem } from "@/hooks/useExpertRequests";
import { expertCategoryLabel, expertStatusClass, expertStatusLabel } from "./expert-display";

function hasThreadPreview(item: ExpertRequestItem | MyExpertRequestItem): item is MyExpertRequestItem {
  return "messageCount" in item;
}

/** One row of the expert queue / "mine" list. Shared by /expert-requests and
 *  the expert dashboard. */
export function ExpertRequestListItem({
  item,
  selected = false,
  onSelect,
}: {
  item: ExpertRequestItem | MyExpertRequestItem;
  selected?: boolean;
  onSelect: (id: string) => void;
}) {
  const category = expertCategoryLabel(item.category);
  const preview = hasThreadPreview(item) ? (item.lastMessage?.textBody ?? item.questionText) : item.questionText;

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(item.id)}
        aria-current={selected || undefined}
        aria-label={`View ${category} request`}
        className={`flex w-full min-w-0 items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
          selected ? "bg-[#F7E8F0]" : "hover:bg-black/[0.04]"
        }`}
      >
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7A2850]/10 text-xs text-[#7A2850]"
        >
          {category.charAt(0)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-900">{category}</span>
            {item.urgent && (
              <span className="shrink-0 rounded-full bg-red-50 px-2 py-px text-[11px] font-medium text-red-600">
                Urgent
              </span>
            )}
            <span
              className={`ml-auto shrink-0 rounded-full px-2 py-px text-[11px] font-medium ${expertStatusClass(item.status)}`}
            >
              {expertStatusLabel(item.status)}
            </span>
          </span>
          <span className="truncate text-xs text-gray-500">{preview}</span>
          <span className="truncate text-xs text-gray-400">
            {formatDateTime(item.requestedAt)}
            {hasThreadPreview(item) && item.messageCount > 0 && (
              <> · {item.messageCount} message{item.messageCount === 1 ? "" : "s"}</>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}

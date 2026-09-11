import { Clock } from "lucide-react";
import { ExpertRequestItem, MyExpertRequestItem } from "../../types";
import { Badge } from "../ui/Badge";
import {
  getExpertCategoryLabel,
  getExpertRequestStatusBadgeClass,
  getExpertRequestStatusLabel,
} from "../../lib/badge-helpers";
import { formatDateTime } from "../../lib/format";

interface ExpertRequestListItemProps {
  item: ExpertRequestItem | MyExpertRequestItem;
  isSelected: boolean;
  onClick: () => void;
}

function hasThreadPreview(
  item: ExpertRequestItem | MyExpertRequestItem,
): item is MyExpertRequestItem {
  return "messageCount" in item;
}

const ExpertRequestListItem = ({ item, isSelected, onClick }: ExpertRequestListItemProps) => {
  const preview = hasThreadPreview(item)
    ? item.lastMessage?.textBody ?? item.questionText
    : item.questionText;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`View ${getExpertCategoryLabel(item.category)} request`}
      data-slide-active={isSelected ? "true" : undefined}
      className={`
        relative z-10 w-full px-4 py-3 text-left transition-[background-color,transform] duration-200 ease-out
        ${isSelected ? "" : "hover:bg-gray-50 hover:translate-x-0.5"}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary">
          {getExpertCategoryLabel(item.category).charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center gap-2">
            <span className="block text-sm font-medium text-gray-900 truncate">
              {getExpertCategoryLabel(item.category)}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.urgent && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200" size="sm">
                  Urgent
                </Badge>
              )}
              {hasThreadPreview(item) && item.messageCount > 0 && (
                <span className="text-[11px] text-gray-400 font-normal">
                  {item.messageCount}
                </span>
              )}
              <Badge
                variant="outline"
                className={getExpertRequestStatusBadgeClass(item.status)}
                size="sm"
                dot
              >
                {getExpertRequestStatusLabel(item.status)}
              </Badge>
            </div>
          </div>

          <p className="mt-1 text-xs text-gray-500 font-normal truncate">{preview}</p>

          <div className="mt-1 flex items-center gap-1.5">
            <Clock size={11} className="text-gray-400 shrink-0" />
            <span className="text-xs text-gray-400 font-normal truncate">
              {formatDateTime(item.requestedAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

export { ExpertRequestListItem };

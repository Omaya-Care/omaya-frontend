import { Clock } from "lucide-react";
import { Call } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusBadgeClass } from "../../lib/badge-helpers";
import { formatDateTime } from "../../lib/format";

interface CallListItemProps {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
}

const statusLabel: Record<string, string> = {
  completed:   "Completed",
  in_progress: "In progress",
  upcoming:    "Upcoming",
  missed:      "Missed",
};

const CallListItem = ({ call, isSelected, onClick }: CallListItemProps) => {
  const label = statusLabel[call.status] ?? call.status;
  const initials = call.motherName?.charAt(0) ?? "?";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full px-4 py-3 text-left transition-colors border-l-4
        ${isSelected ? "border-l-primary bg-gray-50" : "border-l-transparent hover:bg-gray-50"}
      `}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-900 truncate">
            {call.motherName}
          </span>
        </div>
        <Badge
          variant="outline"
          className={getStatusBadgeClass(call.status)}
          size="sm"
          dot
        >
          {label}
        </Badge>
      </div>

      <div className="pl-11 mt-1.5 flex items-center gap-1.5">
        <Clock size={11} className="text-gray-400 shrink-0" />
        <span className="text-xs text-gray-500 font-normal truncate">
          {call.callType} · {formatDateTime(call.scheduledAt)}
        </span>
      </div>
    </button>
  );
};

export { CallListItem };

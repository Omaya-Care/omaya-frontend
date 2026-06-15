import { format, parseISO, isToday } from "date-fns";
import { Call } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusBadgeClass } from "../../lib/badge-helpers";
import { TableRow, TableCell } from "../ui/table";

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

function formatScheduled(iso: string): string {
  try {
    const d = parseISO(iso);
    return isToday(d) ? format(d, "h:mm a") : format(d, "d MMM · h:mm a");
  } catch {
    return iso;
  }
}

const CallListItem = ({ call, isSelected, onClick }: CallListItemProps) => {
  const label = statusLabel[call.status] ?? call.status;

  return (
    <TableRow className={`transition-colors ${isSelected ? "bg-[#F7E8F0]" : "hover:bg-gray-50"}`}>
      <TableCell
        onClick={onClick}
        className={`py-3.5 pl-4 border-l-2 cursor-pointer ${isSelected ? "border-[#93406B]" : "border-transparent"}`}
      >
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">{call.motherName}</span>
          <span className="text-xs text-gray-400 font-normal">
            {call.callType} · {formatScheduled(call.scheduledAt)}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3.5 pr-4">
        <Badge variant="outline" className={getStatusBadgeClass(call.status)} size="sm" dot>
          {label}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export { CallListItem };

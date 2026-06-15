import { Call, CallStatus } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusBadgeClass } from "../../lib/badge-helpers";
import { TableRow, TableCell } from "../ui/table";

interface CallListItemProps {
  call: Call;
  isSelected: boolean;
  onClick: () => void;
  onViewDetails?: () => void;
  onMarkCompleted?: () => void;
  onReschedule?: () => void;
}

const statusLabel: Record<CallStatus, string> = {
  completed: "Completed",
  in_progress: "In progress",
  upcoming: "Upcoming",
  missed: "Missed",
};

const CallListItem = ({
  call,
  isSelected,
  onClick,
  onViewDetails,
  onMarkCompleted,
  onReschedule,
}: CallListItemProps) => {
  const label = statusLabel[call.status];

  // Map fields from API (handling potential snake_case from backend)
  const motherName =
    call.motherName || (call as any).mother_name || "Unknown Mother";
  const time =
    call.time || (call as any).time || (call as any).scheduled_at || "--:--";
  const callType = call.callType || (call as any).call_type || "Check-in";

  return (
    <TableRow
      className={`
        transition-colors
        ${isSelected ? "bg-[#F7E8F0]" : "hover:bg-gray-50"}
      `}
    >
      <TableCell
        onClick={onClick}
        className={`py-3.5 pl-4 border-l-2 cursor-pointer ${isSelected ? "border-[#93406B]" : "border-transparent"}`}
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {motherName}
          </span>
          <span className="text-xs text-gray-400 mt-0.5 font-normal">
            {callType} · {time}
          </span>
        </div>
      </TableCell>
      <TableCell className="py-3.5 pr-4">
        <div className="flex items-center justify-end gap-2">
          <Badge
            variant="outline"
            className={getStatusBadgeClass(call.status)}
            size="sm"
          >
            {label}
          </Badge>
        </div>
      </TableCell>
    </TableRow>
  );
};

export { CallListItem };

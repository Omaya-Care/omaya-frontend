import { Call } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusBadgeClass } from "../../lib/badge-helpers";
import { TableRow, TableCell } from "../ui/table";

interface CallRowProps {
  call: Call;
  onViewDetails?: () => void;
  onMarkCompleted?: () => void;
  onReschedule?: () => void;
}

const statusLabel: Record<string, string> = {
  completed: "Completed",
  in_progress: "In progress",
  upcoming: "Upcoming",
  missed: "Missed",
};

const CallRow = ({
  call,
  onViewDetails,
  onMarkCompleted,
  onReschedule,
}: CallRowProps) => {
  console.log("CallRow data:", call);
  const label = statusLabel[call.status] ?? call.status;

  // Map fields from API (handling potential snake_case from backend)
  const motherName =
    call.motherName || (call as any).mother_name || "Unknown Mother";
  const time =
    call.time || (call as any).time || (call as any).scheduled_at || "--:--";
  const callType = call.callType || (call as any).call_type || "Check-in";

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <TableCell className="py-3 text-sm text-gray-900 truncate">
        {motherName}
      </TableCell>
      <TableCell className="py-3 text-xs md:text-sm text-gray-700">
        {time}
      </TableCell>
      <TableCell className="py-3 text-sm text-gray-500 hidden md:table-cell">
        {callType}
      </TableCell>
      <TableCell className="py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <Badge
            variant="outline"
            className={getStatusBadgeClass(call.status)}
            size="sm"
            dot
          >
            {label}
          </Badge>
        </div>
      </TableCell>
    </TableRow>
  );
};

export { CallRow };

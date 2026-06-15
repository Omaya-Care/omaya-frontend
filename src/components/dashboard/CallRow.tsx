import { Call } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusBadgeClass } from "../../lib/badge-helpers";
import { TableRow, TableCell } from "../ui/table";

interface CallRowProps {
  call: Call;
}

const statusLabel: Record<string, string> = {
  completed: "Completed",
  in_progress: "In progress",
  upcoming: "Upcoming",
  missed: "Missed",
};

const CallRow = ({ call }: CallRowProps) => {
  const label = statusLabel[call.status] ?? call.status;

  return (
    <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <TableCell className="py-3 text-sm text-gray-900 truncate">
        {call.motherName}
      </TableCell>
      <TableCell className="py-3 text-xs md:text-sm text-gray-700">
        {call.time}
      </TableCell>
      <TableCell className="py-3 text-sm text-gray-500 hidden md:table-cell">
        {call.callType}
      </TableCell>
      <TableCell className="py-3 text-right">
        <Badge variant="outline" className={getStatusBadgeClass(call.status)} size="sm" dot>
          {label}
        </Badge>
      </TableCell>
    </TableRow>
  );
};

export { CallRow };

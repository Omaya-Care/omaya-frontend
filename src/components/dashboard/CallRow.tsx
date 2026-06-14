import { Call } from "../../types";
import { Badge } from "../ui/Badge";
import { getStatusBadgeClass } from "../../lib/badge-helpers";

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
    <div className="flex items-center w-full border-b border-gray-50 last:border-0 py-2.5 md:py-3">
      {/* MOTHER COLUMN */}
      <div className="flex-1 min-w-0 text-sm font-normal text-gray-900 truncate">
        {call.motherName}
      </div>

      {/* TIME COLUMN */}
      <div className="w-20 md:w-28 text-xs md:text-sm font-normal text-gray-700">{call.time}</div>

      {/* CALL TYPE COLUMN — hidden on mobile */}
      <div className="hidden md:block flex-1 text-sm font-normal text-gray-500">
        {call.callType}
      </div>

      {/* STATUS COLUMN */}
      <div className="w-32 md:w-40 flex justify-end">
        <Badge variant="outline" className={getStatusBadgeClass(call.status)} size="sm" dot>
          {label}
        </Badge>
      </div>
    </div>
  );
};

export { CallRow };

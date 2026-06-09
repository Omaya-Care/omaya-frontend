import React from "react";
import { Call } from "../../types";

interface CallRowProps {
  call: Call;
}

const CallRow = ({ call }: CallRowProps) => {
  const getStatusStyles = (status: Call["status"]) => {
    switch (status) {
      case "completed":
        return {
          label: "Completed",
          dot: "bg-gray-600",
          container: "bg-gray-100 text-gray-600",
        };
      case "in_progress":
        return {
          label: "In progress",
          dot: "bg-[#16A34A]",
          container: "bg-[#DCFCE7] text-[#16A34A]",
        };
      case "upcoming":
        return {
          label: "Upcoming",
          dot: "bg-blue-600",
          container: "bg-blue-50 text-blue-600",
        };
      case "missed":
        return {
          label: "Missed",
          dot: "bg-[#DC2626]",
          container: "bg-[#FEE2E2] text-[#DC2626]",
        };
      default:
        return {
          label: status,
          dot: "bg-gray-400",
          container: "bg-gray-100 text-gray-600",
        };
    }
  };

  const statusStyle = getStatusStyles(call.status);

  return (
    <div className="flex items-center w-full border-b border-gray-100 py-4">
      {/* MOTHER COLUMN */}
      <div className="flex-1 text-sm font-normal text-gray-900">
        {call.motherName}
      </div>

      {/* TIME COLUMN */}
      <div className="w-28 text-sm font-normal text-gray-700">{call.time}</div>

      {/* CALL TYPE COLUMN */}
      <div className="flex-1 text-sm font-normal text-gray-500">
        {call.callType}
      </div>

      {/* STATUS COLUMN */}
      <div className="w-40 flex justify-end">
        <div
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.container}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full mr-1.5 ${statusStyle.dot}`}
          />
          {statusStyle.label}
        </div>
      </div>
    </div>
  );
};

export { CallRow };

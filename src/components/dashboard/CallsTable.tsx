import React, { useState } from "react";
import { CallItem } from "../../types";
import { CallRow } from "./CallRow";
import { Pagination } from "../ui/Pagination";

interface CallsTableProps {
  calls: CallItem[];
}

export const CallsTable: React.FC<CallsTableProps> = ({ calls }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(calls.length / pageSize));

  // Guard against page out of bounds
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = calls.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Column headers */}
          <div className="grid grid-cols-[1fr_112px_1fr_160px] text-xs font-medium text-gray-400 tracking-wide uppercase border-b border-gray-100 pb-2">
            <div>Mother</div>
            <div>Time</div>
            <div>Call Type</div>
            <div className="text-right">Status</div>
          </div>

          <div className="flex flex-col">
            {paginatedData.map((call) => (
              <CallRow key={call.id} call={call} />
            ))}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center text-gray-400 text-sm py-12">
                No calls scheduled for today.
              </div>
            )}
          </div>
        </div>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        totalItems={calls.length}
      />
    </div>
  );
};

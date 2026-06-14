import React, { useState } from "react";
import { EscalationItem } from "../../types";
import { AcknowledgeRow } from "./AcknowledgeRow";
import { Pagination } from "../ui/Pagination";

interface AlertsTableProps {
  escalations: EscalationItem[];
  onAcknowledgeClick: (item: EscalationItem) => void;
}

export const AlertsTable: React.FC<AlertsTableProps> = ({
  escalations,
  onAcknowledgeClick,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(escalations.length / pageSize));

  // Guard against page out of bounds after filtered/changed data
  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = escalations.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="w-full flex-1 flex flex-col">
      <div className="flex-1 overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Column headers row */}
          <div className="grid grid-cols-[1fr_192px_1fr_144px] text-xs font-medium text-gray-400 tracking-wide uppercase border-b border-gray-100 pb-2">
            <div>Mother</div>
            <div>Severity</div>
            <div>Time Left</div>
            <div className="text-right">Action</div>
          </div>

          <div className="flex flex-col">
            {paginatedData.map((item) => (
              <AcknowledgeRow
                key={item.id}
                item={item}
                onAcknowledge={() => onAcknowledgeClick(item)}
              />
            ))}
            {paginatedData.length === 0 && (
              <div className="flex items-center justify-center text-gray-400 text-sm py-12">
                No urgent alerts at this time.
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
        totalItems={escalations.length}
      />
    </div>
  );
};

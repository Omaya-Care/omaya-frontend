import React, { useState } from "react";
import { EscalationItem } from "../../types";
import { AcknowledgeRow } from "./AcknowledgeRow";
import { Pagination } from "../ui/Pagination";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";

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
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide">Mother</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide">Severity</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide">Time Left</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 text-sm py-12">
                  No urgent alerts at this time.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((item) => (
                <AcknowledgeRow
                  key={item.id}
                  item={item}
                  onAcknowledge={() => onAcknowledgeClick(item)}
                />
              ))
            )}
          </TableBody>
        </Table>
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

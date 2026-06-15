import React, { useState } from "react";
import { Call } from "../../types";
import { CallRow } from "./CallRow";
import { Pagination } from "../ui/Pagination";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";

interface CallsTableProps {
  calls: Call[];
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
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-100">
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide">Mother</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide">Time</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide hidden md:table-cell">Call Type</TableHead>
              <TableHead className="text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-400 text-sm py-12">
                  No calls scheduled for today.
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((call) => (
                <CallRow key={call.id} call={call} />
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
        totalItems={calls.length}
      />
    </div>
  );
};

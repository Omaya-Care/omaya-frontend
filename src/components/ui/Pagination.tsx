import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  totalItems,
}) => {
  if (totalItems === 0) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  // Helper to generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const showNav = totalPages > 1;

  return (
    <div className="flex items-center justify-between pt-3 pb-0 mt-0 border-t border-gray-100">
      {/* LEFT: Rows per page */}
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">Rows per page:</span>
            <div className="relative inline-flex items-center">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="appearance-none bg-transparent text-xs font-semibold text-gray-700 pr-4 focus:outline-none cursor-pointer hover:text-[#4A2545] transition-colors"
              >
                {[10, 25, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 pointer-events-none">
                <svg className="w-2.5 h-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Row range + Navigation */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-gray-400 tabular-nums">
          {firstItem}–{lastItem} of {totalItems}
        </span>

        {showNav && (
          <div className="flex items-center gap-2">
            {/* Previous */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 text-gray-400 hover:text-[#4A2545] disabled:opacity-20 transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Numbers */}
            <div className="flex items-center gap-1.5">
              {getPageNumbers().map((p, idx) => {
                if (p === '...') {
                  return (
                    <span key={`ellipsis-${idx}`} className="text-xs text-gray-300">...</span>
                  );
                }
                const isActive = p === currentPage;
                return (
                  <button
                    key={`page-${p}`}
                    onClick={() => onPageChange(p as number)}
                    className={`
                      text-xs transition-all px-0.5
                      ${isActive ? "font-bold text-gray-900" : "text-gray-400 hover:text-[#4A2545]"}
                    `}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 text-gray-400 hover:text-[#4A2545] disabled:opacity-20 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

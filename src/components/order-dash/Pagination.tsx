import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  limit,
  setLimit,
}) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Smart truncation logic for large numbers of pages
  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      // If 7 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // If near the beginning
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      }
      // If near the end
      else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      }
      // If in the middle
      else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between">
      <div className="grid grid-cols-3 gap-2">
        {[10, 50, 100].map((preset) => {
          const isSelected = limit === preset;
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setLimit(preset)}
              className={`py-1.5 px-2 text-center rounded-lg border text-xs font-bold transition-all ${
                isSelected
                  ? "border-[#F5891E] bg-[#FFF7ED] text-[#F5891E] shadow-sm"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
              }`}
            >
              {preset}
            </button>
          );
        })}
      </div>
      <div className="flex justify-center items-center mt-10 mb-8 gap-3">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 font-semibold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="text-slate-400 px-1 font-bold tracking-widest"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = currentPage === page;

            return (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page as number)}
                className={`flex justify-center items-center w-10 h-10 rounded-full text-sm transition-all duration-200 ${
                  isCurrent
                    ? "bg-linear-to-r from-[#F5891E] to-[#FF6B35] text-white font-bold shadow-md shadow-orange-500/30 border-transparent"
                    : "bg-white border border-slate-200 text-slate-600 font-semibold shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 font-semibold text-sm shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

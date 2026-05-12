import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
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
    // Changed to justify-content-center and added gap-3
    <div className="d-flex justify-content-center align-items-center mt-5 mb-4 gap-3">
      {/* Previous Button */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="btn btn-light d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm border-0"
        style={{
          opacity: currentPage === 1 ? 0.6 : 1,
          transition: "all 0.2s ease-in-out",
        }}
      >
        <ChevronLeft size={18} />
        {/* Hides text on tiny mobile screens, shows on small+ */}
        <span className="d-none d-sm-inline fw-medium">Prev</span>
      </button>

      {/* Page Numbers */}
      <div className="d-flex align-items-center gap-2">
        {getPageNumbers().map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="text-secondary px-1 fw-bold"
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
              className={`btn d-flex justify-content-center align-items-center rounded-circle border-0 ${
                isCurrent
                  ? "btn-primary shadow"
                  : "btn-light shadow-sm text-secondary hover-bg-light"
              }`}
              style={{
                width: "40px",
                height: "40px",
                fontWeight: isCurrent ? "600" : "500",
                transition: "all 0.2s ease-in-out",
              }}
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
        className="btn btn-light d-flex align-items-center gap-1 rounded-pill px-3 shadow-sm border-0"
        style={{
          opacity: currentPage === totalPages ? 0.6 : 1,
          transition: "all 0.2s ease-in-out",
        }}
      >
        <span className="d-none d-sm-inline fw-medium">Next</span>
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;

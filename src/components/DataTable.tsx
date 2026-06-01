import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TableColumn<T> {
  name?: string; // Used for the table headers
  selector?: (row: T) => any;
  cell?: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

interface CustomDataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  totalRecords: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  isLoading?: boolean;
  selectableRows?: boolean;
  selectedIds?: string[];
  keyField?: keyof T;
  onSelectAll?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne?: (id: string) => void;
}

export default function CustomDataTable<T>({
  columns,
  data,
  totalRecords,
  page,
  limit,
  setPage,
  setLimit,
  isLoading = false,
  selectableRows = false,
  selectedIds = [],
  keyField = "id" as keyof T,
  onSelectAll,
  onSelectOne,
}: CustomDataTableProps<T>) {
  const totalPages = Math.ceil(totalRecords / limit);
  const isAllSelected = selectedIds.length === data.length && data.length > 0;

  // Improved Pagination Logic
  const renderPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    // Determine which numbers to show
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
        pageNumbers.push(i);
      }
    }

    // Insert ellipses where there are gaps
    const withEllipses: (number | string)[] = [];
    let prev: number | null = null;

    for (const p of pageNumbers) {
      if (typeof p === "number") {
        if (prev !== null && p - prev > 1) {
          withEllipses.push("...");
        }
        withEllipses.push(p);
        prev = p;
      }
    }

    return withEllipses.map((p, idx) => {
      if (p === "...") {
        return (
          <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        );
      }

      const pageNum = p as number;
      return (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`w-12 h-12 flex items-center justify-center rounded-full text-md font-medium transition-all duration-200 ${
            page === pageNum
              ? "bg-[#F5891E] text-white shadow-md ring-2 ring-[#F5891E]/30"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
          }`}
        >
          {pageNum}
        </button>
      );
    });
  };

  return (
    <div className="flex flex-col w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {selectableRows && (
                <th className="py-4 px-4 w-12 text-center align-middle">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#F5891E] focus:ring-[#F5891E] cursor-pointer transition-colors"
                    checked={isAllSelected}
                    onChange={onSelectAll}
                  />
                </th>
              )}
              {columns.map((col, colIdx) => (
                <th
                  key={colIdx}
                  style={{ width: col.width }}
                  className={`py-4 px-4 text-lg font-semibold tracking-wider text-gray-500 uppercase ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                      ? "text-right"
                      : "text-left"
                  }`}
                >
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 text-md text-gray-700">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectableRows ? 1 : 0)}
                  className="p-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <span className="animate-pulse">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectableRows ? 1 : 0)}
                  className="p-12 text-center text-gray-400"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => {
                const rowId = String(row[keyField] || rowIdx);
                const isChecked = selectedIds.includes(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`group bg-white hover:bg-gray-50/80 transition-colors duration-150 ${
                      isChecked ? "bg-orange-50/30" : ""
                    }`}
                  >
                    {selectableRows && (
                      <td className="py-4 px-4 w-12 align-middle text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[#F5891E] focus:ring-[#F5891E] cursor-pointer transition-colors"
                          checked={isChecked}
                          onChange={() => onSelectOne && onSelectOne(rowId)}
                        />
                      </td>
                    )}

                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={`py-4 px-4 align-middle ${
                          col.align === "center"
                            ? "text-center"
                            : col.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {col.cell
                          ? col.cell(row)
                          : col.selector
                          ? col.selector(row)
                          : null}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Container */}
      <div className="py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border-t border-gray-200">
        {/* Limit Selection Controls */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-gray-500">
            Rows per page:
          </span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Safely push layout indexes back to head frame
            }}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] cursor-pointer transition-all"
          >
            {[10, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Page Navigators */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              <ChevronLeft size={16} className="mr-1.5" /> Prev
            </button>

            <div className="flex items-center gap-1 mx-2">
              {renderPageNumbers()}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="flex items-center px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
            >
              Next <ChevronRight size={16} className="ml-1.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

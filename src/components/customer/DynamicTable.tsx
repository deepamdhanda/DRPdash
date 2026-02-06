"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";
import { customerAxios } from "../../axios/customerAxios";

// --- Types ---
interface DynamicTableProps {
  url: string;
  enableSearch?: boolean;
  rowsPerPage?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data: T[];
  total: number;
}

// --- Helper: Tries to find a readable string from an object ---
const getPreviewString = (item: any): string => {
  if (typeof item !== "object" || item === null) return String(item);
  // Priority keys to display in the preview
  const priorityKeys = [
    "name",
    "title",
    "label",
    "status",
    "email",
    "id",
    "description",
  ];
  for (const key of priorityKeys) {
    if (item[key]) return String(item[key]);
  }
  // Fallback: return the first value found
  return Object.values(item)[0] ? String(Object.values(item)[0]) : "Object";
};

// --- Sub-Component: Data Modal (The Popup) ---
const DataModal = ({
  data,
  title,
  onClose,
}: {
  data: any;
  title: string;
  onClose: () => void;
}) => {
  // Normalize data to always be an array for the table
  const list = Array.isArray(data) ? data : [data];
  const columns =
    list.length > 0 && typeof list[0] === "object"
      ? Object.keys(list[0])
      : ["Value"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-semibold text-lg text-gray-800 capitalize">
            {title} Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-auto p-4">
          <table className="w-full text-sm text-left border rounded-md">
            <thead className="bg-gray-50 text-gray-500 uppercase font-medium">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 border-b">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map((item, idx) => (
                <tr key={idx}>
                  {columns.map((col) => {
                    const val = typeof item === "object" ? item[col] : item;
                    return (
                      <td key={col} className="px-4 py-2 text-gray-700">
                        {typeof val === "object"
                          ? JSON.stringify(val)
                          : String(val)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Sub-Component: Smart Cell Renderer ---
const DataCell = ({
  data,
  columnName,
  onExpand,
}: {
  data: any;
  columnName: string;
  onExpand: (data: any, col: string) => void;
}) => {
  // Case 1: Null or undefined
  if (data === null || data === undefined)
    return <span className="text-gray-400">-</span>;

  // Case 2: Array
  if (Array.isArray(data)) {
    if (data.length === 0)
      return <span className="text-gray-400">Empty List</span>;

    // Preview the first item
    const preview = getPreviewString(data[0]);
    const remaining = data.length - 1;

    return (
      <div className="flex items-center gap-2">
        <span className="truncate max-w-[150px]">{preview}</span>
        {remaining >= 0 && (
          <button
            onClick={() => onExpand(data, columnName)}
            className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full hover:bg-blue-200 transition font-medium whitespace-nowrap"
          >
            {remaining === 0 ? "View" : `+${remaining} more`}
          </button>
        )}
      </div>
    );
  }

  // Case 3: Single Object
  if (typeof data === "object") {
    return (
      <div className="flex items-center gap-2">
        <span className="truncate max-w-[150px]">{getPreviewString(data)}</span>
        <button
          onClick={() => onExpand(data, columnName)}
          className="text-gray-400 hover:text-blue-600 transition"
        >
          <Eye size={16} />
        </button>
      </div>
    );
  }

  // Case 4: Primitive (String, Number, Boolean)
  return <span>{String(data)}</span>;
};

// --- MAIN COMPONENT ---
export default function DynamicTable({
  url,
  enableSearch = false,
  rowsPerPage = 10,
}: DynamicTableProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal State
  const [modalData, setModalData] = useState<{
    data: any;
    title: string;
  } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(
    async (signal: AbortSignal) => {
      setLoading(true);
      setError(false);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: rowsPerPage.toString(),
        });
        if (enableSearch && debouncedSearch)
          params.append("search", debouncedSearch);

        const fullUrl = `${
          url.includes("?") ? url + "&" : url + "?"
        }${params.toString()}`;
        const res = await customerAxios(fullUrl, { signal });

        const json: ApiResponse = await res.data();
        if (json.success) {
          setData(json.data);
          setTotal(json.total);
        } else {
          setError(true);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") setError(true);
      } finally {
        setLoading(false);
      }
    },
    [url, page, rowsPerPage, enableSearch, debouncedSearch]
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const columns = data.length > 0 ? Object.keys(data[0]) : [];
  const totalPages = Math.ceil(total / rowsPerPage);

  if (error) {
    return (
      <div className="p-6 border border-red-200 bg-red-50 rounded-lg text-red-600 flex items-center gap-2">
        <AlertCircle size={20} />
        <span>Failed to retrieve data</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      {enableSearch && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
            <thead className="bg-gray-50">
              <tr>
                {loading && data.length === 0
                  ? [1, 2, 3].map((i) => (
                      <th key={i} className="px-6 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      </th>
                    ))
                  : columns.map((col) => (
                      <th
                        key={col}
                        className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, idx) => (
                  <tr key={idx}>
                    {columns.length > 0 ? (
                      columns.map((col) => (
                        <td key={col} className="px-6 py-4">
                          <div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div>
                        </td>
                      ))
                    ) : (
                      <td className="p-4 text-center">
                        <Loader2 className="animate-spin inline text-gray-400" />
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={`${rowIndex}-${col}`}
                        className="px-6 py-4 whitespace-nowrap text-gray-700"
                      >
                        {/* Use the new Smart Cell Renderer */}
                        <DataCell
                          data={row[col]}
                          columnName={col}
                          onExpand={(d, c) =>
                            setModalData({ data: d, title: c })
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length || 1}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-medium">
            {data.length > 0 ? (page - 1) * rowsPerPage + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-medium">
            {Math.min(page * rowsPerPage, total)}
          </span>{" "}
          of <span className="font-medium">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium px-2">
            Page {page} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
            disabled={page >= totalPages || loading}
            className="p-2 border rounded-md disabled:opacity-50 hover:bg-gray-50 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* The Popup Modal */}
      {modalData && (
        <DataModal
          data={modalData.data}
          title={modalData.title}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
}

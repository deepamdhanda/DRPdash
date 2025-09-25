import React, { useEffect, useState } from "react";
import axios from "axios";

type Invoice = {
  _id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  grand_total: number;
  total_gst: number;
  total_without_gst: number;
  createdAt: string;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userId, setUserId] = useState("");

  // assume we get user role from auth context or props
  const role = "admin"; // change this to "user" for testing

  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const payload: any = {
        filter: {},
      };

      if (fromDate || toDate) {
        payload.filter.date = {
          ...(fromDate && { from: fromDate }),
          ...(toDate && { to: toDate }),
        };
      }

      if (role === "admin" && userId) {
        payload.filter.user_id = userId;
      }

      const res = await axios.post(
        `http://localhost:5001/api/user/invoices?page=${page}&limit=5`,
        payload,
        { withCredentials: true }
      );

      setInvoices(res.data.invoices);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Error fetching invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Invoices</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div>
          <label>From: </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-1"
          />
        </div>
        <div>
          <label>To: </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-1"
          />
        </div>
        {role === "admin" && (
          <div>
            <label>User ID: </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              className="border p-1"
            />
          </div>
        )}
        <button
          onClick={() => {
            setPage(1); // reset to first page
            fetchInvoices();
          }}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Apply
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : invoices.length === 0 ? (
        <p>No invoices found.</p>
      ) : (
        <table className="border-collapse border w-full">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Invoice ID</th>
              {role === "admin" && <th className="border p-2">User ID</th>}
              <th className="border p-2">Period</th>
              <th className="border p-2">Grand Total</th>
              <th className="border p-2">GST</th>
              <th className="border p-2">Without GST</th>
              <th className="border p-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className="border p-2">{inv._id}</td>
                {role === "admin" && (
                  <td className="border p-2">{inv.user_id}</td>
                )}
                <td className="border p-2">
                  {new Date(inv.period_start).toLocaleDateString()} -{" "}
                  {new Date(inv.period_end).toLocaleDateString()}
                </td>
                <td className="border p-2">{inv.grand_total.toFixed(2)}</td>
                <td className="border p-2">{inv.total_gst.toFixed(2)}</td>
                <td className="border p-2">
                  {inv.total_without_gst.toFixed(2)}
                </td>
                <td className="border p-2">
                  {new Date(inv.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((prev) =>
                pagination && page < pagination.totalPages ? prev + 1 : prev
              )
            }
            disabled={page === pagination.totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

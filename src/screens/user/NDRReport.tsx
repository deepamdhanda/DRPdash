import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Package,
  Calendar,
  Info,
  AlertCircle,
  CheckCircle2,
  Edit2,
  Truck,
} from "lucide-react";
import { toast } from "react-toastify";

import { getAllNDRReports, updateNDRReport } from "../../APIs/user/ndrReport";
import CustomDataTable from "../../components/DataTable"; // Adjust path if needed

// --- Interfaces ---
export interface User {
  _id: string;
  name: string;
}

export interface NDRReport {
  _id: string;
  awb: string;
  courier: string;
  order: any;
  attempts: any[];
  currentAttempt: number;
  latestStatus: string;
  action?: string;
  rescheduleDate?: string;
}

// --- Modal Component ---
interface NDRReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: NDRReport | null;
  onSuccess: () => void;
}

const NDRReportModal: React.FC<NDRReportModalProps> = ({
  isOpen,
  onClose,
  report,
  onSuccess,
}) => {
  const [sellerAction, setSellerAction] = useState<string>("");
  const [rescheduleDate, setRescheduleDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when modal opens/closes or report changes
  useEffect(() => {
    if (isOpen && report) {
      setSellerAction("");
      setRescheduleDate("");
    }
  }, [isOpen, report]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report) return;

    setIsSubmitting(true);
    try {
      await updateNDRReport(report._id, {
        action: sellerAction,
        rescheduleDate: sellerAction === "reschedule" ? rescheduleDate : null,
      });
      toast.success("NDR Report updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving ndr report", error);
      toast.error("Failed to update NDR report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none text-black">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
              className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-500" />
                    Update NDR Report
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 font-medium">
                    {report?.awb} • #{report?.order?.order_id}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="px-6 py-5 space-y-5">
                  {/* Seller Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Seller Action <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={sellerAction}
                      onChange={(e) => setSellerAction(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>
                        Select Action
                      </option>
                      <option value="cancel">Cancel Order</option>
                      <option value="reschedule">
                        Reschedule Pickup/Delivery
                      </option>
                    </select>
                  </div>

                  {/* Reschedule Date (Conditional) */}
                  {sellerAction === "reschedule" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        Reschedule Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </motion.div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !sellerAction}
                    className="px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {isSubmitting ? "Updating..." : "Update NDR"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---
export const NDRReports: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [ndr_reports, setNDRReports] = useState<NDRReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNDRReport, setEditingNDRReport] = useState<NDRReport | null>(
    null
  );

  const fetchInitialData = async (currentPage = page, currentLimit = limit) => {
    setLoading(true);
    try {
      const ndr_reportsData = await getAllNDRReports(currentPage, currentLimit);
      setTotalRecords(ndr_reportsData.total);
      setNDRReports(ndr_reportsData.data);
    } catch (error) {
      console.error("Error loading ndr_reports", error);
      toast.error("Failed to load NDR Reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData(page, limit);
  }, [page, limit]);

  const handleEdit = (ndr_report: NDRReport) => {
    setEditingNDRReport(ndr_report);
    setIsModalOpen(true);
  };

  const columns = useMemo(
    () => [
      {
        name: "Tracking Details",
        selector: (row: NDRReport) => row.awb,
        sortable: true,
        width: "250px",
        cell: (row: NDRReport) => (
          <div className="flex flex-col gap-1 py-3">
            <span className="text-sm font-semibold text-gray-900 tracking-tight">
              #{row.order?.order_id || "N/A"}
            </span>
            <div className="flex items-center gap-1.5 text-gray-700 font-medium">
              <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{row.awb}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Truck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{row.courier || "—"}</span>
            </div>
          </div>
        ),
      },
      {
        name: "Attempt Status",
        minWidth: "300px",
        sortable: true,
        cell: (row: NDRReport) => {
          const lastAttempt = row.attempts?.[row.currentAttempt - 1];
          const date = lastAttempt?.scanDateTime?.split("T")[0] || "—";
          const reason = lastAttempt?.ndrReason || "—";
          const isPending = row.latestStatus === "pending";

          return (
            <div className="flex flex-col gap-2 py-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-md border border-gray-200">
                  Attempt #{row.currentAttempt}
                </span>
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-md border capitalize flex items-center gap-1 ${
                    isPending
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-green-50 text-green-700 border-green-200"
                  }`}
                >
                  {isPending ? (
                    <AlertCircle className="w-3 h-3" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  {row.latestStatus}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{date}</span>
              </div>

              <div className="flex items-start gap-1.5 text-sm text-gray-500">
                <Info className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                <span className="italic line-clamp-2" title={reason}>
                  {reason}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        name: "Resolution Action",
        minWidth: "180px",
        cell: (row: NDRReport) => (
          <span className="text-sm text-gray-700 font-medium py-3">
            {row.attempts?.[row.currentAttempt - 1]?.resolutionAction || "—"}
          </span>
        ),
      },
      {
        name: "Seller Action",
        minWidth: "180px",
        cell: (row: NDRReport) => {
          const action =
            row.attempts?.[row.currentAttempt - 1]?.sellerFeedback?.action ||
            "—";
          return (
            <span className="text-sm text-gray-700 font-medium py-3 capitalize">
              {action}
            </span>
          );
        },
      },
      {
        name: "Actions",
        width: "140px",
        cell: (row: NDRReport) => (
          <div className="py-3">
            <button
              onClick={() => handleEdit(row)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors shadow-sm"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Update
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Non-Delivery Reports (NDR)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage delivery exceptions, view courier attempts, and submit seller
            actions.
          </p>
        </div>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={ndr_reports}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <NDRReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        report={editingNDRReport}
        onSuccess={() => fetchInitialData(page, limit)}
      />
    </>
  );
};

import React, { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Calendar,
  Scale,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  X,
  Send,
  Image as ImageIcon,
  IndianRupee,
} from "lucide-react";
import { toast } from "react-toastify";

import { appAxios } from "../../axios/appAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import CustomDataTable from "../../components/DataTable"; // Adjust path if needed

// --- Types ---
type DiscrepancyStatus = "pending" | "dispute" | "accepted";

interface IChat {
  type: "reporter" | "admin";
  message: string;
  createdAt: string;
}

interface IWeightDiscrepancy {
  _id?: string;
  awb_number: string;
  orderId: string;
  order_createdAt: string;
  entered_weight: number;
  charge_weight: number;
  initial_amount: number;
  final_charge: number;
  status: DiscrepancyStatus;
  chat: IChat[];
  courier_images: string[];
}

// --- Accept Confirmation Modal ---
interface AcceptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  row: IWeightDiscrepancy | null;
  isProcessing: boolean;
}

const AcceptDiscrepancyModal: React.FC<AcceptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  row,
  isProcessing,
}) => {
  return (
    <AnimatePresence>
      {isOpen && row && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto"
            >
              <div className="p-6 text-center flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Accept Carrier Charges?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  You are accepting the carrier's measured weight of{" "}
                  <strong className="text-gray-900">
                    {row.charge_weight}g
                  </strong>
                  .
                </p>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 w-full mb-2">
                  <span className="text-red-600 text-sm font-semibold uppercase tracking-wider">
                    Extra Payable
                  </span>
                  <div className="text-3xl font-bold text-red-700 mt-1">
                    ₹{row.final_charge - row.initial_amount}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This amount will be deducted from your wallet immediately.
                </p>
              </div>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isProcessing}
                  className="w-1/2 py-2.5 font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-sm shadow-green-500/30 transition-all flex justify-center items-center gap-2"
                >
                  {isProcessing ? "Processing..." : "Confirm & Pay"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Dispute / Chat Modal ---
interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: IWeightDiscrepancy | null;
  onSendMessage: (message: string) => Promise<void>;
}

const DisputeModal: React.FC<DisputeModalProps> = ({
  isOpen,
  onClose,
  row,
  onSendMessage,
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  }, [isOpen, row?.chat]);

  const handleSend = async () => {
    if (!message.trim() || !row) return;
    setIsSending(true);
    await onSendMessage(message);
    setMessage("");
    setIsSending(false);
  };

  return (
    <AnimatePresence>
      {isOpen && row && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    {row.status === "accepted"
                      ? "Raise New Dispute"
                      : "Dispute Details"}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    AWB: #{row.awb_number}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Evidence Section */}
              <div className="px-6 py-3 bg-blue-50/50 border-b border-blue-100 flex justify-between items-center shrink-0">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Carrier Evidence
                  </span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {row.courier_images?.length > 0 ? (
                      row.courier_images.map((img, i) => (
                        <a
                          key={i}
                          href={img}
                          target="_blank"
                          rel="noreferrer"
                          className="block relative group rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={img}
                            alt="proof"
                            className="h-12 w-12 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <ImageIcon className="w-4 h-4 text-white" />
                          </div>
                        </a>
                      ))
                    ) : (
                      <span className="text-sm text-gray-400 italic">
                        No images provided
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Charged Weight
                  </span>
                  <div className="text-lg font-bold text-gray-900">
                    {row.charge_weight}g
                  </div>
                </div>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
                {row.chat?.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium text-gray-600">
                      No messages yet.
                    </p>
                    <p className="text-sm text-center mt-1 max-w-xs">
                      Describe your issue below to start the dispute process
                      with our support team.
                    </p>
                  </div>
                ) : (
                  row.chat.map((c, i) => (
                    <div
                      key={i}
                      className={`flex w-full ${
                        c.type === "reporter" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          c.type === "reporter"
                            ? "bg-blue-600 text-white rounded-br-sm"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
                        }`}
                      >
                        <div
                          className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${
                            c.type === "reporter"
                              ? "text-blue-200"
                              : "text-gray-400"
                          }`}
                        >
                          {c.type === "reporter" ? "You" : "Support"} •{" "}
                          {new Date(c.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {c.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    disabled={isSending || !message.trim()}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {isSending ? "..." : "Send"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---
const WeightDiscrepancy: React.FC = () => {
  const [data, setData] = useState<IWeightDiscrepancy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination states for CustomDataTable (Even if API returns all, it's good practice)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Modal States
  const [selectedRow, setSelectedRow] = useState<IWeightDiscrepancy | null>(
    null
  );
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchWeightDiscrepancies = async () => {
    try {
      setLoading(true);
      const res = await appAxios.get<{
        success: boolean;
        data: IWeightDiscrepancy[];
      }>(`${drpCrmBaseUrl}/user/weight-discrepancy`);
      if (res.data.success) {
        setData(res.data.data);
        setTotalRecords(res.data.data.length); // Adjust if backend adds pagination
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load discrepancies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightDiscrepancies();
  }, []);

  const handleAccept = async () => {
    if (!selectedRow) return;
    setIsProcessing(true);
    try {
      const res = await appAxios.post(
        `${drpCrmBaseUrl}/user/weight-discrepancy/accept`,
        {
          awb_number: selectedRow.awb_number,
        }
      );

      if (res.data.success) {
        setData((prev) =>
          prev.map((d) =>
            d.awb_number === selectedRow.awb_number
              ? { ...d, status: "accepted" }
              : d
          )
        );
        toast.success("Charges accepted successfully");
        setShowAcceptModal(false);
        setShowDisputeModal(false);
      }
    } catch (err) {
      console.error("Failed to accept:", err);
      toast.error("Failed to accept charges");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedRow) return;
    try {
      const res = await appAxios.post(
        `${drpCrmBaseUrl}/user/weight-discrepancy/message`,
        {
          awb_number: selectedRow.awb_number,
          message: message,
        }
      );

      if (res.data.success) {
        const updatedItem = res.data.data;
        setData((prev) =>
          prev.map((d) =>
            d.awb_number === selectedRow.awb_number ? updatedItem : d
          )
        );
        setSelectedRow(updatedItem);
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message");
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Tracking & Date",
        selector: (row: IWeightDiscrepancy) => row.awb_number,
        sortable: true,
        width: "200px",
        cell: (row: IWeightDiscrepancy) => (
          <div className="flex flex-col gap-1 py-3">
            <div className="flex items-center gap-1.5 font-semibold text-gray-900">
              <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>{row.awb_number}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <Calendar className="w-3 h-3 shrink-0" />
              <span>
                {new Date(row.order_createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Weight Details",
        minWidth: "180px",
        cell: (row: IWeightDiscrepancy) => (
          <div className="flex flex-col gap-1.5 py-3 text-sm w-full">
            <div className="flex justify-between items-center text-gray-500">
              <span>Entered:</span>
              <span className="font-medium text-gray-700">
                {row.entered_weight}g
              </span>
            </div>
            <div className="flex justify-between items-center text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md">
              <span className="flex items-center gap-1">
                <Scale className="w-3 h-3" /> Charged:
              </span>
              <span>{row.charge_weight}g</span>
            </div>
          </div>
        ),
      },
      {
        name: "Extra Charge",
        minWidth: "150px",
        cell: (row: IWeightDiscrepancy) => (
          <div className="flex items-center gap-1 font-bold text-red-600 py-3">
            <IndianRupee className="w-4 h-4" />
            <span className="text-lg">
              {row.final_charge - row.initial_amount}
            </span>
          </div>
        ),
      },
      {
        name: "Status",
        selector: (row: IWeightDiscrepancy) => row.status,
        width: "140px",
        cell: (row: IWeightDiscrepancy) => {
          const isPending = row.status === "pending";
          const isAccepted = row.status === "accepted";
          const isDispute = row.status === "dispute";

          return (
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold uppercase ${
                isPending
                  ? "bg-orange-50 text-orange-700 border-orange-200"
                  : isDispute
                  ? "bg-red-50 text-red-700 border-red-200"
                  : "bg-green-50 text-green-700 border-green-200"
              }`}
            >
              {isPending && <AlertCircle className="w-3.5 h-3.5" />}
              {isDispute && <AlertTriangle className="w-3.5 h-3.5" />}
              {isAccepted && <CheckCircle2 className="w-3.5 h-3.5" />}
              {row.status}
            </div>
          );
        },
      },
      {
        name: "Actions",
        width: "220px",
        cell: (row: IWeightDiscrepancy) => (
          <div className="flex items-center gap-2 py-3 w-full">
            {row.status === "pending" && (
              <>
                <button
                  onClick={() => {
                    setSelectedRow(row);
                    setShowAcceptModal(true);
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => {
                    setSelectedRow(row);
                    setShowDisputeModal(true);
                  }}
                  className="flex-1 py-1.5 px-3 text-xs font-bold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Dispute
                </button>
              </>
            )}

            {row.status === "accepted" && (
              <button
                onClick={() => {
                  setSelectedRow(row);
                  setShowDisputeModal(true);
                }}
                className="w-full py-1.5 px-3 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Raise Dispute
              </button>
            )}

            {row.status === "dispute" && (
              <button
                onClick={() => {
                  setSelectedRow(row);
                  setShowDisputeModal(true);
                }}
                className="w-full py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                View Chat
              </button>
            )}
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
            Weight Discrepancy
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and resolve courier weight differences and extra charges.
          </p>
        </div>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={data}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <AcceptDiscrepancyModal
        isOpen={showAcceptModal}
        onClose={() => setShowAcceptModal(false)}
        onConfirm={handleAccept}
        row={selectedRow}
        isProcessing={isProcessing}
      />

      <DisputeModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        row={selectedRow}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default WeightDiscrepancy;

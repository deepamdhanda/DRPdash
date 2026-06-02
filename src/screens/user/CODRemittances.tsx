import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  Building,
  Package,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Wallet,
  X,
  RefreshCw,
} from "lucide-react";

import { getAllCODRemittances } from "../../APIs/user/codRemittance";
import { transferPayment } from "../../APIs/user/wallet";
import CustomDataTable from "../../components/DataTable"; // Adjust path if needed

// --- Interfaces ---
export interface User {
  _id: string;
  name: string;
}

export interface CODRemittance {
  _id: string;
  pool_name: string;
  totalAmount: number;
  remittanceDate: Date;
  status: string;
  masked_account_number: string;
  createdAt: string;
  orders: {
    order_id: string;
    channel_order_id: string;
    store_order_id: string;
    amount: number;
    awb_number?: string;
    courier_name?: string;
    channel_account_name?: string;
    product_sku_id?: string;
    product_sku_name?: string;
  }[];
  transfers: any[];
}

// --- Wallet Transfer Modal ---
interface WalletTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxAmount: number;
  remittanceId: string;
  onSuccess: () => void;
}

const WalletTransferModal: React.FC<WalletTransferModalProps> = ({
  isOpen,
  onClose,
  maxAmount,
  remittanceId,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<number | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset/Set default amount when modal opens
  useEffect(() => {
    if (isOpen) {
      setAmount(maxAmount);
    } else {
      setAmount("");
    }
  }, [isOpen, maxAmount]);

  const handlePayment = async () => {
    if (!amount || amount <= 0 || amount > maxAmount) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await transferPayment(Number(amount), remittanceId);
      if (res) {
        toast.success("Wallet transfer successful");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("Transfer failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none text-black">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-blue-600" />
                  Add Money to Wallet
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6 space-y-4">
                <div className="bg-blue-50 text-blue-800 p-3 rounded-xl flex justify-between items-center border border-blue-100">
                  <span className="text-sm font-medium">
                    Pending Remittance:
                  </span>
                  <span className="text-lg font-bold">
                    ₹{maxAmount.toFixed(2)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Transfer Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    max={maxAmount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 text-lg font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                  />
                  {Number(amount) > maxAmount && (
                    <p className="text-xs text-red-500 mt-1.5 font-medium">
                      Amount cannot exceed pending remittance (₹
                      {maxAmount.toFixed(2)})
                    </p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={onClose}
                  className="w-1/3 py-2.5 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={
                    isProcessing ||
                    !amount ||
                    Number(amount) <= 0 ||
                    Number(amount) > maxAmount
                  }
                  className="w-2/3 py-2.5 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? "Processing..." : "Proceed to Transfer"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Custom Expanded Row Component ---
// const ExpandedComponent = ({ data: row }: { data: CODRemittance }) => {
//   return (
//     <div className="p-5 bg-gray-50 border-l-4 border-[#F5891E] m-3 rounded-r-xl shadow-inner">
//       {/* Transfers Section */}
//       {row.transfers && row.transfers.length > 0 && (
//         <div className="mb-6">
//           <h6 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-3">
//             <ArrowRightLeft className="w-4 h-4 text-[#F5891E]" />
//             Transfers
//           </h6>
//           <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
//             <table className="w-full text-sm text-left">
//               <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
//                 <tr>
//                   <th className="px-4 py-2">Transfer Mode</th>
//                   <th className="px-4 py-2">Transfer ID</th>
//                   <th className="px-4 py-2">Total Amount</th>
//                   <th className="px-4 py-2">Transfer Date</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {row.transfers.map((t, idx) => (
//                   <tr key={idx} className="hover:bg-gray-50/50">
//                     <td className="px-4 py-2 font-medium">
//                       {t.transferMode || "—"}
//                     </td>
//                     <td className="px-4 py-2 text-gray-600">
//                       {t.transferId || "—"}
//                     </td>
//                     <td className="px-4 py-2 font-semibold text-green-600">
//                       ₹{t.amount?.toFixed(2) || "0.00"}
//                     </td>
//                     <td className="px-4 py-2 text-gray-500">
//                       {t.transferDate?.split("T")[0] || "—"}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {/* Orders Section */}
//       <div>
//         <h6 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2 mb-3">
//           <Package className="w-4 h-4 text-[#F5891E]" />
//           Included Orders
//         </h6>
//         <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
//           <table className="w-full text-sm text-left whitespace-nowrap">
//             <thead className="bg-gray-100 text-gray-600 font-semibold border-b border-gray-200">
//               <tr>
//                 <th className="px-4 py-2">Order ID</th>
//                 <th className="px-4 py-2">Channel Details</th>
//                 <th className="px-4 py-2">AWB Number</th>
//                 <th className="px-4 py-2">Product</th>
//                 <th className="px-4 py-2 text-right">Total Amount</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {row.orders?.map((o, idx) => (
//                 <tr key={idx} className="hover:bg-gray-50/50">
//                   <td className="px-4 py-3 font-medium text-gray-900">
//                     #{o.order_id || "—"}
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex flex-col gap-0.5 text-xs">
//                       <span className="text-gray-500">
//                         Ch: {o.channel_order_id || "—"}
//                       </span>
//                       <span className="font-semibold text-[#F5891E] underline">
//                         St: {o.store_order_id || "—"}
//                       </span>
//                       <span className="text-gray-600">
//                         {o.channel_account_name || "—"}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex flex-col gap-0.5 text-xs">
//                       <span className="font-medium text-gray-700">
//                         {o.courier_name || "—"}
//                       </span>
//                       <span className="flex items-center gap-1 text-[#F5891E] font-semibold underline">
//                         <Truck className="w-3 h-3" />
//                         {o.awb_number || "—"}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3">
//                     <div className="flex flex-col gap-0.5 text-xs">
//                       <span
//                         className="text-gray-700 font-medium truncate max-w-[150px]"
//                         title={o.product_sku_name}
//                       >
//                         {o.product_sku_name || "—"}
//                       </span>
//                       <span className="flex items-center gap-1 text-gray-500">
//                         <Tag className="w-3 h-3" />
//                         {o.product_sku_id || "—"}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-right font-bold text-gray-900">
//                     ₹{o.amount?.toFixed(2) || "0.00"}
//                   </td>
//                 </tr>
//               ))}
//               {(!row.orders || row.orders.length === 0) && (
//                 <tr>
//                   <td
//                     colSpan={5}
//                     className="px-4 py-4 text-center text-gray-500 italic"
//                   >
//                     No orders found for this remittance.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// --- Main Component ---
export const CODRemittances: React.FC = () => {
  const [cod_remittances, setCODRemittances] = useState<CODRemittance[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [maxAmount, setMaxAmount] = useState(0);
  const [remittanceId, setRemittanceId] = useState("");

  // Pagination State
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  const fetchInitialData = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const cod_remittancesData = await getAllCODRemittances(
        pageParam,
        limitParam
      );
      setTotalRecords(cod_remittancesData.total);
      setCODRemittances(
        cod_remittancesData.data.map((remittance: any) => ({
          ...remittance,
          transfers: Array.isArray(remittance.transfers)
            ? remittance.transfers
            : [],
        }))
      );
    } catch (error) {
      console.error("Error loading cod_remittances", error);
      toast.error("Failed to load COD Remittances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData(page, limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  const columns = useMemo(
    () => [
      {
        name: "Pool Name",
        selector: (row: CODRemittance) => row.pool_name,
        sortable: true,
        width: "180px",
        cell: (row: CODRemittance) => (
          <div className="flex items-center gap-2 py-3 font-semibold text-gray-900">
            <Building className="w-4 h-4 text-gray-400 shrink-0" />
            {row.pool_name || "—"}
          </div>
        ),
      },
      {
        name: "Orders",
        selector: (row: CODRemittance) => row.orders?.length || 0,
        sortable: true,
        width: "120px",
        cell: (row: CODRemittance) => (
          <div className="flex items-center justify-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-md text-xs font-bold text-gray-700 border border-gray-200">
            <Package className="w-3.5 h-3.5 text-gray-500" />
            {row.orders?.length || 0}
          </div>
        ),
      },
      {
        name: "Bank Details",
        minWidth: "160px",
        selector: (row: CODRemittance) => row.masked_account_number,
        cell: (row: CODRemittance) => (
          <div className="flex items-center gap-2 text-sm text-gray-700 py-3">
            <CreditCard className="w-4 h-4 text-gray-400 shrink-0" />
            {row.masked_account_number || "N/A"}
          </div>
        ),
      },
      {
        name: "Remittance Date",
        minWidth: "150px",
        sortable: true,
        selector: (row: CODRemittance) => row.remittanceDate?.toString() || "",
        cell: (row: CODRemittance) => (
          <div className="flex items-center gap-1.5 text-sm text-gray-600 py-3">
            <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span>
              {row.remittanceDate
                ? new Date(row.remittanceDate).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        ),
      },
      {
        name: "Amount",
        minWidth: "180px",
        cell: (row: CODRemittance) => {
          const totalTransferred =
            row?.transfers?.reduce(
              (sum: number, i: any) => sum + i.amount,
              0
            ) || 0;
          const totalAmount =
            row?.orders?.reduce((sum: number, i: any) => sum + i.amount, 0) ||
            0;
          const pending = totalAmount - totalTransferred;

          return (
            <div className="flex flex-col gap-1 py-2 text-xs w-full">
              <div className="flex justify-between items-center font-bold text-gray-900 border-b border-gray-100 pb-1">
                <span>Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
              {row.transfers?.length > 0 && (
                <>
                  <div className="flex justify-between items-center font-semibold text-green-600">
                    <span>Paid:</span>
                    <span>₹{totalTransferred.toFixed(2)}</span>
                  </div>
                  {pending > 0 && (
                    <div className="flex justify-between items-center font-semibold text-[#F5891E]">
                      <span>Pending:</span>
                      <span>₹{pending.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        },
      },
      {
        name: "Status",
        width: "140px",
        sortable: true,
        selector: (row: CODRemittance) => row.status,
        cell: (row: CODRemittance) => {
          const status = row.status?.toLowerCase() || "";
          let styles = "bg-gray-100 text-gray-700 border-gray-200";
          let Icon = AlertCircle;

          if (status === "completed") {
            styles = "bg-green-50 text-green-700 border-green-200";
            Icon = CheckCircle2;
          } else if (status === "processing") {
            styles = "bg-blue-50 text-blue-700 border-blue-200";
            Icon = RefreshCw;
          } else if (status === "pending") {
            styles = "bg-orange-50 text-orange-700 border-orange-200";
          }

          return (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold capitalize ${styles}`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  status === "processing" ? "animate-spin" : ""
                }`}
              />
              {status || "—"}
            </div>
          );
        },
      },
      {
        name: "Action",
        width: "160px",
        cell: (row: CODRemittance) => {
          const totalTransferred =
            row?.transfers?.reduce(
              (sum: number, i: any) => sum + i.amount,
              0
            ) || 0;
          const totalAmount =
            row?.orders?.reduce((sum: number, i: any) => sum + i.amount, 0) ||
            0;
          const pendingAmount = totalAmount - totalTransferred;

          if (pendingAmount > 0) {
            return (
              <button
                onClick={() => {
                  setMaxAmount(pendingAmount);
                  setRemittanceId(row._id);
                  setShowModal(true);
                }}
                className="w-full py-1.5 px-3 flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-[#000434] rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5" />
                Transfer
              </button>
            );
          }
          return null;
        },
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            COD Remittances
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your Cash on Delivery payouts and transfers.
          </p>
        </div>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={cod_remittances}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <WalletTransferModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        maxAmount={maxAmount}
        remittanceId={remittanceId}
        onSuccess={() => fetchInitialData(page, limit)}
      />
    </>
  );
};

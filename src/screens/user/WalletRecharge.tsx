import React, { useEffect, useState, useMemo } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Gift,
  Receipt,
  Search,
  Wallet as WalletIcon,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { appAxios } from "../../axios/appAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { getAllWalletsRecharges, makePayment } from "../../APIs/user/wallet";
import { getAllPools } from "../../APIs/user/pool";
import CustomDataTable from "../../components/DataTable"; // Adjust path if needed

// --- Types ---
export type TWalletRecharge = {
  _id: string;
  pool_id: string;
  amount: number;
  razorpay_order_id: string;
  created_by: string;
  status: "pending" | "paid" | "failed" | "freecash";
  createdAt: string;
  updatedAt: string;
  razorpay_payment_id?: string;
  full_details?: any;
  reason?: string;
  finalAmount: number;
  bonusAmount: number;
  paidAmount: number;
};

// --- Modal Component ---
interface WalletRechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  pools: any[];
  onSuccess: () => void; // Callback to refresh table/pools
}

const WalletRechargeModal: React.FC<WalletRechargeModalProps> = ({
  isOpen,
  onClose,
  pools,
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<number | "">("");
  const [selectedPool, setSelectedPool] = useState<string>("");
  const [coupon, setCoupon] = useState<string>("");
  const [bonus, setBonus] = useState<number>(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1);
        setAmount("");
        setSelectedPool("");
        setCoupon("");
        setBonus(0);
      }, 300);
    }
  }, [isOpen]);

  const handleApplyCoupon = async () => {
    if (!amount) return;
    setIsValidating(true);
    try {
      const { data } = await appAxios.post(`${drpCrmBaseUrl}/user/coupon`, {
        amount: Number(amount),
        coupon: coupon,
      });
      setBonus(data.data.discount);
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.message || "Invalid coupon code");
      setBonus(0);
      setCoupon("");
    } finally {
      setIsValidating(false);
    }
  };

  const handlePayment = async () => {
    if (!amount || !selectedPool) return;
    setIsProcessing(true);
    try {
      const res = await makePayment(Number(amount), selectedPool, coupon);
      if (res) {
        toast.success("Payment initiated successfully");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error("Payment initiation failed");
    } finally {
      setIsProcessing(false);
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
              className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <WalletIcon className="w-5 h-5 text-blue-600" />
                  Add Money{" "}
                  {step === 2 && (
                    <span className="text-gray-400 font-normal text-lg">
                      - Review
                    </span>
                  )}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {step === 1 ? (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Enter Amount (₹)
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full px-4 py-2.5 text-lg font-medium border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Select Target Pool
                      </label>
                      <select
                        value={selectedPool}
                        onChange={(e) => setSelectedPool(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
                      >
                        <option value="" disabled>
                          Select a pool
                        </option>
                        {pools.map((pool: any) => (
                          <option key={pool._id} value={pool._id}>
                            {pool.pool.name} (Balance: ₹
                            {pool?.pool.wallet_balance?.toFixed(2) || 0})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Summary Card */}
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Base Amount:</span>
                        <strong className="text-gray-800 text-base">
                          ₹{Number(amount).toFixed(2)}
                        </strong>
                      </div>
                      {bonus > 0 && (
                        <div className="flex justify-between items-center text-sm text-green-600">
                          <span className="flex items-center gap-1">
                            <Gift className="w-4 h-4" /> Bonus Applied:
                          </span>
                          <strong className="text-base">
                            + ₹{bonus.toFixed(2)}
                          </strong>
                        </div>
                      )}
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-gray-700 font-medium">
                          Final Wallet Balance:
                        </span>
                        <strong className="text-xl text-blue-600">
                          ₹{(Number(amount) + bonus).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    {/* Coupon Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Have a Promo Code?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter code (e.g., SAVE10)"
                          value={coupon}
                          onChange={(e) =>
                            setCoupon(e.target.value.toUpperCase())
                          }
                          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none uppercase"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          disabled={!coupon || isValidating}
                          className="px-5 py-2.5 font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {isValidating ? "Validating..." : "Apply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                {step === 1 ? (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!amount || !selectedPool || Number(amount) <= 0}
                    className="w-full py-2.5 font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/30 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                  >
                    Continue to Review
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setStep(1)}
                      className="w-1/3 py-2.5 font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-2/3 py-2.5 font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-sm shadow-green-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                    >
                      {isProcessing ? "Processing..." : `Pay ₹${amount}`}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Main Component ---
export const WalletRechargeComponent = () => {
  const [walletRecharges, setWalletRecharges] = useState<TWalletRecharge[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State (Aligned with CustomDataTable)
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);

  // Filter State
  const [transactionId, setTransactionId] = useState("");
  const [selectedPoolId, setSelectedPoolId] = useState("");
  const [dateRange, setDateRange] = useState({
    from: moment().subtract(1, "month").toDate(),
    to: moment().toDate(),
  });

  // Modal & Pool State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pools, setPools] = useState<any[]>([]);

  const fetchWalletsRecharges = async (
    currentPage = page,
    currentLimit = limit
  ) => {
    try {
      setLoading(true);
      const response = await getAllWalletsRecharges(
        currentPage,
        currentLimit,
        transactionId,
        selectedPoolId,
        dateRange.from,
        dateRange.to
      );
      if (response) {
        setWalletRecharges(response.data);
        setTotalRecords(response.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching wallets recharges", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPools = async () => {
    try {
      setPools((await getAllPools()).data);
    } catch (error) {
      console.error("Error fetching pools", error);
    }
  };

  // Initial Fetch & Dependency Triggers
  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    fetchWalletsRecharges(page, limit);
  }, [page, limit]);

  // Debounce only transactionId
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        // Reset to page 1 when searching
        setPage(1);
        fetchWalletsRecharges(1, limit);
      },
      transactionId ? 500 : 0
    );

    return () => clearTimeout(timeoutId);
  }, [transactionId]);

  const handleRefresh = () => {
    fetchPools();
    fetchWalletsRecharges(1, limit);
    setPage(1);
  };

  // Columns definition optimized with useMemo
  const columns = useMemo(
    () => [
      {
        name: "Order ID",
        selector: (row: TWalletRecharge) => row._id,
        sortable: true,
        width: "200px",
        cell: (row: TWalletRecharge) => (
          <div className="flex items-center gap-2 py-3">
            <Receipt className="w-4 h-4 text-gray-400 shrink-0" />
            <span
              className="text-sm font-medium text-gray-900 tracking-tight truncate"
              title={row._id}
            >
              #{row._id.slice(-8).toUpperCase()}
            </span>
          </div>
        ),
      },
      {
        name: "Payment Details",
        minWidth: "220px",
        cell: (row: TWalletRecharge) => (
          <div className="flex flex-col gap-1 py-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Paid:</span>
              <span className="font-semibold text-gray-800">
                ₹{row.paidAmount.toFixed(2)}
              </span>
            </div>
            {row.bonusAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500 flex items-center gap-1">
                  <Gift className="w-3 h-3" /> Bonus:
                </span>
                <span className="font-semibold text-green-600">
                  + ₹{row.bonusAmount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-1">
              <span className="text-gray-700 text-xs font-medium">
                Final Credit:
              </span>
              <span className="font-bold text-blue-600">
                ₹{row.finalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Status",
        width: "160px",
        sortable: true,
        selector: (row: TWalletRecharge) => row.status,
        cell: (row: TWalletRecharge) => {
          let styles = "bg-gray-100 text-gray-700 border-gray-200";
          let Icon = AlertCircle;
          let text = row.status.toUpperCase();

          if (row.status === "paid") {
            styles = "bg-green-50 text-green-700 border-green-200";
            Icon = CheckCircle2;
          } else if (row.status === "failed") {
            styles = "bg-red-50 text-red-700 border-red-200";
            Icon = X;
          } else if (row.status === "pending") {
            styles = "bg-orange-50 text-orange-700 border-orange-200";
          } else if (row.status === "freecash") {
            styles = "bg-purple-50 text-purple-700 border-purple-200";
            Icon = Gift;
            text = row.reason ? row.reason.toUpperCase() : "PROMOTIONAL";
          }

          return (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${styles}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]" title={text}>
                {text}
              </span>
            </div>
          );
        },
      },
      {
        name: "Date & Gateway",
        minWidth: "180px",
        cell: (row: TWalletRecharge) => (
          <div className="flex flex-col gap-1.5 py-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                {new Date(row.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {row.razorpay_payment_id && (
              <div className="flex items-center gap-2 text-gray-500 text-xs">
                <CreditCard className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="truncate" title={row.razorpay_payment_id}>
                  {row.razorpay_payment_id}
                </span>
              </div>
            )}
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 text-black">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Wallet Recharge History
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Track your deposits, bonus credits, and transaction statuses.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center gap-2"
        >
          <WalletIcon className="w-4 h-4" />
          Add Money
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6 text-black">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Transaction ID
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Select Pool
            </label>
            <select
              value={selectedPoolId}
              onChange={(e) => setSelectedPoolId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none appearance-none"
            >
              <option value="">All Pools</option>
              {pools.map((pool: any) => (
                <option key={pool._id} value={pool._id}>
                  {pool.pool.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              Start Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
              value={moment(dateRange.from).format("YYYY-MM-DD")}
              onChange={(e) =>
                setDateRange((old) => ({
                  ...old,
                  from: moment(e.target.value).toDate(),
                }))
              }
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
              End Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all outline-none"
              value={moment(dateRange.to).format("YYYY-MM-DD")}
              onChange={(e) =>
                setDateRange((old) => ({
                  ...old,
                  to: moment(e.target.value).toDate(),
                }))
              }
            />
          </div>

          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={() => fetchWalletsRecharges(1, limit)}
              className="w-full px-4 py-2 font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={walletRecharges}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <WalletRechargeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        pools={pools}
        onSuccess={handleRefresh}
      />
    </>
  );
};

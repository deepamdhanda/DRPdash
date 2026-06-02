import React, { useEffect, useState } from "react";
import { getAllPools, updatePool } from "../../APIs/user/pool";
import { toast } from "react-toastify";
import PoolModal from "../../components/pools/PoolModal";
import { AnimatePresence } from "framer-motion";

/* --- Types --- */
export interface User {
  _id: string;
  name: string;
}

export type Owner = {
  full_name?: string;
  email?: string;
  phone?: string;
};

export type Pool = {
  _id: string;
  name: string;
  status: string;
  admins?: User[];
  wallet_balance?: number;
  created_by?: { name: string };
  createdAt?: string;
  company_type?: string;
  owner?: Owner;
  website?: string;
  business_logo?: string | File | null;
  bank_details?: {
    account_number?: string;
    ifsc?: string;
    holder_name?: string;
    cheque?: string | File | null;
    approval_status?: string;
    status_message?: string;
  };
  kyc_documents?: any[];
  gstin?: string;
  address?: string;
  state?: string;
  kyc_status: string;
};

// NEW: Type for the channel accounts linked to the pool
export type ChannelAccountSummary = {
  _id: string;
  name: string;
  status: string;
  channel_type?: string;
  admins?: string[];
  createdon?: string;
};

// NEW: Wrapper type to match the backend aggregation structure
export type PoolListItem = {
  pool: Pool;
  channel_accounts: ChannelAccountSummary[];
};

export const Pools: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(9);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // UPDATED: State now holds the wrapper objects
  const [poolItems, setPoolItems] = useState<PoolListItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const poolsData = await getAllPools(page, limit);
      // Ensure we are mapping exactly to the backend's new response keys
      setPoolItems(poolsData.data || []);
      setTotalRecords(poolsData.total || 0);
    } catch (error) {
      toast.error("Failed to load pools");
    } finally {
      setLoading(false);
    }
  };

  const openNewPoolModal = () => {
    setEditingPool(null);
    setShowModal(true);
  };

  const handleEdit = (pool: Pool) => {
    setEditingPool(pool);
    setShowModal(true);
  };

  const handleToggleStatus = async (pool: Pool) => {
    const newStatus = pool.status === "active" ? "inactive" : "active";
    if (window.confirm(`Mark this pool as ${newStatus}?`)) {
      try {
        await updatePool(pool._id, { status: newStatus });
        fetchInitialData();
        toast.success(`Pool status updated to ${newStatus}`);
      } catch {
        toast.error("Failed to update status");
      }
    }
  };

  // Helper for Status Badge
  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-200",
      inactive: "bg-gray-100 text-gray-700 border-gray-200",
      warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return styles[status?.toLowerCase() || "inactive"] || styles.warning;
  };

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return (
    <div className="pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Business Accounts
          </h1>
          <p className="text-sm text-gray-500">
            Streamline your shipping and fulfillment
          </p>
        </div>
        <button
          onClick={openNewPoolModal}
          className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 whitespace-nowrap"
        >
          + Add New Business
        </button>
      </div>

      {/* Cards Grid Section */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#F5891E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : poolItems.length === 0 ? (
        <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-900">
            No businesses found
          </h3>
          <p className="text-gray-500 mt-1">
            Get started by creating a new business account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* UPDATED: Mapping through poolItems and destructuring pool & channel_accounts */}
          {poolItems.map((item) => {
            const { pool, channel_accounts } = item;
            const hasBalance = pool.wallet_balance && pool.wallet_balance > 0;
            const isActive = pool.status === "active";

            return (
              <div
                key={pool._id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-5 gap-3">
                  <button
                    onClick={() => handleEdit(pool)}
                    className="text-lg font-bold text-gray-900 text-left hover:text-blue-600 transition-colors focus:outline-none"
                  >
                    {pool.name}
                  </button>
                  <span
                    className={`px-3 py-1 text-[11px] font-bold tracking-wide rounded-full border capitalize shadow-sm shrink-0 ${getStatusStyle(
                      pool.status
                    )}`}
                  >
                    {pool.status}
                  </span>
                </div>

                {/* Card Body */}
                <div className="flex-1 space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Wallet Balance
                    </span>
                    <span
                      className={`px-3 py-1.5 text-xs font-bold rounded-full border shadow-sm ${
                        hasBalance
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-50 text-gray-600 border-gray-200"
                      }`}
                    >
                      ₹{pool.wallet_balance?.toFixed(2) || "0.00"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Created By
                    </span>
                    <span className="text-sm font-medium text-gray-800">
                      {pool.created_by?.name || "Unknown"}
                    </span>
                  </div>

                  {/* NEW: Channels Display */}
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-500">
                      Linked Channels
                    </span>
                    <div className="flex flex-wrap justify-end gap-1.5 mt-0.5 max-w-[55%]">
                      {channel_accounts && channel_accounts.length > 0 ? (
                        channel_accounts.slice(0, 3).map((ca) => (
                          <span
                            key={ca._id}
                            title={ca.status}
                            className={`px-2 py-0.5 text-[10px] font-medium rounded-md border ${
                              ca.status === "active"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-600 border-gray-200"
                            }`}
                          >
                            {ca.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">None</span>
                      )}
                      {channel_accounts && channel_accounts.length > 3 && (
                        <span className="px-2 py-0.5 text-[10px] font-medium rounded-md border bg-gray-50 text-gray-600 border-gray-200">
                          +{channel_accounts.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end">
                  {pool.kyc_status === "approved" ? (
                    <button
                      onClick={() => handleToggleStatus(pool)}
                      className={`w-full px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        isActive
                          ? "bg-white text-red-600 border border-red-200 hover:bg-red-50 focus:ring-red-500 hover:border-red-300"
                          : "bg-white text-green-600 border border-green-200 hover:bg-green-50 focus:ring-green-500 hover:border-green-300"
                      }`}
                    >
                      {isActive ? "Deactivate Account" : "Activate Account"}
                    </button>
                  ) : (
                    <div className="w-full text-center py-2">
                      <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 inline-block w-full">
                        KYC Pending
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Section */}
      {!loading && totalRecords > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 font-medium">
              Items per page:
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1); // Reset to page 1 on limit change
              }}
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#F5891E] focus:border-[#F5891E] block p-2 outline-none shadow-sm"
            >
              <option value={9}>9</option>
              <option value={24}>24</option>
              <option value={51}>51</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
              >
                Next
              </button>
            </div>
          </div>
          <div></div>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {showModal && (
          <PoolModal
            onClose={() => setShowModal(false)}
            editingPool={editingPool}
            onSuccess={() => {
              setShowModal(false);
              fetchInitialData();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { getAllPools, updatePool } from "../../APIs/user/pool";
import { createChannelAccount } from "../../APIs/user/channelAccount";
import { getAllChannels } from "../../APIs/user/channel";
import { channelAccounts_url } from "../../URLs/user";
import { toast } from "react-toastify";
import PoolModal from "../../components/pools/PoolModal";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
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

export type ChannelAccountSummary = {
  _id: string;
  name: string;
  status: string;
  channel_type?: string;
  admins?: string[];
  createdon?: string;
};

export type PoolListItem = {
  pool: Pool;
  channel_accounts: ChannelAccountSummary[];
};

export const Pools: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState(9);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  const [poolItems, setPoolItems] = useState<PoolListItem[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Pool Edit State
  const [showModal, setShowModal] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);

  // Channel Creation State
  const [targetPool, setTargetPool] = useState<Pool | null>(null);

  // Woo State
  const [showWoo, setShowWoo] = useState(false);
  const [wooName, setWooName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [isWooConnecting, setIsWooConnecting] = useState(false);

  // General Channel State (Shopify / Custom)
  const [showChannelModal, setShowChannelModal] = useState(false);
  const [channelType, setChannelType] = useState<"shopify" | "custom">(
    "custom"
  );
  const [channelName, setChannelName] = useState("");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [automation, setAutomation] = useState({
    auto_ship: true,
    auto_ai_recommendation: true,
    auto_address_confirm: true,
    auto_ai_rating: true,
  });
  const location = useLocation();
  const navigate = useNavigate();
  const [channelKeys, setChannelKeys] = useState<
    { key: string; value: string; disabled?: boolean }[]
  >([]);
  useEffect(() => {
    fetchInitialData();
    fetchChannels();
  }, [page, limit]);
  const checkNewToken = () => {
    const params = new URLSearchParams(location.search);

    if (
      params.get("channel") === "shopify" &&
      params.get("token") &&
      params.get("store_url")
    ) {
      // 1. Check if it already exists across ANY pool
      let existingAccount;
      for (const item of poolItems) {
        // Assuming channel_accounts summary returns enough info to identify it.
        // You might need to rely on the account name matching the store URL if keys aren't in the summary.
        const found = item.channel_accounts?.find(
          (ca) =>
            ca.channel_type?.toLowerCase() === "shopify" &&
            ca.name.includes(params.get("store_url")!)
        );
        if (found) existingAccount = found;
      }

      if (existingAccount) {
        toast.info(
          "A Shopify channel account with this store URL already exists. Please update it from the specific pool."
        );
        // Clear the URL parameters so it doesn't keep firing
        navigate(location.pathname, { replace: true });
        return;
      }

      // 2. Set up for a NEW Shopify account
      const shopifyChannel = channels.find(
        (c) => c.channel_name.toLowerCase() === "shopify"
      );

      if (shopifyChannel) setSelectedChannelId(shopifyChannel._id);
      setChannelType("shopify");

      // Pre-fill the keys
      setChannelKeys([
        {
          key: "api_access_token",
          value: params.get("token") || "",
          disabled: true,
        },
        {
          key: "store_url",
          value: params.get("store_url") || "",
          disabled: true,
        },
      ]);

      // Auto-open the modal (Note: user will still need to select a Target Pool if they just arrived from an external redirect)
      setShowChannelModal(true);

      // Clear the URL parameters
      navigate(location.pathname, { replace: true });
    }
  };
  useEffect(() => {
    if (channels.length > 0) {
      checkNewToken();
    }
  }, [location.search, channels, poolItems]);
  const fetchChannels = async () => {
    try {
      const data = await getAllChannels();
      setChannels(data);
    } catch (error) {
      console.error("Failed to fetch channels");
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const poolsData = await getAllPools(page, limit);
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

  // Channel Action Handlers
  const openWooModal = (pool: Pool) => {
    setTargetPool(pool);
    setWooName("");
    setStoreUrl("");
    setShowWoo(true);
  };

  const openChannelModal = (pool: Pool, type: "shopify" | "custom") => {
    setTargetPool(pool);
    setChannelType(type);
    setChannelName("");

    const preselectedChannel = channels.find((c) =>
      type === "shopify"
        ? c.channel_name.toLowerCase() === "shopify"
        : c.channel_name.toLowerCase() !== "shopify" &&
          c.channel_name.toLowerCase() !== "woocommerce"
    );
    setSelectedChannelId(preselectedChannel?._id || "");
    setShowChannelModal(true);
  };

  const handleConnectWooCommerce = async () => {
    if (!storeUrl || !wooName || !targetPool) {
      toast.error("Please fill in all fields.");
      return;
    }
    setIsWooConnecting(true);
    try {
      const woocomId = channels.find(
        (item) => item.channel_name.toLowerCase() === "woocommerce"
      )?._id;
      const response = await fetch(`${channelAccounts_url}/woo/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          store_url: storeUrl,
          channel_account_name: wooName,
          pool_id: targetPool._id,
          channel_id: woocomId,
        }),
      });

      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error("Failed to generate authorization URL.");
      }
    } catch (error) {
      toast.error("An error occurred connecting to the server.");
    } finally {
      setIsWooConnecting(false);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName || !selectedChannelId || !targetPool) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const keysObject: Record<string, any> = {};
    channelKeys.forEach(({ key, value }) => {
      if (key.trim()) {
        keysObject[key.trim()] = value;
      }
    });

    try {
      const formData = {
        channel_account_name: channelName,
        pool_id: targetPool, // Assuming targetPool is set
        channel_id: channels.find((c) => c._id === selectedChannelId),
        fulfillment_type: "Self",
        status: "active",
        keys: keysObject, // <-- ADD THIS
        admins: targetPool.admins?.map((a) => a._id) || [],
        automation: { ...automation },
      };

      await createChannelAccount(formData as any);
      toast.success(
        `${channelType === "shopify" ? "Shopify" : "Channel"} account created!`
      );
      setShowChannelModal(false);
      fetchInitialData();
    } catch (error) {
      toast.error("Failed to create channel account");
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
          className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all duration-200 whitespace-nowrap"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                    className="text-lg font-bold text-gray-900 text-left hover:text-[#F5891E] transition-colors focus:outline-none"
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

                {/* Card Body Core Info */}
                <div className="space-y-4 mb-4">
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
                </div>

                {/* Tabular Channel Accounts Display */}
                <div className="mt-2 border-t border-gray-100 pt-4 flex-1">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Linked Accounts
                  </h4>
                  <div className="flex flex-col gap-2">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-2 pb-1 border-b border-gray-100 text-[11px] font-semibold text-gray-400">
                      <div className="col-span-5">NAME</div>
                      <div className="col-span-4">PLATFORM</div>
                      <div className="col-span-3 text-right">STATUS</div>
                    </div>
                    {/* Data Rows */}
                    {channel_accounts && channel_accounts.length > 0 ? (
                      channel_accounts.map((ca) => (
                        <div
                          key={ca._id}
                          className="grid grid-cols-12 gap-2 items-center text-xs py-1"
                        >
                          <div
                            className="col-span-5 font-medium text-gray-700 truncate"
                            title={ca.name}
                          >
                            {ca.name}
                          </div>
                          <div className="col-span-4 text-gray-500 capitalize truncate">
                            {ca.channel_type || "Custom"}
                          </div>
                          <div className="col-span-3 flex justify-end">
                            <span
                              className={`px-2 py-0.5 rounded-md border text-[10px] font-medium ${
                                ca.status === "active"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-50 text-gray-500 border-gray-200"
                              }`}
                            >
                              {ca.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        No channels linked yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Add Channel Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <a
                    href="https://apps.shopify.com/app7"
                    className="py-1.5 flex items-center justify-center text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    + Shopify
                  </a>
                  <button
                    onClick={() => openChannelModal(pool, "custom")}
                    className="py-1.5 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors"
                  >
                    + Custom
                  </button>
                  <button
                    onClick={() => openWooModal(pool)}
                    className="py-1.5 text-xs font-semibold bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 border border-purple-200 transition-colors"
                  >
                    + Woo
                  </button>
                </div>

                {/* Card Footer (Status Toggle) */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                  {pool.kyc_status === "approved" ? (
                    <button
                      onClick={() => handleToggleStatus(pool)}
                      className={`w-full px-4 py-2 text-sm font-semibold rounded-xl shadow-sm transition-all duration-200 focus:outline-none ${
                        isActive
                          ? "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300"
                          : "bg-white text-green-600 border border-green-200 hover:bg-green-50 hover:border-green-300"
                      }`}
                    >
                      {isActive ? "Deactivate Business" : "Activate Business"}
                    </button>
                  ) : (
                    <div className="w-full text-center py-2 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="text-xs font-semibold text-gray-500">
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
                setPage(1);
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
                className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <AnimatePresence>
        {/* Existing Pool Modal */}
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

        {/* WooCommerce Connect Modal */}
        {showWoo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-black">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  Connect WooCommerce
                </h3>
                <button
                  onClick={() => setShowWoo(false)}
                  className="text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Pool
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm font-semibold">
                    {targetPool?.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={wooName}
                    onChange={(e) => setWooName(e.target.value)}
                    placeholder="e.g., My Woo Store - US"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store URL
                  </label>
                  <input
                    type="url"
                    value={storeUrl}
                    onChange={(e) => setStoreUrl(e.target.value)}
                    placeholder="https://yourstore.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowWoo(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectWooCommerce}
                    disabled={isWooConnecting}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isWooConnecting ? "Connecting..." : "Connect Store"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showChannelModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm text-black">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">
                  Add {channelType === "shopify" ? "Shopify" : "Channel"}{" "}
                  Account
                </h3>
                <button
                  onClick={() => setShowChannelModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleCreateChannel} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Pool
                  </label>
                  {targetPool ? (
                    <div className="flex justify-between items-center w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm font-semibold">
                      <span>{targetPool.name}</span>
                      {/* Allow them to clear and change it if needed */}
                      <button
                        type="button"
                        onClick={() => setTargetPool(null)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <select
                      required
                      onChange={(e) => {
                        const selected = poolItems.find(
                          (item) => item.pool._id === e.target.value
                        )?.pool;
                        setTargetPool(selected || null);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="">Select a Business Account...</option>
                      {poolItems.map((item) => (
                        <option key={item.pool._id} value={item.pool._id}>
                          {item.pool.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    required
                    placeholder="e.g., Main Shopify Store"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Channel
                  </label>
                  <select
                    value={selectedChannelId}
                    onChange={(e) => setSelectedChannelId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    <option value="" disabled>
                      Select Channel
                    </option>
                    {channels
                      .filter((c) =>
                        channelType === "shopify"
                          ? c.channel_name.toLowerCase() === "shopify"
                          : c.channel_name.toLowerCase() !== "shopify" &&
                            c.channel_name.toLowerCase() !== "woocommerce"
                      )
                      .map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.channel_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="border-t border-gray-200 pt-4 mt-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Automation Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(automation).map((key) => (
                      <label
                        key={key}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={automation[key as keyof typeof automation]}
                          onChange={(e) =>
                            setAutomation({
                              ...automation,
                              [key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowChannelModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

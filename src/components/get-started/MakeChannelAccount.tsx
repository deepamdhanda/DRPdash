import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  FaExternalLinkAlt,
  FaShopify,
  FaTimes,
  FaCheck,
  FaInfoCircle,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// Update these imports to match your project's directory structure
import { createChannelAccount } from "../../APIs/user/channelAccount";
import { getAllChannels } from "../../APIs/user/channel";
import { getAllPools } from "../../APIs/user/pool";
import { initialChannelAccountFetch } from "../../APIs/user/initialChannelAccountFetch";

type Automation = {
  auto_ship: boolean;
  auto_ai_recommendation: boolean;
  auto_address_confirm: boolean;
  auto_ai_rating: boolean;
};

export interface ChannelAccount {
  _id?: string;
  channel_account_name: string;
  pool_id?: { _id: string; name: string };
  channel_id?: { _id: string; channel_name: string };
  keys?: Record<string, any>;
  fulfillment_type?: "Self" | "Optional" | "Channel" | "Other";
  status: "active" | "inactive" | "suspended";
  automation?: Automation;
  admins?: Array<{ _id: string; name: string }>;
  created_by?: string;
  ownership?: { _id: string; name: string };
  createdAt?: string;
}

const MakeChannelAccount: React.FC<{ handleNext: () => void }> = ({
  handleNext,
}) => {
  const [channels, setChannels] = useState<any[]>([]);
  const [pools, setPools] = useState<any[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<string>("");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [channelAccountName, setChannelAccountName] = useState<string>("");
  const [keys, setKeys] = useState<
    { key: string; value: string; disabled?: boolean }[]
  >([{ key: "", value: "" }]);
  const [selectedPoolAdmins, setSelectedPoolAdmins] = useState<any[]>([]);
  const [adminAccess, setAdminAccess] = useState<string[]>([]);
  const [automation, setAutomation] = useState<Automation>({
    auto_ship: true,
    auto_ai_recommendation: true,
    auto_address_confirm: true,
    auto_ai_rating: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [showFetchingModal, setShowFetchingModal] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [fetchingOrders, setFetchingOrders] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [channelsData, poolsData] = await Promise.all([
          getAllChannels(),
          getAllPools(),
        ]);
        setChannels(channelsData || []);
        channelsData.find((c: any) => {
          if (c.channel_name === "Custom") {
            setSelectedChannelId(c._id);
          }
        });
        setPools(poolsData?.data || []);
      } catch (err) {
        console.error("Failed to load channels/pools", err);
      }
    })();
  }, []);

  const handlePoolChange = (poolId: string) => {
    setSelectedPoolId(poolId);
    const selectedPool = pools.find((p) => p._id === poolId);
    setSelectedPoolAdmins(selectedPool?.admins || []);
    setAdminAccess([]);
  };

  const canSubmit = useMemo(() => {
    if (!channelAccountName.trim()) return false;
    if (!selectedPoolId) return false;
    if (!selectedChannelId) return false;
    return true;
  }, [channelAccountName, selectedPoolId, selectedChannelId]);

  const startInitialChannelAccountFetch = async (channelAccountId?: string) => {
    if (!channelAccountId) return;
    setShowFetchingModal(true);
    setFetchingProducts(true);
    setFetchingOrders(true);

    try {
      await Promise.all([
        initialChannelAccountFetch(channelAccountId, "products")
          .then(() => setFetchingProducts(false))
          .catch(() => setFetchingProducts(false)),
        initialChannelAccountFetch(channelAccountId, "orders")
          .then(() => setFetchingOrders(false))
          .catch(() => setFetchingOrders(false)),
      ]);
    } finally {
      setTimeout(() => setShowFetchingModal(false), 800);
    }
  };

  const handleAdminToggle = (adminId: string) => {
    setAdminAccess((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    const keysObject: Record<string, any> = {};
    keys.forEach(({ key, value }) => {
      if (key.trim()) keysObject[key.trim()] = value;
    });

    const formData: ChannelAccount = {
      channel_account_name: channelAccountName.trim(),
      pool_id: pools.find((p) => p._id === selectedPoolId),
      channel_id: channels.find((c) => c._id === selectedChannelId),
      fulfillment_type: "Self",
      keys: keysObject,
      status: "active",
      admins: selectedPoolAdmins
        .filter((a) => adminAccess.includes(a._id))
        .map((a) => a._id),
      automation,
    };

    try {
      const result: any = await createChannelAccount(formData);
      channels.find((c) => c._id === selectedChannelId)?.channel_name !==
        "Custom" &&
        (await startInitialChannelAccountFetch(result?._id || result));
      handleNext();
    } catch (err) {
      console.error("Error creating channel account", err);
      toast.error("Failed to create channel account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Reusable Modern Toggle
  const ModernToggle = ({ id, label, checked, onChange, description }: any) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {description && (
          <span className="text-xs text-gray-500 mt-0.5">{description}</span>
        )}
      </div>
      <label
        htmlFor={id}
        className="relative inline-flex items-center cursor-pointer shrink-0"
      >
        <input
          type="checkbox"
          id={id}
          className="sr-only peer"
          checked={checked}
          onChange={onChange}
        />
        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-orange-100 peer-checked:bg-orange-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
      </label>
    </div>
  );

  return (
    <div className=" mx-auto">
      {/* Header Section */}
      <div className="mb-8 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Add Channel Account
        </h2>
        <p className="mt-2 text-gray-500 text-sm">
          Connect your sales channels to streamline your fulfillment and sync
          orders instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Shopify Integration Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-emerald-600">
              <FaShopify size={28} />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                Connect via Shopify
              </h4>
              <p className="text-sm text-gray-600">
                Secure, OAuth-based connection for immediate sync.
              </p>
            </div>
          </div>
          <a
            href="https://apps.shopify.com/app7"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex  items-center justify-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white! text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow active:scale-95 focus:ring-4 focus:ring-emerald-200"
          >
            Install App <FaExternalLinkAlt className="ml-2 w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Details (Left Col) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                General Information
              </h3>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="accountName"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Account Name
                  </label>
                  <input
                    id="accountName"
                    type="text"
                    placeholder="e.g. My Awesome Store"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                    value={channelAccountName}
                    onChange={(e) => setChannelAccountName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="poolSelect"
                    className="block text-sm font-semibold text-gray-700 mb-1.5"
                  >
                    Select Pool
                  </label>
                  <select
                    id="poolSelect"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 appearance-none"
                    value={selectedPoolId}
                    onChange={(e) => handlePoolChange(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choose a routing pool...
                    </option>
                    {pools.map((pool) => (
                      <option key={pool._id} value={pool._id}>
                        {pool.pool.name}
                      </option>
                    ))}
                  </select>
                </div>

                <AnimatePresence>
                  {selectedPoolAdmins.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Admin Access
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedPoolAdmins.map((admin) => {
                          const isSelected = adminAccess.includes(admin._id);
                          return (
                            <button
                              type="button"
                              key={admin._id}
                              onClick={() => handleAdminToggle(admin._id)}
                              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                isSelected
                                  ? "bg-orange-50 border-orange-200 text-orange-700 shadow-sm"
                                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div
                                className={`mr-2 w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                                  isSelected
                                    ? "bg-orange-600 text-white"
                                    : "border-2 border-gray-300"
                                }`}
                              >
                                {isSelected && <FaCheck size={10} />}
                              </div>
                              {admin.name}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Automation & Settings (Right Col) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Automation Rules
              </h3>

              <div className="flex flex-col">
                <ModernToggle
                  id="auto_ai_rating"
                  label="AI Customer Rating"
                  description="Evaluate risk based on history"
                  checked={automation.auto_ai_rating}
                  onChange={(e: any) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_ai_rating: e.target.checked,
                    }))
                  }
                />
                <ModernToggle
                  id="auto_address_confirm"
                  label="Auto Order Confirmation"
                  description="Verify addresses automatically"
                  checked={automation.auto_address_confirm}
                  onChange={(e: any) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_address_confirm: e.target.checked,
                    }))
                  }
                />
                <ModernToggle
                  id="auto_ai_recommendation"
                  label="Smart Courier Select"
                  description="AI chooses best delivery partner"
                  checked={automation.auto_ai_recommendation}
                  onChange={(e: any) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_ai_recommendation: e.target.checked,
                    }))
                  }
                />
                <ModernToggle
                  id="auto_ship"
                  label="Auto Shipment Book"
                  description="Book instantly on order import"
                  checked={automation.auto_ship}
                  onChange={(e: any) =>
                    setAutomation((a) => ({
                      ...a,
                      auto_ship: e.target.checked,
                    }))
                  }
                />
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start">
                  <FaInfoCircle className="text-slate-400 mt-0.5 mr-3 flex-shrink-0" />
                  <div className="text-xs text-slate-600 space-y-2">
                    <p>
                      <strong>Heads up:</strong> Manual keys for custom channels
                      can be updated later from the integrations tab.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="button"
            className="px-6 py-3 text-sm font-semibold text-gray-600 bg-transparent hover:bg-gray-100 rounded-xl transition-colors"
            onClick={() => {
              setChannelAccountName("");
              setKeys([{ key: "", value: "" }]);
              setSelectedPoolId("");
            }}
          >
            Reset Form
          </button>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="inline-flex items-center justify-center px-8 py-3 text-sm font-semibold text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-md hover:shadow-lg focus:ring-4 focus:ring-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {submitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      {/* Fetching Progress Modal */}
      <AnimatePresence>
        {showFetchingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                    Syncing Store
                  </h3>
                  <button
                    onClick={() => setShowFetchingModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                  >
                    <FaTimes size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      fetchingProducts
                        ? "bg-amber-50 border-amber-100"
                        : "bg-emerald-50 border-emerald-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">📦</span>
                      <strong className="text-sm text-gray-800">
                        Products Sync
                      </strong>
                    </div>
                    {fetchingProducts ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    ) : (
                      <FaCheck className="text-emerald-500" />
                    )}
                  </div>

                  <div
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      fetchingOrders
                        ? "bg-amber-50 border-amber-100"
                        : "bg-emerald-50 border-emerald-100"
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-xl mr-3">🚚</span>
                      <strong className="text-sm text-gray-800">
                        Orders Sync
                      </strong>
                    </div>
                    {fetchingOrders ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                      </span>
                    ) : (
                      <FaCheck className="text-emerald-500" />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MakeChannelAccount;

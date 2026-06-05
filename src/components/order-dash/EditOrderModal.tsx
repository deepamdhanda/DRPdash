import React from "react";
import { FaStore, FaBriefcase, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

interface EditOrderModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editOrder: any;
  setEditOrder: React.Dispatch<React.SetStateAction<any>>;
  bestAddress?: string;
  hasValue: (val: any) => boolean;
  pincodeDetails: (data: { pincode: string }) => Promise<any>;
  toast: any;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  show,
  onHide,
  onSubmit,
  editOrder,
  setEditOrder,
  bestAddress,
  hasValue,
  pincodeDetails,
  toast,
}) => {
  // --- Handlers ---
  const handleInputChange = (field: string, value: string) => {
    setEditOrder((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = String(e.target.value || "");
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    handleInputChange("customer_phone", digits ? `91${digits}` : "");
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pincode = e.target.value;
    handleInputChange("shipping_pincode", pincode);

    if (!/^\d{6}$/.test(pincode)) return;

    try {
      const data = await pincodeDetails({ pincode });
      if (Array.isArray(data) && data.length > 0) {
        const postOffice = data[0];
        setEditOrder((prev: any) => ({
          ...prev,
          shipping_city: postOffice?.district || "",
          shipping_state: postOffice?.statename || "",
          shipping_country: "India",
        }));
      } else {
        setEditOrder((prev: any) => ({
          ...prev,
          shipping_city: "",
          shipping_state: "",
        }));
      }
    } catch (error) {
      toast.error("Invalid Pincode or Pincode not found");
    }
  };

  // --- Formatting Helpers ---
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString)
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", " -");
  };

  const calculateAmount = () => {
    if (editOrder?.first_line_item_price && editOrder?.quantity) {
      return Number(editOrder.first_line_item_price) * editOrder.quantity;
    }
    return editOrder?.total_amount || "—";
  };

  const isCOD = editOrder?.payment_method?.toLowerCase().includes("cod");

  // Remittance Status Badge Color Map
  const getRemittanceColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "completed":
        return "bg-green-500";
      case "processing":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!editOrder) return null;

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto text-black">
          {/* Background click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={onHide}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
          >
            <form onSubmit={onSubmit} className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Edit Order #{editOrder?.order_id || "—"}
                </h2>
                <button
                  type="button"
                  onClick={onHide}
                  className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-4 overflow-y-auto flex-1 font-[Hiragino_Maru_Gothic_ProN_W4]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* --- Order Info Card --- */}
                  <div className="border border-[#F5891E] rounded-xl p-4 bg-white shadow-sm text-[13px] text-[#000434]">
                    <div className="font-semibold">
                      <span className="text-[#F5891E]">
                        #{editOrder?.order_id || "—"}
                      </span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {formatDate(editOrder?.createdAt)}
                    </div>

                    <div className="pt-3 space-y-1">
                      <div className="flex items-center">
                        <FaStore className="mr-2 text-gray-500" />
                        <span>
                          {editOrder?.channel_account_name || "—"}
                          {hasValue(editOrder?.store_order_id) && (
                            <span className="group relative inline-block ml-1">
                              -{" "}
                              <span className="text-blue-600 font-medium cursor-pointer">
                                {String(editOrder?.store_order_id).trim()}
                              </span>
                              {/* Store ID Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-xs p-2 rounded z-10 shadow-lg">
                                Store Order ID:{" "}
                                {String(editOrder?.store_order_id).trim()}
                                <br />
                                Channel Order ID:{" "}
                                {String(editOrder?.channel_order_id).trim()}
                              </div>
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <FaBriefcase className="mr-2 text-gray-500" />
                        <span>{editOrder?.pool_name || "—"}</span>
                      </div>
                    </div>
                  </div>

                  {/* --- Product Info & AI Card --- */}
                  <div className="flex gap-2">
                    <div className="flex-1 border border-[#F5891E] rounded-xl p-4 bg-white shadow-sm text-[11px] leading-tight text-[#000434]">
                      <div className="font-semibold text-[12px] underline mb-1">
                        {hasValue(editOrder?.product_name) ? (
                          <div className="group relative inline-block">
                            <span className="cursor-pointer">
                              {String(editOrder?.product_name)}
                            </span>
                            {/* Product Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs whitespace-normal bg-gray-800 text-white text-xs p-2 rounded z-10 shadow-lg text-center">
                              {String(editOrder?.product_name)}
                              <br />
                              <span className="text-gray-300">
                                ID: {editOrder?.product_sku_id || "—"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </div>

                      <div className="italic text-gray-600 mb-1">
                        SKU:{" "}
                        {editOrder?.product_sku_id ? (
                          <span className="cursor-pointer">
                            {String(editOrder?.product_sku_id)}
                          </span>
                        ) : (
                          "—"
                        )}
                      </div>

                      <div className="font-medium">
                        Qty:{" "}
                        <span className="text-[#000434]">
                          {editOrder?.quantity || "—"} pcs
                        </span>
                      </div>

                      <div className="font-medium">
                        Amt:{" "}
                        <span
                          className={isCOD ? "text-red-500" : "text-green-600"}
                        >
                          ₹{calculateAmount()} ({isCOD ? "COD" : "Prepaid"})
                        </span>
                      </div>

                      {editOrder?.remittance_status &&
                        editOrder?.remittance_status !== "NA" && (
                          <span
                            className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-semibold text-white rounded uppercase ${getRemittanceColor(
                              editOrder.remittance_status
                            )}`}
                          >
                            {editOrder?.remittance_status}
                          </span>
                        )}
                    </div>

                    {/* --- AI Recommended Address --- */}
                    {bestAddress && (
                      <div className="w-[40%] flex flex-col items-center justify-center bg-white border-[1.5px] border-[#F5891E] rounded-xl p-3 font-semibold text-sm text-[#000434] text-center shadow-sm">
                        <div className="bg-linear-to-br from-[#F5891E] to-[#000434] text-white px-3 py-1 rounded-full text-[11px] flex items-center gap-1.5 shadow mb-2">
                          <span>🤖</span> OU AI Recommended
                        </div>
                        <div className="text-[12px] mb-2 leading-snug">
                          🏠 <b>{bestAddress}</b>
                        </div>
                        <div className="bg-[#000434] text-white text-[11px] rounded-full px-2.5 py-1 font-medium shadow-[0_0_8px_#F5891E] w-fit select-none">
                          🔄 RTO Risk:{" "}
                          <span className="text-[#F5891E] font-bold">~10%</span>{" "}
                          (Low)
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <hr className="my-6 border-gray-200" />

                {/* --- Form Inputs --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5891E]/50 focus:border-[#F5891E] transition-all"
                      value={editOrder?.customer_name || ""}
                      onChange={(e) =>
                        handleInputChange("customer_name", e.target.value)
                      }
                      placeholder="Enter Customer Name"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Customer Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={10}
                        className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5891E]/50 focus:border-[#F5891E] transition-all"
                        value={
                          editOrder?.customer_phone
                            ? String(editOrder.customer_phone)
                                .replace(/^91/, "")
                                .slice(0, 10)
                            : ""
                        }
                        onChange={handlePhoneChange}
                        placeholder="Enter 10-digit Phone Number"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Customer Address
                    </label>
                    <input
                      type="text"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5891E]/50 focus:border-[#F5891E] transition-all"
                      value={editOrder?.shipping_address || ""}
                      onChange={(e) =>
                        handleInputChange("shipping_address", e.target.value)
                      }
                      placeholder="Enter Customer Address"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Customer Pin Code
                    </label>
                    <input
                      type="number"
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5891E]/50 focus:border-[#F5891E] transition-all"
                      value={editOrder?.shipping_pincode || ""}
                      onChange={handlePincodeChange}
                      placeholder="Enter 6-digit Pin Code"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Customer City
                    </label>
                    <input
                      type="text"
                      disabled
                      className="border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                      value={editOrder?.shipping_city || ""}
                      placeholder="Auto-filled via Pincode"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-medium text-gray-700">
                      Customer State
                    </label>
                    <input
                      type="text"
                      disabled
                      className="border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm cursor-not-allowed"
                      value={editOrder?.shipping_state || ""}
                      placeholder="Auto-filled via Pincode"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
                <button
                  type="button"
                  onClick={onHide}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

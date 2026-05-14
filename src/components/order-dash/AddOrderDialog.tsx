import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  MapPin,
  Store,
  CreditCard,
  User,
  Box,
} from "lucide-react";

import { pincodeDetails } from "../../APIs/pincodeAPIs";

// --- Types ---
export interface OrderItem {
  product: string;
  quantity: number;
}

export interface OrderFormData {
  channel_id: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_pincode: string | number;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  total_amount: number | string;
  items: OrderItem[];
}

export interface AddOrderModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (formData: OrderFormData) => Promise<void>;
  dropdownOptions: {
    channels: Array<{ _id: string; channel_account_name: string }>;
    products: Array<{ _id: string; product_sku_name: string }>;
  };
}

const initialFormState: OrderFormData = {
  channel_id: "",
  payment_method: "",
  customer_name: "",
  customer_phone: "",
  shipping_address: "",
  shipping_pincode: "",
  shipping_city: "",
  shipping_state: "",
  shipping_country: "India",
  total_amount: "",
  items: [{ product: "", quantity: 1 }],
};

const AddOrderModal: React.FC<AddOrderModalProps> = ({
  show,
  onClose,
  onSubmit,
  dropdownOptions,
}) => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setFormData(initialFormState);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  // --- Handlers ---
  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(-10);
    if (digits.length === 10) {
      handleInputChange("customer_phone", `91${digits}`);
    } else {
      handleInputChange("customer_phone", digits); // Store raw typing until 10 digits are hit
    }
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pincode = e.target.value;
    handleInputChange("shipping_pincode", pincode);

    if (/^\d{6}$/.test(pincode)) {
      try {
        const data = await pincodeDetails({ pincode });
        if (data?.[0]) {
          setFormData((prev) => ({
            ...prev,
            shipping_city: data[0].district,
            shipping_state: data[0].statename,
            shipping_country: "India",
          }));
        }
      } catch (error) {
        toast.error("Pincode not found");
      }
    }
  };

  // --- Items Array Handlers ---
  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleInputChange("items", updatedItems);
  };

  const handleAddItem = () => {
    handleInputChange("items", [
      ...formData.items,
      { product: "", quantity: 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange("items", updatedItems);
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.some((item) => !item.product)) {
      return toast.error("Please select a product for all items.");
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] block p-3 outline-none transition-all placeholder:text-slate-400";
  const labelClass =
    "block mb-1.5 text-[13px] font-bold text-slate-700 tracking-wide";

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white z-10 shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Add Manual Order
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Create a new order directly into the system.
                </p>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
              <form
                id="add-order-form"
                onSubmit={handleSubmit}
                className="space-y-8"
              >
                {/* Section: Order Basics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <Store size={14} className="text-slate-400" /> Channel
                        Account
                      </span>
                    </label>
                    <select
                      required
                      value={formData.channel_id}
                      onChange={(e) =>
                        handleInputChange("channel_id", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select a Channel Account
                      </option>
                      {dropdownOptions.channels.map((account) => (
                        <option key={account._id} value={account._id}>
                          {account.channel_account_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>
                      <span className="flex items-center gap-1.5">
                        <CreditCard size={14} className="text-slate-400" />{" "}
                        Payment Method
                      </span>
                    </label>
                    <select
                      required
                      value={formData.payment_method}
                      onChange={(e) =>
                        handleInputChange("payment_method", e.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="" disabled>
                        Select Method
                      </option>
                      <option value="COD">COD - Cash on Delivery</option>
                      <option value="PREPAID">Prepaid</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* Section: Customer Details */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <User size={16} className="text-[#F5891E]" /> Customer
                    Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.customer_name}
                        onChange={(e) =>
                          handleInputChange("customer_name", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone Number</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          placeholder="9876543210"
                          value={formData.customer_phone.replace(/^91/, "")}
                          onChange={handlePhoneChange}
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* Section: Shipping Address */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={16} className="text-[#F5891E]" /> Shipping
                    Address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-12">
                      <label className={labelClass}>Full Address</label>
                      <input
                        type="text"
                        required
                        placeholder="Street, Landmark, Apartment"
                        value={formData.shipping_address}
                        onChange={(e) =>
                          handleInputChange("shipping_address", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className={labelClass}>Pincode</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="6 Digit Pincode"
                        value={formData.shipping_pincode}
                        onChange={handlePincodeChange}
                        className={inputClass}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className={labelClass}>City</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Auto-filled via Pincode"
                        value={formData.shipping_city}
                        className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`}
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className={labelClass}>State</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Auto-filled via Pincode"
                        value={formData.shipping_state}
                        className={`${inputClass} bg-slate-100 text-slate-500 cursor-not-allowed`}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100"></div>

                {/* Section: Order Items */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Box size={16} className="text-[#F5891E]" /> Order Items
                  </h3>

                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {formData.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col sm:flex-row items-end gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm"
                        >
                          <div className="flex-1 w-full">
                            <label className="block mb-1 text-[12px] font-bold text-slate-600">
                              Product SKU
                            </label>
                            <select
                              required
                              value={item.product}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "product",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                            >
                              <option value="" disabled>
                                Select a Product
                              </option>
                              {dropdownOptions.products.map((sku) => (
                                <option key={sku._id} value={sku._id}>
                                  {sku.product_sku_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="w-full sm:w-32 shrink-0">
                            <label className="block mb-1 text-[12px] font-bold text-slate-600">
                              Quantity
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className={inputClass}
                            />
                          </div>

                          {formData.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="w-full sm:w-auto h-11 px-4 flex justify-center items-center gap-2 rounded-xl border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-colors shrink-0"
                            >
                              <Trash2 size={16} />
                              <span className="sm:hidden font-medium">
                                Remove Item
                              </span>
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="mt-4 flex items-center gap-2 text-sm font-bold text-[#F5891E] bg-orange-50 hover:bg-orange-100 px-4 py-2.5 rounded-lg transition-colors border border-orange-200 border-dashed"
                  >
                    <Plus size={16} /> Add Another Item
                  </button>
                </div>

                {/* Section: Total */}
                <div>
                  <label className="block mb-2 text-sm font-bold text-slate-900">
                    Total Order Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="0.00"
                      value={formData.total_amount}
                      onChange={(e) =>
                        handleInputChange(
                          "total_amount",
                          Number(e.target.value)
                        )
                      }
                      className={`${inputClass} pl-8 text-lg font-bold text-[#F5891E] h-14`}
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="add-order-form"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] shadow-[0_2px_10px_rgba(245,137,30,0.3)] hover:shadow-[0_4px_14px_rgba(245,137,30,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Creating...
                  </>
                ) : (
                  "Create Order"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddOrderModal;

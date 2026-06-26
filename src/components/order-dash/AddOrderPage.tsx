import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  MapPin,
  Store,
  CreditCard,
  User,
  Box,
  Tag,
  Truck,
  Receipt,
  Check,
  AlertCircle,
  Banknote,
  ShieldCheck,
  Loader2,
  PackageSearch,
} from "lucide-react";

import { pincodeDetails } from "../../APIs/pincodeAPIs";
import { createOrder } from "../../APIs/user/order";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/user";

// ───────────────────────── Types ─────────────────────────
export interface OrderItem {
  product: string;
  quantity: number;
  unit_price: number;
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
  items: OrderItem[];
  tax_percent: number;
  shipping_charges: number;
  discount: number;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
}

type FieldErrors = Partial<{
  channel_id: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_pincode: string;
  items: string;
}>;

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
  items: [{ product: "", quantity: 1, unit_price: 0 }],
  tax_percent: 18,
  shipping_charges: 0,
  discount: 0,
  subtotal: 0,
  tax_amount: 0,
  total_amount: 0,
};

// Required fields tracked for the completion rail in the header.
const getCompletionChecks = (formData: OrderFormData) => [
  { key: "channel", label: "Channel", done: !!formData.channel_id },
  { key: "payment", label: "Payment", done: !!formData.payment_method },
  { key: "name", label: "Customer name", done: !!formData.customer_name.trim() },
  {
    key: "phone",
    label: "Phone number",
    done: formData.customer_phone.replace(/^91/, "").length === 10,
  },
  { key: "address", label: "Address", done: !!formData.shipping_address.trim() },
  {
    key: "pincode",
    label: "Pincode",
    done: /^\d{6}$/.test(String(formData.shipping_pincode)),
  },
  {
    key: "items",
    label: "Order items",
    done: formData.items.length > 0 && formData.items.every((i) => !!i.product),
  },
];

const currency = (value: number) =>
  `₹${(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const AddOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<OrderFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "loading" | "found" | "error">(
    "idle"
  );

  const [channelAccounts, setChannelAccounts] = useState<
    Array<{ _id: string; channel_account_name: string }>
  >([]);
  const [productSKUs, setProductSKUs] = useState<
    Array<{
      _id: string;
      product_sku_name: string;
      // Price may come from the backend under different field names depending
      // on what the API returns — we check all of them when reading the price.
      price?: number;
      unit_price?: number;
      selling_price?: number;
    }>
  >([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState(false);

  const pincodeDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchDropdownOptions = async () => {
    setLoadingOptions(true);
    setOptionsError(false);
    try {
      const [channelRes, productRes] = await Promise.all([
        appAxios.get(`${channelAccounts_url}?limit=1000`),
        getAllProductSKUs(),
      ]);
      setChannelAccounts(channelRes.data?.data || []);
      setProductSKUs(productRes.data || []);
    } catch (err) {
      console.error("Error fetching dropdown options:", err);
      setOptionsError(true);
      toast.error("Couldn't load channels or products. Check your connection and retry.");
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    fetchDropdownOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ───────────── Live pricing calculations ─────────────
  const subtotal = formData.items.reduce(
    (sum, item) => sum + (item.unit_price || 0) * (item.quantity || 0),
    0
  );
  const taxAmount = (subtotal * formData.tax_percent) / 100;
  const grandTotal =
    subtotal + taxAmount + (formData.shipping_charges || 0) - (formData.discount || 0);

  // ───────────── Completion tracking ─────────────
  const completionChecks = useMemo(() => getCompletionChecks(formData), [formData]);
  const completedCount = completionChecks.filter((c) => c.done).length;
  const completionPercent = Math.round((completedCount / completionChecks.length) * 100);
  const isFormComplete = completedCount === completionChecks.length;

  // ───────────── Validation ─────────────
  const validate = (data: OrderFormData): FieldErrors => {
    const next: FieldErrors = {};
    if (!data.channel_id) next.channel_id = "Select a channel account.";
    if (!data.payment_method) next.payment_method = "Choose a payment method.";
    if (!data.customer_name.trim()) next.customer_name = "Customer name is required.";
    if (data.customer_phone.replace(/^91/, "").length !== 10)
      next.customer_phone = "Enter a valid 10-digit phone number.";
    if (!data.shipping_address.trim()) next.shipping_address = "Shipping address is required.";
    if (!/^\d{6}$/.test(String(data.shipping_pincode)))
      next.shipping_pincode = "Enter a valid 6-digit pincode.";
    if (data.items.length === 0 || data.items.some((i) => !i.product))
      next.items = "Select a product for every line item.";
    return next;
  };

  useEffect(() => {
    if (attemptedSubmit) {
      setErrors(validate(formData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, attemptedSubmit]);

  const markTouched = (field: string) => setTouched((prev) => ({ ...prev, [field]: true }));
  const showError = (field: keyof FieldErrors) =>
    (touched[field] || attemptedSubmit) && errors[field];

  // ───────────── Handlers ─────────────
  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(-10);
    if (digits.length === 10) {
      handleInputChange("customer_phone", `91${digits}`);
    } else {
      handleInputChange("customer_phone", digits);
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pincode = e.target.value.replace(/\D/g, "").slice(0, 6);
    handleInputChange("shipping_pincode", pincode);

    if (pincodeDebounceRef.current) clearTimeout(pincodeDebounceRef.current);

    if (!/^\d{6}$/.test(pincode)) {
      setPincodeStatus("idle");
      return;
    }

    setPincodeStatus("loading");
    pincodeDebounceRef.current = setTimeout(async () => {
      try {
        const data = await pincodeDetails({ pincode });
        if (data?.[0]) {
          setFormData((prev) => ({
            ...prev,
            shipping_city: data[0].district,
            shipping_state: data[0].statename,
            shipping_country: "India",
          }));
          setPincodeStatus("found");
        } else {
          setPincodeStatus("error");
        }
      } catch {
        setPincodeStatus("error");
        toast.error("Pincode not found");
      }
    }, 350);
  };

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleInputChange("items", updatedItems);
  };

  // When a product is selected, pull its price from the backend SKU data
  // instead of letting the user type it in. Unit price is no longer
  // user-editable — it's whatever the catalog says.
  const handleProductSelect = (index: number, productId: string) => {
    const selectedSku = productSKUs.find((sku) => sku._id === productId);
    const skuPrice =
      selectedSku?.price ?? selectedSku?.unit_price ?? selectedSku?.selling_price ?? 0;

    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      product: productId,
      unit_price: skuPrice,
    };
    handleInputChange("items", updatedItems);
  };

  const handleAddItem = () => {
    handleInputChange("items", [
      ...formData.items,
      { product: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange("items", updatedItems);
  };

  const handleBack = () => {
    if (isSubmitting) return;
    navigate("/user/order-dash");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    const validationErrors = validate(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fix the highlighted fields before continuing.");
      const firstErrorField = document.querySelector("[data-error='true']");
      firstErrorField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createOrder({
        ...formData,
        subtotal,
        tax_amount: taxAmount,
        total_amount: grandTotal,
      });
      toast.success("Order created successfully");
      navigate("/user/order-dash");
    } catch (error: any) {
      toast.error("Error creating order: " + (error?.message || "Something went wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────── Shared style tokens ─────────────
  const baseInput =
    "w-full bg-white border text-slate-900 text-sm rounded-xl block p-3 outline-none transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed";
  const inputClass = (hasError?: boolean) =>
    `${baseInput} ${
      hasError
        ? "border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400"
        : "border-slate-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-400"
    }`;
  const labelClass = "block mb-1.5 text-[12px] font-bold text-slate-500 tracking-wide uppercase";
  const sectionCardClass =
    "bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] p-6";

  const FieldError = ({ message }: { message?: string }) =>
    message ? (
      <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-red-500">
        <AlertCircle size={12} />
        {message}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-[#FBFAF8]">
      {/* ───────── Sticky Page Header with completion rail ───────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between px-4 sm:px-6 py-5 max-w-6xl mx-auto gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              aria-label="Back to orders"
              className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors disabled:opacity-50 shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">
                Add Manual Order
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate">
                Create a new order directly into the system.
              </p>
            </div>
          </div>

          {/* Completion indicator */}
          <div className="hidden sm:flex items-center gap-3 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Progress
                </span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    isFormComplete ? "text-emerald-600" : "text-orange-600"
                  }`}
                >
                  {completedCount}/{completionChecks.length}
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={completionPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden"
              >
                <motion.div
                  className={`h-full rounded-full ${
                    isFormComplete
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-[#F97C2A] to-[#FB923C]"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercent}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Page Body */}
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto pb-32">
        {optionsError && (
          <div className="mb-6 flex items-center justify-between gap-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle size={16} />
              Couldn't load channels or products.
            </span>
            <button
              type="button"
              onClick={fetchDropdownOptions}
              className="font-bold text-red-700 hover:text-red-900 underline underline-offset-2 shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <form id="add-order-form" onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* ── Channel + Payment ── */}
          <div className={`${sectionCardClass} grid grid-cols-1 md:grid-cols-2 gap-6`}>
            <div data-error={!!showError("channel_id")}>
              <label className={labelClass} htmlFor="channel_id">
                <span className="flex items-center gap-1.5">
                  <Store size={13} className="text-orange-400" /> Channel Account
                </span>
              </label>
              <select
                id="channel_id"
                required
                disabled={loadingOptions}
                value={formData.channel_id}
                onChange={(e) => handleInputChange("channel_id", e.target.value)}
                onBlur={() => markTouched("channel_id")}
                aria-invalid={!!showError("channel_id")}
                className={inputClass(!!showError("channel_id"))}
              >
                <option value="" disabled>
                  {loadingOptions ? "Loading channels..." : "Select a Channel Account"}
                </option>
                {channelAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.channel_account_name}
                  </option>
                ))}
              </select>
              <FieldError message={showError("channel_id") ? errors.channel_id : undefined} />
            </div>

            <div data-error={!!showError("payment_method")}>
              <label className={labelClass}>
                <span className="flex items-center gap-1.5">
                  <CreditCard size={13} className="text-orange-400" /> Payment Method
                </span>
              </label>
              <div className="flex gap-3" role="radiogroup" aria-label="Payment method">
                {(
                  [
                    { value: "COD", label: "Cash on Delivery", Icon: Banknote },
                    { value: "PREPAID", label: "Prepaid", Icon: ShieldCheck },
                  ] as const
                ).map(({ value, label, Icon }) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={formData.payment_method === value}
                    onClick={() => {
                      handleInputChange("payment_method", value);
                      markTouched("payment_method");
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 transition-all ${
                      formData.payment_method === value
                        ? "border-[#F97C2A] bg-orange-50 text-[#F97C2A] shadow-[0_1px_0_rgba(249,124,42,0.15)_inset]"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-orange-200 hover:bg-orange-50/40"
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
              <FieldError
                message={showError("payment_method") ? errors.payment_method : undefined}
              />
            </div>
          </div>

          {/* ── Customer Details ── */}
          <div className={sectionCardClass}>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-50 text-[#F97C2A]">
                <User size={13} />
              </span>
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-error={!!showError("customer_name")}>
                <label className={labelClass} htmlFor="customer_name">
                  Full Name
                </label>
                <input
                  id="customer_name"
                  type="text"
                  required
                  placeholder="John Doe"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange("customer_name", e.target.value)}
                  onBlur={() => markTouched("customer_name")}
                  aria-invalid={!!showError("customer_name")}
                  className={inputClass(!!showError("customer_name"))}
                />
                <FieldError
                  message={showError("customer_name") ? errors.customer_name : undefined}
                />
              </div>
              <div data-error={!!showError("customer_phone")}>
                <label className={labelClass} htmlFor="customer_phone">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    id="customer_phone"
                    type="tel"
                    required
                    inputMode="numeric"
                    placeholder="9876543210"
                    value={formData.customer_phone.replace(/^91/, "")}
                    onChange={handlePhoneChange}
                    onBlur={() => markTouched("customer_phone")}
                    aria-invalid={!!showError("customer_phone")}
                    className={`${inputClass(!!showError("customer_phone"))} pl-10`}
                  />
                </div>
                <FieldError
                  message={showError("customer_phone") ? errors.customer_phone : undefined}
                />
              </div>
            </div>
          </div>

          {/* ── Shipping Address ── */}
          <div className={sectionCardClass}>
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
              <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-50 text-[#F97C2A]">
                <MapPin size={13} />
              </span>
              Shipping Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12" data-error={!!showError("shipping_address")}>
                <label className={labelClass} htmlFor="shipping_address">
                  Full Address
                </label>
                <input
                  id="shipping_address"
                  type="text"
                  required
                  placeholder="Street, Landmark, Apartment"
                  value={formData.shipping_address}
                  onChange={(e) => handleInputChange("shipping_address", e.target.value)}
                  onBlur={() => markTouched("shipping_address")}
                  aria-invalid={!!showError("shipping_address")}
                  className={inputClass(!!showError("shipping_address"))}
                />
                <FieldError
                  message={showError("shipping_address") ? errors.shipping_address : undefined}
                />
              </div>
              <div className="md:col-span-4" data-error={!!showError("shipping_pincode")}>
                <label className={labelClass} htmlFor="shipping_pincode">
                  Pincode
                </label>
                <div className="relative">
                  <input
                    id="shipping_pincode"
                    type="text"
                    required
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="6 Digit Pincode"
                    value={formData.shipping_pincode}
                    onChange={handlePincodeChange}
                    onBlur={() => markTouched("shipping_pincode")}
                    aria-invalid={!!showError("shipping_pincode")}
                    className={`${inputClass(!!showError("shipping_pincode"))} pr-9`}
                  />
                  {pincodeStatus === "loading" && (
                    <Loader2
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 animate-spin"
                    />
                  )}
                  {pincodeStatus === "found" && (
                    <Check
                      size={15}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500"
                    />
                  )}
                </div>
                <FieldError
                  message={
                    showError("shipping_pincode")
                      ? errors.shipping_pincode
                      : pincodeStatus === "error"
                      ? "Pincode not found — check and try again."
                      : undefined
                  }
                />
              </div>
              <div className="md:col-span-4">
                <label className={labelClass} htmlFor="shipping_city">
                  City
                </label>
                <input
                  id="shipping_city"
                  type="text"
                  disabled
                  readOnly
                  placeholder="Auto-filled via Pincode"
                  value={formData.shipping_city}
                  className={inputClass()}
                />
              </div>
              <div className="md:col-span-4">
                <label className={labelClass} htmlFor="shipping_state">
                  State
                </label>
                <input
                  id="shipping_state"
                  type="text"
                  disabled
                  readOnly
                  placeholder="Auto-filled via Pincode"
                  value={formData.shipping_state}
                  className={inputClass()}
                />
              </div>
            </div>
          </div>

          {/* ── Order Items ── */}
          <div
            className={`bg-orange-50/40 rounded-2xl p-6 border ${
              showError("items") ? "border-red-200" : "border-orange-100"
            }`}
            data-error={!!showError("items")}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-orange-100 text-[#F97C2A]">
                  <Box size={13} />
                </span>
                Order Items
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {formData.items.length} {formData.items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {productSKUs.length === 0 && !loadingOptions && !optionsError && (
              <div className="flex items-center gap-3 bg-white border border-dashed border-orange-200 rounded-xl p-4 mb-3 text-sm text-slate-500">
                <PackageSearch size={18} className="text-orange-400 shrink-0" />
                No product SKUs found. Add a product to your catalog before creating an order.
              </div>
            )}

            <div className="space-y-3">
              <div className="hidden md:grid grid-cols-12 gap-3 px-1">
                <span className="col-span-5 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Product SKU
                </span>
                <span className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Qty
                </span>
                <span className="col-span-3 text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                  Unit Price (₹)
                </span>
                <span className="col-span-2 text-[11px] font-bold text-slate-400 uppercase tracking-wide text-right">
                  Total
                </span>
              </div>
              <AnimatePresence initial={false}>
                {formData.items.map((item, index) => {
                  const lineHasError =
                    (touched.items || attemptedSubmit) && !item.product;
                  const lineTotal = (item.unit_price || 0) * (item.quantity || 0);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`grid grid-cols-12 gap-3 items-start bg-white p-3 rounded-xl border shadow-sm ${
                        lineHasError ? "border-red-200" : "border-slate-200"
                      }`}
                    >
                      <div className="col-span-12 md:col-span-5">
                        <select
                          required
                          value={item.product}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          onBlur={() => markTouched("items")}
                          aria-invalid={lineHasError}
                          aria-label={`Product for item ${index + 1}`}
                          className={inputClass(lineHasError)}
                        >
                          <option value="" disabled>
                            Select a Product
                          </option>
                          {productSKUs.map((sku) => (
                            <option key={sku._id} value={sku._id}>
                              {sku.product_sku_name}
                            </option>
                          ))}
                        </select>
                        {/* Per-item price chip — shows the line's price next to the
                            selected product so the cost is visible right where the
                            product is chosen, not just in the summary card below. */}
                        {item.product && (
                          <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#F97C2A] bg-orange-50 border border-orange-200 rounded-md px-2 py-0.5 tabular-nums">
                            {currency(lineTotal)}
                          </span>
                        )}
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <input
                          type="number"
                          required
                          min="1"
                          aria-label={`Quantity for item ${index + 1}`}
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                          className={inputClass()}
                        />
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            ₹
                          </span>
                          <input
                            type="number"
                            min="0"
                            disabled
                            readOnly
                            placeholder="Auto-filled on selection"
                            aria-label={`Unit price for item ${index + 1}`}
                            value={item.unit_price || ""}
                            className={`${inputClass()} pl-6`}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2 h-[42px]">
                        <span className="text-sm font-bold text-slate-700 tabular-nums">
                          {currency(lineTotal)}
                        </span>
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            aria-label={`Remove item ${index + 1}`}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <FieldError message={showError("items") ? errors.items : undefined} />

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-[#F97C2A] bg-white hover:bg-orange-50 px-4 py-2.5 rounded-xl transition-colors border border-orange-200 border-dashed"
            >
              <Plus size={16} /> Add Another Item
            </button>
          </div>

          {/* ── Pricing Breakdown ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: inputs */}
            <div className={`${sectionCardClass} space-y-5`}>
              <div>
                <label className={labelClass} htmlFor="tax_percent">
                  <span className="flex items-center gap-1.5">
                    <Receipt size={13} className="text-orange-400" /> Tax (%)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="tax_percent"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="18"
                    value={formData.tax_percent || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "tax_percent",
                        Math.min(100, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className={`${inputClass()} pr-8`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                    %
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  Tax is added on top of the product price.
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="shipping_charges">
                  <span className="flex items-center gap-1.5">
                    <Truck size={13} className="text-orange-400" /> Shipping Charges (₹)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    id="shipping_charges"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.shipping_charges || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "shipping_charges",
                        Math.max(0, Number(e.target.value) || 0)
                      )
                    }
                    className={`${inputClass()} pl-6`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="discount">
                  <span className="flex items-center gap-1.5">
                    <Tag size={13} className="text-orange-400" /> Discount (₹)
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    id="discount"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      handleInputChange("discount", Math.max(0, Number(e.target.value) || 0))
                    }
                    className={`${inputClass()} pl-6`}
                  />
                </div>
                {formData.discount > subtotal + taxAmount + formData.shipping_charges && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-600">
                    <AlertCircle size={12} />
                    Discount exceeds the order value — total will show as ₹0.00.
                  </p>
                )}
              </div>
            </div>

            {/* Right: Live Summary Card */}
            <div className="bg-[#F97C2A] rounded-2xl p-6 text-[#464343] self-start relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#F97C2A] opacity-20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -left-10 w-40 h-40 bg-[#FB923C] opacity-10 rounded-full blur-3xl pointer-events-none" />

              <p className="text-[11px] text-orange-200/80 uppercase tracking-widest font-bold mb-4 relative">
                Order Summary
              </p>

              <div className="space-y-2.5 text-sm relative">
                <div className="flex justify-between">
                  <span className="text-white">Subtotal</span>
                  <span className="tabular-nums text-slate-100">{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">GST / Tax ({formData.tax_percent || 0}%)</span>
                  <span className="text-slate-100 tabular-nums">{currency(taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Shipping Charges</span>
                  <span className="text-slate-100 tabular-nums">
                    {currency(formData.shipping_charges || 0)}
                  </span>
                </div>
                {(formData.discount || 0) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white">Discount</span>
                    <span className="text-emerald-400 tabular-nums">
                      -{currency(formData.discount || 0)}
                    </span>
                  </div>
                )}
                {/* Grand Total — stays on-theme (orange card, white text) but with
                    a larger, bolder number so it's the clear visual anchor of
                    the summary without introducing a clashing new color. */}
                <div className="border-t border-white/20 pt-3 mt-3 flex justify-between items-center">
                  <span className="font-bold text-base text-white uppercase tracking-wide">
                    Grand Total
                  </span>
                  <motion.span
                    key={grandTotal}
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.35 }}
                    className="font-extrabold text-2xl sm:text-3xl tabular-nums text-white"
                  >
                    {currency(Math.max(0, grandTotal))}
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ───────── Sticky Footer Action Bar ───────── */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-[0_-2px_10px_rgba(0,0,0,0.04)] z-20">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
            <Check
              size={14}
              className={isFormComplete ? "text-emerald-500" : "text-slate-300"}
            />
            <span className={isFormComplete ? "text-emerald-600" : ""}>
              {completedCount}/{completionChecks.length} steps complete
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-order-form"
              disabled={isSubmitting}
              className="px-5 sm:px-6 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#F97C2A] to-[#FB923C] shadow-[0_2px_10px_rgba(249,124,42,0.35)] hover:shadow-[0_4px_16px_rgba(249,124,42,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Order"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddOrderPage;

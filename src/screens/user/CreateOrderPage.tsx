import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createOrder } from "../../APIs/user/order";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/user";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { pincodeDetails } from "../../APIs/pincodeAPIs";
import { Plus, Trash2, ArrowLeft, FileText } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product_sku_id: string;
  quantity: number;
  unit_price: number;
}

interface FormState {
  // Customer
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  // Shipping
  shipping_address: string;
  shipping_pincode: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  // Items
  items: OrderItem[];
  // Pricing
  tax_type: "inclusive" | "exclusive";
  tax_percent: number;
  shipping_charges: number;
  discount: number;
  // Payment
  payment_method: "COD" | "PREPAID";
  // Channel
  channel_id: string;
  // Notes
  notes: string;
}

const EMPTY_ITEM: OrderItem = {
  product_sku_id: "",
  quantity: 1,
  unit_price: 0,
};

const INITIAL_FORM: FormState = {
  customer_name: "",
  customer_phone: "",
  customer_email: "",
  shipping_address: "",
  shipping_pincode: "",
  shipping_city: "",
  shipping_state: "",
  shipping_country: "India",
  items: [{ ...EMPTY_ITEM }],
  tax_type: "exclusive",
  tax_percent: 18,
  shipping_charges: 0,
  discount: 0,
  payment_method: "COD",
  channel_id: "",
  notes: "",
};

// ─── Component ────────────────────────────────────────────────────────────────

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [productSKUs, setProductSKUs] = useState<
    Array<{ _id: string; product_sku_name: string }>
  >([]);
  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [skuRes, channelRes] = await Promise.all([
        getAllProductSKUs(),
        appAxios.get(`${channelAccounts_url}?limit=1000`),
      ]);
      setProductSKUs(skuRes.data || []);
      setChannelAccounts(channelRes.data?.data || []);
    } catch {
      toast.error("Failed to load dropdown data");
    }
  };

  // ── Pincode auto-fill ──
  const handlePincode = async (pincode: string) => {
    setForm((f) => ({ ...f, shipping_pincode: pincode }));
    if (!/^\d{6}$/.test(pincode)) return;
    setPincodeLoading(true);
    try {
      const data = await pincodeDetails({ pincode });
      if (Array.isArray(data) && data.length > 0) {
        setForm((f) => ({
          ...f,
          shipping_city: data[0].district || "",
          shipping_state: data[0].statename || "",
          shipping_country: "India",
        }));
      }
    } catch {
      toast.error("Pincode not found");
    } finally {
      setPincodeLoading(false);
    }
  };

  // ── Item helpers ──
  const updateItem = (idx: number, key: keyof OrderItem, value: any) => {
    setForm((f) => {
      const items = [...f.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...f, items };
    });
  };

  const addItem = () =>
    setForm((f) => ({ ...f, items: [...f.items, { ...EMPTY_ITEM }] }));

  const removeItem = (idx: number) =>
    setForm((f) => ({
      ...f,
      items: f.items.filter((_, i) => i !== idx),
    }));

  // ── Pricing calculations ──
  const subtotal = form.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const taxAmount =
    form.tax_type === "exclusive"
      ? (subtotal * form.tax_percent) / 100
      : subtotal - subtotal / (1 + form.tax_percent / 100);

  const taxableBase =
    form.tax_type === "exclusive" ? subtotal : subtotal - taxAmount;

  const grandTotal =
    form.tax_type === "exclusive"
      ? subtotal + taxAmount + form.shipping_charges - form.discount
      : subtotal + form.shipping_charges - form.discount;

  // ── Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!form.customer_name.trim()) return toast.error("Customer name required");
    if (!form.customer_phone.trim()) return toast.error("Phone number required");
    if (!form.shipping_address.trim()) return toast.error("Address required");
    if (!form.shipping_pincode || form.shipping_pincode.length !== 6)
      return toast.error("Valid 6-digit pincode required");
    if (form.items.some((i) => !i.product_sku_id))
      return toast.error("Please select product for all items");

    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        customer_phone: `91${form.customer_phone.replace(/\D/g, "").slice(-10)}`,
        customer_email: form.customer_email,
        shipping_address: form.shipping_address,
        shipping_pincode: Number(form.shipping_pincode),
        shipping_city: form.shipping_city,
        shipping_state: form.shipping_state,
        shipping_country: form.shipping_country,
        channel_id: form.channel_id || undefined,
        payment_method: form.payment_method,
        items: form.items.map((i) => ({
          product_sku_id: i.product_sku_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        subtotal,
        tax_type: form.tax_type,
        tax_percent: form.tax_percent,
        tax_amount: taxAmount,
        shipping_charges: form.shipping_charges,
        discount: form.discount,
        total_amount: grandTotal,
        notes: form.notes,
      };

      await createOrder(payload as any);
      toast.success("Order created successfully!");
      navigate("/user/order-dash");
    } catch (err: any) {
      toast.error("Error creating order: " + (err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Shared input style ──
  const inputCls =
    "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 bg-white transition-all";

  const labelCls = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Bar ── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Create Manual Order
            </h1>
            <p className="text-xs text-slate-500">
              Fill in the details below to create a new order
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-order-form"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-all disabled:opacity-60"
          >
            <FileText size={15} />
            {submitting ? "Creating..." : "Create Order"}
          </button>
        </div>
      </div>

      <form
        id="create-order-form"
        onSubmit={handleSubmit}
        className="max-w-5xl mx-auto px-4 py-8 space-y-6"
      >
        {/* ── Section: Customer Details ── */}
        <Section
          number={1}
          icon="👤"
          title="Customer Details"
          subtitle="Basic information about the customer"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                type="text"
                placeholder="John Doe"
                value={form.customer_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer_name: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">
                  +91
                </span>
                <input
                  className={inputCls + " pl-10"}
                  type="tel"
                  maxLength={10}
                  placeholder="9876543210"
                  value={form.customer_phone}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      customer_phone: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Email (optional)</label>
              <input
                className={inputCls}
                type="email"
                placeholder="customer@email.com"
                value={form.customer_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, customer_email: e.target.value }))
                }
              />
            </div>
          </div>
        </Section>

        {/* ── Section: Shipping Address ── */}
        <Section
          number={2}
          icon="📍"
          title="Shipping Address"
          subtitle="Where should this order be delivered?"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Full Address <span className="text-red-500">*</span>
              </label>
              <input
                className={inputCls}
                type="text"
                placeholder="Street, Landmark, Apartment"
                value={form.shipping_address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shipping_address: e.target.value }))
                }
              />
            </div>
            <div>
              <label className={labelCls}>
                Pincode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  className={inputCls}
                  type="text"
                  maxLength={6}
                  placeholder="6-digit pincode"
                  value={form.shipping_pincode}
                  onChange={(e) => handlePincode(e.target.value.replace(/\D/g, ""))}
                />
                {pincodeLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-orange-500">
                    Fetching...
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className={labelCls}>City</label>
              <input
                className={inputCls + " bg-slate-50 text-slate-500"}
                type="text"
                placeholder="Auto-filled via Pincode"
                value={form.shipping_city}
                readOnly
              />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input
                className={inputCls + " bg-slate-50 text-slate-500"}
                type="text"
                placeholder="Auto-filled via Pincode"
                value={form.shipping_state}
                readOnly
              />
            </div>
            <div>
              <label className={labelCls}>Country</label>
              <input
                className={inputCls + " bg-slate-50 text-slate-500"}
                type="text"
                value={form.shipping_country}
                readOnly
              />
            </div>
          </div>
        </Section>

        {/* ── Section: Channel (optional) ── */}
        <Section
          number={3}
          icon="🏪"
          title="Channel Account"
          subtitle="Which store/channel is this order from? (Optional)"
        >
          <div>
            <label className={labelCls}>Select Channel Account</label>
            <select
              className={inputCls}
              value={form.channel_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, channel_id: e.target.value }))
              }
            >
              <option value="">— Direct / Manual Order —</option>
              {channelAccounts.map((ca) => (
                <option key={ca._id} value={ca._id}>
                  {ca.channel_account_name}
                </option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── Section: Order Items ── */}
        <Section
          number={4}
          icon="📦"
          title="Order Items"
          subtitle="Add one or more products to this order"
        >
          <div className="space-y-3">
            {/* Header row */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-1">
              <span className="col-span-5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Product SKU
              </span>
              <span className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Qty
              </span>
              <span className="col-span-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Unit Price (₹)
              </span>
              <span className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wide text-right">
                Total
              </span>
            </div>

            {form.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-3 items-center bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                {/* Product SKU */}
                <div className="col-span-12 sm:col-span-5">
                  <select
                    className={inputCls}
                    value={item.product_sku_id}
                    onChange={(e) =>
                      updateItem(idx, "product_sku_id", e.target.value)
                    }
                  >
                    <option value="">Select a Product</option>
                    {productSKUs.map((sku) => (
                      <option key={sku._id} value={sku._id}>
                        {sku.product_sku_name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Qty */}
                <div className="col-span-4 sm:col-span-2">
                  <input
                    className={inputCls}
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, "quantity", Number(e.target.value))
                    }
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-5 sm:col-span-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      ₹
                    </span>
                    <input
                      className={inputCls + " pl-6"}
                      type="number"
                      min={0}
                      placeholder="0.00"
                      value={item.unit_price || ""}
                      onChange={(e) =>
                        updateItem(idx, "unit_price", Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                {/* Row Total + Delete */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-end gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    ₹{(item.unit_price * item.quantity).toLocaleString("en-IN")}
                  </span>
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600 px-3 py-2 hover:bg-orange-50 rounded-xl transition-colors"
            >
              <Plus size={15} />
              Add Another Item
            </button>
          </div>
        </Section>

        {/* ── Section: Pricing Breakdown ── */}
        <Section
          number={5}
          icon="💰"
          title="Pricing Breakdown"
          subtitle="Set tax, shipping, and discounts"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Left: inputs */}
            <div className="space-y-4">
              {/* Tax */}
              <div>
                <label className={labelCls}>Tax</label>
                <div className="flex gap-2 mb-2">
                  {(["exclusive", "inclusive"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tax_type: type }))}
                      className={`flex-1 py-2 text-sm font-semibold rounded-xl border transition-all ${
                        form.tax_type === type
                          ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-orange-300"
                      }`}
                    >
                      {type === "exclusive" ? "Exclusive (+ tax)" : "Inclusive (tax in price)"}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    className={inputCls + " pr-8"}
                    type="number"
                    min={0}
                    max={100}
                    placeholder="18"
                    value={form.tax_percent || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        tax_percent: Number(e.target.value),
                      }))
                    }
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    %
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {form.tax_type === "exclusive"
                    ? "Tax will be added on top of the product price"
                    : "Tax is already included in the product price above"}
                </p>
              </div>

              {/* Shipping Charges */}
              <div>
                <label className={labelCls}>Shipping Charges (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    className={inputCls + " pl-6"}
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={form.shipping_charges || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        shipping_charges: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className={labelCls}>Discount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                    ₹
                  </span>
                  <input
                    className={inputCls + " pl-6"}
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={form.discount || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        discount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Right: live summary card */}
            <div className="bg-slate-900 rounded-2xl p-5 text-white self-start">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-4">
                Order Summary
              </p>
              <div className="space-y-2.5 text-sm">
                <SummaryRow label="Subtotal" value={subtotal} />
                {form.tax_type === "inclusive" && (
                  <SummaryRow
                    label={`Taxable Base`}
                    value={taxableBase}
                    muted
                  />
                )}
                <SummaryRow
                  label={`GST / Tax (${form.tax_percent}% ${form.tax_type})`}
                  value={taxAmount}
                  muted
                />
                <SummaryRow
                  label="Shipping Charges"
                  value={form.shipping_charges}
                  muted
                />
                {form.discount > 0 && (
                  <SummaryRow
                    label="Discount"
                    value={-form.discount}
                    accent="text-green-400"
                  />
                )}
                <div className="border-t border-slate-700 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-base">Grand Total</span>
                    <span className="font-bold text-xl text-orange-400">
                      ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Section: Payment Mode ── */}
        <Section
          number={6}
          icon="💳"
          title="Payment Mode"
          subtitle="How will this order be paid?"
        >
          <div className="flex gap-4">
            {(
              [
                {
                  value: "COD",
                  label: "Cash on Delivery",
                  icon: "🏠",
                  desc: "Customer pays on delivery",
                },
                {
                  value: "PREPAID",
                  label: "Prepaid",
                  icon: "✅",
                  desc: "Payment already received",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setForm((f) => ({ ...f, payment_method: opt.value }))
                }
                className={`flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl border-2 transition-all ${
                  form.payment_method === opt.value
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span
                  className={`text-sm font-bold ${
                    form.payment_method === opt.value
                      ? "text-orange-600"
                      : "text-slate-700"
                  }`}
                >
                  {opt.label}
                </span>
                <span className="text-xs text-slate-400">{opt.desc}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* ── Section: Notes ── */}
        <Section
          number={7}
          icon="📝"
          title="Additional Notes"
          subtitle="Any special instructions or remarks (optional)"
        >
          <textarea
            className={inputCls + " resize-none h-24"}
            placeholder="Special delivery instructions, gift message, etc."
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
        </Section>

        {/* ── Bottom Submit ── */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-10">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-all disabled:opacity-60"
          >
            <FileText size={15} />
            {submitting ? "Creating Order..." : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

// ─── Helper sub-components ────────────────────────────────────────────────────

const Section: React.FC<{
  number: number;
  icon: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ number, icon, title, subtitle, children }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    {/* Section header */}
    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/60">
      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
        {number}
      </div>
      <span className="text-base">{icon}</span>
      <div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    {/* Section body */}
    <div className="px-6 py-5">{children}</div>
  </div>
);

const SummaryRow: React.FC<{
  label: string;
  value: number;
  muted?: boolean;
  accent?: string;
}> = ({ label, value, muted, accent }) => (
  <div className="flex justify-between items-center">
    <span className={muted ? "text-slate-400" : "text-slate-300"}>{label}</span>
    <span className={accent ?? (muted ? "text-slate-400" : "text-white")}>
      {value < 0 ? "-" : ""}₹
      {Math.abs(value).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </span>
  </div>
);

export default CreateOrderPage;

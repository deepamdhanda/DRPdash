import React, { useEffect, useState } from "react";
import {
  fetchInvoices,
  fetchInvoicePools,
  InvoicePool,
} from "../../APIs/user/invoices";
import moment from "moment";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { Invoice } from "./invoiceTypes";

// Custom Tailwind Spinner
const Spinner = () => (
  <svg
    className="animate-spin h-8 w-8 text-blue-600 mx-auto"
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
);

// Badge Component
const Badge = ({
  children,
  color = "blue",
  className = "",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
  className?: string;
}) => {
  const colorStyles = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyles[color]} ${className}`}
    >
      {children}
    </span>
  );
};

// Invoice Modal Component
const InvoiceModal = ({
  invoice,
  show,
  onHide,
}: {
  invoice?: Invoice;
  show: boolean;
  onHide: () => void;
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  if (!invoice) return null;

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    const invoiceElement = document.getElementById("invoice-content");
    const invoiceContent = invoiceElement ? invoiceElement.innerHTML : "";
    printWindow?.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice._id}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <style>
            body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @media print { 
              .no-print { display: none; } 
            }
          </style>
        </head>
        <body class="p-8 bg-white">${invoiceContent}</body>
      </html>
    `);

    printWindow?.document.close();
    // Small delay to allow Tailwind to process before printing
    setTimeout(() => {
      printWindow?.print();
    }, 500);
  };

  const gstType =
    invoice.gst_breakup?.type === "intra_state"
      ? "Intra-State"
      : invoice.gst_breakup?.type === "union_territory"
      ? "Union Territory"
      : "Inter-State";

  const gstBadgeColor =
    invoice.gst_breakup?.type === "intra_state"
      ? "blue"
      : invoice.gst_breakup?.type === "union_territory"
      ? "green"
      : "yellow";

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onHide}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50">
              <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                <i className="fas fa-file-invoice text-blue-600"></i>
                Invoice Details
              </h2>
              <button
                onClick={onHide}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div id="invoice-content" className="flex-1 overflow-y-auto p-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-blue-600 mb-2 tracking-tight">
                  ₹ INVOICE
                </h1>
                <p className="text-slate-500 mb-2">Invoice #{invoice._id}</p>
                <Badge color={gstBadgeColor}>{gstType} GST</Badge>
              </div>

              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h5 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-building"></i> From
                  </h5>
                  <div className="text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 text-lg">
                      BABITA BEAUTY AND COSMETIC PRODUCTS
                    </p>
                    <p className="flex items-start gap-2">
                      <i className="fas fa-map-marker-alt mt-1 text-slate-400"></i>
                      <span>
                        KHEWAT NO 582, KHASRA NO 208/3
                        <br />
                        DARA KALAN, LAKSHMAN COLONY, THANESAR,
                        <br />
                        Kurukshetra, Haryana
                      </span>
                    </p>
                    <p className="flex items-center gap-2 pt-1">
                      <i className="fas fa-envelope text-slate-400"></i>
                      hello@orderzup.com
                    </p>
                    <p className="flex items-center gap-2 pt-2 border-t border-slate-200 mt-2">
                      <i className="fas fa-file-invoice text-slate-400"></i>
                      <span className="font-semibold text-slate-700">
                        GSTIN:
                      </span>{" "}
                      06EFZPB1531K1Z8
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h5 className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <i className="fas fa-user-tie"></i> To
                  </h5>
                  <div className="text-slate-600 space-y-2">
                    <p className="font-bold text-slate-800 text-lg mb-1">
                      {invoice.pool_name}
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fas fa-map-marker-alt text-slate-400"></i>
                      <span className="font-semibold text-slate-700">
                        State:
                      </span>{" "}
                      {invoice.party_state || "N/A"}
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fas fa-file-invoice text-slate-400"></i>
                      <span className="font-semibold text-slate-700">
                        GSTIN:
                      </span>{" "}
                      {invoice.gstin || "Not Available"}
                    </p>
                    <p className="flex items-center gap-2">
                      <i className="fas fa-id-card text-slate-400"></i>
                      <span className="font-semibold text-slate-700">
                        Pool Name:
                      </span>{" "}
                      {invoice.pool_name}
                    </p>
                  </div>
                </div>
              </div>

              {/* Period and Service Information */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <i className="fas fa-calendar-alt"></i> Invoice Date
                    </p>
                    <p className="font-semibold text-slate-800">
                      {moment(invoice.createdAt).format("DD MMM, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <i className="fas fa-calendar-check"></i> Period Start
                    </p>
                    <p className="font-semibold text-slate-800">
                      {moment(invoice.period_start).format("DD MMM, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <i className="fas fa-calendar-times"></i> Period End
                    </p>
                    <p className="font-semibold text-slate-800">
                      {moment(invoice.period_end).format("DD MMM, YYYY")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                      <i className="fas fa-truck"></i> Service Type
                    </p>
                    <p className="font-semibold text-slate-800">
                      {invoice.service_name || "Courier"}
                    </p>
                  </div>
                </div>
              </div>

              {invoice.service_description && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
                  <h6 className="text-blue-600 font-medium mb-2 flex items-center gap-2">
                    <i className="fas fa-info-circle"></i> Service Description
                  </h6>
                  <p className="text-slate-600 m-0">
                    {invoice.service_description}
                  </p>
                </div>
              )}

              {/* Transaction Summary */}
              {invoice.transactions && invoice.transactions.length > 0 && (
                <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-100 px-6 py-3 border-b border-slate-200">
                    <h5 className="font-medium text-slate-700 flex items-center gap-2 m-0">
                      <i className="fas fa-receipt"></i> Transaction Summary
                    </h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 p-6">
                    <div className="text-center p-4">
                      <i className="fas fa-exchange-alt text-blue-500 text-2xl mb-2"></i>
                      <h6 className="text-slate-500 text-sm mb-1">
                        Total Transactions
                      </h6>
                      <h4 className="text-2xl font-bold text-slate-800">
                        {invoice.transactions.length}
                      </h4>
                    </div>
                    <div className="text-center p-4">
                      <i className="fas fa-undo text-yellow-500 text-2xl mb-2"></i>
                      <h6 className="text-slate-500 text-sm mb-1">
                        Refund Transactions
                      </h6>
                      <h4 className="text-2xl font-bold text-slate-800">
                        {invoice.refund_transactions?.length || 0}
                      </h4>
                    </div>
                    <div className="text-center p-4">
                      <i className="fas fa-money-bill-wave text-red-500 text-2xl mb-2"></i>
                      <h6 className="text-slate-500 text-sm mb-1">
                        Total Refund Amount
                      </h6>
                      <h4 className="text-2xl font-bold text-slate-800">
                        ₹{(invoice.total_refund_amount || 0).toFixed(2)}
                      </h4>
                    </div>
                  </div>
                </div>
              )}

              {/* Invoice Items Table */}
              <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-blue-600 px-6 py-3">
                  <h5 className="font-medium text-white flex items-center gap-2 m-0">
                    <i className="fas fa-list-alt"></i> Invoice Items
                  </h5>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 text-sm font-medium text-slate-500">
                          <i className="fas fa-list-alt mr-2"></i>Description
                        </th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-500 text-center">
                          <i className="fas fa-hashtag mr-2"></i>Qty
                        </th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-500 text-right">
                          Rate
                        </th>
                        <th className="px-6 py-3 text-sm font-medium text-slate-500 text-right">
                          <i className="fas fa-calculator mr-2"></i>Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {invoice.items && invoice.items.length > 0 ? (
                        invoice.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 text-slate-700">
                              {item.description}
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-center">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-right">
                              ₹{item.rate.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-slate-700 text-right font-medium">
                              ₹{item.amount.toFixed(2)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-6 py-4 text-slate-700">
                            {invoice.service_description ||
                              "Services Rendered for Period"}
                          </td>
                          <td className="px-6 py-4 text-slate-700 text-center">
                            1
                          </td>
                          <td className="px-6 py-4 text-slate-700 text-right">
                            ₹{invoice.total_without_gst.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-slate-700 text-right font-medium">
                            ₹{invoice.total_without_gst.toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-full md:w-1/2 lg:w-5/12 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-3 text-slate-600">
                    <span className="flex items-center gap-2">
                      <i className="fas fa-minus text-slate-400"></i>Subtotal
                      (Before GST)
                    </span>
                    <span className="font-semibold text-slate-800">
                      ₹{invoice.total_without_gst.toFixed(2)}
                    </span>
                  </div>

                  {/* GST Breakup */}
                  <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-100">
                    <div className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                      <i className="fas fa-percentage"></i> GST Breakup (
                      {gstType})
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 pl-6">
                      {invoice.gst_breakup?.type === "intra_state" ? (
                        <>
                          <div className="flex justify-between">
                            <span>CGST (9%)</span>
                            <span className="font-medium text-slate-800">
                              ₹{(invoice.gst_breakup.cgst || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>SGST (9%)</span>
                            <span className="font-medium text-slate-800">
                              ₹{(invoice.gst_breakup.sgst || 0).toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : invoice.gst_breakup?.type === "union_territory" ? (
                        <>
                          <div className="flex justify-between">
                            <span>CGST (9%)</span>
                            <span className="font-medium text-slate-800">
                              ₹{(invoice.gst_breakup.cgst || 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>UTGST (9%)</span>
                            <span className="font-medium text-slate-800">
                              ₹{(invoice.gst_breakup.utgst || 0).toFixed(2)}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span>IGST (18%)</span>
                          <span className="font-medium text-slate-800">
                            ₹{(invoice.gst_breakup?.igst || 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between border-t border-slate-200 mt-3 pt-3 font-semibold text-slate-800">
                      <span>Total GST</span>
                      <span>₹{invoice.total_gst.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t-2 border-slate-800 pt-3 mb-3 text-lg font-bold">
                    <span className="text-slate-800">Grand Total</span>
                    <span className="text-green-600">
                      ₹{invoice.grand_total.toFixed(2)}
                    </span>
                  </div>

                  {invoice.total_refund_amount > 0 && (
                    <>
                      <div className="flex justify-between items-center pb-3 mb-3 text-red-500">
                        <span className="flex items-center gap-2">
                          <i className="fas fa-undo"></i>Total Refund
                        </span>
                        <span className="font-medium">
                          - ₹{invoice.total_refund_amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t-2 border-slate-200 pt-3 mb-3 text-lg font-bold">
                        <span className="text-slate-800">
                          Net Total (After Refund)
                        </span>
                        <span className="text-blue-600">
                          ₹
                          {(
                            invoice.net_total_after_refund ||
                            invoice.grand_total
                          ).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {invoice.pending_amount !== undefined &&
                    invoice.pending_amount > 0 && (
                      <div className="flex justify-between items-center border-t-2 border-yellow-400 pt-3 text-lg font-bold text-yellow-600 bg-yellow-50 p-3 rounded-lg mt-4">
                        <span className="flex items-center gap-2">
                          <i className="fas fa-exclamation-circle"></i> Pending
                          Amount
                        </span>
                        <span>₹{invoice.pending_amount.toFixed(2)}</span>
                      </div>
                    )}
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-center pt-6 border-t border-slate-200 text-slate-400 text-sm">
                <p className="mb-1 flex items-center justify-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  This is a computer-generated invoice and does not require a
                  signature.
                </p>
                <p>Thank you for your business!</p>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={onHide}
                className="px-5 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium flex items-center gap-2"
              >
                <i className="fas fa-times"></i> Close
              </button>
              <button
                onClick={handleDownload}
                className="px-5 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm shadow-blue-200"
              >
                <i className="fas fa-download"></i> Download PDF
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [invoicePools, setInvoicePools] = useState<InvoicePool[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: moment().startOf("year").toString(),
    toDate: moment().toString(),
    pool_id: "",
  });

  const role = "admin"; // change this to "user" for testing

  const getInvoices = async (
    page = pagination.page,
    limit = pagination.limit
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      const data = await fetchInvoices({
        ...filters,
        page: page,
        limit: limit,
      });

      if (data?.invoices && data?.pagination) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      }
    } catch (err: any) {
      toast.error(err?.message || "Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const getInvoicePools = async () => {
    setLoading(true);
    const users = await fetchInvoicePools();
    if (users.length) {
      setInvoicePools(users);
    }
    setLoading(false);
  };

  const downloadTransactionsCSV = (invoice: Invoice) => {
    if (!invoice.transactions || invoice.transactions.length === 0) {
      toast.warn("No transactions available for this invoice");
      return;
    }

    const headers = [
      "Transaction ID",
      "CR/DR",
      "Order ID",
      "Type",
      "Freight Charge",
      "COD Charges",
      "Commission",
      "GST (18%)",
      "Total Amount",
      "Zone",
      "Charged Weight",
      "Status",
      "Created At",
    ];

    const rows = [
      ...(invoice.transactions || []),
      ...(invoice.refund_transactions || []),
    ].map((t: any) => {
      const subtotal =
        (t.freight_charge || 0) + (t.cod_charges || 0) + (t.commission || 0);
      const gst = subtotal * 0.18;
      const totalAmount = subtotal + gst;

      return [
        t._id,
        t.cr_dr,
        t.order_id,
        t.type,
        t.freight_charge,
        t.cod_charges,
        t.commission,
        gst.toFixed(2),
        totalAmount.toFixed(2),
        t.zone,
        t.charged_weight,
        t.full_details?.status || "",
        new Date(t.createdAt).toLocaleString(),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${invoice._id}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    getInvoicePools();
  }, []);

  useEffect(() => {
    getInvoices(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.fromDate, filters.toDate, filters.pool_id]);

  // Framer Motion list container variant
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <span className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                  <i className="fas fa-file-invoice"></i>
                </span>
                Invoice Management
              </h1>
              <p className="text-slate-500 mt-1 ml-12">
                Manage, track, and download your platform invoices
              </p>
            </div>
            <div className="text-right bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
              <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-2 justify-end">
                <i className="fas fa-chart-bar"></i> Total Invoices
              </p>
              <h2 className="text-3xl font-bold text-blue-600 m-0 leading-none">
                {pagination?.total || 0}
              </h2>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
              <h5 className="font-semibold text-slate-700 flex items-center gap-2 m-0">
                <i className="fas fa-filter text-slate-400"></i> Filter Records
              </h5>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-calendar-alt text-slate-400"></i> From
                    Date
                  </label>
                  <input
                    max={moment(filters.toDate).format("YYYY-MM-DD")}
                    type="date"
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={moment(filters?.fromDate).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setFilters((old) => ({
                        ...old,
                        fromDate: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <i className="fas fa-calendar-alt text-slate-400"></i> To
                    Date
                  </label>
                  <input
                    min={moment(filters.fromDate).format("YYYY-MM-DD")}
                    type="date"
                    className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={moment(filters?.toDate).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setFilters((old) => ({ ...old, toDate: e.target.value }))
                    }
                  />
                </div>

                {role === "admin" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <i className="fas fa-users text-slate-400"></i> Pool
                    </label>
                    <select
                      className="w-full bg-white border border-slate-300 text-slate-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                      value={filters.pool_id}
                      onChange={(e) =>
                        setFilters((old) => ({
                          ...old,
                          pool_id: e.target.value,
                        }))
                      }
                    >
                      <option value={""}>All Pools</option>
                      {invoicePools.map((pool) => (
                        <option key={pool._id} value={pool._id}>
                          {pool.name}{" "}
                          {pool?.description && `(${pool.description})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex items-end">
                  <button
                    onClick={() => getInvoices(1)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2.5 transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <i className="fas fa-search"></i> Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Spinner />
                <span className="text-slate-500 mt-4 font-medium">
                  Fetching invoices...
                </span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-file-invoice text-3xl text-slate-300"></i>
                </div>
                <p className="text-slate-500 font-medium">
                  No invoices found for this period.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <i className="fas fa-hashtag mr-1"></i> ID
                      </th>
                      {role === "admin" && (
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <i className="fas fa-user mr-1"></i> Pool
                        </th>
                      )}
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <i className="fas fa-calendar mr-1"></i> Period
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <i className="fas fa-exchange-alt mr-1"></i> Txns
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Net Total
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Grand Total
                      </th>
                      {invoices.some(
                        (i) => i?.pending_amount && i?.pending_amount > 0
                      ) && (
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                          Pending
                        </th>
                      )}
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        GST
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Before GST
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        GST Type
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="divide-y divide-slate-100 bg-white"
                  >
                    {invoices.map((inv) => (
                      <motion.tr
                        variants={itemVariants}
                        key={inv._id}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="font-medium text-blue-600 flex items-center gap-2">
                            <i className="fas fa-file-alt text-slate-400"></i>
                            {inv._id.substring(0, 8)}...
                          </span>
                        </td>
                        {role === "admin" && (
                          <td className="px-6 py-4 text-slate-700 font-medium">
                            {inv.pool_name}
                          </td>
                        )}
                        <td className="px-6 py-4 text-slate-600 text-sm">
                          {moment(inv.period_start).format("DD MMM")} -{" "}
                          {moment(inv.period_end).format("DD MMM, YY")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Badge color="blue">
                              {inv.transactions?.length || 0}
                            </Badge>
                            {inv.refund_transactions &&
                              inv.refund_transactions.length > 0 && (
                                <Badge color="yellow">
                                  <i className="fas fa-undo mr-1"></i>
                                  {inv.refund_transactions.length}
                                </Badge>
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-blue-600">
                          ₹
                          {(
                            inv.net_total_after_refund || inv.grand_total
                          ).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-green-600">
                          ₹{inv.grand_total.toFixed(2)}
                        </td>
                        {invoices.some(
                          (i) => i?.pending_amount && i?.pending_amount > 0
                        ) && (
                          <td className="px-6 py-4 text-right font-semibold text-red-500">
                            {inv?.pending_amount && inv?.pending_amount > 0
                              ? `₹${inv.pending_amount.toFixed(2)}`
                              : "-"}
                          </td>
                        )}
                        <td className="px-6 py-4 text-right text-slate-600">
                          ₹{inv.total_gst.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right text-slate-600">
                          ₹{inv.total_without_gst.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            color={
                              inv.gst_breakup?.type === "intra_state"
                                ? "blue"
                                : "yellow"
                            }
                          >
                            {inv.gst_breakup?.type === "intra_state"
                              ? "Intra"
                              : "Inter"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">
                          {moment(inv.createdAt).format("DD MMM, YYYY")}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleViewInvoice(inv)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                              title="View Invoice"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              onClick={() => downloadTransactionsCSV(inv)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors border border-transparent hover:border-yellow-100"
                              title="Download Transactions CSV"
                            >
                              <i className="fas fa-file-csv"></i>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && pagination && pagination.totalPages > 1 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-600">
                  Showing page{" "}
                  <span className="font-semibold">{pagination.page}</span> of{" "}
                  <span className="font-semibold">{pagination.totalPages}</span>
                </p>
                <div className="flex rounded-lg shadow-sm">
                  <button
                    onClick={() => getInvoices(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <i className="fas fa-chevron-left mr-2"></i> Previous
                  </button>
                  <button
                    onClick={() => getInvoices(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border-t border-b border-r border-slate-300 rounded-r-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next <i className="fas fa-chevron-right ml-2"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Modal Mount */}
        <InvoiceModal
          invoice={selectedInvoice || undefined}
          show={showModal}
          onHide={() => setShowModal(false)}
        />
      </div>
    </>
  );
};

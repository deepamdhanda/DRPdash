import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ArrowLeft,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// --- Interfaces ---
export interface LinkOrderData {
  product_name?: string;
  total_amount?: string | number;
  channel_account_name?: string;
  items: Array<{
    product: {
      _id: string;
      product_sku_id: string;
      product_sku_name: string;
    } | null;
    variantId?: string;
    quantity: number;
  }>;
}

export interface Warehouse {
  _id: string;
  name: string;
}

export interface WarehouseStock {
  warehouse: Warehouse;
  stock: number;
}

export interface PhysicalDetails {
  weight: string | number;
  warehouse: WarehouseStock[];
  length: string | number;
  breadth: string | number;
  width: string | number;
  packWeight: string | number;
}

interface LinkProductModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (variantId?: string) => void;
  linkOrderData: LinkOrderData | null;
  physicalDetails: PhysicalDetails;
  setPhysicalDetails: React.Dispatch<React.SetStateAction<PhysicalDetails>>;
  warehouses?: Warehouse[];
}

export const LinkProductModal: React.FC<LinkProductModalProps> = ({
  show,
  onHide,
  onSubmit,
  linkOrderData,
  physicalDetails,
  setPhysicalDetails,
  warehouses = [],
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  // Lock body scroll
  useEffect(() => {
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [show]);

  const handleInputChange = (
    field: keyof PhysicalDetails,
    value: string | number
  ) => {
    setPhysicalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleWarehouseStockChange = (wh: Warehouse, stock: number) => {
    setPhysicalDetails((prev) => {
      const existingWarehouse = prev.warehouse || [];
      const index = existingWarehouse.findIndex(
        (w) => w.warehouse._id === wh._id
      );
      const updatedWarehouse = [...existingWarehouse];
      if (index !== -1)
        updatedWarehouse[index] = { ...updatedWarehouse[index], stock };
      else updatedWarehouse.push({ warehouse: wh, stock });
      return { ...prev, warehouse: updatedWarehouse };
    });
  };

  const handleClose = () => {
    setSelectedVariantId(null);
    onHide();
  };

  // Reusable Classes
  const inputClass =
    "w-full bg-white border border-slate-300 text-slate-900 text-[14px] rounded-lg focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500 block px-3 py-2 outline-none transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
  const labelClass =
    "block mb-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider";

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container - Increased max-width to max-w-5xl for a wider format */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200 z-10 shrink-0">
              <h5 className="text-[18px] font-bold text-slate-900 m-0">
                {selectedVariantId
                  ? "Configure Variant Details"
                  : "Order Items Linking"}
              </h5>
              <button
                onClick={handleClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar bg-white">
              {linkOrderData && (
                <>
                  {/* Context Banner */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                        Source Order
                      </div>
                      <div className="text-[16px] font-bold text-slate-900 leading-tight">
                        {linkOrderData.product_name || "Unknown Product"}
                      </div>
                    </div>
                    <div className="sm:text-right flex flex-row sm:flex-col justify-between sm:justify-start">
                      <div className="text-[13px] font-semibold text-slate-500">
                        {linkOrderData.channel_account_name || "Direct Channel"}
                      </div>
                      <div className="text-[16px] font-bold text-emerald-600">
                        ₹{linkOrderData.total_amount || "0.00"}
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden min-h-[300px]">
                    <AnimatePresence mode="wait">
                      {/* VIEW 1: Line Items List */}
                      {!selectedVariantId ? (
                        <motion.div
                          key="list-view"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col h-full"
                        >
                          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                            Line Items ({linkOrderData.items.length})
                          </div>
                          <div className="grid grid-cols-1  gap-4">
                            {linkOrderData.items.map((item, index) => {
                              const isLinked = !!item.product?.product_sku_id;

                              return (
                                <div
                                  key={index}
                                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                                    isLinked
                                      ? "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                                      : "bg-amber-50/40 border-amber-200 hover:border-amber-300 hover:shadow-sm"
                                  }`}
                                >
                                  <div className="flex items-start gap-3.5 mb-4 sm:mb-0">
                                    <div className="mt-0.5 shrink-0">
                                      {isLinked ? (
                                        <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                          <CheckCircle2 size={12} /> Linked
                                        </span>
                                      ) : (
                                        <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                          <AlertCircle size={12} /> Action Req
                                        </span>
                                      )}
                                    </div>
                                    <div>
                                      {isLinked ? (
                                        <>
                                          <div className="text-[14px] font-bold text-slate-900">
                                            {item.product?.product_sku_name}
                                          </div>
                                          <div className="text-[12px] text-slate-500 font-medium mt-0.5">
                                            SKU: {item.product?.product_sku_id}
                                          </div>
                                        </>
                                      ) : (
                                        <>
                                          <div className="text-[14px] font-bold text-slate-900">
                                            Variant: {item.variantId || "N/A"}
                                          </div>
                                          <div className="text-[12px] text-amber-700 font-medium mt-0.5">
                                            Requires physical details to link.
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-5 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                                    <div className="text-center bg-slate-50 sm:bg-transparent px-3 py-1 rounded-md sm:px-0 sm:py-0">
                                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                                        Qty
                                      </div>
                                      <div className="text-[15px] font-bold text-slate-900 leading-none">
                                        {item.quantity}
                                      </div>
                                    </div>

                                    {!isLinked && (
                                      <button
                                        onClick={() =>
                                          setSelectedVariantId(
                                            item.variantId || "unknown"
                                          )
                                        }
                                        className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-[12px] font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
                                      >
                                        <LinkIcon size={14} /> Link Now
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : (
                        /* VIEW 2: Configuration Form */
                        <motion.div
                          key="form-view"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="flex flex-col h-full"
                        >
                          <div className="flex flex-wrap items-center gap-3 mb-6">
                            <button
                              onClick={() => setSelectedVariantId(null)}
                              className="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                              <ArrowLeft size={16} /> Back
                            </button>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-[12px] font-semibold border border-slate-200">
                              Configuring Variant:{" "}
                              <strong className="text-slate-900">
                                {selectedVariantId}
                              </strong>
                            </span>
                          </div>

                          <div className="space-y-8">
                            {/* Step 1 */}
                            <div>
                              <div className="flex items-center gap-2.5 mb-4">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black">
                                  1
                                </span>
                                <h6 className="text-[15px] font-bold text-slate-900 m-0">
                                  Inventory Settings
                                </h6>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-2 md:pl-8">
                                <div>
                                  <label className={labelClass}>
                                    Item Weight (kg)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    className={inputClass}
                                    value={physicalDetails.weight}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "weight",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>
                                    Initial Stock per Warehouse
                                  </label>
                                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 space-y-1.5">
                                    {warehouses && warehouses.length > 0 ? (
                                      warehouses.map((wh) => {
                                        const currentStock =
                                          physicalDetails.warehouse?.find(
                                            (w) => w.warehouse._id === wh._id
                                          )?.stock;
                                        return (
                                          <div
                                            key={wh._id}
                                            className="flex items-center justify-between bg-white px-3 py-2 rounded-md border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                                          >
                                            <div
                                              className="text-[12px] font-bold text-slate-700 truncate pr-2"
                                              title={wh.name}
                                            >
                                              {wh.name}
                                            </div>
                                            <input
                                              type="number"
                                              className="w-24 bg-slate-50 border border-slate-200 rounded text-right px-2 py-1.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-blue-400"
                                              placeholder="0"
                                              value={
                                                currentStock === undefined
                                                  ? ""
                                                  : currentStock
                                              }
                                              onChange={(e) => {
                                                const val = e.target.value;
                                                handleWarehouseStockChange(
                                                  wh,
                                                  val === ""
                                                    ? 0
                                                    : parseInt(val, 10)
                                                );
                                              }}
                                            />
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <div className="text-[12px] text-slate-400 p-2 text-center font-medium">
                                        No warehouses configured.
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Step 2 */}
                            <div>
                              <div className="flex items-center gap-2.5 mb-4">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[11px] font-black">
                                  2
                                </span>
                                <h6 className="text-[15px] font-bold text-slate-900 m-0">
                                  Logistics & Packaging
                                </h6>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pl-2 md:pl-8">
                                <div>
                                  <label className={labelClass}>
                                    Length (cm)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className={inputClass}
                                    value={physicalDetails.length}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "length",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>
                                    Breadth (cm)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className={inputClass}
                                    value={physicalDetails.breadth}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "breadth",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>
                                    Height (cm)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0"
                                    className={inputClass}
                                    value={physicalDetails.width}
                                    onChange={(e) =>
                                      handleInputChange("width", e.target.value)
                                    }
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>
                                    Pack Wt. (kg)
                                  </label>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    className={inputClass}
                                    value={physicalDetails.packWeight}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "packWeight",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* Form Footer */}
            <AnimatePresence>
              {selectedVariantId && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200 shrink-0"
                >
                  <button
                    onClick={() => setSelectedVariantId(null)}
                    className="px-5 py-2.5 text-[13px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => onSubmit(selectedVariantId)}
                    className="px-6 py-2.5 bg-slate-900 text-white text-[13px] font-bold rounded-lg shadow-sm hover:bg-slate-800 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    Create & Link Product
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

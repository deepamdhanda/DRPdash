import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { appAxios } from "../../axios/appAxios";
import { products_url } from "../../URLs/user";

export interface UpdateDimensionsModalProps {
  show: boolean;
  onHide: () => void;
  productId: string | null;
  onSuccess: () => void;
}

export const UpdateDimensionsModal: React.FC<UpdateDimensionsModalProps> = ({
  show,
  onHide,
  productId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>("");

  const [dimensions, setDimensions] = useState({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId || !show) return;

      setLoading(true);
      try {
        const response = await appAxios.get(`${products_url}/${productId}`);
        const data = response.data;

        setProductName(data.product_name || "Unknown Product");
        setDimensions({
          length: data.length?.toString() || "",
          breadth: data.breadth?.toString() || "",
          height: data.height?.toString() || "",
          weight: data.product_weight?.toString() || "",
        });
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, show]);

  const handleInputChange = (field: keyof typeof dimensions, value: string) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!productId) return;

    setSaving(true);
    try {
      await appAxios.patch(`${products_url}/${productId}`, {
        length: parseFloat(dimensions.length),
        breadth: parseFloat(dimensions.breadth),
        height: parseFloat(dimensions.height),
        product_weight: parseFloat(dimensions.weight),
      });

      onSuccess();
      onHide();
    } catch (error) {
      console.error("Failed to update dimensions:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) onHide();
  };

  return (
    <AnimatePresence>
      {show && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black
        "
        >
          {/* Backdrop (Static: no onClick handler) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-5 flex justify-between items-center">
              <h5 className="text-lg font-bold text-slate-900 m-0">
                Missing Logistics Data
              </h5>
              <button
                onClick={handleClose}
                disabled={saving}
                className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-10">
                  {/* Custom Tailwind Spinner */}
                  <svg
                    className="animate-spin h-8 w-8 text-slate-400 mx-auto"
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
                  <p className="mt-3 text-sm text-slate-500">
                    Fetching product details...
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {/* Context Banner */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-4">
                    <div className="text-2xl">📦</div>
                    <div>
                      <div className="font-bold text-amber-900">
                        Action Required
                      </div>
                      <div className="text-amber-700 text-sm leading-relaxed mt-0.5">
                        <strong className="font-bold">{productName}</strong> is
                        missing critical dimensions required for accurate
                        shipping calculations.
                      </div>
                    </div>
                  </div>

                  <div className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
                    Physical Attributes
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Weight Input (Full Width) */}
                    <div className="col-span-3">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Product Weight (kg){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 1.25"
                        value={dimensions.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
                      />
                    </div>

                    {/* Logistics Input Grid */}
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Length (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={dimensions.length}
                        onChange={(e) =>
                          handleInputChange("length", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Breadth (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={dimensions.breadth}
                        onChange={(e) =>
                          handleInputChange("breadth", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                        Height (cm)
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={dimensions.height}
                        onChange={(e) =>
                          handleInputChange("height", e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 outline-none"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {!loading && (
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex justify-end gap-3 items-center">
                <button
                  onClick={handleClose}
                  disabled={saving}
                  className="text-slate-500 font-medium text-sm px-4 py-2 hover:text-slate-700 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    saving ||
                    !dimensions.weight ||
                    !dimensions.length ||
                    !dimensions.breadth ||
                    !dimensions.height
                  }
                  className="bg-slate-900 text-white rounded-lg font-medium text-sm px-5 py-2.5 transition-colors hover:bg-slate-800 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                  )}
                  {saving ? "Updating..." : "Save Dimensions"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Box, Ruler, Weight } from "lucide-react";
import { ProductPack } from "../../screens/user/ProductPacks";

interface ProductPackModalProps {
  isOpen: boolean;
  onClose: () => void;

  onSave: (
    data: Omit<ProductPack, "_id" | "created_by" | "status">
  ) => Promise<void>;
  productPack: ProductPack | null;
}

export const ProductPackModal: React.FC<ProductPackModalProps> = ({
  isOpen,
  onClose,
  onSave,
  productPack,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    weight: 0,
    stock: 0,
    packing_cost: 0,
  });

  const [dimensions, setDimensions] = useState({
    length: 0,
    breadth: 0,
    height: 0,
  });

  const [volumetricWeight, setVolumetricWeight] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form state
  useEffect(() => {
    if (isOpen) {
      if (productPack) {
        setFormData({
          name: productPack.name || "",
          weight: productPack.weight || 0,
          stock: productPack.stock || 0,
          packing_cost: productPack.packing_cost || 0,
        });
        setDimensions({
          length: productPack.length || 0,
          breadth: productPack.breadth || 0,
          height: productPack.height || 0,
        });
      } else {
        setFormData({ name: "", weight: 0, stock: 0, packing_cost: 0 });
        setDimensions({ length: 0, breadth: 0, height: 0 });
        setVolumetricWeight(0);
      }
    }
  }, [isOpen, productPack]);

  // Recalculate volumetric weight automatically
  useEffect(() => {
    const { length, breadth, height } = dimensions;
    const calculatedVolumetricWeight = (length * breadth * height) / 5000;
    setVolumetricWeight(calculatedVolumetricWeight * 1000); // in grams
  }, [dimensions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDimensions((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Create the exact payload matching the Omit signature
      const payload: Omit<ProductPack, "_id" | "created_by" | "status"> = {
        name: formData.name,
        weight: formData.weight,
        stock: formData.stock,
        packing_cost: formData.packing_cost,
        length: dimensions.length,
        breadth: dimensions.breadth,
        height: dimensions.height,
        volumetric_weight: volumetricWeight,
      };

      await onSave(payload);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none text-black"
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-gray-800">
                  <Box className="w-5 h-5 text-[#F5891E]" />
                  <h2 className="text-xl font-semibold">
                    {productPack ? "Edit Product Pack" : "Create Product Pack"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <form
                  id="pack-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pack Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Small Corrugated Box"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>

                  {/* Weights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 items-center gap-1.5">
                        <Weight className="w-4 h-4 text-gray-400" /> Actual
                        Weight (gm)
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-500">
                        Volumetric Weight (gm)
                      </label>
                      <input
                        type="number"
                        disabled
                        value={volumetricWeight.toFixed(2)}
                        className="w-full px-4 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl outline-none cursor-not-allowed font-medium"
                      />
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                      <Ruler className="w-4 h-4 text-gray-400" /> Dimensions
                      (cm)
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <input
                          type="number"
                          name="length"
                          placeholder="Length"
                          value={dimensions.length || ""}
                          onChange={handleDimensionChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                        />
                        <span className="text-xs text-gray-400 mt-1 block text-center">
                          Length
                        </span>
                      </div>
                      <div>
                        <input
                          type="number"
                          name="breadth"
                          placeholder="Breadth"
                          value={dimensions.breadth || ""}
                          onChange={handleDimensionChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                        />
                        <span className="text-xs text-gray-400 mt-1 block text-center">
                          Breadth
                        </span>
                      </div>
                      <div>
                        <input
                          type="number"
                          name="height"
                          placeholder="Height"
                          value={dimensions.height || ""}
                          onChange={handleDimensionChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                        />
                        <span className="text-xs text-gray-400 mt-1 block text-center">
                          Height
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inventory & Cost */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Available
                      </label>
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cost per piece (₹)
                      </label>
                      <input
                        type="number"
                        name="packing_cost"
                        step="0.01"
                        value={formData.packing_cost || ""}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                      />
                    </div>
                  </div>
                </form>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50 rounded-b-2xl">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="pack-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : productPack
                    ? "Update Pack"
                    : "Create Pack"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

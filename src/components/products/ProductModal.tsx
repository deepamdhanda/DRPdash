import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import {
  Product,
  ProductAttribute,
  WarehouseStock,
  Warehouse,
} from "../../screens/user/Products"; // Adjust import as needed

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    productData: Partial<Product>,
    imagePreview: string,
    imageName: string
  ) => Promise<void>;
  product: Product | null;
  warehouses: Warehouse[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  warehouses,
}) => {
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    product_weight: 0,
    length: 0,
    breadth: 0,
    height: 0,
  });

  const [productAttributes, setProductAttributes] = useState<
    ProductAttribute[]
  >([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form state when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData({
          product_name: product.product_name || "",
          product_description: product.product_description || "",
          product_weight: product.product_weight || 0,
          length: product.length || 0,
          breadth: product.breadth || 0,
          height: product.height || 0,
        });
        setProductAttributes(product.product_attributes || []);
        setImagePreview(product.product_image || "");

        const mappedStocks = warehouses.map((wh) => {
          const existingStock = product.warehouse.find(
            (w) => w.warehouse._id === wh._id
          );
          return {
            warehouse: wh,
            stock: existingStock ? existingStock.stock : 0,
          };
        });
        setWarehouseStocks(mappedStocks);
      } else {
        // Reset form for create
        setFormData({
          product_name: "",
          product_description: "",
          product_weight: 0,
          length: 0,
          breadth: 0,
          height: 0,
        });
        setProductAttributes([]);
        setImagePreview("");
        setImageName("");
        setWarehouseStocks(
          warehouses.map((wh) => ({ warehouse: wh, stock: 0 }))
        );
      }
    }
  }, [isOpen, product, warehouses]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["length", "breadth", "height", "product_weight"].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttributeChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...productAttributes];
    updated[index][field] = value;
    setProductAttributes(updated);
  };

  const handleWarehouseStockChange = (warehouseId: string, stock: number) => {
    const updated = [...warehouseStocks];
    const idx = updated.findIndex((w) => w.warehouse._id === warehouseId);
    if (idx !== -1) {
      updated[idx].stock = stock;
    }
    setWarehouseStocks(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: Partial<Product> = {
        ...formData,
        product_attributes: productAttributes,
        warehouse: warehouseStocks.filter((ws) => ws.stock > 0),
      };
      await onSave(payload, imagePreview, imageName);
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
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800">
                  {product ? "Edit Product" : "Create Product"}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto p-6">
                <form
                  id="product-form"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Name
                        </label>
                        <input
                          type="text"
                          name="product_name"
                          value={formData.product_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] focus:border-[#F5891E] outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="product_description"
                          rows={3}
                          value={formData.product_description}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] focus:border-[#F5891E] outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Length (cm)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="length"
                            value={formData.length}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Breadth (cm)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="breadth"
                            value={formData.breadth}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Height (cm)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            name="height"
                            value={formData.height}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Weight (kg)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          name="product_weight"
                          value={formData.product_weight}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#F5891E] outline-none"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-semibold text-gray-800 mb-3">
                          Warehouse Stock
                        </label>
                        <div className="space-y-3">
                          {warehouses.map((wh) => (
                            <div
                              key={wh._id}
                              className="flex items-center justify-between gap-4"
                            >
                              <span className="text-sm text-gray-600 font-medium">
                                {wh.name}
                              </span>
                              <input
                                type="number"
                                placeholder="0"
                                min="0"
                                value={
                                  warehouseStocks.find(
                                    (w) => w.warehouse._id === wh._id
                                  )?.stock || ""
                                }
                                onChange={(e) =>
                                  handleWarehouseStockChange(
                                    wh._id,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                                className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-[#F5891E] outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#F5891E] hover:file:bg-orange-100 transition-all cursor-pointer mb-3"
                        />
                        {imagePreview && (
                          <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 h-48 flex items-center justify-center">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Attributes
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setProductAttributes([
                                ...productAttributes,
                                { key: "", value: "" },
                              ])
                            }
                            className="flex items-center gap-1 text-xs font-medium text-[#F5891E] hover:text-[#e07715] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Attribute
                          </button>
                        </div>

                        <div className="space-y-3">
                          {productAttributes.length === 0 && (
                            <p className="text-sm text-gray-400 italic py-2">
                              No attributes added.
                            </p>
                          )}
                          {productAttributes.map((attr, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input
                                placeholder="Key (e.g. Color)"
                                value={attr.key}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    "key",
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5891E] outline-none"
                              />
                              <input
                                placeholder="Value (e.g. Red)"
                                value={attr.value}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F5891E] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...productAttributes];
                                  updated.splice(index, 1);
                                  setProductAttributes(updated);
                                }}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
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
                  form="product-form"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? "Saving..."
                    : product
                    ? "Update Product"
                    : "Create Product"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import DescriptionEditor from "../../screens/user/description"; // Adjust path as needed
import {
  ProductSKU,
  Warehouse,
  ProductPack,
  WarehouseStock,
  ProductSKUAttribute,
} from "../../screens/user/ProductSKUs";
import { Product } from "../../screens/user/Products";

interface ProductSKUModalProps {
  isOpen: boolean;
  onClose: () => void;
  sku: ProductSKU | null;
  products: Product[];
  warehouses: Warehouse[];
  productPacks: ProductPack[];
  onSave: (
    data: Partial<ProductSKU>,
    imagePreview: string,
    imageName: string | null
  ) => Promise<void>;
}

export const ProductSKUModal: React.FC<ProductSKUModalProps> = ({
  isOpen,
  onClose,
  sku,
  products,
  warehouses,
  productPacks,
  onSave,
}) => {
  const [productSKUId, setProductSKUId] = useState<string>("");
  const [productSKUName, setProductSKUName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [packId, setPackId] = useState<string>("");
  const [calculatedWeight, setCalculatedWeight] = useState<number>(0);

  const [productSKUAttributes, setProductSKUAttributes] = useState<
    ProductSKUAttribute[]
  >([]);
  const [warehouseStocks, setWarehouseStocks] = useState<WarehouseStock[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<
    { product_id: string; quantity: number }[]
  >([]);

  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageName, setImageName] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (sku) {
        setProductSKUId(sku.product_sku_id || "");
        setProductSKUName(sku.product_sku_name || "");
        setDescription(sku.product_sku_description || "");
        setPackId(sku.pack_id?._id || "");
        setProductSKUAttributes(sku.product_sku_attributes || []);
        setImagePreview(sku.product_sku_image || "");

        const preSelected = (sku.products || []).map((prod) => ({
          product_id: prod.product_id?._id ?? "",
          quantity: prod.quantity ?? 0,
        }));
        setSelectedProducts(preSelected);

        // Map existing warehouse stock or initialize defaults
        const existingStockMap = new Map(
          (sku.warehouse || []).map((w) => [w.warehouse._id, w.stock])
        );
        setWarehouseStocks(
          warehouses.map((wh) => ({
            warehouse: wh,
            stock: existingStockMap.get(wh._id) || 0,
          }))
        );
      } else {
        // Reset for new creation
        setProductSKUId("");
        setProductSKUName("");
        setDescription("");
        setPackId("");
        setProductSKUAttributes([]);
        setImagePreview("");
        setImageName(null);
        setSelectedProducts([]);
        setWarehouseStocks(
          warehouses.map((wh) => ({ warehouse: wh, stock: 0 }))
        );
      }
    }
  }, [isOpen, sku, warehouses]);

  // Calculate weight automatically when products or quantities change
  useEffect(() => {
    const totalWeight = selectedProducts.reduce((total, sel) => {
      const product = products.find((p) => p._id === sel.product_id);
      return total + (product ? product.product_weight * sel.quantity : 0);
    }, 0);
    setCalculatedWeight(totalWeight);
  }, [selectedProducts, products]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleProductChange = (
    index: number,
    field: "product_id" | "quantity",
    value: string | number
  ) => {
    const updated = [...selectedProducts];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedProducts(updated);
  };

  const handleAttributeChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const updated = [...productSKUAttributes];
    updated[index] = { ...updated[index], [field]: value };
    setProductSKUAttributes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const formData: Partial<ProductSKU> = {
      product_sku_id: productSKUId,
      product_sku_name: productSKUName,
      product_sku_description: description,
      product_sku_weight: calculatedWeight,
      product_sku_attributes: productSKUAttributes,
      warehouse: warehouseStocks,
      pack_id: packId as any,
      products: selectedProducts as any,
      status: sku?.status || "active",
    };

    try {
      await onSave(formData, imagePreview, imageName);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md text-black p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            {sku ? "Edit Product SKU" : "Create Product SKU"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="sku-form" onSubmit={handleSubmit} className="space-y-8">
            {/* --- Products Section --- */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                🛒 Products Included
              </h3>

              <div className="space-y-3 mb-4">
                {selectedProducts.map((sel, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                  >
                    <select
                      className="flex-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                      value={sel.product_id}
                      onChange={(e) =>
                        handleProductChange(idx, "product_id", e.target.value)
                      }
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.product_name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      className="w-full sm:w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      value={sel.quantity}
                      onChange={(e) =>
                        handleProductChange(
                          idx,
                          "quantity",
                          Number(e.target.value)
                        )
                      }
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProducts(
                          selectedProducts.filter((_, i) => i !== idx)
                        )
                      }
                      className="w-full sm:w-auto p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />{" "}
                      <span className="sm:hidden">Remove</span>
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProducts([
                    ...selectedProducts,
                    { product_id: "", quantity: 1 },
                  ])
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors border border-orange-200"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {/* --- SKU Details Section --- */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📦 Product SKU Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU ID
                  </label>
                  <input
                    type="text"
                    value={productSKUId}
                    onChange={(e) => setProductSKUId(e.target.value)}
                    disabled={!!sku}
                    required
                    placeholder="Enter SKU ID"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU Name
                  </label>
                  <input
                    type="text"
                    value={productSKUName}
                    onChange={(e) => setProductSKUName(e.target.value)}
                    required
                    placeholder="Enter SKU Name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-orange-500">
                  <DescriptionEditor
                    value={description}
                    onChange={setDescription}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Packaging (Pack)
                  </label>
                  <select
                    value={packId}
                    onChange={(e) => setPackId(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="">Select Packaging</option>
                    {productPacks.map((pack) => (
                      <option key={pack._id} value={pack._id}>
                        {pack.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Weight (gm)
                  </label>
                  <input
                    type="number"
                    value={calculatedWeight}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 font-medium outline-none cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Calculated automatically from selected products.
                  </p>
                </div>
              </div>

              {/* --- Image Upload --- */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
                {imagePreview && (
                  <div className="mt-3 relative w-full max-w-sm rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-contain bg-gray-50"
                    />
                  </div>
                )}
              </div>

              {/* --- Attributes --- */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attributes
                </label>
                <div className="space-y-3 mb-3">
                  {productSKUAttributes.map((attr, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        placeholder="Key (e.g., Color)"
                        value={attr.key}
                        onChange={(e) =>
                          handleAttributeChange(index, "key", e.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <input
                        placeholder="Value (e.g., Red)"
                        value={attr.value}
                        onChange={(e) =>
                          handleAttributeChange(index, "value", e.target.value)
                        }
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setProductSKUAttributes(
                            productSKUAttributes.filter((_, i) => i !== index)
                          )
                        }
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setProductSKUAttributes([
                      ...productSKUAttributes,
                      { key: "", value: "" },
                    ])
                  }
                  className="text-sm font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add Attribute
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="sku-form"
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md shadow-orange-500/20"
          >
            {isSaving ? "Saving..." : sku ? "Update SKU" : "Create SKU"}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { newProductSKU, Warehouse } from "../../screens/user/ChannelSKU";
interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlinkedProduct: newProductSKU;
  warehouses: Warehouse[];
  onSuccess: () => void;
  apiCreateFunction: (data: any) => Promise<any>;
}

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  unlinkedProduct,
  warehouses,
  onSuccess,
  apiCreateFunction,
}) => {
  const [productSKUId, setProductSKUId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: "",
      weight: "",
      warehouses: [{ warehouse: "", stock: "" }],
    },
  ]);

  const [productPack, setProductPack] = useState({
    packType: "box",
    length: "",
    breadth: "",
    width: "",
    weight: "",
  });

  if (!isOpen) return null;

  // Products Logic
  const handleAddProduct = () => {
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    setProducts([
      ...products,
      {
        id: newId,
        name: "",
        weight: "",
        warehouses: [{ warehouse: "", stock: "" }],
      },
    ]);
  };

  const handleRemoveProduct = (id: number) => {
    if (products.length > 1) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleProductChange = (id: number, field: string, value: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Warehouse Logic
  const handleAddWarehouse = (productId: number) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              warehouses: [...p.warehouses, { warehouse: "", stock: "" }],
            }
          : p
      )
    );
  };

  const handleRemoveWarehouse = (productId: number, warehouseIndex: number) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              warehouses: p.warehouses.filter(
                (_, idx) => idx !== warehouseIndex
              ),
            }
          : p
      )
    );
  };

  const handleWarehouseChange = (
    productId: number,
    warehouseIndex: number,
    field: string,
    value: string
  ) => {
    setProducts(
      products.map((p) =>
        p.id === productId
          ? {
              ...p,
              warehouses: p.warehouses.map((w, idx) =>
                idx === warehouseIndex ? { ...w, [field]: value } : w
              ),
            }
          : p
      )
    );
  };

  const handleProductPackChange = (field: string, value: string) => {
    setProductPack({ ...productPack, [field]: value });
  };

  const calculateVolumetricWeight = () => {
    const { length, breadth, width } = productPack;
    if (length && breadth && width) {
      return (
        (parseFloat(length) * parseFloat(breadth) * parseFloat(width)) /
        5000
      ).toFixed(2);
    }
    return "0.00";
  };

  const handleReset = () => {
    setProductSKUId("");
    setProducts([
      {
        id: 1,
        name: "",
        weight: "",
        warehouses: [{ warehouse: "", stock: "" }],
      },
    ]);
    setProductPack({
      packType: "box",
      length: "",
      breadth: "",
      width: "",
      weight: "",
    });
  };

  const handleSubmit = async () => {
    for (const product of products) {
      if (!product.name || !product.weight) {
        toast.error(`Please fill all fields for product.`);
        return;
      }
      for (const warehouse of product.warehouses) {
        if (!warehouse.warehouse || !warehouse.stock) {
          toast.error(`Please fill warehouse and stock for ${product.name}`);
          return;
        }
      }
    }

    const packName = `${productPack.packType}_${productPack.length}x${productPack.breadth}x${productPack.width}`;

    const formData = {
      productSKU: {
        product_sku_id: productSKUId,
      },
      products: products.map((p) => ({
        name: p.name,
        weight: p.weight,
        warehouses: p.warehouses.map((w) => ({
          warehouse: w.warehouse,
          stock: Number(w.stock),
        })),
      })),
      productPack: {
        name: packName,
        length: productPack.length,
        breadth: productPack.breadth,
        width: productPack.width,
        weight: productPack.weight,
      },
    };

    setIsSubmitting(true);
    try {
      await apiCreateFunction(formData);
      toast.success("Product created successfully");
      onSuccess();
    } catch (error) {
      console.error("Creation error", error);
      toast.error("Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-black">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">
            📦 Create New Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar bg-gray-50/50">
          {/* Section 1: Product SKU Details */}
          <div>
            <h3 className="text-lg font-semibold text-blue-700 mb-3">
              🧾 Section 1: Product SKU
            </h3>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product SKU ID
                </label>
                <input
                  type="text"
                  value={productSKUId}
                  onChange={(e) => setProductSKUId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Enter SKU ID"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  SKU Name
                </label>
                <input
                  type="text"
                  value={unlinkedProduct.product_name}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  SKU Price
                </label>
                <input
                  type="text"
                  value={`₹${unlinkedProduct.price}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 rounded-lg text-sm text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Products */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-blue-700">
                📋 Section 2: Products
              </h3>
              <button
                onClick={handleAddProduct}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            <div className="space-y-4">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                      Product #{index + 1}
                    </span>
                    {products.length > 1 && (
                      <button
                        onClick={() => handleRemoveProduct(product.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Product Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={product.name}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            "name",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Cotton T-Shirt"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Weight (gm) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={product.weight}
                        onChange={(e) =>
                          handleProductChange(
                            product.id,
                            "weight",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 250"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      />
                    </div>
                  </div>

                  {/* Warehouses inside Product */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <strong className="text-xs text-gray-700">
                        Warehouse Allocation
                      </strong>
                      <button
                        onClick={() => handleAddWarehouse(product.id)}
                        className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Warehouse
                      </button>
                    </div>

                    <div className="space-y-3">
                      {product.warehouses.map((warehouse, wIndex) => (
                        <div key={wIndex} className="flex items-end gap-3">
                          <div className="flex-1">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">
                              Warehouse
                            </label>
                            <select
                              value={warehouse.warehouse}
                              onChange={(e) =>
                                handleWarehouseChange(
                                  product.id,
                                  wIndex,
                                  "warehouse",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                              <option value="">Select</option>
                              {warehouses.map((wh) => (
                                <option key={wh._id} value={wh._id}>
                                  {wh.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-24">
                            <label className="block text-[11px] font-medium text-gray-500 mb-1">
                              Stock
                            </label>
                            <input
                              type="number"
                              value={warehouse.stock}
                              onChange={(e) =>
                                handleWarehouseChange(
                                  product.id,
                                  wIndex,
                                  "stock",
                                  e.target.value
                                )
                              }
                              placeholder="Qty"
                              min="0"
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>
                          {product.warehouses.length > 1 && (
                            <button
                              onClick={() =>
                                handleRemoveWarehouse(product.id, wIndex)
                              }
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-[1px]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Product Pack Dimensions */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-3">
              📐 Section 3: Pack Dimensions
            </h3>
            <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={productPack.packType}
                  onChange={(e) =>
                    handleProductPackChange("packType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                >
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Length (cm)
                </label>
                <input
                  type="number"
                  value={productPack.length}
                  onChange={(e) =>
                    handleProductPackChange("length", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Breadth (cm)
                </label>
                <input
                  type="number"
                  value={productPack.breadth}
                  onChange={(e) =>
                    handleProductPackChange("breadth", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Width (cm)
                </label>
                <input
                  type="number"
                  value={productPack.width}
                  onChange={(e) =>
                    handleProductPackChange("width", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={productPack.weight}
                  onChange={(e) =>
                    handleProductPackChange("weight", e.target.value)
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                />
              </div>

              <div className="col-span-2 md:col-span-5 mt-2 bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex flex-col md:flex-row justify-between text-sm">
                <span className="text-emerald-800">
                  <strong>📦 Pack Name:</strong> {productPack.packType}_
                  {productPack.length || "0"}x{productPack.breadth || "0"}x
                  {productPack.width || "0"}
                </span>
                <span className="text-emerald-800 mt-1 md:mt-0">
                  <strong>⚖️ Volumetric Weight:</strong>{" "}
                  {calculateVolumetricWeight()} kg
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white rounded-b-xl">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Reset Form
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 transition-all shadow-md"
            >
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState, useMemo } from "react";
import {
  createProductSKU,
  getAllProductSKUs,
  updateProductSKU,
} from "../../APIs/user/productSKU";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { getAllProducts } from "../../APIs/user/product";
import { getAllProductPacks } from "../../APIs/user/productPack";
import { createAmazonS3 } from "../../APIs/user/amazonS3";
import CustomDataTable from "../../components/DataTable";
import { Edit2, Package, Weight, CheckCircle2, XCircle } from "lucide-react";
import { ProductSKUModal } from "../../components/products/ProductSKUModal"; // Adjust path as needed
import { Product } from "./Products";

// Types (You can move these to a separate types file if preferred)
export interface ProductSKUAttribute {
  key: string;
  value: string;
}

export interface Warehouse {
  _id: string;
  name: string;
}

export interface WarehouseStock {
  warehouse: Warehouse;
  stock: number;
}

export interface ProductPack {
  _id: string;
  name: string;
}

export interface ProductSKUProduct {
  product_id: Product;
  quantity: number;
}

export interface ProductSKU {
  _id?: string;
  product_sku_id?: string;
  product_sku_name: string;
  product_sku_description: string;
  product_sku_weight: number;
  product_sku_attributes: ProductSKUAttribute[];
  product_sku_image: string;
  pack_id?: ProductPack;
  warehouse: WarehouseStock[];
  products: ProductSKUProduct[];
  status: "active" | "inactive" | "suspended";
  created_by?: string;
  ownership?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const ProductSKUs: React.FC = () => {
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productPacks, setProductPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProductSKU, setEditingProductSKU] = useState<ProductSKU | null>(
    null
  );

  // Pagination State
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);

  useEffect(() => {
    fetchInitialData();
  }, [page, limit]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [skuData, warehousesData, productsData, packsData] =
        await Promise.all([
          getAllProductSKUs(page, limit),
          getAllWarehouses(),
          getAllProducts(),
          getAllProductPacks(),
        ]);

      setProductSKUs(skuData.data);
      setTotalRecords(skuData.total);
      setWarehouses(warehousesData.data);
      setProducts(productsData.data);
      setProductPacks(packsData.data);
    } catch (error) {
      console.error("Error loading initial data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProductSKU(null);
    setIsModalOpen(true);
  };

  const handleEdit = (productSKU: ProductSKU) => {
    setEditingProductSKU(productSKU);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (row: ProductSKU) => {
    const newStatus = row.status === "active" ? "inactive" : "active";
    if (
      window.confirm(`Are you sure you want to mark this SKU as ${newStatus}?`)
    ) {
      try {
        await updateProductSKU(row._id!, { ...row, status: newStatus });
        await fetchInitialData();
      } catch (err) {
        console.error("Error toggling status:", err);
      }
    }
  };

  const handleSaveSKU = async (
    skuData: Partial<ProductSKU>,
    imagePreview: string,
    imageName: string | null
  ) => {
    try {
      let finalSKUData = { ...skuData };

      // Handle Image Upload if a new image is provided
      if (imageName && imagePreview && !imagePreview.startsWith("http")) {
        const img = await createAmazonS3(
          `productSKU/${Date.now()}-${imageName.replace(/ /g, "_")}`,
          imagePreview
        );
        finalSKUData.product_sku_image = (img as any).url;
      } else {
        finalSKUData.product_sku_image = imagePreview || "";
      }

      if (editingProductSKU && editingProductSKU._id) {
        await updateProductSKU(
          editingProductSKU._id,
          finalSKUData as ProductSKU
        );
      } else {
        await createProductSKU(finalSKUData as ProductSKU);
        setPage(1);
      }

      await fetchInitialData();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving SKU", err);
      throw err;
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "SKU Details",
        selector: (row: ProductSKU) => row.product_sku_name,
        sortable: true,
        width: "280px",
        wrap: true,
        cell: (row: ProductSKU) => (
          <div className="flex flex-col gap-1 py-3">
            <span className="text-lg font-semibold text-neutral-600 leading-tight">
              {row.product_sku_name}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              ID: {row.product_sku_id}
            </span>
          </div>
        ),
      },
      {
        name: "Weight & Pack",
        minWidth: "220px",
        cell: (row: ProductSKU) => {
          const totalWeight = row.products.reduce((sum, p) => {
            const weight = p?.product_id?.product_weight ?? 0;
            return sum + weight * (p.quantity ?? 0);
          }, 0);

          return (
            <div className="flex flex-col gap-2 py-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Weight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  <span className="text-gray-900 font-medium">Weight:</span>{" "}
                  {totalWeight.toFixed(2)} gm
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>
                  <span className="text-gray-900 font-medium">Pack:</span>{" "}
                  {row.pack_id?.name || "N/A"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        name: "Status",
        width: "150px",
        cell: (row: ProductSKU) => {
          const isActive = row.status === "active";
          return (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {isActive ? "Active" : "Inactive"}
            </div>
          );
        },
      },
      {
        name: "Actions",
        width: "220px",
        cell: (row: ProductSKU) => {
          const isActive = row.status === "active";
          return (
            <div className="py-2 flex items-center gap-2 w-full">
              <button
                onClick={() => handleEdit(row)}
                className="p-2.5 text-neutral-600 rounded-lg shadow-sm transition-all duration-200 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 flex items-center justify-center"
                title="Edit SKU"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleStatus(row)}
                className={`flex-1 font-semibold px-3 py-2 text-sm rounded-lg shadow-sm transition-all duration-200 border ${
                  isActive
                    ? "text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    : "text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
                }`}
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="mt-4 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Product SKUs
          </h1>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          Create New
        </button>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={productSKUs}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      {isModalOpen && (
        <ProductSKUModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sku={editingProductSKU}
          products={products}
          warehouses={warehouses}
          productPacks={productPacks}
          onSave={handleSaveSKU}
        />
      )}
    </div>
  );
};

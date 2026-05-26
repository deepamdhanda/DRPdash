import React, { useEffect, useState, useMemo } from "react";
import {
  createProduct,
  getAllProducts,
  updateProduct,
} from "../../APIs/user/product";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { createAmazonS3 } from "../../APIs/user/amazonS3";
import CustomDataTable from "../../components/DataTable";
import { Edit2, Package, Ruler, Tag, Weight } from "lucide-react";
import { ProductModal } from "../../components/products/ProductModal"; // Adjust path if needed

// Shared Interfaces
export interface Warehouse {
  _id: string;
  name: string;
}

export interface ProductAttribute {
  key: string;
  value: string;
}

export interface WarehouseStock {
  warehouse: Warehouse;
  stock: number;
}

export interface Product {
  _id?: string;
  product_name: string;
  product_description: string;
  product_weight: number;
  length: number;
  breadth: number;
  height: number;
  product_attributes: ProductAttribute[];
  product_image: string;
  warehouse: WarehouseStock[];
  created_by?: string;
  ownership?: string;
  status?: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Pagination State
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const limit = 10;

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchProducts(page, limit);
  }, [page, limit]);

  const fetchWarehouses = async () => {
    try {
      const warehouseData = await getAllWarehouses();
      setWarehouses(warehouseData.data);
    } catch (error) {
      console.error("Error loading warehouses", error);
    }
  };

  const fetchProducts = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const productData = await getAllProducts(pageParam, limitParam);
      setTotalRecords(productData.total);
      setProducts(productData.data);
    } catch (error) {
      console.error("Error loading products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this product as ${newStatus}?`
      )
    ) {
      try {
        await updateProduct(product._id!, { ...product, status: newStatus });
        await fetchProducts();
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleSaveProduct = async (
    productData: Partial<Product>,
    imagePreview: string,
    imageName: string
  ) => {
    try {
      let finalProductData = { ...productData };

      // Handle Image Upload if a new image preview is provided
      if (imagePreview && !imagePreview.startsWith("http")) {
        const imageData = await createAmazonS3(
          `product/${Date.now()}-${imageName.replace(/ /g, "_")}`,
          imagePreview
        );
        finalProductData.product_image = (imageData as any).url;
      } else {
        finalProductData.product_image = imagePreview || "";
      }

      if (editingProduct && editingProduct._id) {
        await updateProduct(editingProduct._id, finalProductData as Product);
      } else {
        await createProduct(finalProductData as Product);
        setPage(1); // Reset to first page on create
      }

      await fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      throw error; // Re-throw so the modal form knows it failed
    }
  };

  const warehouseMap = useMemo(() => {
    return warehouses.reduce<Record<string, Warehouse>>((acc, wh) => {
      acc[wh._id] = wh;
      return acc;
    }, {});
  }, [warehouses]);

  const columns = useMemo(
    () => [
      {
        name: "Product Name",
        selector: (row: Product) => row.product_name,
        sortable: true,
        width: "280px",
        wrap: true,
        cell: (row: Product) => (
          <div className="flex flex-col gap-1 py-3">
            <span className="text-lg font-semibold text-neutral-600 leading-tight">
              {row.product_name}
            </span>
            <span className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
              {row.product_description}
            </span>
          </div>
        ),
      },
      {
        name: "Specifications",
        minWidth: "220px",
        cell: (row: Product) => (
          <div className="flex flex-col gap-2 py-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Ruler className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                <span className="text-gray-900 font-medium">Dim:</span>{" "}
                {row.length} × {row.breadth} × {row.height}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Weight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                <span className="text-gray-900 font-medium">Weight:</span>{" "}
                {row.product_weight} kg
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Attributes",
        minWidth: "200px",
        cell: (row: Product) => (
          <div className="flex flex-col gap-1.5 py-2 text-sm">
            {row.product_attributes?.length > 0 ? (
              row.product_attributes.map((attr, idx) => (
                <div key={idx} className="flex items-start gap-2 text-gray-600">
                  <Tag className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-gray-900 font-medium capitalize">
                      {attr.key}
                    </span>
                    <span className="text-gray-500 text-xs">{attr.value}</span>
                  </div>
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic">No attributes</span>
            )}
          </div>
        ),
      },
      {
        name: "Stock Status",
        minWidth: "220px",
        cell: (row: Product) => (
          <div className="flex flex-col gap-2 py-2 text-sm w-full pe-4">
            {row.warehouse?.length > 0 ? (
              row.warehouse.map((wh, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 text-gray-600 truncate">
                    <Package className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">
                      {warehouseMap[wh.warehouse?._id]?.name || "N/A"}
                    </span>
                  </div>
                  <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md text-xs font-semibold shrink-0">
                    {wh.stock}
                  </span>
                </div>
              ))
            ) : (
              <span className="text-gray-400 italic">No stock data</span>
            )}
          </div>
        ),
      },
      {
        name: "Actions",
        width: "220px",
        cell: (row: Product) => {
          const isActive = row.status === "active";
          return (
            <div className="py-2 flex items-center gap-2 w-full">
              <button
                onClick={() => handleEdit(row)}
                className="p-2.5 text-neutral-600 rounded-lg shadow-sm transition-all duration-200 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 flex items-center justify-center"
                title="Edit Product"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleStatus(row)}
                className={`flex-1 font-semibold px-3 py-2 text-sm text-neutral-600 rounded-lg shadow-sm transition-all duration-200 border border-neutral-600 ${
                  isActive
                    ? "hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                    : "hover:bg-green-50 hover:border-green-300 hover:text-green-700"
                }`}
              >
                {isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          );
        },
      },
    ],
    [warehouseMap]
  );

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Products
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
        columns={columns}
        data={products}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
        warehouses={warehouses}
        onSave={handleSaveProduct}
      />
    </>
  );
};

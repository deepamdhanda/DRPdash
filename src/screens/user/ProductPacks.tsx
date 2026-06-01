import React, { useEffect, useState, useMemo } from "react";
import {
  getAllProductPacks,
  createProductPack,
  updateProductPack,
} from "../../APIs/user/productPack";
import CustomDataTable from "../../components/DataTable"; // Adjust path if needed
import {
  Edit2,
  Package,
  Ruler,
  IndianRupee,
  Activity,
  Calendar,
} from "lucide-react";
import { ProductPackModal } from "../../components/productpacks/ProductPackModal";

export interface User {
  _id: string;
  name: string;
}

export interface ProductPack {
  _id: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  stock: number;
  packing_cost: number;
  volumetric_weight: number;
  created_by: User;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

export const ProductPacks: React.FC = () => {
  const [productPacks, setProductPacks] = useState<ProductPack[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductPack, setEditingProductPack] =
    useState<ProductPack | null>(null);

  // Pagination states
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  // const limit = 10;
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    fetchProductPacks(page, limit);
  }, [page, limit]);

  const fetchProductPacks = async (pageParam = page, limitParam = limit) => {
    setLoading(true);
    try {
      const data = await getAllProductPacks(pageParam, limitParam);
      setTotalRecords(data.total);
      setProductPacks(data.data);
    } catch (error) {
      console.error("Error loading product_packs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingProductPack(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product_pack: ProductPack) => {
    setEditingProductPack(product_pack);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (product_pack: ProductPack) => {
    const newStatus = product_pack.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this product pack as ${newStatus}?`
      )
    ) {
      try {
        await updateProductPack(product_pack._id, { status: newStatus });
        await fetchProductPacks();
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleSaveProductPack = async (
    data: Omit<ProductPack, "_id" | "created_by" | "status">
  ) => {
    try {
      if (editingProductPack) {
        await updateProductPack(editingProductPack._id, data);
      } else {
        await createProductPack(data);
        setPage(1); // Go to first page on new entry
      }
      await fetchProductPacks();
    } catch (error) {
      console.error("Error saving product pack", error);
      throw error;
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Pack Details",
        selector: (row: ProductPack) => row.name,
        sortable: true,
        width: "250px",
        cell: (row: ProductPack) => (
          <div className="flex flex-col gap-1 py-3">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  row.status === "active"
                    ? "bg-green-500 shadow-sm shadow-green-500/40"
                    : row.status === "inactive"
                    ? "bg-red-500 shadow-sm shadow-red-500/40"
                    : "bg-gray-400"
                }`}
              />
              <span className="text-sm font-semibold text-gray-800 leading-tight">
                {row.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 ms-4">
              <span>By {row.created_by?.name || "Unknown"}</span>
            </div>
          </div>
        ),
      },
      {
        name: "Specifications",
        minWidth: "220px",
        cell: (row: ProductPack) => (
          <div className="flex flex-col gap-1.5 py-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Ruler className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                {row.length} × {row.breadth} × {row.height} cm
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                Wt: {row.weight}g
              </span>
              <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-100">
                Vol: {row.volumetric_weight}g
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Inventory & Cost",
        minWidth: "180px",
        cell: (row: ProductPack) => (
          <div className="flex flex-col gap-1.5 py-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{row.stock} in stock</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <IndianRupee className="w-3.5 h-3.5 text-gray-400" />
              <span>{row.packing_cost} / piece</span>
            </div>
          </div>
        ),
      },
      {
        name: "Created On",
        minWidth: "150px",
        cell: (row: ProductPack) => (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>
              {row.createdAt
                ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </span>
          </div>
        ),
      },
      {
        name: "Actions",
        width: "200px",
        cell: (row: ProductPack) => {
          const isActive = row.status === "active";
          return (
            <div className="py-2 flex items-center gap-2 w-full">
              <button
                onClick={() => handleEdit(row)}
                className="p-2 text-neutral-600 rounded-lg shadow-sm transition-all duration-200 border border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 flex items-center justify-center"
                title="Edit Product Pack"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleToggleStatus(row)}
                className={`flex-1 flex items-center justify-center gap-1.5 font-medium px-3 py-1.5 text-sm rounded-lg shadow-sm transition-all duration-200 border ${
                  isActive
                    ? "text-red-700 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300"
                    : "text-green-700 border-green-200 bg-green-50 hover:bg-green-100 hover:border-green-300"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
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
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">
            Product Packs
          </h1>
          <p className="text-sm text-gray-500">
            Manage your packaging materials, dimensions, and inventory.
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-[#F5891E] to-[#FF6B35] rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          + New Product Pack
        </button>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={productPacks}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      <ProductPackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productPack={editingProductPack}
        onSave={handleSaveProductPack}
      />
    </>
  );
};

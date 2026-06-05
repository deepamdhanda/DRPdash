import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import CustomDataTable from "../../components/DataTable"; // Adjust path as needed
import { Link2, Plus, PlusCircle } from "lucide-react";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";
import {
  linkProductSkuToChannelAccount,
  getUnlinkedProductSku,
  postNewProduct,
} from "../../APIs/user/productSKUChannelLink";
import { getAllWarehouses } from "../../APIs/user/warehouse";

import { LinkBulkModal } from "../../components/channel-sku/LinkBulkModal";
import { LinkSingleModal } from "../../components/channel-sku/LinkSingleModal";
import { CreateProductModal } from "../../components/channel-sku/CreateProductModal";
import { ProductSKU } from "./ProductSKUs";
import { ChannelAccount } from "./ChannelAccounts";

// Shared Types
export type newProductSKU = {
  _id: string;
  product_name: string;
  variant_id: string;
  product_sku_id?: string;
  price: number;
  channel_account_id: string;
  channel_account_name: string;
  product_description: string;
};

export type Warehouse = {
  _id: string;
  name: string;
};

export const ChannelSKU: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [refresh, setRefresh] = useState<boolean>(false);

  // Data States
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [unlinkedProducts, setUnlinkedProducts] = useState<newProductSKU[]>([]);

  // Modal Visibility States
  const [showBulkLinkModal, setShowBulkLinkModal] = useState(false);
  const [showSingleLinkModal, setShowSingleLinkModal] = useState(false);
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);

  // Selected Item States for Modals
  const [selectedUnlinkedProduct, setSelectedUnlinkedProduct] =
    useState<newProductSKU | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [page, limit, refresh]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [
        productSKUsData,
        channelAccountsData,
        unlinkedProductsData,
        warehousesData,
      ] = await Promise.all([
        getAllProductSKUs(),
        getAllChannelAccounts(),
        getUnlinkedProductSku(page, limit),
        getAllWarehouses(),
      ]);
      setTotalRecords(unlinkedProductsData.total);
      setProductSKUs(productSKUsData.data);
      setChannelAccounts(channelAccountsData.data);
      setUnlinkedProducts(unlinkedProductsData.data);
      setWarehouses(warehousesData.data || []);
    } catch (error) {
      console.error("Error fetching initial data", error);
      toast.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSuccess = () => {
    setShowBulkLinkModal(false);
    setShowSingleLinkModal(false);
    setRefresh((prev) => !prev);
  };

  const handleCreateSuccess = () => {
    setShowCreateProductModal(false);
    setRefresh((prev) => !prev);
  };

  const columns = useMemo(
    () => [
      {
        name: "Product Details",
        selector: (row: newProductSKU) => row.product_name,
        sortable: true,
        wrap: true,
        width: "280px",
        cell: (row: newProductSKU) => (
          <div className="flex flex-col gap-1 py-3">
            <span className="text-sm font-semibold text-neutral-800 leading-tight">
              {row.product_name || "N/A"}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Variant ID: {row.variant_id || "N/A"}
            </span>
          </div>
        ),
      },
      {
        name: "Channel Account",
        selector: (row: newProductSKU) => row.channel_account_name,
        sortable: true,
        cell: (row: newProductSKU) => (
          <span className="text-sm text-gray-600">
            {row.channel_account_name || "N/A"}
          </span>
        ),
      },
      {
        name: "Price",
        selector: (row: newProductSKU) => row.price,
        sortable: true,
        cell: (row: newProductSKU) => (
          <span className="text-sm font-medium text-gray-900">
            ₹{row.price || "0.00"}
          </span>
        ),
      },
      {
        name: "Linked SKU",
        selector: (row: newProductSKU) => row.product_sku_id,
        sortable: true,
        cell: (row: newProductSKU) => (
          <span className="text-sm text-gray-500 font-mono">
            {row.product_sku_id || "Unlinked"}
          </span>
        ),
      },
      {
        name: "Actions",
        width: "320px",
        cell: (row: newProductSKU) =>
          !row.product_sku_id ? (
            <div className="flex items-center gap-2 py-2">
              <button
                onClick={() => {
                  setSelectedUnlinkedProduct(row);
                  setShowSingleLinkModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors shadow-sm"
              >
                <Link2 className="w-3.5 h-3.5" />
                Link Product
              </button>
              <button
                onClick={() => {
                  setSelectedUnlinkedProduct(row);
                  setShowCreateProductModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors shadow-sm"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Create New
              </button>
            </div>
          ) : (
            <span className="text-xs text-gray-400 italic">Fully Linked</span>
          ),
      },
    ],
    []
  );

  return (
    <div className="mt-4 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
            Channel SKU Management
          </h1>
        </div>
        <button
          onClick={() => setShowBulkLinkModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Link New Products
        </button>
      </div>

      <CustomDataTable
        setLimit={setLimit}
        columns={columns}
        data={unlinkedProducts}
        totalRecords={totalRecords}
        page={page}
        limit={limit}
        setPage={setPage}
        isLoading={loading}
      />

      {/* Modals */}
      {showBulkLinkModal && (
        <LinkBulkModal
          isOpen={showBulkLinkModal}
          onClose={() => setShowBulkLinkModal(false)}
          productSKUs={productSKUs}
          channelAccounts={channelAccounts}
          onSuccess={handleLinkSuccess}
          apiLinkFunction={linkProductSkuToChannelAccount}
        />
      )}

      {showSingleLinkModal && selectedUnlinkedProduct && (
        <LinkSingleModal
          isOpen={showSingleLinkModal}
          onClose={() => {
            setShowSingleLinkModal(false);
            setSelectedUnlinkedProduct(null);
          }}
          unlinkedProduct={selectedUnlinkedProduct}
          productSKUs={productSKUs}
          onSuccess={handleLinkSuccess}
          apiLinkFunction={linkProductSkuToChannelAccount}
        />
      )}

      {showCreateProductModal && selectedUnlinkedProduct && (
        <CreateProductModal
          isOpen={showCreateProductModal}
          onClose={() => {
            setShowCreateProductModal(false);
            setSelectedUnlinkedProduct(null);
          }}
          unlinkedProduct={selectedUnlinkedProduct}
          warehouses={warehouses}
          onSuccess={handleCreateSuccess}
          apiCreateFunction={postNewProduct}
        />
      )}
    </div>
  );
};

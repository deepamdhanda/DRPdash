import React, { useEffect, useMemo, useState } from "react";
import {
  getAllOrders,
  updateOrder,
  getAllFilters,
} from "../../APIs/user/order";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";
import CustomDataTable from "../../components/DataTable";
import { ProductSKU } from "./ProductSKUs";
import { Warehouse } from "./Warehouse";
import { toast } from "react-toastify";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  Truck,
  Search,
  FilterX,
} from "lucide-react";

export interface User {
  _id: string;
  name: string;
}

export interface Order {
  _id: string;
  order_id: number;
  channel_order_id: string;
  store_order_id: string;
  order_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_pincode: number;
  product_name: string;
  quantity: number;
  channel_account_name: string;
  product_sku_id: string;
  total_amount: number;
  issues: Array<any>;
  product_sku: ProductSKU[];
  name: string;
  payment_method: string;
  awb_number: string;
  channel_account: { channel_account_name: string; _id: string };
  status: Array<{
    status: string;
    status_date: string;
    description?: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  label?: any;
  recommended_courier_id?: string;
  recommended_courier_name?: string;
  recommended_courier_rate?: number;
  shipping_courier_id?: string;
  recommended_warehouse_id?: string;
  shipping_warehouse_id?: string;
}

interface FilterParams {
  searchQuery?: string;
  channelAccountId?: string;
  warehouseId?: string;
  productSKUId?: string;
  selectedCouriers?: string[];
  productName?: string;
  paymentMethod?: string;
}

const FlaggedOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  // const [rowsPerPage] = useState<number>(10);
  const [rowsPerPage, setLimit] = useState(10);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterParams>({});
  const [searchInput, setSearchInput] = useState<string>("");

  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [courierPartners, setCourierPartners] = useState<any[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [filtersData, warehouseData, skuData, channelData] =
          await Promise.all([
            getAllFilters(true),
            getAllWarehouses(),
            getAllProductSKUs(),
            getAllChannelAccounts(),
          ]);

        setCourierPartners(filtersData.courierPartners || []);
        setWarehouses(warehouseData.data || []);
        setProductSKUs(skuData.data || []);
        setChannelAccounts(channelData.data || []);
      } catch (error) {
        toast.error("Error fetching initial data: " + error);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange("searchQuery", searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetchOrders(currentPage, rowsPerPage, filters);
  }, [currentPage, rowsPerPage, filters]);

  const fetchOrders = async (
    page: number,
    limit: number,
    filterParams: FilterParams
  ) => {
    setIsLoading(true);
    try {
      const response = await getAllOrders(
        page,
        limit,
        {
          page,
          limit,
          ...filterParams,
        },
        "/flagged"
      );

      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (error) {
      toast.error("Error fetching orders: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterParams, value: any) => {
    setFilters((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchInput("");
    setFilters({});
    setCurrentPage(1);
  };

  const handleCancelOrder = async (order: Order, status: any) => {
    try {
      const updatedStatus = [
        ...order.status,
        {
          status: status.toLowerCase(),
          status_date: new Date().toISOString(),
          description: "Order cancelled by brand admin",
        },
      ];

      const response = await updateOrder(order._id, {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        shipping_pincode: order.shipping_pincode,
        status: updatedStatus,
      });

      if (response) {
        toast.success("Order status updated successfully.");
        fetchOrders(currentPage, rowsPerPage, filters);
      } else {
        toast.error("Failed to update order.");
      }
    } catch (error) {
      toast.error("Error updating order: " + error);
    }
  };

  const columns = useMemo(
    () => [
      {
        name: "Order Details",
        width: "220px",
        wrap: true,
        cell: (row: Order) => (
          <div className="flex flex-col gap-1 py-3 text-sm">
            <span className="text-base font-semibold text-neutral-600 leading-tight">
              #{row.order_id || "—"}
            </span>
            <div className="flex flex-col text-xs text-gray-500 leading-relaxed">
              <span>
                <span className="font-medium text-gray-900">Channel OID:</span>{" "}
                {row.channel_order_id || "—"}
              </span>
              <span>
                <span className="font-medium text-gray-900">Store OID:</span>{" "}
                <span className="text-blue-600">
                  {row.store_order_id || "—"}
                </span>
              </span>
              <span>
                <span className="font-medium text-gray-900">Channel:</span>{" "}
                {row.channel_account_name || "—"}
              </span>
            </div>
          </div>
        ),
      },
      {
        name: "Product Details",
        width: "225px",
        wrap: true,
        cell: (row: Order) => (
          <div className="flex flex-col gap-1 py-3 text-sm">
            <span className="text-neutral-700 font-medium underline underline-offset-2 leading-tight">
              {row.product_name || "—"}
            </span>
            <span className="text-xs text-gray-500">
              <span className="font-medium text-gray-900">SKU:</span>{" "}
              {row.product_sku_id || "—"}
            </span>
          </div>
        ),
      },
      {
        name: "Customer Details",
        width: "260px",
        wrap: true,
        cell: (row: any) => (
          <div className="flex flex-col gap-1.5 py-3 text-sm">
            <span className="font-semibold text-neutral-600 leading-tight">
              {row.customer_name || "—"}
            </span>
            <div className="flex flex-col gap-1 text-xs text-gray-600">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span>{row.customer_phone || "—"}</span>
              </div>
              {row.customer_email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span className="truncate">{row.customer_email}</span>
                </div>
              )}
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                <span className="line-clamp-2 leading-relaxed">
                  {row.shipping_address}, {row.shipping_city},{" "}
                  {row.shipping_state}, {row.shipping_country} -{" "}
                  {row.shipping_pincode}
                </span>
              </div>
            </div>
          </div>
        ),
      },
      {
        name: "Courier Details",
        width: "240px",
        wrap: true,
        cell: (row: any) => {
          const sortedStatus = row.status
            ? [...row.status].sort(
                (a: any, b: any) =>
                  new Date(b.status_date).getTime() -
                  new Date(a.status_date).getTime()
              )
            : [];

          const latestStatus =
            sortedStatus?.[0]?.status?.replaceAll("_", " ") || "—";

          const tooltipText =
            sortedStatus.length > 0
              ? sortedStatus
                  .map(
                    (status: any, index: number) =>
                      `${index + 1}. ${status.status.replaceAll(
                        "_",
                        " "
                      )} at ${new Date(
                        status.status_date
                      ).toLocaleDateString()} ${new Date(
                        status.status_date
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`
                  )
                  .join("\n")
              : "No status updates";

          return (
            <div className="flex flex-col gap-1.5 py-3 text-sm">
              {/* Recommended Courier */}
              {row?.recommended_courier_id && !row?.shipping_courier_id && (
                <div className="mb-1">
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md text-xs font-semibold inline-flex items-center gap-1">
                    👍 {row?.recommended_courier_name || "—"}
                  </span>
                </div>
              )}

              {/* Shipping Courier */}
              {row?.shipping_courier_id && (
                <span className="font-medium text-gray-900 text-xs">
                  {row?.shipping_courier_name || "—"}
                </span>
              )}

              {/* AWB Number */}
              {row.awb_number ? (
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <a
                    href={row?.tracking_url?.replace(
                      "{{awb_number}}",
                      row.awb_number
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    {row.awb_number}
                  </a>
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  <span className="font-medium text-gray-900">AWB:</span> —
                </div>
              )}

              {/* Latest Status */}
              <div className="flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span
                  title={tooltipText}
                  className="text-[11px] capitalize text-blue-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 cursor-help underline decoration-dotted underline-offset-2"
                >
                  {latestStatus}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        name: "Fetched On",
        width: "120px",
        sortable: true,
        selector: (row: Order) => row.createdAt,
        cell: (row: Order) => (
          <div className="py-3 text-sm text-gray-600">
            {row.createdAt
              ? new Date(row.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </div>
        ),
      },
      {
        name: "Actions",
        width: "180px",
        cell: (row: Order) => {
          const hasAwb = Boolean(row.awb_number);
          const latestStatus = row.status?.length
            ? row.status.sort(
                (a: any, b: any) =>
                  new Date(b.status_date).getTime() -
                  new Date(a.status_date).getTime()
              )[0]
            : null;

          const isCancelled = latestStatus?.status === "cancelled";

          return (
            <div className="py-2 flex flex-col gap-2 w-full pr-4">
              {/* Change Courier */}
              {hasAwb &&
                latestStatus &&
                (latestStatus.status === "AWB & Label Generated" ||
                  latestStatus.status.toLowerCase().includes("pickup")) && (
                  <button
                    onClick={() => alert("Courier Changed")}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium underline text-left transition-colors"
                  >
                    Change Courier
                  </button>
                )}

              {/* Cancel / Reactivate Order */}
              {!hasAwb && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to change the status of this order?"
                      )
                    ) {
                      handleCancelOrder(
                        row,
                        isCancelled ? "re_activate" : "cancelled"
                      );
                    }
                  }}
                  className={`w-full font-semibold px-3 py-1.5 text-sm rounded-lg shadow-sm transition-all duration-200 border flex items-center justify-center ${
                    isCancelled
                      ? "text-green-700 border-green-600 hover:bg-green-50 hover:border-green-300"
                      : "text-red-700 border-red-600 hover:bg-red-50 hover:border-red-300"
                  }`}
                >
                  {isCancelled ? "Re-Activate" : "❌ Cancel"}
                </button>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8  w-full text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Flagged Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage and resolve flagged issues for your orders.
          </p>
        </div>
      </div>

      {/* Inline Filters Panel */}
      <div className="bg-white p-4 rounded-xl   mb-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative col-span-1 lg:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, etc..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            />
          </div>

          {/* Channel Account Filter */}
          <select
            value={filters.channelAccountId || ""}
            onChange={(e) =>
              handleFilterChange("channelAccountId", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Channels</option>
            {channelAccounts.map((account) => (
              <option key={account._id} value={account._id}>
                {account.channel_account_name}
              </option>
            ))}
          </select>

          {/* Warehouse Filter */}
          <select
            value={filters.warehouseId || ""}
            onChange={(e) => handleFilterChange("warehouseId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Warehouses</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse._id} value={warehouse._id}>
                {warehouse.name} ({warehouse.City})
              </option>
            ))}
          </select>

          {/* SKU Filter */}
          <select
            value={filters.productSKUId || ""}
            onChange={(e) => handleFilterChange("productSKUId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All SKUs</option>
            {productSKUs.map((sku) => (
              <option key={sku._id} value={sku._id}>
                {sku.product_sku_id}
              </option>
            ))}
          </select>
        </div>

        {/* Second Row of Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex-1 w-full max-w-sm">
            {/* Courier Multi-Select */}
            <select
              multiple
              value={filters.selectedCouriers || []}
              onChange={(e) =>
                handleFilterChange(
                  "selectedCouriers",
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 scrollbar-thin h-24"
              title="Hold Ctrl/Cmd to select multiple couriers"
            >
              {courierPartners.map(
                (courier) =>
                  courier.courier && (
                    <option
                      key={courier.shipping_courier_id}
                      value={courier.shipping_courier_id}
                      className="py-1"
                    >
                      {courier.courier} ({courier.count})
                    </option>
                  )
              )}
            </select>
            <p className="text-[10px] text-gray-400 mt-1 ml-1">
              Hold Ctrl (Windows) or ⌘ (Mac) to select multiple.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <FilterX className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <CustomDataTable
          setLimit={setLimit}
          data={orders}
          columns={columns}
          totalRecords={totalOrders}
          limit={rowsPerPage}
          setPage={(page: number) => setCurrentPage(page)}
          isLoading={isLoading}
          page={currentPage}
        />
      </div>
    </div>
  );
};

export { FlaggedOrders };

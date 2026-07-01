import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { appAxios } from "../../axios/appAxios";
import {
  channelAccounts_url,
  couriers_url,
  productSKUChannelLinks_url,
} from "../../URLs/user";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { drpCrmBaseUrl } from "../../axios/urls";
import { FaBoxOpen, FaTruck } from "react-icons/fa";
import { CheckCircle2, Info, PackageOpen, Plus, Search } from "lucide-react";
import { FaGear } from "react-icons/fa6";
import "../../components/order-dash/OrderDash.css";
import OrderTable from "../../components/order-dash/OrderTable";
import ShipmentModal from "../../components/order-dash/ShipmentModal";
import { bookCourier, schedulePickup } from "../../APIs/user/courier";
import { EditOrderModal } from "../../components/order-dash/EditOrderModal";
import { updateOrder } from "../../APIs/user/order";
import { pincodeDetails } from "../../APIs/pincodeAPIs";
import {
  LinkProductModal,
  PhysicalDetails,
} from "../../components/order-dash/LinkProductModal";
import { Warehouse } from "./Warehouse";
import Pagination from "../../components/order-dash/Pagination";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { SchedulePickupModal } from "../../components/order-dash/SchedulePickupModal";
import {
  LabelPrinter,
  LabelPrinterRef,
} from "../../components/order-dash/LabelPreviewModal";

import { motion } from "framer-motion";
import { UpdateDimensionsModal } from "../../components/order-dash/UpdateDimensionsModal";

export interface Order {
  _id: string;
  order_id: number | string;
  channel_id: string | any;
  channel_order_id: string;
  store_order_id: string;
  order_date: string;
  customer_name: string;
  customer_phone: string | number;
  customer_email?: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  shipping_pincode: number;
  quantity: number;
  total_amount: number;
  payment_method: string;
  awb_number: string;
  channel_account: {
    channel_account_name: string;
    _id: string;
    pool_id?: string;
  };
  status: Array<{ status: string; status_date: string; status_details?: any }>;
  createdAt?: string;
  updatedAt?: string;
  items: Array<{
    product: {
      _id: string;
      product_sku_id: string;
      product_sku_name: string;
    };
    variantId?: string;
    quantity: number;
  }>;
  flags: Array<any>;
  risk_flag?: any;
  label?: any;
  recommended_courier_id?: string;
  recommended_courier_name?: string;
  shipping_courier_id?: string;
  recommended_warehouse_id?: string;
  first_line_item_price?: string;
}

const OrderDash = () => {
  const navigate = useNavigate();
  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [productSKUs, setProductSKUs] = useState<
    Array<{ _id: string; product_sku_name: string }>
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void channelAccounts;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void productSKUs;
  const [tab, setTab] = useState<String>("new");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);
  const [labelData, setLabelData] = useState<any>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [linkOrderData, setLinkOrderData] = useState<Order | null>(null);
  const [physicalDetails, setPhysicalDetails] = useState<PhysicalDetails>({
    weight: "",
    length: "",
    breadth: "",
    width: "",
    packWeight: "",
    warehouse: [],
  });
  const [missingDataProductId, setMissingDataProductId] = useState<
    string | null
  >(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [pickupOrder, setPickupOrder] = useState<string | null>(null);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const printerRef = useRef<LabelPrinterRef>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);
  const tabs = [
    { key: "new", label: "New", icon: <FaBoxOpen /> },
    {
      key: "pickup",
      label: "Pickups",
      icon: <PackageOpen size={14} />,
    },
    { key: "intransit", label: "In Transit", icon: <FaTruck /> },
    {
      key: "delivered",
      label: "Delivered",
      icon: <CheckCircle2 size={14} />,
    },
    { key: "rto", label: "RTO", icon: <Info size={14} /> },
    { key: "all", label: "All Orders", icon: <FaGear /> },
    { key: "archive", label: "Archive Orders", icon: <FaGear /> },
  ];

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Add this
  const fetchWarehouses = async () => {
    try {
      const warehouseData = await getAllWarehouses();
      setWarehouses(warehouseData.data);
    } catch (error) {
      console.error("Error loading warehouses", error);
    }
  };
  // const limit = 10;
  const [limit, setLimit] = useState(10);
  useEffect(() => {
    setPage(1);
  }, [tab]);

  useEffect(() => {
    fetchChannelAccounts();
    fetchProductSkus();
    fetchWarehouses();
  }, []);
  useEffect(() => {
    fetchOrders();
  }, [tab, page, debouncedSearch, limit]);

  const fetchChannelAccounts = async () => {
    try {
      const response = await appAxios.get(`${channelAccounts_url}?limit=1000`);
      const data = response.data;
      setChannelAccounts(data.data || []);
    } catch (error) {
      console.error("Error fetching channel accounts:", error);
    }
  };

  const fetchProductSkus = async () => {
    try {
      const allProductSKUData = await getAllProductSKUs();
      setProductSKUs(allProductSKUData.data || []);
    } catch (err) {
      console.error("Error fetching product SKUs:", err);
    }
  };
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await appAxios.get(`${drpCrmBaseUrl}/user/order/new`, {
        params: {
          tab,
          page,
          limit,
          search: debouncedSearch,
        },
      });

      setOrders(data.data || data);

      if (data.totalPages) {
        setTotalPages(data.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (error) {
      toast.error("Error fetching Orders");
    } finally {
      setLoading(false);
    }
  };

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  // --- Checkbox Logic ---
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map((order) => order._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOne = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };
  const handleShipmentClose = () => {
    setShowShipmentModal(false);
    setShipmentOrder(null);
    setSelectedWarehouse(null);
  };

  // --- Actions ---

  const handleViewStatus = (statusList: string[]) => {
    /* setStatusList(statusList); setShowStatusModal(true); */
    console.log(statusList);
  };

  const handleShipNow = async (order: Order) => {
    try {
      setShipmentOrder(order);
      const response = await appAxios.get(
        `${couriers_url}/checkServiceabilityv2?id=${order._id}`
      );
      const details = response.data.data;

      setShipmentDetails(details);
      if (details?.fulfillment?.warehouseDetails) {
        setSelectedWarehouse({
          warehouseAddress: {
            warehouse_id:
              details.fulfillment.warehouseDetails._id ||
              details.fulfillment.warehouseDetails.warehouse_id,
          },
        });
      }

      setShowShipmentModal(true);
    } catch (err) {
      if ((err as any).message.toLowerCase() === "product sku not linked") {
        handleOpenLinkModal(order);
      }
      const index = (err as any).response.data.index;
      if (
        (err as any).message.toLowerCase() === "product has missing information"
      ) {
        setMissingDataProductId(order.items[index].product._id);
      }
      toast.error((err as any).message);
    }
  };
  const handlePickupClose = () => {
    setShowPickupModal(false);
    setPickupOrder(null);
  };
  const handlePickupSubmit = async (pickupDate: Date) => {
    if (!pickupOrder || !pickupDate) {
      toast.error("Invalid Date or Order Id");
    }
    const res = pickupDate && (await schedulePickup(pickupOrder, pickupDate));
    if (res) {
      toast.success(
        "Pickup Scheduled for " + pickupDate.toISOString().split("T")[0]
      );
      fetchOrders();
      handlePickupClose();
    }
  };

  const handlePickup = (order: Order) => {
    setPickupOrder(order._id);
    setShowPickupModal(true);
  };
  const handlePrintLabel = (labelData: string) => {
    setLabelData([labelData]);
    setTimeout(() => {
      printerRef.current?.print();
    }, 100);
  };

  const handleAutoBook = (ordersArray: Order[]) => {
    /* handleBookBulkShipment(ordersArray) */
    console.log(ordersArray);
  };
  const handleCancelOrder = async (orderId: string) => {
    try {
      await appAxios.get(`${couriers_url}/cancelShipment?order_id=${orderId}`);
      fetchOrders();
      toast.success("Shipment has been cancelled");
    } catch (err) {
      console.log(err);
      toast.error((err as any).message);
    }
  };

  const handleBookShipment = async (courier_id: any) => {
    try {
      const response = await bookCourier(
        shipmentOrder?._id,
        courier_id,
        selectedWarehouse.warehouseAddress.warehouse_id,
        true
      );
      toast.success(response.message);
      if (response) {
        fetchOrders();
        handlePrintLabel(response.data);
        handleShipmentClose();
      }
    } catch (error) {
      toast.error("Error: " + error);
    }
  };
  const handleEditOrder = (order: Order) => {
    setEditOrder(order);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditOrder(null);
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    if (!editOrder) {
      toast.error("Edit Details not found");
      return;
    }
    e.preventDefault();
    try {
      await updateOrder(editOrder._id, editOrder);
      toast.success("Order updated successfully");
      setShowEditModal(false);
      fetchOrders();
    } catch (error: any) {
      toast.error("Error updating order");
    }
  };
  const hasValue = (val: any) =>
    val !== null && val !== undefined && val !== "";
  const handleOpenLinkModal = (order: Order) => {
    setLinkOrderData(order);
    // Reset form
    setPhysicalDetails({
      weight: "",
      length: "",
      breadth: "",
      width: "",
      packWeight: "",
      warehouse: [],
    });
    setShowLinkModal(true);
  };
  const handleLinkSubmit = async (variantId?: string) => {
    if (!linkOrderData) return;

    if (!physicalDetails.weight || !physicalDetails.length) {
      toast.error("Please fill in weight and dimensions");
      return;
    }

    try {
      const payload = {
        orderId: linkOrderData._id,
        physicalDetails: {
          weight: Number(physicalDetails.weight),
          length: Number(physicalDetails.length),
          breadth: Number(physicalDetails.breadth),
          width: Number(physicalDetails.width),
          packWeight: Number(physicalDetails.packWeight),

          warehouses: physicalDetails.warehouse,
        },
        ...(variantId ? { bodyVariantId: variantId } : {}),
      };

      const res = await appAxios.post(
        `${productSKUChannelLinks_url}/create-from-order`,
        payload
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setShowLinkModal(false);
        setLinkOrderData(null);
        fetchOrders();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Linking failed");
    }
  };

  return (
    <>
      <div className="w-full p-4 space-y-6">
        {/* Top Bar: Title & Primary Action */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Orders Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Streamline your shipping and fulfillment
            </p>
          </div>

          {/* CHANGED: navigates to a dedicated route instead of opening a modal */}
          <button
            onClick={() => navigate("/user/order-dash/add")}
            className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:shadow transition-all duration-200 active:scale-[0.98]"
          >
            <Plus size={16} />
            Add Order
          </button>
        </div>

        {/* Filter Bar: Tabs & Search Input */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-b border-slate-100 pb-4">
          {/* Animated Tabs Container */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full">
            {tabs.map((tabi) => {
              const isActive = tabi.key === tab;
              return (
                <button
                  key={tabi.key}
                  onClick={() => setTab(tabi.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap focus:outline-none ${
                    isActive
                      ? "text-orange-500"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {/* Sliding Highlight Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabHighlight"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm z-0"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}

                  {/* Content elements need relative z-index to sit on top of the moving background */}
                  <span className="relative z-10 flex items-center gap-2">
                    {tabi.icon}
                    {tabi.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input Box */}
          <div className="relative w-full lg:max-w-xs group">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search
                size={18}
                className="text-slate-400 group-focus-within:text-orange-500 transition-colors"
              />
            </span>
            <input
              type="search"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all shadow-inner"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>
      <OrderTable
        orders={orders}
        isLoading={loading}
        page={page}
        limit={limit}
        selectedOrders={selectedOrders}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        onEditOrder={handleEditOrder}
        onViewStatus={handleViewStatus}
        onShipNow={handleShipNow}
        onPickup={handlePickup}
        onPrintLabel={handlePrintLabel}
        onAutoBook={handleAutoBook}
        onCancelOrder={handleCancelOrder}
      />
      <Pagination
        setLimit={setLimit}
        limit={limit}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
      <ShipmentModal
        showShipmentModal={showShipmentModal}
        handleShipmentClose={handleShipmentClose}
        shipmentOrder={shipmentOrder}
        shipmentDetails={shipmentDetails}
        handleBookShipment={handleBookShipment}
      />
      {/* REMOVED: <AddOrderModal ... /> — Add Order is now a dedicated page at /user/order-dash/add */}
      <EditOrderModal
        show={showEditModal}
        onHide={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        editOrder={editOrder}
        setEditOrder={setEditOrder}
        hasValue={hasValue}
        pincodeDetails={pincodeDetails}
        toast={toast}
      />
      <LinkProductModal
        show={showLinkModal}
        onHide={() => setShowLinkModal(false)}
        onSubmit={handleLinkSubmit}
        linkOrderData={linkOrderData}
        physicalDetails={physicalDetails}
        setPhysicalDetails={setPhysicalDetails}
        warehouses={warehouses}
      />
      <SchedulePickupModal
        show={showPickupModal}
        onHide={() => setShowPickupModal(false)}
        onSubmit={(date) => {
          handlePickupSubmit(date);
        }}
      />
      <LabelPrinter ref={printerRef} labelData={labelData} />
      <UpdateDimensionsModal
        show={!!missingDataProductId}
        onHide={() => setMissingDataProductId(null)}
        productId={missingDataProductId}
        onSuccess={() => {
          setMissingDataProductId(null);
          fetchOrders();
        }}
      />
    </>
  );
};

export default OrderDash;

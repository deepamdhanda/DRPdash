import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Barcode from "react-barcode";
import { toast } from "react-toastify";

// Icons
import { BsFillFunnelFill, BsPhoneFill } from "react-icons/bs";
import { FaGear, FaLocationPin } from "react-icons/fa6";
import { FaBoxOpen, FaPlane, FaStore, FaTruck } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import {
  CheckCircle2,
  Info,
  MapPin,
  PackageOpen,
  Plane,
  Scale,
  Star,
  Store,
  Truck,
  MoreVertical,
  Flag,
} from "lucide-react";

// APIs & Config (Replace with your actual imports)
import { appAxios } from "../../axios/appAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { getAllFilters, createOrder } from "../../APIs/user/order";
import {
  channelAccounts_url,
  couriers_url,
  productSKUChannelLinks_url,
} from "../../URLs/user";
import {
  bookCourier,
  checkShipmentServiceavailablity,
  schedulePickup,
} from "../../APIs/user/courier";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { pincodeDetails } from "../../APIs/pincodeAPIs";
import { updateCustomerAddress } from "../../APIs/user/customerAddress";

// --- Types ---
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
    quantity: number;
  }>;
  issues: Array<any>;
  flags: Array<any>;
  risk_flag?: any;
  label?: any;
  recommended_courier_id?: string;
  recommended_courier_name?: string;
  shipping_courier_id?: string;
  recommended_warehouse_id?: string;
  first_line_item_price?: string;
}

// --- Helper Components ---
const ShippingLabel = ({ labelData }: any) => {
  const data = labelData;
  if (!data) return null;
  return (
    <div
      style={{
        width: "100mm",
        height: "150mm",
        fontFamily: "Arial, sans-serif",
        padding: "0 5px",
        fontSize: "10px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        backgroundColor: "white",
      }}
    >
      <div className="header" style={{ textAlign: "center" }}>
        <h2 style={{ margin: "0 0 6px 0", fontWeight: "bold" }}>
          {data.courier_name}
        </h2>
        <hr />
      </div>
      <div style={{ textAlign: "center" }}>
        <Barcode value={data.waybill} height={60} fontSize={16} />
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <div>{data.date}</div>
          <div>{data.sort_code}</div>
        </div>
      </div>
      <hr />
      <div>
        <div style={{ textAlign: "center" }}>
          <b>
            <u>Shipping Address</u>
          </b>
        </div>
        <div className="mb-2">
          {data.customer_address}, {data.customer_address2} -{" "}
          {data.customer_pincode}
        </div>
        <div>Contact: {data.customer_phone || "-"}</div>
      </div>
      <hr />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div>eWaybill: {data.e_waybill}</div>
          <div>
            Payment:{" "}
            <b>
              {data.payment_method?.toLowerCase().includes("cod")
                ? "COD"
                : "Prepaid"}
            </b>
          </div>
          <div>
            Amount: <b>{data.amount}</b>
          </div>
        </div>
        <div>
          <div>Dimensions: {data.dimensions}</div>
          <div>Weight: {data.weight} gm</div>
        </div>
      </div>
      <hr />
      <div style={{ textAlign: "center", fontSize: "10px", color: "#555" }}>
        All orders are shipped exclusively via OrderzUp. Return or exchange is
        subject to the store’s policy.
      </div>
    </div>
  );
};

// --- Main Component ---
const OrdersDashboard: React.FC = () => {
  // Global Data State
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Pagination & Table State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("new_orders");
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);

  // Modals & Forms
  const [showModal, setShowModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);

  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);

  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<Order>>({});
  const [orderItems, setOrderItems] = useState([{ product: "", quantity: 1 }]);

  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupOrder, setPickupOrder] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<Date>();
  const [statusList, setStatusList] = useState<any>([]);

  // Filters & Dropdowns Data
  const [showFilters, setShowFilters] = useState(false);
  const [channelAccounts, setChannelAccounts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [productSKUs, setProductSKUs] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  // Local Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [channelAccountId, setChannelAccountId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Logistics & Printing
  const [shipNowLoading, setShipNowLoading] = useState(false);
  const [labelData, setLabelData] = useState<any>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialFetch();
    fetchChannelAccounts();
    fetchOrders(); // Initial fetch
  }, []);

  // Client-Side Filtering Engine
  useEffect(() => {
    let result = [...allOrders];

    // 1. Tab Filtering
    if (activeTab === "new_orders") {
      result = result.filter(
        (o) =>
          !o.awb_number &&
          !o.status.some((s) => s.status.toLowerCase() === "cancelled")
      );
    } else if (activeTab === "pickup_pending") {
      result = result.filter(
        (o) =>
          o.awb_number &&
          !o.status.some((s) => s.status.toLowerCase() === "shipped")
      );
    } else if (activeTab === "in_transit") {
      result = result.filter((o) =>
        o.status.some(
          (s) =>
            s.status.toLowerCase() === "shipped" ||
            s.status.toLowerCase() === "in transit"
        )
      );
    } else if (activeTab === "delivered") {
      result = result.filter((o) =>
        o.status.some((s) => s.status.toLowerCase() === "delivered")
      );
    } else if (activeTab === "rto") {
      result = result.filter((o) =>
        o.status.some((s) => s.status.toLowerCase().includes("rto"))
      );
    }

    // 2. Search Query Filtering
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.order_id?.toString().toLowerCase().includes(q) ||
          o.customer_name?.toLowerCase().includes(q) ||
          o.customer_phone?.toString().includes(q) ||
          o.awb_number?.toLowerCase().includes(q)
      );
    }

    // 3. Dropdown Filters
    if (channelAccountId)
      result = result.filter(
        (o) =>
          o.channel_id === channelAccountId ||
          o.channel_account?._id === channelAccountId
      );

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to page 1 on filter change
  }, [
    allOrders,
    activeTab,
    searchQuery,
    channelAccountId,
    warehouseId,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    if (labelData && labelData.length > 0) handlePrint();
  }, [labelData]);

  const initialFetch = async () => {
    try {
      const allFiltersData = await getAllFilters();
      const allWarehouseData = await getAllWarehouses();
      const allProductSKUData = await getAllProductSKUs();
      setPaymentMethods(allFiltersData.paymentMethods || []);
      setWarehouses(allWarehouseData.data || []);
      setProductSKUs(allProductSKUData.data || []);
    } catch (e) {
      console.error("Initial Fetch Error:", e);
    }
  };

  const fetchChannelAccounts = async () => {
    try {
      const response = await appAxios.get(channelAccounts_url);
      setChannelAccounts(response.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  // NEW API Implementation - Fetch All Data
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await appAxios.get(`${drpCrmBaseUrl}/user/order/new`);
      if (data.success || Array.isArray(data)) {
        setAllOrders(data.data || data); // Adjust based on exact response mapping
      }
    } catch (error) {
      toast.error("Error fetching orders from new API");
    } finally {
      setIsLoading(false);
      setSelectedOrders([]);
    }
  };

  // --- Selection Handlers ---
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedOrders([...paginatedOrders]);
    else setSelectedOrders([]);
  };

  const handleSelectOne = (order: Order) => {
    if (selectedOrders.some((o) => o._id === order._id)) {
      setSelectedOrders(selectedOrders.filter((o) => o._id !== order._id));
    } else {
      setSelectedOrders([...selectedOrders, order]);
    }
  };

  const isSelected = (id: string) => selectedOrders.some((o) => o._id === id);

  // --- Actions ---
  const handleBookShipment = async (courier_id: any) => {
    try {
      const response = await bookCourier(
        shipmentOrder?._id,
        courier_id,
        shipmentDetails?.fulfillment?.warehouseDetails?._id
      );
      toast.success(response.message);
      if (response) {
        fetchOrders();
        setLabelData([response.data]);
        setShowShipmentModal(false);
      }
    } catch (error) {
      toast.error("Error booking shipment");
    }
  };

  const handleBookBulkShipment = async (ordersToShip: Order[]) => {
    if (ordersToShip.length === 0) return toast.error("No orders selected.");
    setShipNowLoading(true);
    let doneCount = 0;

    await Promise.allSettled(
      ordersToShip.map(async (order) => {
        const courier_id =
          order.recommended_courier_id || order.shipping_courier_id;
        const warehouse_id = order.recommended_warehouse_id;
        if (!courier_id) return;
        try {
          const response = await bookCourier(
            order._id,
            courier_id,
            warehouse_id
          );
          doneCount++;
          if (ordersToShip.length === 1 && response)
            setShowShipmentModal(false);
        } catch (err) {
          console.error(err);
        }
      })
    );
    if (doneCount > 0) {
      toast.success(`${doneCount} shipments booked successfully.`);
      fetchOrders();
    }
    setShipNowLoading(false);
  };

  const handleShipmentImprove = async (order: Order) => {
    try {
      setShipmentOrder(order);
      const response = await appAxios.get(
        `${couriers_url}/checkServiceability?id=${order._id}`
      );
      setShipmentDetails(response.data.data);
      setShowShipmentModal(true);
    } catch (err: any) {
      toast.error(err.message || "Error checking serviceability");
    }
  };

  const handlePrint = () => {
    if (labelRef.current) {
      const printWindow = window.open("", "PRINT", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <style>
                @page { size: 4in 6in; margin: 0; }
                body { margin: 0; font-family: Arial, sans-serif; font-size: 12px; }
              </style>
            </head>
            <body>${labelRef.current.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setLabelData(null);
      }
    }
  };

  const handleNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (orderItems.some((item) => !item.product))
      return toast.error("Select a product for all items.");
    try {
      const payload = { ...newOrder, items: orderItems };
      await createOrder(payload);
      toast.success("Order created successfully");
      setShowNewOrderModal(false);
      setOrderItems([{ product: "", quantity: 1 }]);
      fetchOrders();
    } catch (error: any) {
      toast.error("Error creating order: " + error.message);
    }
  };

  // --- UI Helpers ---
  const getStatusStyles = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("delivered") || s.includes("completed"))
      return "bg-success-subtle text-success border-success-subtle";
    if (s.includes("shipped") || s.includes("transit"))
      return "bg-indigo-subtle text-primary border-primary-subtle";
    if (s.includes("cancel") || s.includes("rto"))
      return "bg-danger-subtle text-danger border-danger-subtle";
    if (s.includes("label") || s.includes("awb"))
      return "bg-info-subtle text-info border-info-subtle";
    return "bg-warning-subtle text-warning border-warning-subtle";
  };

  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  const SkeletonRow = () => (
    <tr>
      {Array(7)
        .fill(0)
        .map((_, i) => (
          <td key={i}>
            <div className="skeleton-block"></div>
          </td>
        ))}
    </tr>
  );

  return (
    <div className="main-wrapper py-4 px-3 px-md-4">
      <style>{`
        :root {
          --primary-indigo: #4f46e5;
          --surface-color: #ffffff;
          --bg-gradient: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
          --border-subtle: #e2e8f0;
        }
        .main-wrapper { background: var(--bg-gradient); min-height: 100vh; font-family: 'Inter', -apple-system, sans-serif; }
        .glass-card {
          background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.8); border-radius: 16px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); overflow: hidden;
        }
        .filter-bar { background: rgba(248, 250, 252, 0.7); border-bottom: 1px solid var(--border-subtle); }
        .modern-table thead { background: #f8fafc; }
        .modern-table thead th {
          font-weight: 600; color: #64748b; font-size: 0.75rem; text-transform: uppercase;
          letter-spacing: 0.025em; padding: 1rem; border-bottom: 1px solid var(--border-subtle); white-space: nowrap;
        }
        .modern-table tbody td {
          padding: 1rem; vertical-align: middle; border-bottom: 1px solid #f1f5f9; transition: background 0.2s; font-size: 0.85rem;
        }
        .modern-table tr:hover td { background: #fdfdff; }
        .modern-table tr.selected td { background: #eff6ff; }
        .row-flag-red { border-left: 4px solid #dc3545; background-color: rgba(220,53,69,0.03); }
        .row-flag-green { border-left: 4px solid #198754; background-color: rgba(25,135,84,0.02); }
        
        .skeleton-block {
          height:20px; width: 80%; border-radius: 4px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%; animation: skeleton-loading 1.5s infinite linear;
        }
        @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        
        .order-chip { color: #F5891E; font-family: 'Monaco', monospace; font-size: 0.85rem; font-weight: 700; }
        .badge-pill { padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; }
        .btn-orange { background: linear-gradient(90deg, #F5891E 0%, #FF6B35 100%); color: white; border: none; font-weight: 600; }
        .btn-orange:hover { opacity: 0.9; color: white; transform: translateY(-1px); }
        
        .custom-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px; }
        .tab-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; border: 1px solid var(--border-subtle);
          background: #fff; color: #475569; white-space: nowrap;
        }
        .tab-btn.active { background: #000434; color: #fff; border-color: #000434; }
        .tab-badge { background: #FFE8CC; color: #F5891E; padding: 2px 6px; border-radius: 10px; font-size: 0.65rem; }
        .tab-btn.active .tab-badge { background: rgba(255,255,255,0.2); color: #fff; }
      `}</style>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Orders Management</h1>
          <p className="text-secondary small mb-0">
            Streamline your shipping and fulfillment
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-primary"
            className="fw-semibold bg-white"
            onClick={() => setShowNewOrderModal(true)}
          >
            📥 Add Manual Order
          </Button>
          <Button
            variant="primary"
            className="btn-orange shadow-sm"
            onClick={() => handleBookBulkShipment(selectedOrders)}
            disabled={selectedOrders.length === 0}
          >
            🚚 Bulk Book ({selectedOrders.length})
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="custom-tabs mb-3">
        {[
          { key: "new_orders", label: "New", icon: <FaBoxOpen /> },
          {
            key: "pickup_pending",
            label: "Pickups",
            icon: <PackageOpen size={14} />,
          },
          { key: "in_transit", label: "In Transit", icon: <FaTruck /> },
          {
            key: "delivered",
            label: "Delivered",
            icon: <CheckCircle2 size={14} />,
          },
          { key: "rto", label: "RTO", icon: <Info size={14} /> },
          { key: "all", label: "All Orders", icon: <FaGear /> },
        ].map((tab) => (
          <div
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      <div className="glass-card">
        {/* Filter Bar */}
        <div className="filter-bar p-3 d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between">
          <div className="d-flex gap-2 w-100" style={{ maxWidth: "400px" }}>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search Order ID, AWB, Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="d-flex gap-2">
            <select
              className="form-select form-select-sm text-secondary fw-medium"
              value={channelAccountId}
              onChange={(e) => setChannelAccountId(e.target.value)}
            >
              <option value="">All Channels</option>
              {channelAccounts.map((acc) => (
                <option key={acc._id} value={acc._id}>
                  {acc.channel_account_name}
                </option>
              ))}
            </select>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="d-flex align-items-center gap-2 bg-white"
            >
              <BsFillFunnelFill /> Advanced
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive" style={{ minHeight: "500px" }}>
          <table className="table modern-table mb-0">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={
                      selectedOrders.length === paginatedOrders.length &&
                      paginatedOrders.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Order Details</th>
                <th>Items & Value</th>
                <th>Customer Info</th>
                <th>Status & Courier</th>
                <th>Risk Flags</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    No orders found matching filters.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const isChecked = isSelected(order._id);
                  const latestStatus = order.status?.length
                    ? [...order.status].sort(
                        (a: any, b: any) =>
                          new Date(b.status_date).getTime() -
                          new Date(a.status_date).getTime()
                      )[0]
                    : null;
                  const statusName = latestStatus?.status || "New Order";

                  // Flag Logic based on new schema
                  const issues = order.issues || [];
                  const riskFlag = order.risk_flag || {};
                  const hasRedFlags =
                    issues.length > 0 ||
                    riskFlag.is_duplicate ||
                    riskFlag.is_suspicious_address;
                  const rowClass = hasRedFlags
                    ? "row-flag-red"
                    : "row-flag-green";

                  return (
                    <tr
                      key={order._id}
                      className={`${isChecked ? "selected" : ""} ${rowClass}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={isChecked}
                          onChange={() => handleSelectOne(order)}
                        />
                      </td>

                      {/* 1. Order Details */}
                      <td>
                        <div className="order-chip">#{order.order_id}</div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "10px", marginTop: "2px" }}
                        >
                          {new Date(
                            order.createdAt || order.order_date
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div
                          className="mt-1 d-flex align-items-center gap-1 text-dark"
                          style={{ fontSize: "11px", fontWeight: 600 }}
                        >
                          <FaStore className="text-muted" />{" "}
                          {order.channel_account?.channel_account_name ||
                            "Manual"}
                        </div>
                      </td>

                      {/* 2. Items Array Mapping */}
                      <td>
                        <div
                          style={{
                            maxHeight: "70px",
                            overflowY: "auto",
                            paddingRight: "4px",
                          }}
                        >
                          {order.items?.map((item, idx) => (
                            <div
                              key={idx}
                              className="mb-1 pb-1 border-bottom border-light"
                            >
                              <div
                                className="fw-semibold text-dark text-truncate"
                                style={{ maxWidth: "180px", fontSize: "12px" }}
                                title={item.product?.product_sku_name}
                              >
                                {item.product?.product_sku_name ||
                                  "Unknown Product"}
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <span
                                  className="text-success"
                                  style={{ fontSize: "10px", fontWeight: 600 }}
                                >
                                  SKU: {item.product?.product_sku_id}
                                </span>
                                <span
                                  className="text-muted"
                                  style={{ fontSize: "10px" }}
                                >
                                  x{item.quantity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 bg-light px-2 py-1 rounded d-inline-block">
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color:
                                order.payment_method === "PREPAID"
                                  ? "#28a745"
                                  : "#d9534f",
                            }}
                          >
                            {order.payment_method === "PREPAID" ? "💳" : "💰"} ₹
                            {order.total_amount}
                          </span>
                        </div>
                      </td>

                      {/* 3. Customer */}
                      <td>
                        <div
                          className="fw-semibold text-dark d-flex align-items-center gap-1"
                          style={{ fontSize: "12px" }}
                        >
                          {order.customer_name}
                          <BiSolidPencil
                            className="text-primary"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setEditOrder(order);
                              setShowModal(true);
                            }}
                          />
                        </div>
                        <div
                          className="text-muted mt-1"
                          style={{ fontSize: "10px" }}
                        >
                          <BsPhoneFill /> {order.customer_phone}
                        </div>
                        <div
                          className="text-muted mt-1 text-truncate"
                          style={{ maxWidth: "200px", fontSize: "10px" }}
                        >
                          <FaLocationPin /> {order.shipping_city},{" "}
                          {order.shipping_state} -{" "}
                          <b>{order.shipping_pincode}</b>
                        </div>
                      </td>

                      {/* 4. Status & Courier */}
                      <td>
                        <span
                          className={`badge-pill ${getStatusStyles(
                            statusName
                          )} mb-2 cursor-pointer`}
                          onClick={() => setStatusList(order.status)}
                        >
                          {statusName}
                        </span>
                        {order.awb_number ? (
                          <div style={{ fontSize: "11px", marginTop: "4px" }}>
                            <b>AWB:</b>{" "}
                            <Link
                              to={`/track/${order.awb_number}`}
                              className="text-primary"
                            >
                              {order.awb_number}
                            </Link>
                          </div>
                        ) : order.recommended_courier_name ? (
                          <div
                            className="mt-1 d-inline-flex align-items-center gap-1"
                            style={{
                              fontSize: "10px",
                              background: "#FFF7F0",
                              color: "#F5891E",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              border: "1px solid #F5891E",
                            }}
                          >
                            <FaPlane /> Rec: {order.recommended_courier_name}
                          </div>
                        ) : (
                          <div
                            className="text-muted mt-1"
                            style={{ fontSize: "10px" }}
                          >
                            No Courier Assigned
                          </div>
                        )}
                      </td>

                      {/* 5. Risk Flags */}
                      <td>
                        <div
                          className="d-flex flex-column gap-1"
                          style={{ maxWidth: "140px" }}
                        >
                          {hasRedFlags ? (
                            <>
                              {issues.map((issue: any, idx: number) => (
                                <Badge
                                  key={idx}
                                  bg="danger"
                                  className="text-wrap text-start"
                                  style={{ fontSize: "9px" }}
                                >
                                  <Flag size={10} /> {issue.message || "Issue"}
                                </Badge>
                              ))}
                              {riskFlag.is_duplicate && (
                                <Badge bg="danger" style={{ fontSize: "9px" }}>
                                  Duplicate
                                </Badge>
                              )}
                              {riskFlag.customer_order_count_in_channel > 0 && (
                                <Badge
                                  bg="warning"
                                  text="dark"
                                  style={{ fontSize: "9px" }}
                                >
                                  Past Orders:{" "}
                                  {riskFlag.customer_order_count_in_channel}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <Badge
                              bg="success"
                              className="bg-opacity-10 text-success border border-success"
                              style={{ fontSize: "10px", width: "fit-content" }}
                            >
                              ✓ Clear to Ship
                            </Badge>
                          )}
                        </div>
                      </td>

                      {/* 6. Actions */}
                      <td className="text-end">
                        <div className="d-flex flex-column align-items-end gap-1">
                          {order.awb_number ? (
                            <Button
                              size="sm"
                              variant="outline-primary"
                              style={{
                                fontSize: "11px",
                                borderRadius: "15px",
                                width: "80px",
                              }}
                              onClick={() => {
                                setPickupOrder(order._id);
                                setShowPickupModal(true);
                              }}
                            >
                              Pickup
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="btn-orange"
                              style={{
                                fontSize: "11px",
                                borderRadius: "15px",
                                width: "80px",
                              }}
                              onClick={() => handleShipmentImprove(order)}
                            >
                              Ship Now
                            </Button>
                          )}
                          <Dropdown align="end">
                            <Dropdown.Toggle
                              variant="link"
                              size="sm"
                              className="text-secondary p-0 m-0"
                            >
                              <MoreVertical size={16} />
                            </Dropdown.Toggle>
                            <Dropdown.Menu
                              className="shadow-sm border-0"
                              style={{ fontSize: "13px" }}
                            >
                              {order.awb_number && (
                                <Dropdown.Item
                                  onClick={() => setLabelData([order.label])}
                                >
                                  🖨️ Print Label
                                </Dropdown.Item>
                              )}
                              {!order.awb_number && (
                                <Dropdown.Item
                                  onClick={() =>
                                    handleBookBulkShipment([order])
                                  }
                                >
                                  📦 Auto Book
                                </Dropdown.Item>
                              )}
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger">
                                ❌ Cancel Order
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-light bg-opacity-50 d-flex justify-content-between align-items-center border-top">
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small fw-medium">
              Showing {filteredOrders.length} Orders
            </span>
            <select
              className="form-select form-select-sm w-auto"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[20, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small me-2">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              className="btn btn-sm btn-white border bg-white shadow-sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Prev
            </button>
            <button
              className="btn btn-sm btn-white border bg-white shadow-sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={
                currentPage === totalPages || isLoading || totalPages === 0
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- ALL MODALS APPENDED BELOW --- */}

      {/* 1. Edit Customer Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            setShowModal(false);
            toast.success("Address Updated");
          }}
        >
          <Modal.Header closeButton className="bg-light">
            <Modal.Title className="h5">Edit Customer Details</Modal.Title>
          </Modal.Header>
          <Modal.Body className="row g-3">
            <Form.Group className="col-md-6">
              <Form.Label className="small fw-bold text-muted">
                Customer Name
              </Form.Label>
              <Form.Control
                type="text"
                defaultValue={editOrder?.customer_name}
                required
              />
            </Form.Group>
            <Form.Group className="col-md-6">
              <Form.Label className="small fw-bold text-muted">
                Phone Number
              </Form.Label>
              <Form.Control
                type="text"
                defaultValue={editOrder?.customer_phone}
                required
              />
            </Form.Group>
            <Form.Group className="col-md-12">
              <Form.Label className="small fw-bold text-muted">
                Address
              </Form.Label>
              <Form.Control
                type="text"
                defaultValue={editOrder?.shipping_address}
                required
              />
            </Form.Group>
            <Form.Group className="col-md-4">
              <Form.Label className="small fw-bold text-muted">
                Pincode
              </Form.Label>
              <Form.Control
                type="text"
                defaultValue={editOrder?.shipping_pincode}
                required
              />
            </Form.Group>
            <Form.Group className="col-md-4">
              <Form.Label className="small fw-bold text-muted">City</Form.Label>
              <Form.Control
                type="text"
                defaultValue={editOrder?.shipping_city}
                disabled
              />
            </Form.Group>
            <Form.Group className="col-md-4">
              <Form.Label className="small fw-bold text-muted">
                State
              </Form.Label>
              <Form.Control
                type="text"
                defaultValue={editOrder?.shipping_state}
                disabled
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 2. Advanced Filters Modal */}
      <Modal
        show={showFilters}
        onHide={() => setShowFilters(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h5">Advanced Filters</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label className="small fw-bold text-muted">
                Warehouse
              </Form.Label>
              <Form.Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w._id}>
                    {w.name} - {w.City}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label className="small fw-bold text-muted">
                Payment Method
              </Form.Label>
              <Form.Select
                value={paymentMethods}
                onChange={(e) => setPaymentMethods(e.target.value)}
              >
                <option value="">All</option>
                {paymentMethods.map((p) => (
                  <option key={p.method} value={p.method}>
                    {p.method}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          {/* <Button variant="outline-secondary" onClick={resetFilters}>
            Clear All
          </Button> */}
          <Button variant="primary" onClick={() => setShowFilters(false)}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 3. Schedule Pickup Modal */}
      <Modal
        show={showPickupModal}
        onHide={() => setShowPickupModal(false)}
        size="sm"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6">Schedule Pickup</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="small fw-bold">Pickup Date</Form.Label>
            <Form.Control
              type="date"
              onChange={(e) => setPickupDate(new Date(e.target.value))}
              min={new Date().toISOString().split("T")[0]}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            className="w-100"
            onClick={() => {
              toast.success("Pickup scheduled!");
              setShowPickupModal(false);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 4. Status History Modal */}
      <Modal
        show={statusList.length > 0}
        onHide={() => setStatusList([])}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title className="h6">Order Timeline</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <ul className="list-group list-group-flush">
            {statusList.map((item: any, idx: number) => (
              <li key={idx} className="list-group-item py-3">
                <div className="d-flex justify-content-between">
                  <strong className="text-dark" style={{ fontSize: "13px" }}>
                    {item.status}
                  </strong>
                  <small className="text-muted" style={{ fontSize: "11px" }}>
                    {new Date(item.status_date).toLocaleString()}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        </Modal.Body>
      </Modal>

      {/* 5. Add New Manual Order Modal (Updated to Item Array map) */}
      <Modal
        show={showNewOrderModal}
        onHide={() => setShowNewOrderModal(false)}
        size="xl"
      >
        <Form onSubmit={handleNewOrderSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Order</Modal.Title>
          </Modal.Header>
          <Modal.Body className="row g-3">
            <Form.Group className="col-lg-6">
              <Form.Label>Channel Account</Form.Label>
              <Form.Select
                required
                value={newOrder?.channel_id || ""}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, channel_id: e.target.value })
                }
              >
                <option value="" disabled>
                  Select a Channel Account
                </option>
                {channelAccounts.map((acc) => (
                  <option key={acc._id} value={acc._id}>
                    {acc.channel_account_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Payment Method</Form.Label>
              <Form.Select
                required
                value={newOrder?.payment_method || ""}
                onChange={(e) =>
                  setNewOrder({ ...newOrder, payment_method: e.target.value })
                }
              >
                <option value="" disabled>
                  Select Method
                </option>
                <option value="COD">COD</option>
                <option value="PREPAID">Prepaid</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                required
                onChange={(e) =>
                  setNewOrder({ ...newOrder, customer_name: e.target.value })
                }
                placeholder="Full Name"
              />
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Phone Number</Form.Label>
              <Form.Control
                type="tel"
                required
                onChange={(e) =>
                  setNewOrder({ ...newOrder, customer_phone: e.target.value })
                }
                placeholder="10 Digit Mobile"
              />
            </Form.Group>

            <Form.Group className="col-lg-12">
              <Form.Label>Full Address</Form.Label>
              <Form.Control
                type="text"
                required
                onChange={(e) =>
                  setNewOrder({ ...newOrder, shipping_address: e.target.value })
                }
              />
            </Form.Group>

            {/* Dynamic Items Mapping */}
            <div className="col-12 mt-4">
              <div className="p-3 border rounded bg-light">
                <h6 className="mb-3">Order Items Array</h6>
                {orderItems.map((item, index) => (
                  <div className="row align-items-end mb-3" key={index}>
                    <Form.Group className="col-md-7">
                      <Form.Label className="small text-muted">
                        Select Product (SKU)
                      </Form.Label>
                      <Form.Select
                        required
                        value={item.product}
                        onChange={(e) => {
                          const newItems = [...orderItems];
                          newItems[index].product = e.target.value;
                          setOrderItems(newItems);
                        }}
                      >
                        <option value="" disabled>
                          Select Product
                        </option>
                        {productSKUs.map((sku) => (
                          <option key={sku._id} value={sku._id}>
                            {sku.product_sku_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="col-md-3">
                      <Form.Label className="small text-muted">
                        Quantity
                      </Form.Label>
                      <Form.Control
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) => {
                          const newItems = [...orderItems];
                          newItems[index].quantity = Number(e.target.value);
                          setOrderItems(newItems);
                        }}
                      />
                    </Form.Group>
                    <div className="col-md-2">
                      {orderItems.length > 1 && (
                        <Button
                          variant="outline-danger"
                          className="w-100"
                          onClick={() =>
                            setOrderItems(
                              orderItems.filter((_, i) => i !== index)
                            )
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setOrderItems([...orderItems, { product: "", quantity: 1 }])
                  }
                >
                  + Add Item
                </Button>
              </div>
            </div>

            <Form.Group className="col-lg-6">
              <Form.Label>Total Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                required
                min="1"
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    total_amount: Number(e.target.value),
                  })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowNewOrderModal(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Order
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* 6. Shipment/Courier Selection Modal */}
      <ShipmentModal
        showShipmentModal={showShipmentModal}
        handleShipmentClose={() => setShowShipmentModal(false)}
        shipmentOrder={shipmentOrder}
        shipmentDetails={shipmentDetails}
        handleBookShipment={handleBookShipment}
      />

      {/* Hidden Print Wrapper */}
      <div style={{ display: "none" }}>
        <div ref={labelRef}>
          {labelData?.map((ld: any, idx: number) => (
            <div key={idx} style={{ pageBreakAfter: "always" }}>
              <ShippingLabel labelData={ld} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;

// --- Shipment Modal Component ---
function ShipmentModal({
  showShipmentModal,
  handleShipmentClose,
  shipmentOrder,
  shipmentDetails,
  handleBookShipment,
}: any) {
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [filterType, setFilterType] = useState("all");

  const { couriers, cheapestId, fastestId, bestRatedId } = useMemo(() => {
    if (!shipmentDetails?.couriers)
      return {
        couriers: [],
        cheapestId: null,
        fastestId: null,
        bestRatedId: null,
      };
    let list = [...shipmentDetails.couriers];
    const checkIsSurface = (c: any) =>
      c.is_surface === true || c.name?.toLowerCase().includes("surface");

    const cheapest = [...list].sort(
      (a, b) => a.total_amount - b.total_amount
    )[0]?._id;
    const fastest = [...list].sort(
      (a, b) =>
        Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
    )[0]?._id;
    const bestRated = [...list].sort((a, b) => b.rating - a.rating)[0]?._id;

    if (filterType === "air") list = list.filter((c) => !checkIsSurface(c));
    if (filterType === "surface") list = list.filter((c) => checkIsSurface(c));

    if (sortBy === "cheapest")
      list.sort((a, b) => a.total_amount - b.total_amount);
    if (sortBy === "fastest")
      list.sort(
        (a, b) =>
          Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
      );
    if (sortBy === "best-rated") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "recommended")
      list.sort(
        (a, b) => b.rating - a.rating || a.total_amount - b.total_amount
      );

    return {
      couriers: list,
      cheapestId: cheapest,
      fastestId: fastest,
      bestRatedId: bestRated,
    };
  }, [shipmentDetails, sortBy, filterType]);

  const primaryDark = "#000434";
  const primaryAccent = "#F5891E";

  return (
    <Modal
      show={showShipmentModal}
      onHide={handleShipmentClose}
      size="xl"
      centered
      backdrop="static"
    >
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="h5 d-flex align-items-center gap-2">
          <PackageOpen color={primaryAccent} size={24} /> Process Shipment
          <span className="badge bg-white text-dark border ms-2">
            Order #{shipmentOrder?.order_id || "—"}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-light p-4">
        {shipmentDetails ? (
          <div className="d-flex flex-column gap-4">
            {/* 1. Summary Bar */}
            <Row className="g-3">
              <Col lg={4}>
                <div className="bg-white p-3 rounded border shadow-sm h-100 d-flex gap-3">
                  <div className="p-2 rounded bg-warning bg-opacity-10">
                    <Store color={primaryAccent} size={20} />
                  </div>
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">
                      Dispatch From
                    </div>
                    <div className="fw-bold text-dark">
                      {shipmentDetails.fulfillment.warehouseDetails.name}
                    </div>
                    <div className="small text-muted">
                      {shipmentDetails.fulfillment.warehouseDetails.City},{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.State}
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="bg-white p-3 rounded border shadow-sm h-100 d-flex gap-3">
                  <div className="p-2 rounded bg-success bg-opacity-10">
                    <MapPin color="#28a745" size={20} />
                  </div>
                  <div>
                    <div className="text-muted small fw-bold text-uppercase">
                      Shipping To
                    </div>
                    <div className="fw-bold text-dark">
                      {shipmentOrder?.customer_name}
                    </div>
                    <div className="small text-muted">
                      {shipmentOrder?.shipping_city},{" "}
                      {shipmentOrder?.shipping_state}
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={4}>
                <div className="bg-white p-3 rounded border shadow-sm h-100 d-flex gap-3">
                  <div className="p-2 rounded bg-primary bg-opacity-10">
                    <Scale color="#0d6efd" size={20} />
                  </div>
                  <div className="w-100">
                    <div className="text-muted small fw-bold text-uppercase mb-1">
                      Weight Summary
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark">
                          {shipmentDetails.weight.actual} kg
                        </div>
                        <div className="small text-muted">Actual</div>
                      </div>
                      <div className="text-muted">/</div>
                      <div>
                        <div className="fw-bold text-dark">
                          {shipmentDetails.weight.volumetric} kg
                        </div>
                        <div className="small text-muted">Volumetric</div>
                      </div>
                      <div className="text-muted">=</div>
                      <div className="bg-success bg-opacity-10 px-2 py-1 rounded text-center">
                        <div className="fw-bold text-success">
                          {shipmentDetails.weight.billable} kg
                        </div>
                        <div
                          className="small text-success fw-bold"
                          style={{ fontSize: "9px" }}
                        >
                          BILLABLE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* 2. Courier Options */}
            <div className="bg-white rounded border shadow-sm p-3">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                <h6 className="fw-bold mb-0">
                  Available Couriers{" "}
                  <Badge bg="light" text="dark" className="border">
                    {couriers.length}
                  </Badge>
                </h6>
                <div className="d-flex gap-2">
                  <Form.Select
                    size="sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="recommended">Recommended</option>
                    <option value="cheapest">Cheapest</option>
                    <option value="fastest">Fastest</option>
                    <option value="best-rated">Best Rated</option>
                  </Form.Select>
                  <Form.Select
                    size="sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="air">✈️ Air</option>
                    <option value="surface">🚚 Surface</option>
                  </Form.Select>
                </div>
              </div>

              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {couriers.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    No couriers match your filter criteria.
                  </div>
                ) : (
                  couriers.map((courier: any) => {
                    const isSurface =
                      courier.is_surface ||
                      courier.name?.toLowerCase().includes("surface");
                    const isRec =
                      sortBy === "recommended" &&
                      courier._id === couriers[0]?._id;
                    return (
                      <div
                        key={courier._id}
                        className="d-flex justify-content-between align-items-center p-3 mb-2 rounded border"
                        style={{
                          backgroundColor: isRec ? "#FFFAF5" : "#fff",
                          borderColor: isRec ? primaryAccent : "#dee2e6",
                        }}
                      >
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className={`p-2 rounded ${
                              isSurface
                                ? "bg-secondary bg-opacity-10"
                                : "bg-primary bg-opacity-10"
                            }`}
                          >
                            {isSurface ? (
                              <Truck size={20} className="text-secondary" />
                            ) : (
                              <Plane size={20} className="text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">
                              {courier.courier_name}
                            </div>
                            <div className="small text-muted d-flex gap-2 align-items-center">
                              <span className="text-warning fw-bold">
                                ★ {courier.rating}/5
                              </span>{" "}
                              |<span>{isSurface ? "Surface" : "Air"}</span> |
                              <span>
                                {courier.estimated_delivery_days} Days Transit
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-4">
                          <div className="text-end">
                            <div className="small text-muted fw-bold">
                              FINAL RATE
                            </div>
                            <div className="fw-bold fs-5 text-dark">
                              ₹{Number(courier.total_amount).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            style={{ background: primaryDark, border: "none" }}
                            onClick={() => handleBookShipment(courier._id)}
                          >
                            Ship Now
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="spinner-border text-warning mb-3"></div>
            <h6>Analyzing Best Shipping Routes...</h6>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

import AddOrderModal, {
  OrderFormData,
} from "../../components/order-dash/AddOrderDialog";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createOrder } from "../../APIs/user/order";
import { appAxios } from "../../axios/appAxios";
import {
  channelAccounts_url,
  couriers_url,
  productSKUChannelLinks_url,
} from "../../URLs/user";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { drpCrmBaseUrl } from "../../axios/urls";
import { FaBoxOpen, FaTruck } from "react-icons/fa";
import { CheckCircle2, Info, PackageOpen } from "lucide-react";
import { FaGear } from "react-icons/fa6";
import "../../components/order-dash/OrderDash.css";
import OrderTable from "../../components/order-dash/OrderTable";
import ShipmentModal from "../../components/order-dash/ShipmentModal";
import { bookCourier } from "../../APIs/user/courier";
import { EditOrderModal } from "../../components/order-dash/EditOrderModal";
import { updateOrder } from "../../APIs/user/order";
import { pincodeDetails } from "../../APIs/pincodeAPIs";
import {
  LinkProductModal,
  PhysicalDetails,
} from "../../components/order-dash/LinkProductModal";
import { Warehouse } from "./Warehouse";

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
  const [show, setShow] = useState(false);
  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [productSKUs, setProductSKUs] = useState<
    Array<{ _id: string; product_sku_name: string }>
  >([]);
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
    warehouseStock: 0, // Simplified for single warehouse, or use array logic
  });
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

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
  ];
  const addOrder = async (payload: OrderFormData) => {
    try {
      await createOrder(payload);
      setShow(false);
      toast.success("Order created successfully");
    } catch (error: any) {
      toast.error("Error creating order: " + error.message);
    }
  };
  useEffect(() => {
    fetchChannelAccounts();
    fetchProductSkus();
  }, []);
  useEffect(() => {
    fetchOrders();
  }, [tab]);

  const fetchChannelAccounts = async () => {
    try {
      const response = await appAxios.get(channelAccounts_url);
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
        params: { tab },
      });
      setOrders(data.data || data);
    } catch (error) {
      toast.error("Error fetching Orders");
    } finally {
      setLoading(false);
    }
  };

  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const limit = 10;

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
  };

  const handleShipNow = async (order: Order) => {
    try {
      setShipmentOrder(order);
      const response = await appAxios.get(
        `${couriers_url}/checkServiceability?id=${order._id}`
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
      toast.error((err as any).message);
    }
  };
  const handlePickup = (order: Order) => {
    /* setPickupOrder(order._id); setShowPickupModal(true); */
  };
  const handlePrintLabel = (labelData: string) => {
    /* setLabelData([labelData]); */
  };
  const handleAutoBook = (ordersArray: Order[]) => {
    /* handleBookBulkShipment(ordersArray) */
  };
  const handleCancelOrder = (orderId: string) => {
    /* cancel logic */
  };
  const handleBookShipment = async (courier_id: any) => {
    try {
      const response = await bookCourier(
        shipmentOrder?._id,
        courier_id,
        selectedWarehouse.warehouseAddress.warehouse_id
      );
      toast.success(response.message);
      if (response) {
        fetchOrders();
        setLabelData([response.data]);
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
      warehouseStock: order.quantity || 1,
    });
    setShowLinkModal(true);
  };
  const handleLinkSubmit = async () => {
    if (!linkOrderData) return;

    // Basic validation
    if (!physicalDetails.weight || !physicalDetails.length) {
      toast.error("Please fill in weight and dimensions");
      return;
    }

    try {
      // Construct the payload matching backend expectation

      const payload = {
        orderId: linkOrderData._id,
        physicalDetails: {
          weight: Number(physicalDetails.weight),
          length: Number(physicalDetails.length),
          breadth: Number(physicalDetails.breadth),
          width: Number(physicalDetails.width),
          packWeight: Number(physicalDetails.packWeight),
          // Assuming you want to add stock to the order's warehouse or a default one
          warehouses: [
            {
              warehouse: warehouses[0]?._id, // Default to first available warehouse
              stock: Number(physicalDetails.warehouseStock),
            },
          ],
        },
      };

      const res = await appAxios.post(
        `${productSKUChannelLinks_url}/create-from-order`,
        payload
      );

      if (res.data.success) {
        toast.success(res.data.message);
        setShowLinkModal(false);
        setLinkOrderData(null);
        fetchOrders(); // Refresh table
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Linking failed");
    }
  };
  return (
    <>
      {" "}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h1 className="h4 fw-bold text-dark mb-1">Orders Management</h1>
          <p className="text-secondary small mb-0">
            Streamline your shipping and fulfillment
          </p>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="fw-semibold tab-btn activehover"
            onClick={() => setShow(true)}
          >
            + Add Order
          </button>
        </div>
      </div>
      <div className="custom-tabs mb-3">
        {tabs.map((tabi) => (
          <div
            key={tabi.key}
            className={`tab-btn ${tabi.key === tab ? "active" : ""}`}
            onClick={() => setTab(tabi.key)}
          >
            {tabi.icon} {tabi.label}
          </div>
        ))}
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
      <ShipmentModal
        showShipmentModal={showShipmentModal}
        handleShipmentClose={handleShipmentClose}
        shipmentOrder={shipmentOrder}
        shipmentDetails={shipmentDetails}
        handleBookShipment={handleBookShipment}
      />
      <AddOrderModal
        show={show}
        onClose={() => setShow(false)}
        onSubmit={addOrder}
        dropdownOptions={{
          channels: channelAccounts,
          products: productSKUs,
        }}
      />
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
      />
    </>
  );
};

export default OrderDash;

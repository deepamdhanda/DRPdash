import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Table,
  OverlayTrigger,
  Tooltip,
  Dropdown,
  Badge,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  getAllOrders,
  updateOrder,
  getAllFilters,
  createOrder,
} from "../../APIs/user/order";

import { appAxios } from "../../axios/appAxios";
import {
  channelAccounts_url,
  couriers_url,
  productSKUChannelLinks_url,
} from "../../URLs/user";
import { BsClockFill, BsFillFunnelFill, BsPhoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaBriefcase, FaGear, FaLocationPin } from "react-icons/fa6";

import { FaBoxOpen, FaPlane, FaStore, FaTruck } from "react-icons/fa";
import { BiSolidPencil } from "react-icons/bi";
import { ProductSKU } from "./ProductSKUs";
import {
  bookCourier,
  checkShipmentServiceavailablity,
  getCommonWarehouses,
  schedulePickup,
} from "../../APIs/user/courier";
import { toast } from "react-toastify";
import Barcode from "react-barcode";
import { Warehouse } from "./Warehouse";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import DatePicker from "react-datepicker";
import { pincodeDetails } from "../../APIs/pincodeAPIs";
import OUAIIcon from "../../assets/ouai_icon";
import { updateCustomerAddress } from "../../APIs/user/customerAddress";
import { Link } from "react-router-dom";
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
} from "lucide-react";

export interface User {
  _id: string;
  name: string;
}

export interface Order {
  _id: string;
  order_id: number;
  channel_id: string;
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
  remittance_status?: string;
  first_line_item_price: string;
  pool_name?: string;
}

interface FilterParams {
  productName?: string;
  startDate?: Date;
  endDate?: Date;
  channelAccountId?: string;
  selectedStatuses?: string[];
  selectedCouriers?: string[];
  searchQuery?: string;
  productSKUId?: string;
  warehouseId?: string;
  paymentMethod?: string;
}

interface PaymentMethod {
  method?: string;
  count?: Number;
}
// const orderTabs = [
//   { key: "new_orders", label: "New Orders" },
//   { key: "pickup_pending", label: "Pending Pickups" },
//   { key: "in_transit", label: "In Transit" },
//   { key: "delivered", label: "Delivered" },
//   { key: "rto", label: "RTO" },
//   // { key: "others", label: "Others" },
//   { key: "all", label: "All Orders" },
// ];
const ShippingLabel = ({ labelData }: any) => {
  const data = labelData;
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
        <div
          className="row"
          style={{ display: "flex", justifyContent: "space-evenly" }}
        >
          <div className="col">{data.date}</div>
          <div className="col">{data.sort_code}</div>
        </div>
      </div>
      <hr />
      <div style={{}}>
        <div style={{ textAlign: "center" }}>
          <b>
            <u>Shipping Address</u>
          </b>
        </div>
        <div
          className="orders-header d-flex align-items-center justify-content-between mb-3"
          style={{ gap: 12 }}
        >
          <strong>{data.customer_name}</strong>
          <br />
          {data.customer_address}, {data.customer_address2} -{" "}
          {data.customer_pincode}
        </div>
        <div>Contact: {data.customer_phone || "-"}</div>
      </div>
      <hr />
      <div className="row">
        <div className="col">
          <div>eWaybill: {data.e_waybill}</div>
          <div>
            Payment Mode:{" "}
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
        <div className="col">
          <div>Dimensions: {data.dimensions}</div>
          <div>Weight: {data.weight} gm</div>
        </div>
      </div>
      <hr />
      <div>
        <table
          style={{
            width: "100%",
            verticalAlign: "top",
            borderColor: "#dee2e6",
            fontSize: 12,
          }}
        >
          <thead
            style={{
              verticalAlign: "bottom",
              borderStyle: "solid",
              borderBottomWidth: "0.4px",
            }}
          >
            <tr>
              <td style={{ padding: "3px!important" }}>Product Name</td>
              <td style={{ padding: "3px" }}>Qty</td>
              <td style={{ padding: "3px" }}>Price</td>
            </tr>
          </thead>
          <tbody>
            {data.product_details.map((product: any, idx: number) => (
              <tr key={product.sku || idx}>
                <td style={{ padding: "3px" }}>
                  <span style={{ fontSize: "10px" }}>{product.name}</span>
                  <br />
                  <span style={{ fontSize: "8px" }}>SKU ID: {product.sku}</span>
                </td>
                <td style={{ padding: "3px" }}>{product.units}</td>
                <td style={{ padding: "3px" }}>
                  ₹{product.selling_price.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />

      <div>
        <div style={{ textAlign: "center" }}>
          <div
            className="row justify-content-space-evenly"
            style={{ display: "flex", justifyContent: "space-evenly" }}
          >
            <span className="col-md-6">{data.date}</span>
            <span className="col-md-6">{data.route}</span>
          </div>
          <Barcode value={data.seller_order_id} height={60} fontSize={16} />
        </div>
        <div style={{ textAlign: "center" }}>
          <b>
            <u>Return Address</u>
          </b>
        </div>
        <div>
          <b>{data.seller_name}</b>
        </div>
        <div>
          {data.seller_address}, {data.seller_address2} - {data.seller_pincode}
        </div>
      </div>

      <div
        className="footer"
        style={{ textAlign: "center", fontSize: "10px", color: "#555" }}
      >
        <hr />
        <div>
          All orders are shipped exclusively via OrderzUp. We do not hold any
          responsibility for the products or services—any return or exchange is
          strictly subject to the store’s own policy.
        </div>
      </div>
    </div>
  );
};

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [rowsPerPageOptions, setRowsPerPageOptions] = useState<number[]>([
    10, 20, 50, 100, 200, 500, 1000,
  ]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(50);
  const [showModal, setShowModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [tableHeight, setTableHeight] = useState<string>("400px");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState<Order | null>();
  // Filter states
  const [filters, setFilters] = useState<FilterParams>({});
  const [productName, setProductName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [channelAccountId, setChannelAccountId] = useState<string>("");
  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [shipmentOptions, setShipmentOptions] = useState<any>([]);
  const [bestAddress, setBestAddress] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [commonWarehouses, setCommonWarehouses] = useState<any>(null);
  const [labelData, setLabelData] = useState<any>([]);
  const [shipNowLoading, setShipNowLoading] = useState<boolean>(false);
  const [allStatus, setAllStatus] = useState<any[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>();
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<string>();
  const labelRef = useRef<HTMLDivElement>(null);
  const [courierPartners, setCourierPartners] = useState<any[]>([]);
  const [selectedCouriers, setSelectedCouriers] = useState<string[]>([]);
  const [showPickupModal, setShowPickupModal] = useState<boolean>(false);
  const [pickupOrder, setPickupOrder] = useState<string | null>();
  const [pickupDate, setPickupDate] = useState<Date>();
  const [activeTab, setActiveTab] = useState<string>("new_orders");
  const [statusList, setStatusList] = useState<any>([]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [shipmentDetails, setShipmentDetails] = useState<any>(null);

  useEffect(() => {
    setIsLoading(false);
    fetchOrders(currentPage, rowsPerPage, filters);
    calculateTableHeight();
    fetchChannelAccounts();
  }, [currentPage, rowsPerPage]);
  useEffect(() => {
    if (labelData && labelData.length > 0) {
      handlePrint();
    }
  }, [labelData]);
  useEffect(() => {
    innitialFetch();
  }, []);
  const handleChange = ({ selectedRows }: { selectedRows: any }) => {
    setSelectedOrders(selectedRows);
  };

  const innitialFetch = async () => {
    const allFiltersData = await getAllFilters();
    const allWarehouseData = await getAllWarehouses();
    const allProductSKUData = await getAllProductSKUs();
    setAllStatus(allFiltersData.statuses);
    setPaymentMethods(allFiltersData.paymentMethods);
    setCourierPartners(allFiltersData.courierPartners);
    setWarehouses(allWarehouseData.data);
    setProductSKUs(allProductSKUData.data);
  };
  const fetchChannelAccounts = async () => {
    try {
      const response = await appAxios.get(channelAccounts_url, {});
      const data = await response.data;
      setChannelAccounts(data.data);
    } catch (error) {
      toast.error("Error fetching channel accounts" + error);
    }
  };

  const fetchOrders = async (
    page: number = 1,
    limit: number = rowsPerPage,
    filterParams: FilterParams = filters,
    tab: string = activeTab
  ) => {
    setIsLoading(true);
    try {
      const response = await getAllOrders(page, limit, {
        page,
        limit,
        tab,
        ...filterParams,
      });

      setOrders(response.orders);
      setTotalOrders(response.total);
      let newrpOptions = [] as any;
      if (response.total > 10 && !newrpOptions.includes(10)) {
        newrpOptions.push(10);
      }
      if (response.total > 20 && !newrpOptions.includes(20)) {
        newrpOptions.push(20);
      }
      if (response.total > 50 && !newrpOptions.includes(50)) {
        newrpOptions.push(50);
      }
      if (response.total > 100 && !newrpOptions.includes(100)) {
        newrpOptions.push(100);
      }
      if (response.total > 200 && !newrpOptions.includes(200)) {
        newrpOptions.push(200);
      }
      if (response.total > 500 && !newrpOptions.includes(500)) {
        newrpOptions.push(500);
      }
      if (response.total > 1000 && !newrpOptions.includes(1000)) {
        newrpOptions.push(1000);
      }
      newrpOptions.push(response.total);
      setRowsPerPageOptions(newrpOptions);
    } catch (error) {
      toast.error("Error fetching orders" + error);
    } finally {
      setIsLoading(false);
    }
  };
  const applyFilters = () => {
    const newFilters: FilterParams = {};

    if (productName.trim()) newFilters.productName = productName.trim();
    if (startDate) newFilters.startDate = startDate;
    if (endDate) newFilters.endDate = endDate;
    if (channelAccountId) newFilters.channelAccountId = channelAccountId;
    if (selectedStatuses) newFilters.selectedStatuses = selectedStatuses;
    if (selectedCouriers) newFilters.selectedCouriers = selectedCouriers;
    if (searchQuery) newFilters.searchQuery = searchQuery;
    if (productSKUId) newFilters.productSKUId = productSKUId;
    if (warehouseId) newFilters.warehouseId = warehouseId;
    if (paymentMethod) newFilters.paymentMethod = paymentMethod;

    setFilters(newFilters);
    setCurrentPage(1);
    fetchOrders(1, rowsPerPage, newFilters);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setProductName("");
    setStartDate(undefined);
    setEndDate(undefined);
    setChannelAccountId("");
    setFilters({});
    setCurrentPage(1);
    setSelectedStatuses([]);
    setShowFilters(false);
    fetchOrders(1, rowsPerPage, {});
  };

  const calculateTableHeight = () => {
    const headerHeight = showFilters ? 300 : 200;
    const availableHeight = window.innerHeight - headerHeight;
    setTableHeight(`${availableHeight}px`);
  };

  useEffect(() => {
    calculateTableHeight();
  }, [showFilters]);

  const handleTabChange = (k: any) => {
    setActiveTab(k);
    setCurrentPage(1);
    setFilters({});
    fetchOrders(1, rowsPerPage, {}, k);
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

  const handleBookBulkShipment = async (orders: Order[]) => {
    const len = orders.length;
    if (len === 0) {
      toast.error("No orders selected for shipment.");
      return;
    }

    setShipNowLoading(true);
    const courierTotals = orders.reduce((acc: any, order: any) => {
      const courierName = order.recommended_courier_name || "Unknown";
      const rate = order.recommended_courier_rate || 0;

      if (!acc[courierName]) {
        acc[courierName] = 0;
      }

      acc[courierName] += rate;
      return acc;
    }, {});
    const breakdownText = Object.entries(courierTotals)
      .map(([name, amount]: any) => `${name}: ₹${amount.toFixed(2)}`)
      .join("\n");

    const totalAmount: any = Object.values(courierTotals).reduce(
      (sum: any, val: any) => sum + val,
      0
    );

    if (
      confirm(
        `📦 Courier Booking Summary:\n\n${breakdownText}\n\nTotal: ₹${totalAmount.toFixed(
          2
        )}\n\nDo you want to proceed?`
      ) === false
    ) {
      setShipNowLoading(false);
      return;
    }
    len > 1 &&
      toast.info(
        `Booking couriers for ${len} orders. Please do not refresh...`
      );

    let doneCount = 0;

    await Promise.allSettled(
      orders.map(async (order) => {
        const courier_id =
          order.recommended_courier_id || order.shipping_courier_id;
        const warehouse_id = order.recommended_warehouse_id;

        if (!courier_id) {
          toast.error(`No courier selected for order ${order.order_id}`);
          return;
        }

        try {
          const response = await bookCourier(
            order._id,
            courier_id,
            warehouse_id
          );
          toast.success(`Order ${order.order_id}: ${response.message}`);
          doneCount++;

          if (len === 1 && response) {
            // setLabelData(response.data);
            handleShipmentClose();
          }

          if (doneCount === len) {
            toast.success("All shipments booked successfully.");
            fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
          }
        } catch (err) {
          toast.error(`Failed booking for order ${order.order_id}:` + err);
          toast.error(`Order ${order.order_id}: Failed to book shipment.`);
        }
      })
    );

    setShipNowLoading(false);
  };

  // const handleBulkPrint = (orders: Order[]) => {
  //   toast.info(
  //     "Printing labels for " + orders.length + " orders. Please wait..."
  //   );
  //   setLabelData(orders.map((order) => order.label));
  // };

  const handlePrint = () => {
    if (labelRef.current) {
      const printWindow = window.open("", "PRINT", "width=400,height=600");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Shipping Label</title>
              <link
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
      rel="stylesheet"
    />
              <style>
                @page {
                  size: 4in 6in;
                  margin: 0;
                }
                body {
                  margin: 0;
                  font-family: Arial, sans-serif;
                  font-size: 12px;
                  -webkit-print-color-adjust: exact;
                }
                .label {
                  width: 100mm;
                  height: 150mm;
                  box-sizing: border-box;
                  border: 1px solid #333;
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }
                .header, .footer {
                  text-align: center;
                }
                .bold {
                  font-weight: 700;
                }
                hr {
                  border: none;
                  border-top: 1px solid #ccc;
                  margin: 2px 0;
                }
                .row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 2px;
                }
                .col {
                  width: 48%;
                }
              </style>
            </head>
            <body>
              <div class="label">
                ${labelRef.current.innerHTML}
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setLabelData(null);
      }
    }
  };

  // const handleSelectShipment = async (
  //   order_id: Order["_id"],
  //   shipment: any
  // ) => {
  //   const res = await updateOrder(order_id, {
  //     recomended_courier_id: shipment._id,
  //   });
  //   if (res) {
  //     fetchOrders(currentPage, rowsPerPage, filters);
  //     handleShipmentClose();
  //   }
  // };

  const handlePickupSubmit = async () => {
    if (!pickupOrder || !pickupDate) {
      toast.error("Invalid Date or Order Id");
    }
    const res = pickupDate && (await schedulePickup(pickupOrder, pickupDate));
    if (res) {
      toast.success(
        "Pickup Scheduled for " + pickupDate.toISOString().split("T")[0]
      );
      innitialFetch();
      handlePickupClose();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditOrder(null);
  };

  const handlePickupClose = () => {
    setShowPickupModal(false);
    setPickupOrder(null);
  };

  const handleShipmentClose = () => {
    setShowShipmentModal(false);
    setShipmentOrder(null);
    setBestAddress("");
    setShipmentOptions([]);
    setCommonWarehouses(null);
    setSelectedWarehouse(null);
  };

  // const handleChangeWarehouse = async (row: Order, selectedWarehouse: any) => {
  //   setShipmentOptions([]);
  //   const response = await checkShipmentServiceavailablity(row, [
  //     selectedWarehouse,
  //   ]);
  //   setShipmentOptions(response.results);
  //   setSelectedWarehouse(response.selectedWarehouse);
  // };

  const handleShipment = async (rows: Order[]) => {
    if (rows.length === 0) {
      toast.error("No orders selected for shipment.");
      return;
    }
    const len = rows.length;
    setShipNowLoading(true);
    len > 1 &&
      toast.info(
        `Processing ${len} orders for shipment. Please do not refresh the page...`
      );
    let doneCount = 0;
    Promise.all(
      rows.map(async (row) => {
        if (row.issues && row.issues.length > 0 && len === 1) {
          handleEdit(row);
          setShipNowLoading(false);
          toast.error(
            "Please resolve the issues before proceeding with shipment."
          );
        } else {
          const commonWarehouse = getCommonWarehouses(row);
          setCommonWarehouses(commonWarehouse);
          if (len == 1) {
            setShipmentOrder(row);
          }
          const response = await checkShipmentServiceavailablity(
            row,
            commonWarehouse
          );
          if (response) {
            if (response.inventoryUpdate.length > 0) {
              response.inventoryUpdate.forEach((i: any) => {
                i.success
                  ? toast.success(
                      `${i.channel_account}: ${i.sku_id} – ${i.message}`
                    )
                  : toast.error(
                      `${i.channel_account}: ${i.sku_id} – ${i.message}. Try manual updation.`
                    );
              });
            }
            doneCount++;
            len > 1 &&
              toast.success(
                `Shipment service available for order ${doneCount} of ${len}`
              );
            if (doneCount === len) {
              fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
              toast.success("Processed successfully.");
            }
            if (len == 1) {
              setShowShipmentModal(true);
              setShipNowLoading(false);
              setShipmentOptions(response.results);
              setBestAddress(response.best_address);
              setSelectedWarehouse(response.selectedWarehouse);
            }
          } else {
            setShipNowLoading(false);
          }
        }
      })
    );
  };
  const cancelShipment = async (row: Order) => {
    try {
      await appAxios.get(`${couriers_url}/cancelShipment?order_id=${row._id}`);
      fetchOrders();
      toast.success("Shipment has been cancelled");
    } catch (err) {
      console.log(err);
      toast.error((err as any).message);
    }
  };

  const handleShipmentImprove = async (order: Order) => {
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
      console.log(err);
      toast.error((err as any).message);
    }
  };
  const handleCancelOrder = async (order: Order, status: any) => {
    try {
      order.status.push({
        status: status.toLowerCase(),
        status_date: new Date().toISOString(),
        description: "Order cancelled by brand admin",
      });
      const response = await updateOrder(order._id, {
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        shipping_pincode: order.shipping_pincode,
        status: order.status,
      });
      if (response) {
        toast.success("Order cancelled successfully.");
        fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
      } else {
        toast.error("Failed to cancel order.");
      }
    } catch (error) {
      toast.error("Error cancelling order" + error);
      toast.error("Failed to cancel order.");
    }
  };

  const handleEdit = (order: Order) => {
    setEditOrder(order);
    setShowModal(true);
  };
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (
      !(form.elements.namedItem("shipping_city") as HTMLInputElement) ||
      !(form.elements.namedItem("shipping_state") as HTMLInputElement)
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    const customer_address = {
      name: (form.elements.namedItem("customer_name") as HTMLInputElement)
        .value,
      phone: (form.elements.namedItem("customer_phone") as HTMLInputElement)
        .value,
      addressLine1: (
        form.elements.namedItem("shipping_address") as HTMLInputElement
      ).value,
      // addressLine2: (form.elements.namedItem("addressLine2") as HTMLInputElement).value,
      pincode: (form.elements.namedItem("shipping_pincode") as HTMLInputElement)
        .value,
      city: (form.elements.namedItem("shipping_city") as HTMLInputElement)
        .value,
      state: (form.elements.namedItem("shipping_state") as HTMLInputElement)
        .value,
    };
    if (
      !customer_address.name ||
      !customer_address.phone ||
      !customer_address.addressLine1 ||
      !customer_address.pincode ||
      !customer_address.city ||
      !customer_address.state
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    // console.log("Updating address:", customer_address);
    if (customer_address && editOrder?._id) {
      try {
        await updateCustomerAddress(editOrder._id, customer_address);
        fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
        handleClose();
      } catch (error) {
        toast.error("Error updating customer address" + error);
      }
    }
  };

  // Add these states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkOrderData, setLinkOrderData] = useState<Order | null>(null);

  // Form State for the Modal
  const [physicalDetails, setPhysicalDetails] = useState({
    weight: "",
    length: "",
    breadth: "",
    width: "",
    packWeight: "",
    warehouseStock: 0, // Simplified for single warehouse, or use array logic
  });

  // Handler to open modal
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

  // Handler to submit the Link Request
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
        fetchOrders(currentPage, rowsPerPage, filters); // Refresh table
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Linking failed");
    }
  };
  const handlePickup = (order: Order) => {
    setPickupOrder(order._id);
    setShowPickupModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, rowsPerPage, filters);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number, page: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(page);
    // fetchOrders(page, newRowsPerPage, filters);
  };
  const handleNewOrderClose = () => {
    setShowNewOrderModal(false);
    setNewOrder(null);
  };
  const [orderItems, setOrderItems] = useState<
    { product: string; quantity: number }[]
  >([{ product: "", quantity: 1 }]);

  // Helper to add a new blank item row
  const handleAddItem = () => {
    setOrderItems([...orderItems, { product: "", quantity: 1 }]);
  };

  // Helper to remove an item row
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...orderItems];
    updatedItems.splice(index, 1);
    setOrderItems(updatedItems);
  };

  // Helper to update a specific item's data
  const handleItemChange = (
    index: number,
    field: "product" | "quantity",
    value: any
  ) => {
    const updatedItems = [...orderItems];
    if (field === "quantity") {
      updatedItems[index][field] = Number(value);
    } else {
      updatedItems[index][field] = value;
    }
    setOrderItems(updatedItems);
  };
  const handleNewOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that all items have a product selected
    if (orderItems.some((item) => !item.product)) {
      toast.error("Please select a product for all items.");
      return;
    }

    if (newOrder) {
      try {
        // Auto-calculate total quantity from the items array
        const totalQuantity = orderItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        const payload = {
          channel_id: newOrder.channel_id,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          shipping_address: newOrder.shipping_address,
          shipping_city: newOrder.shipping_city,
          shipping_state: newOrder.shipping_state,
          shipping_pincode: String(newOrder.shipping_pincode),
          items: orderItems, // Passes the array of { product, quantity }
          quantity: totalQuantity, // Top-level quantity from your schema
          total_amount: Number(newOrder.total_amount),
          payment_method: newOrder.payment_method,
        };

        await createOrder(payload);
        fetchOrders(currentPage, rowsPerPage, filters);

        // Reset state on close
        setOrderItems([{ product: "", quantity: 1 }]);
        handleNewOrderClose();
        toast.success("Order created successfully");
      } catch (error: any) {
        toast.error("Error creating order: " + error.message);
      }
    }
  };
  const handleBulkPrint = (orders: Order[]) => {
    toast.info(
      "Printing labels for " + orders.length + " orders. Please wait..."
    );

    if (selectedOrders.length == 0) {
      setLabelData(orders.map((order) => order.label));
    } else {
      setLabelData(selectedOrders.map((order: any) => order.label));
    }
  };
  // ================== CREDIT SCORE SPEEDOMETER HELPER ==================

  // ================== MAIN COLUMNS ==================
  const hasValue = (v: any) => {
    if (v === null || v === undefined) return false;
    const s = String(v).trim();
    return s !== "" && s !== "-" && s !== "—";
  };

  const columns = [
    {
      name: "Order Details",
      cell: (row: Order) => (
        <div
          style={{
            fontSize: "12px",
            lineHeight: 1.5,
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            padding: "6px 4px",
          }}
        >
          <div style={{ fontWeight: 600, color: "#000434" }}>
            <span style={{ color: "#F5891E" }}>#{row.order_id || "—"}</span>
          </div>
          <div style={{ fontSize: 9 }}>
            {row.createdAt
              ? new Date(row.createdAt)
                  .toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })
                  .replace(",", " -")
              : "—"}
          </div>
          <div style={{ paddingTop: "5px" }}>
            <div>
              <FaStore style={{ marginRight: "4px", color: "#555" }} />
              {/* <strong style={{ color: "#555" }}>Channel:</strong>{" "} */}
              <span style={{ color: "#000" }}>
                {row.channel_account_name || "—"}{" "}
                {hasValue(row.store_order_id) && (
                  <>
                    -
                    <span
                      style={{
                        color: "#007bff",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      title={
                        "Store Order ID: " +
                        String(row.store_order_id).trim() +
                        "\nChannel Order ID:" +
                        String(row.channel_order_id).trim()
                      }
                    >
                      {" "}
                      {String(row.store_order_id).trim()}
                    </span>
                  </>
                )}
              </span>
            </div>
            <div>
              <FaBriefcase style={{ marginRight: "4px", color: "#555" }} />
              {/* <strong style={{ color: "#555" }}>Channel:</strong>{" "} */}
              <span style={{ color: "#000" }}>{row.pool_name || "—"}</span>
            </div>
            {/* {hasValue(row.channel_order_id) && (
              <div style={{ fontSize: 9 }}>
                (
                <strong style={{ color: "#555" }}>CHOID:</strong>{" "}
                <span style={{ color: "#000" }}>
                  {String(row.channel_order_id).trim()}
                </span>)
              </div>
            )
            } */}
          </div>
        </div>
      ),
      minWidth: "150px",
      style: { padding: "5px 2px" },
    },

    {
      name: "Product Details",
      cell: (row: Order) => {
        const amount =
          row.first_line_item_price && row.quantity
            ? Number(row.first_line_item_price) * row.quantity
            : row.total_amount || "—";

        const remittanceColor =
          row.remittance_status === "pending"
            ? "#ffc107"
            : row.remittance_status === "completed"
            ? "#28a745"
            : row.remittance_status === "processing"
            ? "#007bff"
            : "#6c757d";

        return (
          <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "12px",
                color: "#000434",
                textDecoration: "underline",
                marginBottom: "4px",
                // padding: "6px 4px",
              }}
            >
              {hasValue(row.product_name) ? (
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id={`product-tooltip-${row._id}`}>
                      {String(row.product_name)}
                      <br />
                      ID: {row.product_sku_id || "—"}
                    </Tooltip>
                  }
                >
                  <span style={{ cursor: "pointer" }}>
                    {String(row.product_name).slice(0, 40) +
                      (String(row.product_name).trim().length > 40
                        ? "..."
                        : "")}
                  </span>
                </OverlayTrigger>
              ) : (
                "—"
              )}
            </div>
            <div
              style={{ fontStyle: "italic", color: "#555", marginTop: "4px" }}
            >
              SKU:{" "}
              {row.product_sku_id ? (
                <span style={{ color: "#28a745", fontWeight: 600 }}>
                  {String(row.product_sku_id).slice(0, 10)}...
                </span>
              ) : (
                // THE "LINK" BUTTON
                <Button
                  variant="outline-danger"
                  size="sm"
                  style={{ padding: "0px 6px", fontSize: "10px" }}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent row click
                    handleOpenLinkModal(row);
                  }}
                >
                  ⚠️ Link Now
                </Button>
              )}
            </div>
            <div style={{ fontWeight: 500 }}>
              Qty:{" "}
              <span style={{ color: "#000434" }}>
                {row.quantity || "—"} pcs
              </span>
            </div>
            <div style={{ fontWeight: 500 }}>
              Item Price:{" "}
              <span
                style={{
                  color: !row.payment_method?.toLowerCase().includes("cod")
                    ? "#28a745"
                    : "#d9534f",
                }}
              >
                ₹{amount} (
                {row.payment_method?.toLowerCase().includes("cod")
                  ? "COD"
                  : "Prepaid"}
                )
              </span>
            </div>
            <div style={{ fontWeight: 500 }}>
              Final Price:{" "}
              <span
                style={{
                  color: !row.payment_method?.toLowerCase().includes("cod")
                    ? "#28a745"
                    : "#d9534f",
                }}
              >
                ₹{row.total_amount}
              </span>
            </div>
            {row.remittance_status && row.remittance_status !== "NA" && (
              <span
                style={{
                  display: "inline-block",
                  marginTop: "4px",
                  padding: "2px 6px",
                  fontSize: "10px",
                  fontWeight: 600,
                  borderRadius: "4px",
                  backgroundColor: remittanceColor,
                  color: "#fff",
                }}
              >
                {row.remittance_status.toUpperCase()}
              </span>
            )}
          </div>
        );
      },
      minWidth: "150px",
      style: { padding: "5px 2px" },
    },

    {
      name: "Customer Details",
      cell: (row: any) => {
        const latestStatus = row.status?.length
          ? [...row.status].sort(
              (a: any, b: any) =>
                new Date(b.status_date).getTime() -
                new Date(a.status_date).getTime()
            )[0]
          : null;
        const editable =
          latestStatus &&
          (latestStatus.status === "AWB & Label Generated" ||
            latestStatus.status.toLowerCase().includes("label") ||
            latestStatus.status.toLowerCase().includes("pickup") ||
            latestStatus.status.toLowerCase().includes("fetch") ||
            latestStatus.status.toLowerCase().includes("new"));
        return (
          <div style={{ fontSize: 11, lineHeight: 1.45 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 600,
                color: "#000434",
              }}
            >
              <span
                style={{ textDecoration: "underline", cursor: "pointer" }}
                onClick={() => editable && handleEdit(row)}
              >
                {row.customer_name || "—"}
              </span>
              {editable && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(row);
                  }}
                  style={{
                    cursor: "pointer",
                    color: "#000434",
                    fontSize: 12,
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  title="Edit customer"
                >
                  <BiSolidPencil />
                </span>
              )}
            </div>
            <div style={{ color: "#444", marginTop: 2 }}>
              <BsPhoneFill style={{ fontSize: 10, marginRight: 4 }} />
              {row.customer_phone || "—"}
            </div>
            {row.customer_email && (
              <div style={{ color: "#444" }}>
                <MdEmail style={{ fontSize: 11, marginRight: 4 }} />
                {row.customer_email}
              </div>
            )}
            <div style={{ marginTop: 4, color: "#666", fontSize: 10 }}>
              <FaLocationPin style={{ fontSize: 10, marginRight: 4 }} />
              {row.shipping_address}, {row.shipping_city}, {row.shipping_state}{" "}
              — <strong>{row.shipping_pincode}</strong>
            </div>
          </div>
        );
      },
      minWidth: "150px",
      style: { padding: "5px 2px" },
    },

    // {
    //   name: "Ecom Credit Score",
    //   cell: (row: any) => {
    //     // const score = row.customer_rating * 100 - 192;
    //     return (
    //       <div>
    //         {row.ecom_credit_score && row.ecom_credit_score_valid ? (
    //           <CreditScoreMeter score={row.ecom_credit_score} validTill={row.ecom_credit_score_validtill.split("T")[0]} />
    //         ) : (
    //           <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>

    //             <button
    //               onClick={() => handleGenerateEcomScore(row._id)}
    //               title="Generate AI-Based Ecom Credit Score"
    //               style={{
    //                 // display: "flex",
    //                 alignItems: "center",
    //                 gap: 0,
    //                 padding: "6px 10px",
    //                 borderRadius: 10,
    //                 border: "1px solid rgba(255,255,255,0.08)",
    //                 background: "#dbeafe",
    //                 // background: "linear-gradient(180deg, #000434 0%, #1a1f6b 100%)",
    //                 color: "#000434",
    //                 fontSize: 11,
    //                 fontWeight: 700,
    //                 letterSpacing: "0.3px",
    //                 cursor: "pointer",
    //                 boxShadow: `
    //   0 8px 24px rgba(0,4,52,0.35),
    //   inset 0 1px 0 rgba(255,255,255,0.08)
    // `,
    //                 transition: "all 0.25s ease",
    //                 position: "relative",
    //                 overflow: "hidden",
    //               }}
    //               onMouseEnter={(e) => {
    //                 e.currentTarget.style.transform = "translateY(-1px)";
    //                 e.currentTarget.style.boxShadow = `
    //   0 12px 30px rgba(26,31,107,0.45),
    //   0 0 0 1px rgba(245,137,30,0.25),
    //   inset 0 1px 0 rgba(255,255,255,0.12)
    // `;
    //               }}
    //               onMouseLeave={(e) => {
    //                 e.currentTarget.style.transform = "translateY(0)";
    //                 e.currentTarget.style.boxShadow = `
    //   0 8px 24px rgba(0,4,52,0.35),
    //   inset 0 1px 0 rgba(255,255,255,0.08)
    // `;
    //               }}
    //               onMouseDown={(e) => {
    //                 e.currentTarget.style.transform = "translateY(1px) scale(0.98)";
    //               }}
    //               onMouseUp={(e) => {
    //                 e.currentTarget.style.transform = "translateY(-1px)";
    //               }}
    //             >
    //               <div style={{ display: "flex", alignItems: "center" }}>
    //                 <OUAIIcon style={{ width: 16, opacity: 0.95 }} />
    //                 <span style={{ whiteSpace: "nowrap", fontWeight: 900, marginLeft: 4 }}>
    //                   Get Ecom Credit Score
    //                 </span>
    //               </div>
    //               <div style={{ fontSize: 8, color: "#28a745", marginTop: 6 }}>
    //                 Totally Free - No Extra charge
    //               </div>
    //             </button>
    //             {row.ecom_credit_score && row.ecom_credit_score_valid === false && (
    //               <div style={{ fontSize: 10, color: "#dc3545", marginTop: 4, textAlign: "center" }}>
    //                 Ecom Credit Score expired.
    //               </div>
    //             )}
    //           </div>
    //         )}
    //       </div>
    //     );
    //   },
    //   minWidth: "190px",
    //   center: true,
    //   style: { padding: "5px 2px" },
    // },

    {
      name: "Courier Details",
      cell: (row: any) => {
        const sortedStatus = row.status
          ? [...row.status].sort(
              (a: any, b: any) =>
                new Date(b.status_date).getTime() -
                new Date(a.status_date).getTime()
            )
          : [];
        const latestStatusName =
          sortedStatus[0]?.status?.replaceAll("_", " ") || "—";

        return (
          <div style={{ fontSize: "11px" }}>
            {row.recommended_courier_id && !row.shipping_courier_id && (
              <div
                style={{
                  // display: "inline-flex",
                  alignItems: "center",
                  borderRadius: 3,
                  background: "rgba(245, 137, 30, 0.08)",
                  border: "1px solid rgba(0, 4, 52, 0.15)",
                  margin: "4px 4px",
                  padding: "2px 2px",
                  textAlign: "center",
                }}
              >
                {/* <OUAIIcon style={{ width: 14,}} /> */}

                <span style={{ fontSize: 12, fontWeight: 500 }}>
                  {row.recommended_courier_mode === "air" ? (
                    <FaPlane style={{ marginRight: 4 }} />
                  ) : (
                    <FaTruck style={{ marginRight: 4 }} />
                  )}{" "}
                  {row.recommended_courier_name || "Recommended"}
                </span>
              </div>
            )}
            <div>
              {row.shipping_courier_name ||
                (row.recommended_courier_id ? "" : "—")}
            </div>
            {row.awb_number ? (
              <div style={{ marginTop: 2 }}>
                <strong>AWB: </strong>
                {/* <a
                  href={row.tracking_url?.replace(
                    "{{awb_number}}",
                    row.awb_number
                  )}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#007bff", textDecoration: "underline" }}
                > */}
                <Link to={`/customer/track/${row._id}`}>{row.awb_number}</Link>
                {/* </a> */}
              </div>
            ) : (
              <div>
                <strong>AWB:</strong> —
              </div>
            )}
            <div style={{ marginTop: 4 }}>
              <BsClockFill style={{ marginRight: 4 }} />
              <span
                style={{
                  textTransform: "capitalize",
                  color: "#213bb4",
                  cursor: "help",
                }}
                onClick={() => setStatusList(sortedStatus)}
              >
                {latestStatusName}
              </span>
            </div>
          </div>
        );
      },
      minWidth: "170px",
      style: { padding: "5px 2px" },
    },

    {
      name: "Issues & Risk Flags",
      cell: (row: any) => {
        const risk = row.risk_flag || {};
        const issues = row.issues || [];

        return (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "4px",
              fontSize: "11px",
              padding: "6px 4px",
            }}
          >
            {issues.map((issue: any, idx: number) => (
              <div
                key={idx}
                style={{ color: "#d9534f", fontWeight: 600, width: "100%" }}
              >
                ⚠ {issue.message || issue}
              </div>
            ))}
            {risk.customer_order_count_in_channel > 0 && (
              <span
                style={{
                  backgroundColor:
                    risk.customer_order_count_in_channel < 3
                      ? "#2a9d8f"
                      : "#f4a261",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontWeight: 600,
                }}
              >
                Other Orders: {risk.customer_order_count_in_channel}
              </span>
            )}
            {risk.is_duplicate && (
              <span
                style={{
                  backgroundColor: "#e63946",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontWeight: 600,
                }}
              >
                Duplicate
              </span>
            )}
            {risk.is_suspicious_address && (
              <span
                style={{
                  backgroundColor: "#e63946",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontWeight: 600,
                }}
              >
                Suspicious Addr
              </span>
            )}
            {risk.pincode_rto_percent > 0 && (
              <span
                style={{
                  backgroundColor: "#f4a261",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontWeight: 600,
                }}
              >
                RTO: {risk.pincode_rto_percent.toFixed(1)}%
              </span>
            )}

            {!issues.length &&
              Object.values(risk).every((v) => !v || v === 0) && (
                <span
                  style={{
                    backgroundColor: "#2a9d8f",
                    color: "#fff",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontWeight: 600,
                  }}
                >
                  No Risk Flags
                </span>
              )}
          </div>
        );
      },
      minWidth: "200px",
      style: { padding: "5px 2px" },
    },

    // {
    //   name: "Fetched On",
    //   selector: (row: Order) =>
    //     row.createdAt
    //       ? new Date(row.createdAt).toLocaleDateString("en-IN", {
    //         day: "2-digit",
    //         month: "short",
    //         year: "numeric",
    //       })
    //       : "—",
    //   minWidth: "90px",
    //   style: { padding: "5px 2px" },
    // },

    {
      name: "Actions",
      cell: (row: Order) => {
        const hasAwb = Boolean(row.awb_number);
        const latestStatus = row.status?.length
          ? [...row.status].sort(
              (a: any, b: any) =>
                new Date(b.status_date).getTime() -
                new Date(a.status_date).getTime()
            )[0]
          : null;
        const statusStr = latestStatus?.status?.toLowerCase() || "";

        const canAction =
          statusStr.includes("label") ||
          statusStr.includes("data received") ||
          statusStr.includes("manifested") ||
          statusStr.includes("pickup") ||
          statusStr.includes("not picked");

        const handleMainClick = () => {
          if (hasAwb && canAction) return handlePickup(row);
          if (!hasAwb && statusStr !== "cancelled")
            return handleShipmentImprove(row);
        };

        return (
          <div
            className="order-actions"
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Button
                size="sm"
                onClick={handleMainClick}
                variant={
                  hasAwb && canAction
                    ? "outline-primary"
                    : !hasAwb && statusStr !== "cancelled"
                    ? "warning"
                    : "outline-secondary"
                }
                style={{
                  minWidth: 84,
                  fontWeight: 700,
                  background:
                    "linear-gradient(90deg, rgb(245, 137, 30) 0%, rgb(255, 107, 53) 100%)",
                  color: "#fff",
                  borderRadius: 20,
                }}
                title={
                  hasAwb && canAction
                    ? "Schedule Pickup"
                    : !hasAwb && statusStr !== "cancelled"
                    ? "Ship this order now"
                    : "No primary action"
                }
              >
                {hasAwb && canAction
                  ? "Pickup"
                  : !hasAwb && statusStr !== "cancelled"
                  ? "Ship Now"
                  : statusStr === "cancelled"
                  ? "Cancelled"
                  : "Action"}
              </Button>

              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  size="sm"
                  id={`actions-dd-${row._id}`}
                >
                  {/* <FaEllipsisV /> */}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {hasAwb && canAction && (
                    <>
                      <Dropdown.Item onClick={() => setLabelData([row.label])}>
                        🖨️ Print Label
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => cancelShipment(row)}>
                        Cancel Shipment
                      </Dropdown.Item>
                    </>
                  )}

                  {!hasAwb && statusStr !== "cancelled" && (
                    <>
                      <Dropdown.Item onClick={() => handleShipment([row])}>
                        🚚 Ship Now
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleBookBulkShipment([row])}
                      >
                        📦 Recommend / Book
                      </Dropdown.Item>
                    </>
                  )}

                  <Dropdown.Item
                    onClick={() =>
                      handleCancelOrder(
                        row,
                        statusStr === "cancelled" ? "re_activate" : "cancelled"
                      )
                    }
                  >
                    {statusStr === "cancelled" ? "Re-Activate" : "❌ Cancel"}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        );
      },
      minWidth: "140px",
      style: { padding: "5px 2px" },
    },
  ];
  const conditionalRowStyles = [
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "customer_name"),
      style: {
        backgroundColor: "#ffcccc", // Light red for missing customer name
        color: "black",
      },
    },
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "customer_phone"),
      style: {
        backgroundColor: "#ffe6cc", // Light orange for invalid phone number
        color: "black",
      },
    },
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "customer_email"),
      style: {
        backgroundColor: "#ffffcc", // Light yellow for invalid email
        color: "black",
      },
    },
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "shipping_address"),
      style: {
        backgroundColor: "#e6ffcc", // Light green for missing shipping address
        color: "black",
      },
    },
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "customer_pincode"),
      style: {
        backgroundColor: "#cce6ff", // Light blue for invalid pincode
        color: "black",
      },
    },
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "high_volume"),
      style: {
        backgroundColor: "#d9ccff", // Light purple for high volume orders
        color: "black",
      },
    },
    {
      when: (row: any) =>
        row.issues?.some((issue: any) => issue.field === "duplicate_order"),
      style: {
        backgroundColor: "#ffb3b3", // Light pink for duplicate orders
        color: "black",
      },
    },
    {
      when: (row: any) => {
        const latestStatus = row.status?.length
          ? row.status.sort(
              (a: any, b: any) =>
                new Date(b.status_date).getTime() -
                new Date(a.status_date).getTime()
            )[0]
          : null;
        return latestStatus && latestStatus.status === "cancelled";
      },
      style: {
        backgroundColor: "#b37076ff", // Light red for cancelled orders
        color: "#721c24", // Dark red text for cancelled orders
        textDecoration: "line-through!important", // Strikethrough text for cancelled orders
      },
    },
  ];

  return (
    <div className="container">
      <style>{`
        /* Orders screen responsive styles */
        .orders-header { display:flex; flex-wrap:wrap; gap:12px; align-items:center; }
        .orders-header .input-group { flex:1; max-width:720px; min-width:180px; }
        .orders-header .input-group .form-control { min-width:120px; }
        .orders-tabs { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .orders-tabs .tab-pill { border-radius:20px; padding:6px 12px; font-weight:600; }
        .order-actions { display:flex; flex-direction:column; gap:6px; align-items:center; }

        @media (max-width: 768px) {
          .orders-header { flex-direction:column; align-items:stretch; }
          .orders-header .input-group { order:2; width:100%; margin-top:8px; }
          .orders-header > div:first-child { order:1; }
          .orders-header > div:last-child { order:3; display:flex; justify-content:flex-end; margin-top:8px; }
          .orders-tabs { flex-direction:row; gap:6px; align-items:center; overflow:auto; padding-bottom:6px; }
          .orders-tabs .tab-pill { padding:6px 10px; font-size:13px; }
          .order-actions { flex-direction:row; }
          .order-actions .btn { padding:6px 8px; font-size:12px; }
        }
      `}</style>
      <div className="row d-flex justify-content-between align-items-center mb-3">
        <Col className="md-6 d-flex align-items-center">
          <h4>Orders</h4>
        </Col>
        <Col className="md-6 d-flex align-items-center justify-content-end">
          <Button
            variant="outline-primary"
            onClick={async () => {
              setShowNewOrderModal(true);
            }}
            className="me-3"
          >
            📥 Add New Orders
          </Button>
          {activeTab === "new_orders" && (
            <Button
              disabled={shipNowLoading}
              onClick={() => {
                handleShipment(
                  orders.filter((o: any) => {
                    const latestStatus = o.status?.length
                      ? o.status.sort(
                          (a: any, b: any) =>
                            new Date(b.status_date).getTime() -
                            new Date(a.status_date).getTime()
                        )[0]
                      : null;
                    return (
                      !o.recommended_courier_id &&
                      !o.shipping_courier_id &&
                      (!latestStatus || latestStatus.status !== "cancelled") &&
                      o
                    );
                  })
                );
              }}
              className="me-3"
              style={{
                background: "#ffefc1",
                color: "#000",
                padding: "4px 12px",
                borderRadius: 3,
                fontSize: 12,
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                letterSpacing: "0.03em",
                boxShadow: "0 0 16px rgba(0, 0, 0, 0.5)",
                // marginBottom: 8,
                animation: "pulseGlow 1.8s infinite ease-in-out",
              }}
            >
              <OUAIIcon style={{ width: 16, height: 16 }} />
              Auto Assign Courier
            </Button>
          )}
          {activeTab === "new_orders" && (
            <Button
              variant="primary"
              onClick={() => {
                handleBookBulkShipment(
                  orders.filter((o: any) => {
                    const latestStatus = o.status?.length
                      ? o.status.sort(
                          (a: any, b: any) =>
                            new Date(b.status_date).getTime() -
                            new Date(a.status_date).getTime()
                        )[0]
                      : null;

                    return (
                      o.recommended_courier_id &&
                      o.issues.length === 0 &&
                      !o.shipping_courier_id &&
                      o &&
                      (!latestStatus || latestStatus.status !== "cancelled")
                    );
                  })
                );
              }}
              className="me-2"
            >
              🚚 Book Couriers
            </Button>
          )}
          {activeTab === "pickup_pending" && (
            <Button
              variant="primary"
              onClick={() => {
                handleBulkPrint(
                  orders.filter((o: any) => {
                    const latestStatus = o.status?.length
                      ? o.status.sort(
                          (a: any, b: any) =>
                            new Date(b.status_date).getTime() -
                            new Date(a.status_date).getTime()
                        )[0]
                      : null;

                    return latestStatus?.status
                      ?.toLowerCase()
                      .includes("label generated");
                  })
                );
              }}
            >
              🖨️ Print Labels
            </Button>
          )}
        </Col>
      </div>
      <Modal
        show={showLinkModal}
        onHide={() => setShowLinkModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">
            🔗 Link & Create Product
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {linkOrderData && (
            <div className="container-fluid">
              {/* Read-Only Info from Order/Channel */}
              <div className="row mb-4 p-3 bg-light rounded border">
                <div className="col-md-6">
                  <small className="text-muted">
                    Product Name (From Order)
                  </small>
                  <h6 className="fw-bold">{linkOrderData.product_name}</h6>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Price</small>
                  <div className="fw-bold">₹{linkOrderData.total_amount}</div>
                </div>
                <div className="col-md-3">
                  <small className="text-muted">Channel</small>
                  <div>{linkOrderData.channel_account_name}</div>
                </div>
              </div>

              <h6 className="text-primary mb-3">
                📦 Step 1: Physical Details (Required)
              </h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Item Weight (kg)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g. 0.5"
                      value={physicalDetails.weight}
                      onChange={(e) =>
                        setPhysicalDetails({
                          ...physicalDetails,
                          weight: e.target.value,
                        })
                      }
                    />
                  </Form.Group>
                </div>
                <div className="col-md-6">
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Initial Stock
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={physicalDetails.warehouseStock}
                      onChange={(e) =>
                        setPhysicalDetails({
                          ...physicalDetails,
                          warehouseStock: Number(e.target.value),
                        })
                      }
                    />
                    <Form.Text className="text-muted">
                      Added to primary warehouse
                    </Form.Text>
                  </Form.Group>
                </div>
              </div>

              <h6 className="text-primary mt-4 mb-3">
                📐 Step 2: Packaging Dimensions
              </h6>
              <div className="row g-3">
                <div className="col-md-3">
                  <Form.Control
                    placeholder="Length (cm)"
                    type="number"
                    value={physicalDetails.length}
                    onChange={(e) =>
                      setPhysicalDetails({
                        ...physicalDetails,
                        length: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <Form.Control
                    placeholder="Breadth (cm)"
                    type="number"
                    value={physicalDetails.breadth}
                    onChange={(e) =>
                      setPhysicalDetails({
                        ...physicalDetails,
                        breadth: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <Form.Control
                    placeholder="Width/Height (cm)"
                    type="number"
                    value={physicalDetails.width}
                    onChange={(e) =>
                      setPhysicalDetails({
                        ...physicalDetails,
                        width: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <Form.Control
                    placeholder="Pack Weight (kg)"
                    type="number"
                    value={physicalDetails.packWeight}
                    onChange={(e) =>
                      setPhysicalDetails({
                        ...physicalDetails,
                        packWeight: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowLinkModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleLinkSubmit}>
            Create & Link Product
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showFilters}
        onHide={() => setShowFilters(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Filter Orders</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* Search Input */}
            <Row className="mb-4">
              <Col>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by customer name, contact, address, order IDs, AWB number"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Channel Account</Form.Label>
                  <Form.Select
                    value={channelAccountId}
                    onChange={(e) => setChannelAccountId(e.target.value)}
                  >
                    <option value="">All Channel Accounts</option>
                    {channelAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.channel_account_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Warehouse</Form.Label>
                  <Form.Select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                  >
                    <option value="">All Warehouses</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse._id} value={warehouse._id}>
                        {warehouse.name}, {warehouse.address1}, {warehouse.City}{" "}
                        - {warehouse.State} ({warehouse.pincode})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product SKU</Form.Label>
                  <Form.Select
                    value={productSKUId}
                    onChange={(e) => setProductSKUId(e.target.value)}
                  >
                    <option value="">All Product SKUs</option>
                    {productSKUs.map((sku) => (
                      <option key={sku._id} value={sku._id}>
                        {sku.product_sku_id} - {sku.product_sku_name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="">All Payment Methods</option>
                    {paymentMethods.map((method) => (
                      <option key={method.method} value={method.method}>
                        {method.method} ({(method.count || 0).toString()})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    multiple
                    value={selectedStatuses}
                    onChange={(e) =>
                      setSelectedStatuses(
                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                      )
                    }
                  >
                    {allStatus.map((status) => (
                      <option key={status.status} value={status.status}>
                        {status.status} ({status.count})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Courier Partners</Form.Label>
                  <Form.Select
                    multiple
                    value={selectedCouriers}
                    onChange={(e) =>
                      setSelectedCouriers(
                        Array.from(e.target.selectedOptions, (opt) => opt.value)
                      )
                    }
                  >
                    {courierPartners.map(
                      (courier) =>
                        courier.courier && (
                          <option
                            key={courier.shipping_courier_id}
                            value={courier.shipping_courier_id}
                          >
                            {courier.courier} ({courier.count})
                          </option>
                        )
                    )}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Date Range Picker */}
            <Row>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Date Range</Form.Label>
                  <DatePicker
                    selectsRange
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={new Date()}
                    monthsShown={2}
                    onChange={(dates: any) => {
                      const [start, end] = dates;
                      setStartDate(start);
                      setEndDate(end);
                    }}
                    isClearable
                    className="form-control"
                    placeholderText="Select date range"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={resetFilters}>
            Reset
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              applyFilters();
              setShowFilters(false);
            }}
          >
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={statusList.length > 0}
        onHide={() => {
          setStatusList([]);
        }}
        size="lg"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>Status History</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Status</th>
                <th>Status Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {statusList.map((item: any, index: any) => (
                <tr>
                  <td>{index + 1}</td>
                  <td>{item.status}</td>
                  <td>{new Date(item.status_date).toLocaleString()}</td>
                  <td>
                    {" "}
                    {item.status_details
                      ? typeof item.status_details === "object"
                        ? Object.entries(item.status_details).map(
                            ([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            )
                          )
                        : // If it's a JSON string, try parsing
                          (() => {
                            try {
                              const parsed = JSON.parse(item.status_details);
                              return Object.entries(parsed).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <strong>{key}:</strong> {String(value)}
                                  </div>
                                )
                              );
                            } catch {
                              return String(item.status_details);
                            }
                          })()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setStatusList([]);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div>
        <div className="orders-tabs d-flex justify-content-between align-items-center mb-2">
          <div
            className="row"
            style={{
              justifyContent: "space-between",
              width: "100%",
              margin: "0 20px",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "row", gap: 6 }}
              className="col-md-8"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    background:
                      "linear-gradient(90deg, rgb(245, 137, 30) 0%, rgb(255, 107, 53) 100%)",
                    color: "#fff",
                    padding: "5px 5px 5px 12px",
                    borderStartStartRadius: "14px",
                    borderEndStartRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <FaBoxOpen
                    style={{ marginRight: "4px", color: "#fff" }}
                    size={15}
                  />
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "new_orders" ? "#000" : "#fff",
                    backgroundColor:
                      activeTab !== "new_orders" ? "#fff" : "#000434",
                    border:
                      activeTab !== "new_orders"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                  }}
                  onClick={() =>
                    activeTab !== "new_orders" && handleTabChange("new_orders")
                  }
                >
                  New
                  {activeTab === "new_orders" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "pickup_pending" ? "#000" : "#fff",
                    backgroundColor:
                      activeTab !== "pickup_pending" ? "#fff" : "#000434",
                    border:
                      activeTab !== "pickup_pending"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                    borderEndEndRadius: "14px",
                    borderStartEndRadius: "14px",
                  }}
                  onClick={() =>
                    activeTab !== "pickup_pending" &&
                    handleTabChange("pickup_pending")
                  }
                >
                  Pickups
                  {activeTab === "pickup_pending" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    background:
                      "linear-gradient(90deg, rgb(245, 137, 30) 0%, rgb(255, 107, 53) 100%)",
                    color: "#fff",
                    padding: "5px 5px 5px 12px",
                    borderStartStartRadius: "14px",
                    borderEndStartRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <FaTruck
                    style={{ marginRight: "4px", color: "#fff" }}
                    size={15}
                  />
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "in_transit" ? "#000" : "#fff",
                    backgroundColor:
                      activeTab !== "in_transit" ? "#fff" : "#000434",
                    border:
                      activeTab !== "in_transit"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                  }}
                  onClick={() =>
                    activeTab !== "in_transit" && handleTabChange("in_transit")
                  }
                >
                  In Transit
                  {activeTab === "in_transit" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "delivered" ? "#000" : "#fff",
                    backgroundColor:
                      activeTab !== "delivered" ? "#fff" : "#000434",
                    border:
                      activeTab !== "delivered"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                  }}
                  onClick={() =>
                    activeTab !== "delivered" && handleTabChange("delivered")
                  }
                >
                  Delivered
                  {activeTab === "delivered" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "rto" ? "#000" : "#fff",
                    backgroundColor: activeTab !== "rto" ? "#fff" : "#000434",
                    border:
                      activeTab !== "rto"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                    borderEndEndRadius: "14px",
                    borderStartEndRadius: "14px",
                  }}
                  onClick={() => activeTab !== "rto" && handleTabChange("rto")}
                >
                  RTO
                  {activeTab === "rto" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    background:
                      "linear-gradient(90deg, rgb(245, 137, 30) 0%, rgb(255, 107, 53) 100%)",
                    color: "#fff",
                    padding: "5px 5px 5px 12px",
                    borderStartStartRadius: "14px",
                    borderEndStartRadius: "14px",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <FaGear
                    style={{ marginRight: "4px", color: "#fff" }}
                    size={15}
                  />
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "all" ? "#000" : "#fff",
                    backgroundColor: activeTab !== "all" ? "#fff" : "#000434",
                    border:
                      activeTab !== "all"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                  }}
                  onClick={() => activeTab !== "all" && handleTabChange("all")}
                >
                  All Orders
                  {activeTab === "all" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
                <div
                  style={{
                    borderLeft: "0px",
                    fontSize: 12,
                    color: activeTab !== "others" ? "#000" : "#fff",
                    backgroundColor:
                      activeTab !== "others" ? "#fff" : "#000434",
                    border:
                      activeTab !== "others"
                        ? "1px solid #f5891e"
                        : "1px solid #000434",
                    justifyContent: "center",
                    display: "flex",
                    alignItems: "center",
                    padding: "5px 10px",
                    textWrap: "nowrap",
                    borderEndEndRadius: "14px",
                    borderStartEndRadius: "14px",
                  }}
                  onClick={() =>
                    activeTab !== "others" && handleTabChange("others")
                  }
                >
                  Archived
                  {activeTab === "others" && (
                    <label
                      style={{
                        marginLeft: 4,
                        backgroundColor: "#FFE8CC",
                        color: "#f5891e",
                        borderRadius: "3px",
                        padding: "0px 6px",
                        fontSize: 10,
                      }}
                    >
                      {totalOrders}
                    </label>
                  )}
                </div>
              </div>
            </div>
            <div
              style={{ display: "flex", justifyContent: "flex-end" }}
              className="col-md-4"
            >
              <Button
                variant={"outline-secondary"}
                // size="sm"
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  marginLeft: "14px",
                  textWrap: "nowrap",
                }}
              >
                <BsFillFunnelFill
                  onClick={() => setShowFilters(!showFilters)}
                  // size={"30px"}
                  // color="#F5891E"
                />{" "}
                Filter
              </Button>
            </div>
            {/* {orderTabs.map(({ key, label }) => (
              <Col className="md-2" key={key} style={{ padding: "2px 4px" }}>
                <Button
                  variant={activeTab === key ? "success" : "outline-primary"}
                  // size="sm"
                  onClick={() => activeTab !== key && handleTabChange(key)}
                  style={{
                    textWrap: "nowrap",
                  }}
                >
                  {label}
                </Button>
              </Col>
            ))} */}
          </div>
        </div>
        <div className="shadow">
          <DataTable
            data={orders}
            columns={columns}
            highlightOnHover
            pagination
            paginationServer
            selectableRows
            onSelectedRowsChange={handleChange}
            paginationTotalRows={totalOrders}
            paginationRowsPerPageOptions={rowsPerPageOptions}
            paginationPerPage={rowsPerPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
            fixedHeader
            fixedHeaderScrollHeight={tableHeight}
            defaultSortFieldId="createdAt"
            defaultSortAsc={false}
            sortIcon={<i className="fa-solid fa-sort"></i>}
            noDataComponent="No orders found"
            responsive
            // striped
            persistTableHead
            progressPending={isLoading}
            conditionalRowStyles={conditionalRowStyles}
          />
        </div>
      </div>
      <Modal show={showModal} onHide={handleClose} size="lg">
        <Form className="" onSubmit={handleEditSubmit}>
          <Modal.Header closeButton>
            Edit Order #{editOrder?.order_id || "—"}
          </Modal.Header>
          <Modal.Body>
            <div className="row g-3">
              {/* Order Info */}
              <div className="col-lg-6">
                <div
                  style={{
                    border: "1px solid #F5891E",
                    borderRadius: 10,
                    padding: "12px 16px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.06)",
                    fontSize: 13,
                    color: "#000434",
                    fontFamily: "Hiragino Maru Gothic ProN W4",
                  }}
                >
                  <div style={{ fontWeight: 600, color: "#000434" }}>
                    <span style={{ color: "#F5891E" }}>
                      #{editOrder?.order_id || "—"}
                    </span>
                  </div>
                  <div style={{ fontSize: 9 }}>
                    {editOrder?.createdAt
                      ? new Date(editOrder?.createdAt)
                          .toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                          .replace(",", " -")
                      : "—"}
                  </div>
                  <div style={{ paddingTop: "5px" }}>
                    <div>
                      <FaStore style={{ marginRight: "4px", color: "#555" }} />
                      {/* <strong style={{ color: "#555" }}>Channel:</strong>{" "} */}
                      <span style={{ color: "#000" }}>
                        {editOrder?.channel_account_name || "—"}{" "}
                        {hasValue(editOrder?.store_order_id) && (
                          <>
                            -
                            <span
                              style={{
                                color: "#007bff",
                                fontWeight: 500,
                                cursor: "pointer",
                              }}
                              title={
                                "Store Order ID: " +
                                String(editOrder?.store_order_id).trim() +
                                "\nChannel Order ID:" +
                                String(editOrder?.channel_order_id).trim()
                              }
                            >
                              {" "}
                              {String(editOrder?.store_order_id).trim()}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div>
                      <FaBriefcase
                        style={{ marginRight: "4px", color: "#555" }}
                      />
                      {/* <strong style={{ color: "#555" }}>Channel:</strong>{" "} */}
                      <span style={{ color: "#000" }}>
                        {editOrder?.pool_name || "—"}
                      </span>
                    </div>
                    {/* {hasValue(row.channel_order_id) && (
              <div style={{ fontSize: 9 }}>
                (
                <strong style={{ color: "#555" }}>CHOID:</strong>{" "}
                <span style={{ color: "#000" }}>
                  {String(row.channel_order_id).trim()}
                </span>)
              </div>
            )
            } */}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="col-lg-6">
                <div
                  style={{
                    border: "1px solid #F5891E",
                    borderRadius: 10,
                    padding: "12px 16px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.06)",
                    fontSize: 13,
                    color: "#000434",
                    fontFamily: "Hiragino Maru Gothic ProN W4",
                  }}
                >
                  <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: "12px",
                        color: "#000434",
                        textDecoration: "underline",
                        marginBottom: "4px",
                        // padding: "6px 4px",
                      }}
                    >
                      {hasValue(editOrder?.product_name) ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`product-tooltip-${editOrder?._id}`}>
                              {String(editOrder?.product_name)}
                              <br />
                              ID: {editOrder?.product_sku_id || "—"}
                            </Tooltip>
                          }
                        >
                          <span style={{ cursor: "pointer" }}>
                            {String(editOrder?.product_name)}
                          </span>
                        </OverlayTrigger>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div style={{ fontStyle: "italic", color: "#555" }}>
                      SKU:{" "}
                      {editOrder?.product_sku_id ? (
                        <span style={{ cursor: "pointer" }}>
                          {String(editOrder?.product_sku_id)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      Qty:{" "}
                      <span style={{ color: "#000434" }}>
                        {editOrder?.quantity || "—"} pcs
                      </span>
                    </div>
                    <div style={{ fontWeight: 500 }}>
                      Amt:{" "}
                      <span
                        style={{
                          color: !editOrder?.payment_method
                            ?.toLowerCase()
                            .includes("cod")
                            ? "#28a745"
                            : "#d9534f",
                        }}
                      >
                        ₹
                        {editOrder?.first_line_item_price && editOrder?.quantity
                          ? Number(editOrder?.first_line_item_price) *
                            editOrder?.quantity
                          : editOrder?.total_amount || "—"}{" "}
                        (
                        {editOrder?.payment_method
                          ?.toLowerCase()
                          .includes("cod")
                          ? "COD"
                          : "Prepaid"}
                        )
                      </span>
                    </div>

                    {editOrder?.remittance_status &&
                      editOrder?.remittance_status !== "NA" && (
                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "4px",
                            padding: "2px 6px",
                            fontSize: "10px",
                            fontWeight: 600,
                            borderRadius: "4px",
                            backgroundColor:
                              editOrder?.remittance_status === "pending"
                                ? "#ffc107"
                                : editOrder?.remittance_status === "completed"
                                ? "#28a745"
                                : editOrder?.remittance_status === "processing"
                                ? "#007bff"
                                : "#6c757d",
                            color: "#fff",
                          }}
                        >
                          {editOrder?.remittance_status.toUpperCase()}
                        </span>
                      )}
                  </div>
                </div>

                {/* AI Recommended Address */}
                {bestAddress && (
                  <div className="col-lg-3">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#FFFFFF",
                        border: "1.5px solid #F5891E",
                        borderRadius: 10,
                        padding: "12px 16px",
                        fontWeight: 600,
                        fontSize: 14,
                        fontFamily: "Hiragino Maru Gothic ProN W4",
                        color: "#000434",
                        textAlign: "center",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                        animation: "brandGlow 2.5s infinite ease-in-out",
                      }}
                    >
                      <div
                        style={{
                          background:
                            "linear-gradient(135deg, #F5891E, #000434)",
                          color: "#FFFFFF",
                          padding: "4px 12px",
                          borderRadius: 24,
                          fontSize: 12,
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          letterSpacing: "0.03em",
                          boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                          marginBottom: 8,
                          animation: "pulseGlow 1.8s infinite ease-in-out",
                        }}
                      >
                        🤖 OU AI Recommended
                      </div>
                      <div style={{ fontSize: 13, marginBottom: 6 }}>
                        🏠 <b>{bestAddress}</b>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#000434",
                          color: "#FFFFFF",
                          fontSize: 12,
                          borderRadius: 16,
                          padding: "4px 10px",
                          fontWeight: 500,
                          boxShadow: "0 0 8px #F5891E",
                          userSelect: "none",
                          width: "fit-content",
                        }}
                      >
                        🔄 RTO Risk:{" "}
                        <span style={{ color: "#F5891E", fontWeight: 600 }}>
                          ~10%
                        </span>{" "}
                        (Low)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6" style={{ padding: 10 }}>
                {/* <BiPackage size={12} />  Weight: {editOrder?.['weight']} grams */}
              </div>
              <div className="col-lg-6" style={{ padding: 10, fontSize: 12 }}>
                {/* Dimensions: {editOrder?.['length']}cm X {editOrder?.['width']}cm X {editOrder?.['height']}cm */}
              </div>
            </div>
            <div className="theme-form row">
              <Form.Group className="col-lg-6">
                <Form.Label className="col-form-label pt-0">
                  {"Customer Name"}
                </Form.Label>
                <Form.Control
                  className="form-control"
                  type="text"
                  name="customer_name"
                  onChange={(e) => {
                    let tempData = { ...editOrder };
                    tempData["customer_name"] = e.target.value;
                    setEditOrder(tempData as Order);
                  }}
                  defaultValue={editOrder?.["customer_name"]}
                  placeholder="Enter Customer Name"
                />
              </Form.Group>
              <Form.Group className="col-lg-6">
                <Form.Label className="col-form-label pt-0">
                  {"Customer Phone Number"}
                </Form.Label>
                <Form.Control
                  className="form-control"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  prefix="91"
                  name="customer_phone"
                  onChange={(e) => {
                    const raw = String(e.target.value || "");
                    const digits = raw.replace(/\D/g, "");
                    const last10 = digits.slice(-10);
                    if (last10.length === 10) {
                      let tempData = { ...editOrder };
                      tempData["customer_phone"] = `91${last10}`;
                      setEditOrder(tempData as Order);
                    }
                  }}
                  defaultValue={editOrder?.["customer_phone"]}
                  placeholder="Enter Customer Phone Number"
                />
              </Form.Group>
              <Form.Group className="col-lg-6">
                <Form.Label className="col-form-label pt-0">
                  {"Customer Address"}
                </Form.Label>
                <Form.Control
                  className="form-control"
                  type="text"
                  name="shipping_address"
                  onChange={(e) => {
                    let tempData = { ...editOrder };
                    tempData["shipping_address"] = e.target.value;
                    setEditOrder(tempData as Order);
                  }}
                  defaultValue={editOrder?.["shipping_address"]}
                  placeholder="Enter Customer Address"
                />
              </Form.Group>
              <Form.Group className="col-lg-6">
                <Form.Label className="col-form-label pt-0">
                  {"Customer Pin Code"}
                </Form.Label>
                <Form.Control
                  className="form-control"
                  type="number"
                  name="shipping_pincode"
                  onChange={async (e) => {
                    const pincode = e.target.value;

                    // Validate pincode format (6-digit number)
                    if (!/^\d{6}$/.test(pincode)) {
                      // toast.error("Invalid Pincode");
                      return;
                    }

                    try {
                      const data = await pincodeDetails({ pincode });

                      if (Array.isArray(data) && data.length > 0) {
                        const postOffice = data[0];

                        setEditOrder((prev: any) => {
                          return {
                            ...prev,
                            // shipping_address: postOffice?.Name || "",
                            shipping_city: postOffice?.district || "",
                            shipping_state: postOffice?.statename || "",
                            shipping_country: "India",
                            shipping_pincode: pincode,
                          };
                        });
                      } else {
                        setEditOrder((prev: any) => {
                          return {
                            ...prev,
                            // shipping_address: postOffice?.Name || "",
                            shipping_city: "",
                            shipping_state: "",
                          };
                        });
                      }
                    } catch (error) {
                      toast.error("Invalid Pincode or Pincode not found");
                    }
                  }}
                  defaultValue={editOrder?.["shipping_pincode"]}
                  placeholder="Enter Pin Code"
                />
                <div id="pin_error" style={{ color: "red" }}></div>
              </Form.Group>
              <Form.Group className="col-lg-6">
                <Form.Label className="col-form-label pt-0">
                  {"Customer City"}
                </Form.Label>
                <Form.Control
                  className="form-control"
                  type="text"
                  value={editOrder?.["shipping_city"]}
                  placeholder="Enter Customer City"
                  disabled={true}
                  name="shipping_city"
                />
              </Form.Group>
              <Form.Group className="col-lg-6">
                <Form.Label className="col-form-label pt-0">
                  {"Customer State"}
                </Form.Label>
                <Form.Control
                  className="form-control"
                  type="text"
                  value={editOrder?.["shipping_state"]}
                  placeholder="Enter Customer State"
                  disabled={true}
                  name="shipping_state"
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="submit"
              style={{ color: "primary" }}
              className="m-r-15"
            >
              {"Submit"}
            </Button>
            <Button
              style={{ color: "warning" }}
              className="m-r-15"
              onClick={handleClose}
            >
              {"Close"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      <Modal show={showPickupModal} onHide={handlePickupClose} size="sm">
        <Modal.Header closeButton>Schedule Pickup</Modal.Header>
        <Modal.Body>
          <Form className="theme-form " action="#">
            <Form.Group>
              <Form.Label className="col-form-label pt-0">
                {"Pickup Date"}
              </Form.Label>
              <Form.Control
                className="form-control"
                type="date"
                onChange={(e) => {
                  setPickupDate(new Date(e.target.value));
                }}
                max={
                  new Date(new Date().setDate(new Date().getDate() + 3))
                    .toISOString()
                    .split("T")[0]
                }
                min={
                  new Date(new Date().setDate(new Date().getDate()))
                    .toISOString()
                    .split("T")[0]
                }
                // defaultValue={new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split("T")[0]}
                placeholder="Enter Pickup Date"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{ color: "primary" }}
            className="m-r-15"
            onClick={handlePickupSubmit}
          >
            {"Submit"}
          </Button>
          <Button
            style={{ color: "warning" }}
            className="m-r-15"
            onClick={handlePickupClose}
          >
            {"Close"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ShipmentModal
        showShipmentModal={showShipmentModal}
        handleShipmentClose={handleShipmentClose}
        shipmentOrder={shipmentOrder}
        shipmentDetails={shipmentDetails}
        handleBookShipment={handleBookShipment}
      />
      <div style={{ display: "none" }}>
        <div ref={labelRef}>
          {labelData &&
            labelData.map((ld: any, index: number) => (
              <div key={index} style={{ pageBreakAfter: "always" }}>
                <ShippingLabel labelData={ld} />
              </div>
            ))}
        </div>
      </div>

      <Modal show={showNewOrderModal} onHide={handleNewOrderClose} size="xl">
        <Form onSubmit={handleNewOrderSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Order</Modal.Title>
          </Modal.Header>
          <Modal.Body className="theme-form row">
            {/* --- CHANNEL & CUSTOMER DETAILS --- */}
            <Form.Group className="col-lg-6 mb-3">
              <Form.Label>Select Channel Account</Form.Label>
              <Form.Control
                as="select"
                required
                value={newOrder?.channel_id || ""}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    channel_id: e.target.value,
                  } as Order)
                }
              >
                <option value="" disabled>
                  Select a Channel Account
                </option>
                {channelAccounts.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.channel_account_name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group className="col-lg-6 mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control
                as="select"
                required
                value={newOrder?.payment_method || ""}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    payment_method: e.target.value,
                  } as Order)
                }
              >
                <option value="" disabled>
                  Select Method
                </option>
                <option value="COD">COD - Cash on Delivery</option>
                <option value="PREPAID">Prepaid</option>
              </Form.Control>
            </Form.Group>

            <Form.Group className="col-lg-6 mb-3">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                required
                value={newOrder?.customer_name || ""}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    customer_name: e.target.value,
                  } as Order)
                }
                placeholder="Enter Customer Name"
              />
            </Form.Group>

            <Form.Group className="col-lg-6 mb-3">
              <Form.Label>Customer Phone Number</Form.Label>
              <Form.Control
                type="tel"
                required
                placeholder="Enter 10 digit number"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(-10);
                  if (digits.length === 10) {
                    setNewOrder({
                      ...newOrder,
                      customer_phone: `91${digits}`,
                    } as Order);
                  }
                }}
              />
            </Form.Group>

            <Form.Group className="col-lg-12 mb-3">
              <Form.Label>Customer Address</Form.Label>
              <Form.Control
                type="text"
                required
                value={newOrder?.shipping_address || ""}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    shipping_address: e.target.value,
                  } as Order)
                }
                placeholder="Full Address"
              />
            </Form.Group>

            <Form.Group className="col-lg-4 mb-3">
              <Form.Label>Pin Code</Form.Label>
              <Form.Control
                type="text"
                required
                maxLength={6}
                onChange={async (e) => {
                  const pincode = e.target.value;
                  if (/^\d{6}$/.test(pincode)) {
                    try {
                      const data = await pincodeDetails({ pincode });
                      if (data?.[0]) {
                        setNewOrder({
                          ...newOrder,
                          shipping_pincode: Number(pincode),
                          shipping_city: data[0].district,
                          shipping_state: data[0].statename,
                          shipping_country: "India",
                        } as any);
                      }
                    } catch (error) {
                      toast.error("Pincode not found");
                    }
                  }
                }}
                placeholder="6 Digit Pincode"
              />
            </Form.Group>

            <Form.Group className="col-lg-4 mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={newOrder?.shipping_city || ""}
                placeholder="Auto-filled"
              />
            </Form.Group>

            <Form.Group className="col-lg-4 mb-3">
              <Form.Label>State</Form.Label>
              <Form.Control
                type="text"
                readOnly
                value={newOrder?.shipping_state || ""}
                placeholder="Auto-filled"
              />
            </Form.Group>

            {/* --- DYNAMIC ITEMS SECTION --- */}
            <div className="col-12 mt-3 mb-4">
              <div className="p-3 border rounded">
                <h6 className="mb-3">Order Items</h6>

                {orderItems.map((item, index) => (
                  <div className="row align-items-end mb-3" key={index}>
                    <Form.Group className="col-md-7">
                      <Form.Label className="small text-muted">
                        Product
                      </Form.Label>
                      <Form.Control
                        as="select"
                        required
                        value={item.product}
                        onChange={(e) =>
                          handleItemChange(index, "product", e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select a Product
                        </option>
                        {productSKUs.map((sku) => (
                          <option key={sku._id} value={sku._id}>
                            {sku.product_sku_name}
                          </option>
                        ))}
                      </Form.Control>
                    </Form.Group>

                    <Form.Group className="col-md-3">
                      <Form.Label className="small text-muted">Qty</Form.Label>
                      <Form.Control
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                      />
                    </Form.Group>

                    <div className="col-md-2">
                      {orderItems.length > 1 && (
                        <Button
                          variant="outline-danger"
                          className="w-100"
                          onClick={() => handleRemoveItem(index)}
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
                  onClick={handleAddItem}
                >
                  + Add Another Item
                </Button>
              </div>
            </div>

            {/* --- ORDER TOTAL --- */}
            <Form.Group className="col-lg-12 mb-3">
              <Form.Label>Total Order Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                required
                min="1"
                value={newOrder?.total_amount || ""}
                onChange={(e) =>
                  setNewOrder({
                    ...newOrder,
                    total_amount: Number(e.target.value),
                  } as Order)
                }
                placeholder="Enter Total Amount"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleNewOrderClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Order
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Orders };

const DecorativeSvg = ({ score = 0, width = 120 }) => {
  const percentage = (score / 900) * 100;
  const minAngle = -90;
  const maxAngle = 90;
  const rotation =
    minAngle +
    (Math.min(Math.max(percentage, 0), 100) / 100) * (maxAngle - minAngle);

  const redFill = percentage > 0 ? "#f87171" : "#B4B4B5";
  const yellowFill = percentage > 33 ? "#facc15" : "#B4B4B5";
  const greenFill = percentage > 66 ? "#22c55e" : "#B4B4B5";

  return (
    <svg
      width={width}
      viewBox="0 0 1360 680"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(128.5 42)">
        {/* Left shape (Red Threshold) */}
        <g transform="translate(177.84 324)">
          <path
            fill={redFill}
            style={{ transition: "fill 0.3s ease" }}
            d="M177.59-25.79
               C102.12 32.68 53.54 124.19 53.54 227.04
               H-177.59
               C-177.59 38.59 -82.95 -127.75 61.39 -227.04
               Z"
          />
        </g>

        {/* Center shape (Yellow Threshold) */}
        <g transform="translate(542.01 137.065)">
          <path
            fill={yellowFill}
            style={{ transition: "fill 0.3s ease" }}
            d="M265.91-73.365
               L150.18 127.095
               C107.61 106.105 59.7 94.315 9.03 94.315
               C-49 94.315 -103.42 109.775 -150.33 136.815
               L-265.91 -63.385
               C-185 -110.095 -91.11 -136.815 9.03 -136.815
               C101.8 -136.815 189.22 -113.875 265.91 -73.365
               Z"
          />
        </g>

        {/* Right shape (Green Threshold) */}
        <g transform="translate(915.84 318.3)">
          <path
            fill={greenFill}
            style={{ transition: "fill 0.3s ease" }}
            d="M185.99 232.74
               H-45.14
               C-45.14 122.44 -101.01 25.19 -185.99 -32.27
               L-70.24 -232.74
               C83.76 -135.09 185.99 36.89 185.99 232.74
               Z"
          />
        </g>

        {/* Speedometer Needle */}
        <g
          style={{
            transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            transformOrigin: "542px 450px",
          }}
          transform={`rotate(${rotation}, 0, 0)`}
        >
          <g transform="translate(542, 450)">
            <path fill="#585858" d="M-12 0 Q-12 -20 0 -360 Q12 -20 12 0 Z" />
            <circle cx="0" cy="0" r="22" fill="#585858" />
          </g>
        </g>
      </g>
    </svg>
  );
};

export default DecorativeSvg;

function ShipmentModal({
  showShipmentModal,
  handleShipmentClose,
  shipmentOrder,
  shipmentDetails,
  handleBookShipment,
}: any) {
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [sortBy, setSortBy] = useState("recommended"); // recommended, cheapest, fastest, best-rated
  const [filterType, setFilterType] = useState("all");

  // Process and sort couriers
  const { couriers, cheapestId, fastestId, bestRatedId } = useMemo(() => {
    if (!shipmentDetails?.couriers) {
      return {
        couriers: [],
        cheapestId: null,
        fastestId: null,
        bestRatedId: null,
      };
    }

    let list = [...shipmentDetails.couriers];

    // Helper to determine if a courier is surface (since the new API doesn't explicitly send is_surface)
    const checkIsSurface = (c: any) =>
      c.is_surface === true || c.name?.toLowerCase().includes("surface");

    // Identify smart tags using _id and total_amount
    const cheapest = [...list].sort(
      (a, b) => a.total_amount - b.total_amount
    )[0]?._id;
    const fastest = [...list].sort(
      (a, b) =>
        Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
    )[0]?._id;
    const bestRated = [...list].sort((a, b) => b.rating - a.rating)[0]?._id;

    // Filter
    if (filterType === "air") list = list.filter((c) => !checkIsSurface(c));
    if (filterType === "surface") list = list.filter((c) => checkIsSurface(c));

    // Sort using total_amount instead of rate
    if (sortBy === "cheapest")
      list.sort((a, b) => a.total_amount - b.total_amount);
    if (sortBy === "fastest")
      list.sort(
        (a, b) =>
          Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
      );
    if (sortBy === "best-rated") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "recommended") {
      // Custom recommendation logic: high rating + lower price
      list.sort(
        (a, b) => b.rating - a.rating || a.total_amount - b.total_amount
      );
    }

    return {
      couriers: list,
      cheapestId: cheapest,
      fastestId: fastest,
      bestRatedId: bestRated,
    };
  }, [shipmentDetails, sortBy, filterType]);

  const primaryDark = "#000434";
  const primaryAccent = "#F5891E";
  const softShadow = "0 2px 12px rgba(0,0,0,0.04)";
  const cardBorder = "1px solid #f1f3f5";

  return (
    <Modal
      show={showShipmentModal}
      onHide={handleShipmentClose}
      size="xl"
      centered
      backdrop="static"
    >
      <Modal.Header
        closeButton
        style={{
          backgroundColor: "#ffffff",
          borderBottom: cardBorder,
          padding: "16px 24px",
        }}
      >
        <Modal.Title
          style={{
            color: primaryDark,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "20px",
          }}
        >
          <PackageOpen color={primaryAccent} size={24} />
          Process Shipment
          <span
            style={{
              fontSize: "13px",
              backgroundColor: "#FFF7F0",
              color: primaryAccent,
              padding: "4px 10px",
              borderRadius: "6px",
              marginLeft: "8px",
              border: `1px solid ${primaryAccent}`,
              fontWeight: 600,
            }}
          >
            Order #{shipmentOrder?.order_id || "—"}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#f8f9fb", padding: "24px" }}>
        {shipmentDetails ? (
          <div className="d-flex flex-column" style={{ gap: "24px" }}>
            {/* ================= 1. TOP SUMMARY BAR ================= */}
            <Row className="g-3">
              {/* Dispatch From */}
              <Col lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-3"
                  style={{
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: softShadow,
                  }}
                >
                  <div
                    className="mt-1 p-2 rounded"
                    style={{ backgroundColor: "#FFF7F0" }}
                  >
                    <Store color={primaryAccent} size={20} />
                  </div>
                  <div>
                    <div
                      className="text-muted text-uppercase fw-bold mb-1"
                      style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                    >
                      Dispatch From
                    </div>
                    <div
                      className="fw-bold text-truncate"
                      style={{ fontSize: "13px", color: primaryDark }}
                    >
                      {shipmentDetails.fulfillment.warehouseDetails.name}
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "11px", lineHeight: "1.4" }}
                    >
                      {shipmentDetails.fulfillment.warehouseDetails.City},{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.State} -{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.pincode}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Shipping To */}
              <Col lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-3"
                  style={{
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: softShadow,
                  }}
                >
                  <div
                    className="mt-1 p-2 rounded"
                    style={{ backgroundColor: "#E6F4EA" }}
                  >
                    <MapPin color="#28a745" size={20} />
                  </div>
                  <div>
                    <div
                      className="text-muted text-uppercase fw-bold mb-1"
                      style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                    >
                      Shipping To
                    </div>
                    <div
                      className="fw-bold text-truncate"
                      style={{ fontSize: "13px", color: primaryDark }}
                    >
                      {shipmentOrder?.customer_name}
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "11px", lineHeight: "1.4" }}
                    >
                      {shipmentOrder?.shipping_city},{" "}
                      {shipmentOrder?.shipping_state} -{" "}
                      {shipmentOrder?.shipping_pincode}
                    </div>
                    <div
                      className="mt-1 fw-bold"
                      style={{
                        fontSize: "11px",
                        color: shipmentOrder?.payment_method
                          ?.toLowerCase()
                          .includes("cod")
                          ? "#d9534f"
                          : "#28a745",
                      }}
                    >
                      {shipmentOrder?.payment_method
                        ?.toLowerCase()
                        .includes("cod")
                        ? "💰 COD: "
                        : "💳 Prepaid: "}{" "}
                      ₹{shipmentOrder?.total_amount}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Weight Summary */}
              <Col lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-3 position-relative"
                  style={{
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: softShadow,
                  }}
                >
                  <div
                    className="mt-1 p-2 rounded"
                    style={{ backgroundColor: "#F0F4FF" }}
                  >
                    <Scale color="#4285F4" size={20} />
                  </div>
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div
                        className="text-muted text-uppercase fw-bold"
                        style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                      >
                        Weight Summary
                      </div>
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip>
                            Higher of actual & volumetric is charged
                          </Tooltip>
                        }
                      >
                        <Info
                          size={14}
                          color="#adb5bd"
                          style={{ cursor: "pointer" }}
                        />
                      </OverlayTrigger>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: primaryDark,
                            fontWeight: 600,
                          }}
                        >
                          {shipmentDetails.weight.actual} kg
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          Actual
                        </div>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "14px", opacity: 0.5 }}
                      >
                        /
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: primaryDark,
                            fontWeight: 600,
                          }}
                        >
                          {shipmentDetails.weight.volumetric} kg
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          Volumetric
                        </div>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "14px", opacity: 0.5 }}
                      >
                        =
                      </div>
                      <div
                        className="text-end px-2 py-1 rounded"
                        style={{ backgroundColor: "rgba(40, 167, 69, 0.1)" }}
                      >
                        <div
                          style={{
                            color: "#28a745",
                            fontSize: "14px",
                            fontWeight: 800,
                          }}
                        >
                          {shipmentDetails.weight.billable} kg
                        </div>
                        <div
                          className="fw-bold"
                          style={{ fontSize: "9px", color: "#28a745" }}
                        >
                          BILLABLE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* ================= 2. PACKAGE SELECTION ================= */}
            <div>
              <h6
                className="fw-bold text-uppercase mb-2"
                style={{
                  fontSize: "11px",
                  color: "#6c757d",
                  letterSpacing: "0.5px",
                }}
              >
                Select Packaging{" "}
                <span className="text-lowercase fw-normal ms-1">
                  ({shipmentDetails.recommendedPacks.length} options)
                </span>
              </h6>
              <Row className="g-3">
                {shipmentDetails.recommendedPacks.map(
                  (pack: any, index: number) => {
                    const isSelected = selectedPackageIndex === index;
                    return (
                      <Col md={6} lg={4} key={index}>
                        <div
                          onClick={() => setSelectedPackageIndex(index)}
                          className="d-flex align-items-center p-3 position-relative"
                          style={{
                            backgroundColor: isSelected ? "#FFF7F0" : "#ffffff",
                            border: isSelected
                              ? `1px solid ${primaryAccent}`
                              : cardBorder,
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected
                              ? "0 4px 12px rgba(245, 137, 30, 0.15)"
                              : softShadow,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {isSelected && (
                            <CheckCircle2
                              color={primaryAccent}
                              size={18}
                              style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                              }}
                            />
                          )}

                          <div
                            className="me-3 p-2 rounded-circle"
                            style={{
                              backgroundColor: isSelected
                                ? "rgba(245, 137, 30, 0.1)"
                                : "#f8f9fa",
                            }}
                          >
                            <PackageOpen
                              size={20}
                              color={isSelected ? primaryAccent : "#6c757d"}
                            />
                          </div>

                          <div className="flex-grow-1">
                            <div
                              className="fw-bold text-truncate"
                              style={{
                                fontSize: "13px",
                                color: isSelected ? "#a05206" : primaryDark,
                              }}
                            >
                              {pack.name}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              {pack.length} × {pack.breadth} × {pack.height} cm
                            </div>
                          </div>

                          <div
                            className="text-end ps-2"
                            style={{ borderLeft: "1px solid #e9ecef" }}
                          >
                            <div
                              className="fw-bold"
                              style={{ fontSize: "12px", color: primaryDark }}
                            >
                              ₹{pack.packingCost}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "10px" }}
                            >
                              Max {pack.maxWeight}kg
                            </div>
                          </div>
                        </div>
                      </Col>
                    );
                  }
                )}
              </Row>
            </div>

            {/* ================= 3. COURIER OPTIONS ================= */}
            <div
              className="d-flex flex-column flex-grow-1 bg-white p-3"
              style={{
                borderRadius: "12px",
                border: cardBorder,
                boxShadow: softShadow,
              }}
            >
              {/* Controls Toolbar */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 pb-3 border-bottom gap-3">
                <div className="d-flex align-items-center gap-2">
                  <h6
                    className="fw-bold mb-0 me-2"
                    style={{ color: primaryDark, fontSize: "15px" }}
                  >
                    Available Couriers
                  </h6>
                  <Badge
                    bg="light"
                    text="dark"
                    style={{ border: "1px solid #dee2e6", fontWeight: 600 }}
                  >
                    {couriers.length} Options
                  </Badge>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  {/* Sorting */}
                  <div
                    className="d-flex rounded"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "4px",
                      border: cardBorder,
                    }}
                  >
                    {["recommended", "cheapest", "fastest", "best-rated"].map(
                      (sortOption) => (
                        <button
                          key={sortOption}
                          onClick={() => setSortBy(sortOption)}
                          style={{
                            border: "none",
                            background:
                              sortBy === sortOption ? "#fff" : "transparent",
                            color:
                              sortBy === sortOption ? primaryDark : "#6c757d",
                            padding: "4px 12px",
                            fontSize: "11px",
                            fontWeight: sortBy === sortOption ? 700 : 500,
                            borderRadius: "4px",
                            boxShadow:
                              sortBy === sortOption
                                ? "0 1px 3px rgba(0,0,0,0.1)"
                                : "none",
                            textTransform: "capitalize",
                            transition: "all 0.2s",
                          }}
                        >
                          {sortOption.replace("-", " ")}
                        </button>
                      )
                    )}
                  </div>

                  {/* Filter Toggle */}
                  <Form.Select
                    size="sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      width: "120px",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderColor: "#dee2e6",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="air">✈️ Air Only</option>
                    <option value="surface">🚚 Surface Only</option>
                  </Form.Select>
                </div>
              </div>

              {/* Courier List */}
              <div
                className="p-3"
                style={{ overflowY: "auto", maxHeight: "40vh" }}
              >
                {couriers.length === 0 ? (
                  <div
                    className="text-center py-4 text-muted"
                    style={{ fontSize: "13px" }}
                  >
                    No couriers match your filter criteria.
                  </div>
                ) : (
                  couriers.map((courier: any) => {
                    // Update variables to use `_id`
                    const isCheapest = courier._id === cheapestId;
                    const isFastest = courier._id === fastestId;
                    const isBestRated = courier._id === bestRatedId;
                    const isRecommended =
                      sortBy === "recommended" &&
                      courier._id === couriers[0]?._id;

                    // Derive surface flag safely from name if is_surface is missing
                    const isSurfaceCourier =
                      courier.is_surface === true ||
                      courier.name?.toLowerCase().includes("surface");

                    return (
                      <div
                        key={courier._id} // Changed to _id
                        className="mb-3 p-3 position-relative"
                        style={{
                          border: isRecommended
                            ? `1px solid ${primaryAccent}80`
                            : cardBorder,
                          backgroundColor: isRecommended
                            ? "#FFFAF5"
                            : "#ffffff",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 6px 16px rgba(0,0,0,0.06)";
                          e.currentTarget.style.borderColor = isRecommended
                            ? primaryAccent
                            : "#ced4da";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = isRecommended
                            ? `1px solid ${primaryAccent}80`
                            : cardBorder;
                        }}
                      >
                        {/* Smart Tags Array */}
                        <div
                          style={{
                            position: "absolute",
                            top: "-10px",
                            left: "16px",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          {isRecommended && (
                            <span
                              style={{
                                background:
                                  "linear-gradient(135deg, #F5891E, #E0730A)",
                                color: "#fff",
                                padding: "2px 10px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              ★ Recommended
                            </span>
                          )}
                          {isCheapest && (
                            <span
                              style={{
                                backgroundColor: "#E6F4EA",
                                color: "#137333",
                                border: "1px solid #CEEAD6",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              📉 Cheapest
                            </span>
                          )}
                          {isFastest && (
                            <span
                              style={{
                                backgroundColor: "#E8F0FE",
                                color: "#1967D2",
                                border: "1px solid #D2E3FC",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              ⚡ Fastest
                            </span>
                          )}
                          {isBestRated && (
                            <span
                              style={{
                                backgroundColor: "#FEF7E0",
                                color: "#B06000",
                                border: "1px solid #FCE8B2",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              🏆 Top Rated
                            </span>
                          )}
                        </div>

                        <Row className="align-items-center mt-2">
                          {/* LEFT: Courier Identity */}
                          <Col md={4} className="d-flex align-items-center">
                            <div
                              className="d-flex justify-content-center align-items-center me-3"
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "8px",
                                backgroundColor: isSurfaceCourier
                                  ? "#F3F4F6"
                                  : "#EBF5FF",
                                color: isSurfaceCourier ? "#4B5563" : "#3B82F6",
                              }}
                            >
                              {isSurfaceCourier ? (
                                <Truck size={20} />
                              ) : (
                                <Plane size={20} />
                              )}
                            </div>
                            <div>
                              <div
                                className="fw-bold"
                                style={{ fontSize: "14px", color: primaryDark }}
                              >
                                {courier.courier_name}
                              </div>
                              <div
                                className="d-flex align-items-center gap-2 mt-1"
                                style={{ fontSize: "11px" }}
                              >
                                <span className="d-flex align-items-center gap-1 text-muted">
                                  <Star
                                    size={12}
                                    fill="#F5891E"
                                    color="#F5891E"
                                  />
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: primaryDark,
                                    }}
                                  >
                                    {courier.rating}
                                  </span>
                                  /5
                                </span>
                                <span style={{ color: "#dee2e6" }}>|</span>
                                <span className="text-muted">
                                  {isSurfaceCourier ? "Surface" : "Air"}
                                </span>
                              </div>
                            </div>
                          </Col>

                          {/* MIDDLE: Delivery Stats */}
                          <Col
                            md={4}
                            className="text-center"
                            style={{
                              borderLeft: cardBorder,
                              borderRight: cardBorder,
                            }}
                          >
                            <div className="d-flex justify-content-around align-items-center">
                              <div>
                                <div
                                  className="text-muted text-uppercase fw-bold mb-1"
                                  style={{
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Est. Delivery
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{
                                    color: primaryDark,
                                    fontSize: "13px",
                                  }}
                                >
                                  {courier.etd}
                                </div>
                              </div>
                              <div>
                                <div
                                  className="text-muted text-uppercase fw-bold mb-1"
                                  style={{
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Transit Time
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{
                                    color: primaryDark,
                                    fontSize: "13px",
                                  }}
                                >
                                  {courier.estimated_delivery_days} Days
                                </div>
                              </div>
                              <div>
                                <div
                                  className="text-muted text-uppercase fw-bold mb-1"
                                  style={{
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Reliability
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{ color: "#28a745", fontSize: "13px" }}
                                >
                                  {courier.rto_performance}/10
                                </div>
                              </div>
                            </div>
                          </Col>

                          {/* RIGHT: Price & CTA */}
                          <Col
                            md={4}
                            className="d-flex flex-row align-items-center justify-content-end gap-4"
                          >
                            <div className="text-end">
                              <div
                                className="text-muted text-uppercase fw-bold mb-1"
                                style={{
                                  fontSize: "9px",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Final Rate
                              </div>
                              <div
                                className="fw-bold"
                                style={{
                                  fontSize: "20px",
                                  color: primaryDark,
                                  lineHeight: 1,
                                }}
                              >
                                {/* Changed from courier.rate to courier.total_amount */}
                                ₹{Number(courier.total_amount).toFixed(2)}
                              </div>
                            </div>
                            <Button
                              className="border-0 shadow-sm"
                              style={{
                                background:
                                  "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)",
                                fontWeight: 600,
                                padding: "8px 20px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #F5891E 0%, #d97716 100%)";
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(245, 137, 30, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)";
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 4px rgba(0,0,0,0.1)";
                              }}
                              onClick={() => handleBookShipment(courier._id)} // Pass _id instead of id
                            >
                              Ship Now
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="d-flex flex-column align-items-center justify-content-center py-5"
            style={{ minHeight: "400px" }}
          >
            <div
              className="spinner-border mb-3"
              style={{
                color: primaryAccent,
                width: "2.5rem",
                height: "2.5rem",
              }}
              role="status"
            ></div>
            <h6 className="fw-bold" style={{ color: primaryDark }}>
              Analyzing Best Shipping Routes...
            </h6>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Comparing rates, delivery times, and reliability.
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

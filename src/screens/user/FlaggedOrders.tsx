import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Badge,
  Tooltip,
  OverlayTrigger,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  getAllOrders,
  updateOrder,
  getAllFilters,
} from "../../APIs/user/order";
import { fetchNewOrders } from "../../APIs/user/fetchOrder";
import { BsClockFill, BsPhoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaLocationPin } from "react-icons/fa6";
import { FaDollarSign, FaTruck } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { ProductSKU } from "./ProductSKUs";
import {
  bookCourier,
  checkShipmentServiceavailablity,
  getCommonWarehouses,
} from "../../APIs/user/courier";
import { toast } from "react-toastify";
import axios from "axios";
import { Warehouse } from "./Warehouse";
import { getAllWarehouses } from "../../APIs/user/warehouse";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";

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
  customer_email?: string; // Added this property
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
    description?: string; // Added description for status
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

const FlaggedOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [showModal, setShowModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [tableHeight, setTableHeight] = useState<string>("400px");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Filter states
  const [filters, setFilters] = useState<FilterParams>({});
  const [productName, setProductName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [channelAccountId, setChannelAccountId] = useState<string>("");
  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [shipmentOptions, setShipmentOptions] = useState<any>([]);
  const [bestAddress, setBestAddress] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [commonWarehouses, setCommonWarehouses] = useState<any>(null);
  const [labelData, setLabelData] = useState<any>([]);
  const [shipNowLoading, setShipNowLoading] = useState<boolean>(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseId, setWarehouseId] = useState<string>();
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>();
  const labelRef = useRef<HTMLDivElement>(null);
  const [courierPartners, setCourierPartners] = useState<any[]>([]);
  const [selectedCouriers, setSelectedCouriers] = useState<string[]>([]);
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
  const innitialFetch = async () => {
    const allFiltersData = await getAllFilters(true);
    const allWarehouseData = await getAllWarehouses();
    const allProductSKUData = await getAllProductSKUs();
    setCourierPartners(allFiltersData.courierPartners);
    setWarehouses(allWarehouseData.data);
    setProductSKUs(allProductSKUData.data);
  };
  const fetchChannelAccounts = async () => {
    try {

      const data = await getAllChannelAccounts();
      setChannelAccounts(data.data);
    } catch (error) {
      toast.error("Error fetching channel accounts" + error);
    }
  };

  const fetchOrders = async (
    page: number,
    limit: number,
    filterParams: FilterParams = {}
  ) => {
    setIsLoading(true);
    try {
      // Instead of building a query string, we'll pass the filters directly as an object
      // to the getAllOrders method
      const response = await getAllOrders(
        page,
        limit,
        {
          // Include pagination parameters
          page,
          limit,
          // Spread the filter parameters
          ...filterParams,
        },
        "/flagged"
      );

      setOrders(response.orders);
      setTotalOrders(response.total);
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

    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when applying filters
    fetchOrders(1, rowsPerPage, newFilters);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setProductName("");
    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
    setChannelAccountId("");
    setFilters({});
    setCurrentPage(1);
    setSelectedStatuses([]);
    setShowFilters(false);
    fetchOrders(1, rowsPerPage, {});
  };

  const calculateTableHeight = () => {
    const headerHeight = showFilters ? 300 : 200; // Adjust based on filter visibility
    const availableHeight = window.innerHeight - headerHeight;
    setTableHeight(`${availableHeight}px`);
  };

  useEffect(() => {
    calculateTableHeight();
  }, [showFilters]);

  const handleBookShipment = async (courier_id: any) => {
    try {
      const response = await bookCourier(
        shipmentOrder?._id,
        courier_id,
        selectedWarehouse.warehouseAddress.warehouse_id
      );
      toast.success(response.message);
      if (response) {
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

  const handleBulkPrint = (orders: Order[]) => {
    toast.info(
      "Printing labels for " + orders.length + " orders. Please wait..."
    );
    setLabelData(orders.map((order) => order.label));
  };

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
        // printWindow.close();
      }
    }
  };

  const handleSelectShipment = async (
    order_id: Order["_id"],
    shipment: any
  ) => {
    const res = await updateOrder(order_id, {
      recomended_courier_id: shipment._id,
    });
    if (res) {
      fetchOrders(currentPage, rowsPerPage, filters);
      handleShipmentClose();
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditOrder(null);
  };

  const handleShipmentClose = () => {
    setShowShipmentModal(false);
    setShipmentOrder(null);
    setBestAddress("");
    setShipmentOptions([]);
    setCommonWarehouses(null);
    setSelectedWarehouse(null);
  };

  const handleChangeWarehouse = async (row: Order, selectedWarehouse: any) => {
    setShipmentOptions([]);
    const response = await checkShipmentServiceavailablity(row, [
      selectedWarehouse,
    ]);
    setShipmentOptions(response.results);
    setSelectedWarehouse(response.selectedWarehouse);
  };

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
          }
        }
      })
    );
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
  const handleEditSubmit = async () => {
    if (editOrder) {
      try {
        await updateOrder(editOrder._id, editOrder);
        fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
        handleClose();
      } catch (error) {
        toast.error("Error updating order" + error);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchOrders(page, rowsPerPage, filters);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number, page: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(page);
    fetchOrders(page, newRowsPerPage, filters);
  };

  const columns = [
    {
      name: "Order Details",
      cell: (row: Order) => (
        <div>
          #{row.order_id || "—"} <br />
          <strong>Channel OID:</strong> {row.channel_order_id || "—"} <br />
          <strong>
            Store OID:
            <span style={{ color: "blue" }}> {row.store_order_id || "—"} </span>
          </strong>
          <br />
          <strong>Channel:</strong> {row.channel_account_name || "—"}
        </div>
      ),
      wrap: true,
      width: "200px",
      style: { margin: "10px 0", fontSize: "11px" },
    },
    {
      name: "Product Details",
      cell: (row: Order) => (
        <div>
          <span style={{ textDecoration: "underline" }}>
            {row.product_name || "—"}
            <br />
          </span>
          SKU: {row.product_sku_id || "—"}
          <br />
        </div>
      ),
      wrap: true,
      width: "225px",
      style: { margin: "10px 0", fontSize: "11px" },
    },
    {
      name: "Customer Details",
      cell: (row: any) => (
        <div>
          {row.customer_name || "—"} <br />
          <BsPhoneFill /> {row.customer_phone || "—"}
          <br />
          {row.customer_email && <MdEmail />}{" "}
          {(row.customer_email || "") && <br />}
          <FaLocationPin /> {row.shipping_address}, {row.shipping_city},{" "}
          {row.shipping_state}, {row.shipping_country} - {row.shipping_pincode}
        </div>
      ),
      wrap: true,
      width: "225px",
      style: { margin: "10px 0", fontSize: "11px" },
    },
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

        const latestStatus =
          sortedStatus?.[0]?.status?.replaceAll("_", " ") || "—";
        return (
          <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
            {/* Recommended Courier */}
            {row?.recommended_courier_id && !row?.shipping_courier_id && (
              <Badge
                bg="primary"
                className="me-1"
                key={row?.recommended_courier_id}
                style={{
                  fontSize: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                👍 {row?.recommended_courier_name || "—"}
              </Badge>
            )}
            {/* Shipping Courier */}
            {row?.shipping_courier_id && (
              <>
                {row?.shipping_courier_name || "—"} <br />
              </>
            )}
            {/* AWB Number */}
            {row.awb_number ? (
              <>
                <FaTruck />{" "}
                <a
                  href={row?.tracking_url?.replace(
                    "{{awb_number}}",
                    row.awb_number
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#007bff", textDecoration: "underline" }}
                >
                  {row.awb_number}
                </a>
                <br />
              </>
            ) : (
              <>
                <br />
                <strong>AWB:</strong> — <br />
              </>
            )}
            {/* Latest Status with Tooltip */}
            <BsClockFill />{" "}
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`tooltip-${row._id}`}>
                  <div style={{ maxWidth: "250px" }}>
                    {sortedStatus.length > 0 ? (
                      sortedStatus.map((status: any, index: number) => (
                        <div key={index}>
                          {index + 1}. {status.status.replaceAll("_", " ")} at{" "}
                          {new Date(status.status_date).toLocaleDateString()}{" "}
                          {new Date(status.status_date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {index !== sortedStatus.length - 1 && <br />}
                        </div>
                      ))
                    ) : (
                      <span>No status updates</span>
                    )}
                  </div>
                </Tooltip>
              }
            >
              <span
                style={{
                  textTransform: "capitalize",
                  color: "#213bb4",
                  backgroundColor: "#00daeb",
                  padding: "2px 5px",
                  borderRadius: "5px",
                  textDecoration: "underline dotted",
                  cursor: "help",
                }}
              >
                {latestStatus}
              </span>
            </OverlayTrigger>
            <br />
          </div>
        );
      },
      wrap: true,
      width: "220px",
      style: { margin: "10px 0", fontSize: "11px" },
    },
    {
      name: "Fetched On",
      selector: (row: Order) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          : "—",
      sortable: true,
      width: "110px",
      style: { margin: "10px 0", fontSize: "11px" },
    },
    {
      name: "Actions",
      cell: (row: Order) => {
        const hasAwb = Boolean(row.awb_number);
        const latestStatus = row.status?.length
          ? row.status.sort(
            (a: any, b: any) =>
              new Date(b.status_date).getTime() -
              new Date(a.status_date).getTime()
          )[0]
          : null;
        return (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              {/* Edit or Schedule Pickup */}
              {latestStatus &&
                (latestStatus.status === "AWB & Label Generated" ||
                  latestStatus.status.toLowerCase().includes("pickup")) && (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEdit(row)}
                  >
                    {hasAwb ? "🗓️ Schedule Pickup" : "✏️ Edit"}
                  </Button>
                )}

              {/* Print Label or Ship Now */}
              {hasAwb &&
                latestStatus &&
                latestStatus.status !== "cancelled" &&
                (latestStatus.status === "AWB & Label Generated" ||
                  latestStatus.status.toLowerCase().includes("pickup")) && (
                  <Button
                    variant="success"
                    onClick={() => setLabelData([row.label])}
                  >
                    🖨️ Print Label
                  </Button>
                )}
              {!hasAwb &&
                latestStatus &&
                latestStatus.status !== "cancelled" && (
                  <Button
                    style={{
                      backgroundColor: "#F5891E",
                      border: 0,
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      color: "white",
                    }}
                    disabled={shipNowLoading}
                    onClick={() => handleShipment([row])}
                  >
                    🚚 Ship Now
                  </Button>
                )}
            </div>
            {/* Change Courier */}
            {hasAwb &&
              latestStatus &&
              (latestStatus.status === "AWB & Label Generated" ||
                latestStatus.status.toLowerCase().includes("pickup")) && (
                <Button
                  variant="link"
                  size="sm"
                  style={{
                    padding: 0,
                    color: "#007bff",
                    textDecoration: "underline",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onClick={() => alert("Courier Changed")}
                >
                  Change Courier
                </Button>
              )}
            {/*Cancel Order*/}
            {!hasAwb && (
              <Button
                variant={
                  latestStatus?.status === "cancelled"
                    ? "outline-success"
                    : "outline-danger"
                }
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to cancel this order?"
                    )
                  ) {
                    // Call your cancel order function here
                    handleCancelOrder(
                      row,
                      latestStatus?.status === "cancelled"
                        ? "re_activate"
                        : "cancelled"
                    );
                  }
                }}
                className="mt-2"
              >
                {latestStatus?.status === "cancelled"
                  ? "Re-Activate"
                  : "❌ Cancel Order"}
              </Button>
            )}
          </div>
        );
      },
      width: "200px",
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
        backgroundColor: "#f8d7da", // Light red for cancelled orders
        color: "#721c24", // Dark red text for cancelled orders
        textDecoration: "line-through!important", // Strikethrough text for cancelled orders
      },
    },
  ];

  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Orders</h4>
        <div className="d-flex align-items-center justify-content-center">
          <Button
            variant="outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="me-2"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            variant="outline-primary"
            onClick={async () => {
              (await fetchNewOrders()) && fetchOrders(1, rowsPerPage, filters);
            }}
            className="me-2"
          >
            📥 Fetch New Orders
          </Button>
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
            className="me-2"
            style={{
              background: "linear-gradient(90deg, #000434, #F5891E)",
              color: "#FFFFFF",
              padding: "4px 12px",
              borderRadius: 24,
              fontSize: 12,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              letterSpacing: "0.03em",
              boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
              // marginBottom: 8,
              animation: "pulseGlow 1.8s infinite ease-in-out",
            }}
          >
            💡 OI AI Recommend Couriers
          </Button>
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
          <Button
            variant="success"
            onClick={() => {
              handleBulkPrint(
                orders.filter((o: any) => {
                  if (
                    !o.label ||
                    !o.status ||
                    !Array.isArray(o.status) ||
                    o.status.length === 0
                  )
                    return false;

                  const latestStatus = o.status.sort(
                    (a: any, b: any) =>
                      new Date(b.status_date).getTime() -
                      new Date(a.status_date).getTime()
                  )[0];

                  return latestStatus?.status
                    ?.toLowerCase()
                    .includes("label generated");
                })
              );
            }}
          >
            🖨️ Print Labels
          </Button>
        </div>
      </div>

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
            {/* Filters */}
            <Row className="mb-4">
              <Col md={4}>
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

              <Col md={4}>
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

              <Col md={4}>
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
            </Row>

            <Row className="mb-4"></Row>

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

      <DataTable
        title="Your Orders"
        data={orders}
        columns={columns}
        highlightOnHover
        pagination
        paginationServer
        paginationTotalRows={totalOrders}
        paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
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
        striped
        persistTableHead
        progressPending={isLoading}
        conditionalRowStyles={conditionalRowStyles}
      />
      <Modal show={showModal} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          Edit Order #{editOrder?.order_id || "—"}
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-lg-6">
              <div>
                #{editOrder?.order_id || "—"} <br />
                <strong>Channel OID:</strong>{" "}
                {editOrder?.channel_order_id || "—"} <br />
                <strong>
                  Store OID:
                  <span style={{ color: "blue" }}>
                    {" "}
                    {editOrder?.store_order_id || "—"}{" "}
                  </span>
                </strong>
                <br />
                <strong>Channel:</strong>{" "}
                {editOrder?.channel_account?.channel_account_name || "—"}
              </div>
            </div>
            <div className="col-lg-6" style={{ padding: 10, fontSize: 12 }}>
              {editOrder?.["product_name"]} <br />
              <b>
                <FaDollarSign size={12} /> ₹{editOrder?.["total_amount"]} (
                {editOrder?.["payment_method"]})
              </b>
              <br />
              QTY: {editOrder?.["quantity"]} pc <br />
              <BiCalendar size={12} /> Order Date:{" "}
              {editOrder?.["order_date"]?.split("T")[0]}{" "}
              {editOrder?.["order_date"]?.split("T")[1]?.split(":")[0]}:
              {editOrder?.["order_date"]?.split("T")[1]?.split(":")[1]}
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

          <Form className="theme-form row" action="#">
            <Form.Group className="col-lg-6">
              <Form.Label className="col-form-label pt-0">
                {"Customer Name"}
              </Form.Label>
              <Form.Control
                className="form-control"
                type="text"
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
                type="number"
                onChange={(e) => {
                  if (e.target.value.length > 9) {
                    let tempData = { ...editOrder };
                    tempData["customer_phone"] = e.target.value;
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
                onChange={async (e) => {
                  const pincode = e.target.value;

                  // Validate pincode format (6-digit number)
                  if (!/^\d{6}$/.test(pincode)) {
                    // toast.error("Invalid Pincode");
                    return;
                  }

                  try {
                    const { data } = await axios.get(
                      `https://api.postalpincode.in/pincode/${pincode}`
                    );
                    const postOffices = data?.[0]?.PostOffice;

                    if (Array.isArray(postOffices) && postOffices.length > 0) {
                      const postOffice = postOffices[0];

                      setEditOrder((prev: any) => {
                        if (!prev) return prev; // safeguard in case prev is null

                        return {
                          ...prev,
                          // shipping_address: postOffice?.Name || "",
                          shipping_city: postOffice?.District || "",
                          shipping_state: postOffice?.State || "",
                          shipping_country: "India",
                          shipping_pincode: pincode,
                        };
                      });
                    } else {
                      toast.error("No address found for this pincode");
                    }
                  } catch (error) {
                    toast.error("Failed to fetch pincode details");
                    toast.error("Pincode API error:" + error);
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
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            style={{ color: "primary" }}
            className="m-r-15"
            onClick={handleEditSubmit}
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
      </Modal>

      <Modal show={showShipmentModal} onHide={handleShipmentClose} size="xl">
        <Modal.Header>
          Select Shipment for {shipmentOrder?.order_id}
        </Modal.Header>
        <Modal.Body>
          <div className="row g-3">
            {/* Order Info */}
            <div className="col-lg-3">
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
                <div style={{ fontWeight: "bold", marginBottom: 6 }}>
                  #{shipmentOrder?.order_id || "—"}
                </div>
                <div>
                  <strong>Channel OID:</strong>{" "}
                  {shipmentOrder?.channel_order_id || "—"}
                </div>
                <div>
                  <strong>Store OID:</strong>
                  <span style={{ color: "#F5891E", fontWeight: "bold" }}>
                    {" "}
                    {shipmentOrder?.store_order_id || "—"}
                  </span>
                </div>
                <div>
                  <strong>Channel:</strong>{" "}
                  {shipmentOrder?.channel_account_name || "—"}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="col-lg-3">
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
                <div>{shipmentOrder?.product_name || "—"}</div>
                <div style={{ fontWeight: "bold", margin: "6px 0" }}>
                  <FaDollarSign size={12} /> ₹{shipmentOrder?.total_amount} (
                  {shipmentOrder?.payment_method})
                </div>
                <div>QTY: {shipmentOrder?.quantity} pc</div>
                <div>
                  <BiCalendar size={12} /> Order Date:{" "}
                  {shipmentOrder?.order_date?.split("T")[0]}{" "}
                  {shipmentOrder?.order_date?.split("T")[1]?.slice(0, 5)}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="col-lg-3">
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
                <div>{shipmentOrder?.customer_name || "—"}</div>
                <div>
                  <BsPhoneFill /> {shipmentOrder?.customer_phone || "—"}
                </div>
                {shipmentOrder?.customer_email && (
                  <div>
                    <MdEmail /> {shipmentOrder?.customer_email}
                  </div>
                )}
                <div>
                  <FaLocationPin /> {shipmentOrder?.shipping_address},{" "}
                  {shipmentOrder?.shipping_city},{" "}
                  {shipmentOrder?.shipping_state},{" "}
                  {shipmentOrder?.shipping_country} -{" "}
                  {shipmentOrder?.shipping_pincode}
                </div>
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
                      background: "linear-gradient(135deg, #F5891E, #000434)",
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

          {selectedWarehouse && (
            <div>
              <h5 style={{ margin: "16px 0", textAlign: "center" }}>
                Available Warehouses
              </h5>
              <div className="row justify-content-center">
                {commonWarehouses.map((warehouse: any) => {
                  const isSelected =
                    warehouse.warehouse_id ===
                    selectedWarehouse?.warehouseAddress?.warehouse_id;
                  return (
                    <div
                      key={warehouse.warehouse_id}
                      className="col-md-4 col-sm-6 mb-4"
                    >
                      <div
                        style={{
                          padding: "15px",
                          border: isSelected
                            ? "2px solid #F5891E"
                            : "1px solid #ddd",
                          borderRadius: "12px",
                          backgroundColor: isSelected ? "#FFF7F0" : "#ffffff",
                          fontWeight: isSelected ? "bold" : "normal",
                          color: "#000434",
                          cursor: "pointer",
                          boxShadow: isSelected
                            ? "0 6px 16px rgba(245, 137, 30, 0.2)"
                            : "0 3px 8px rgba(0, 0, 0, 0.05)",
                          transition: "all 0.3s ease-in-out",
                          height: "100%",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onClick={() => {
                          shipmentOrder &&
                            handleChangeWarehouse(shipmentOrder, warehouse);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                        }}
                      >
                        {isSelected && (
                          <span
                            style={{
                              position: "absolute",
                              top: "10px",
                              right: "10px",
                              backgroundColor: "#F5891E",
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "5px",
                              fontSize: "12px",
                              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            🏠 Nearest
                          </span>
                        )}

                        <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
                          <strong style={{ fontSize: "16px" }}>
                            {warehouse.warehouse_name}
                          </strong>
                          <br />
                          📍 {warehouse.warehouse_address1},{" "}
                          {warehouse.warehouse_address2},{" "}
                          {warehouse.warehouse_city},{" "}
                          {warehouse.warehouse_state} -{" "}
                          {warehouse.warehouse_pincode}
                          <br />
                          <small style={{ color: "#555" }}>
                            📦 <strong>Combo Stock:</strong> {warehouse.stock}
                            <br />
                            {isSelected && (
                              <>
                                🚚 <strong>Travel:</strong>{" "}
                                {selectedWarehouse.distance} KM,{" "}
                                {selectedWarehouse.duration}
                              </>
                            )}
                          </small>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <hr />
          {shipmentOptions.length > 0 && (
            <DataTable
              style={{}}
              // progressPending={filteredData.length == 0}
              fixedHeader={true}
              data={shipmentOptions}
              highlightOnHover
              // conditionalRowStyles={conditionalRowStyles}
              columns={[
                {
                  name: "Company Name",
                  selector: (row: any) => row.courier_name,
                  cell: (row: any, index: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12 }}>
                        {index === 0 && (
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
                        )}
                        <span style={{ fontSize: 14 }}>
                          <b>{row.courier_name}</b>
                        </span>
                        <br />
                        Calling: {row.call_before_delivery && "Available"}
                        <br />
                        {/* Delivery Boy Contact: {row.delivery_boy_contact}<br /> */}
                        Chargeable Weight: {row.charge_weight} KG
                      </div>
                    );
                  },
                  compact: true,
                  sortable: true,
                },
                {
                  name: "Performance",
                  selector: (row: any) => row.rating,
                  cell: (row: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12 }}>
                        Delivery: {row.delivery_performance}
                        <br />
                        Pickup: {row.pickup_performance}
                        <br />
                        RTO: {row.rto_performance}
                        <br />
                        Tracking: {row.tracking_performance}
                        <br />
                        <b>Overall: {row.rating}/10</b>
                        <br />
                      </div>
                    );
                  },
                  compact: true,
                  sortable: true,
                },
                {
                  name: "Charges",
                  selector: (row: any) => row.total_amount,
                  cell: (row: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12 }}>
                        <u>
                          {" "}
                          <b style={{ textTransform: "uppercase" }}>
                            ZONE {row.zone}
                          </b>
                        </u>
                        <br />
                        {row.cod_charges > 0 && row.cod_charges != 0
                          ? "COD: ₹" + row.cod_charges
                          : ""}
                        <br />
                        Freight: ₹{row.freight_charge}
                        <br />
                        {parseFloat(row.other_charges) !== 0 && (
                          <>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top">
                                  18% GST on ₹
                                  {row.freight_charge + row.cod_charges} ={" "}
                                  {(
                                    (row.freight_charge + row.cod_charges) *
                                    0.18
                                  ).toFixed(2)}
                                  <br />
                                  {row.other_charges -
                                    (row.freight_charge + row.cod_charges) *
                                    0.18 >
                                    0 &&
                                    `LM Surcharge ₹${(
                                      row.other_charges -
                                      (row.freight_charge + row.cod_charges) *
                                      0.18
                                    ).toFixed(2)}`}
                                  <br />
                                </Tooltip>
                              }
                            >
                              <span
                                style={{
                                  textDecoration: "underline dotted",
                                  cursor: "help",
                                }}
                              >
                                Other
                              </span>
                            </OverlayTrigger>
                            : ₹{row.other_charges}
                            <br />
                          </>
                        )}
                        <span
                          style={{
                            fontWeight: 800,
                            textDecoration: "underline",
                          }}
                        >
                          Total: ₹{row.total_amount}
                        </span>
                        <br />
                        <br />
                        <i>RTO: ₹{row.rto_charges}</i>
                        <br />
                      </div>
                    );
                  },
                  compact: true,
                  sortable: true,
                },
                {
                  name: "Estimated Delivery",
                  selector: (row: any) => row.etd_hours,
                  cell: (row: any) => {
                    const deliveryDate = new Date(row.etd);
                    const formattedDate = deliveryDate.toLocaleDateString(
                      undefined,
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    );

                    return (
                      <div
                        className="smart-estimate"
                        style={{
                          background:
                            "linear-gradient(135deg, #f3f9ff, #e6f2ff)",
                          padding: "10px",
                          fontSize: "13px",
                          borderRadius: "10px",
                          color: "#000434",
                          fontFamily: "Hiragino Maru Gothic ProN W4",
                          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
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
                          🤖 OU AI Estimated
                        </div>
                        <div style={{ marginBottom: "4px" }}>
                          📅{" "}
                          <strong style={{ color: "#F5891E" }}>Arrives:</strong>{" "}
                          {formattedDate}
                        </div>

                        <div style={{ marginBottom: "4px" }}>
                          ⏱️{" "}
                          <span className="pulse-eta">
                            {row.estimated_delivery_days}d {row.etd_hours}h
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: "11px",
                            marginTop: "6px",
                            color: "#666",
                            fontStyle: "italic",
                          }}
                        >
                          Based on courier history & zone analysis
                        </div>
                      </div>
                    );
                  },
                  compact: true,
                  sortable: true,
                },
                {
                  name: "More",
                  cell: (row: any) => {
                    return (
                      <div
                        style={{
                          justifyContent: "center",
                          alignItems: "center",
                          display: "flex",
                          flexDirection: "column",
                          padding: 10,
                          fontSize: 12,
                        }}
                      >
                        <Button
                          variant="primary"
                          onClick={() => handleBookShipment(row._id)}
                        >
                          {"Book Shipment"}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          style={{ margin: 5 }}
                          onClick={() =>
                            shipmentOrder?._id &&
                            handleSelectShipment(shipmentOrder?._id, row)
                          }
                        >
                          {" "}
                          {"Select"}
                        </Button>
                      </div>
                    );
                  },
                  compact: true,
                  center: true,
                },
              ]}
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          {/* <Btn attrBtn={{ color: "primary", className: "m-r-15", onClick: () => handleAddSubmit() }} >{"Submit"}</Btn> */}
          <Button
            style={{ color: "warning" }}
            className="m-r-15"
            onClick={handleShipmentClose}
          >
            {"Close"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export { FlaggedOrders };

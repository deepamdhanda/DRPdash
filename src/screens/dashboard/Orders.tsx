import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Form, Row, Col, Card, Badge, Tooltip, OverlayTrigger, Tab, TabContainer } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllOrders, updateOrder } from "../../APIs/order";
import { fetchNewOrders } from "../../APIs/fetchOrder";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/dash";
import { BsClockFill, BsPhoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaLocationPin } from "react-icons/fa6";
import { FaDollarSign, FaTruck } from "react-icons/fa";
import { BiCalendar } from "react-icons/bi";
import { ProductSKU } from "./ProductSKUs";
import { bookCourier, checkShipmentServiceavailablity, getCommonWarehouses } from "../../APIs/courier";
import { toast } from "react-toastify";
import Barcode from "react-barcode";

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
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

interface FilterParams {
  productName?: string;
  startDate?: string;
  endDate?: string;
  channelAccountId?: string;
}
export interface IChannelAccount {
  _id: string;
  channel_account_name: string;
}


const labelData1 = {
  "customer_name": "Rahul Sharma",
  "customer_address": "123 MG Road",
  "customer_address2": "Mumbai, Maharashtra, India",
  "customer_pincode": "400001",
  "customer_phone": "9876543210",
  "dimensions": "30*20*10 cm",
  "payment_method": "Prepaid",
  "amount": "Rs. 399",
  "weight": 1.5,
  "e_waybill": "123456789012, 987654321098",
  "courier_name": "Delhivery (Surface)",
  "waybill": "DLV123456789",
  "sort_code": "MUM123",
  "route": "MH/Mumbai/Delhi",
  "product_details": [
    {
      "name": "Men's Cotton T-Shirt",
      "sku": "TSHIRT123",
      "units": 2,
      "selling_price": 799
    },
    {
      "name": "Men's Cotton T-Shirt",
      "sku": "TSHIRT123",
      "units": 2,
      "selling_price": 799
    },
    {
      "name": "Men's Cotton T-Shirt",
      "sku": "TSHIRT123",
      "units": 2,
      "selling_price": 799
    },
    {
      "name": "Men's Cotton T-Shirt",
      "sku": "TSHIRT123",
      "units": 2,
      "selling_price": 799
    },
    {
      "name": "Men's Cotton T-Shirt",
      "sku": "TSHIRT123",
      "units": 2,
      "selling_price": 799
    },
  ],
  "seller_name": "BrandKart Pool",
  "seller_address": "A-101 Industrial Estate, Phase 2",
  "seller_address2": "Bangalore, Karnataka, India",
  "seller_pincode": "560001",
  "seller_phone": "08012345678",
  "seller_order_id": "ORD98765",
  "date": "2025-05-13"
}

const ShippingLabel = ({ labelData }: any) => {
  const data = labelData
  return (
    <div
      style={{
        width: '100mm',
        height: '150mm',
        // border: '1px solid #333',
        fontFamily: 'Arial, sans-serif',
        padding: "0 5px",
        fontSize: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        backgroundColor: 'white',
      }}
    >
      <div className="header" style={{ textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 6px 0', fontWeight: "bold" }}>
          {data.courier_name}
        </h2>
        <hr />
      </div>

      <div style={{ textAlign: 'center' }}>
        <Barcode value={data.waybill} height={60} fontSize={16} />
        <div className="row" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
          <div className="col">{data.date}</div>
          <div className="col">{data.sort_code}</div>
        </div>
      </div>
      <hr />
      <div style={{}}>
        <div><b>Shipping Address:</b></div>
        <div><b>{data.customer_name}</b></div>
        <div>{data.customer_address}, {data.customer_address2} - {data.customer_pincode}</div>
        <div>Contact: {data.customer_phone || '-'}</div>
      </div>
      <hr />
      <div className="row">
        <div className="col">
          <div>eWaybill: {data.e_waybill}</div>
          <div>Payment Mode: <b>{data.payment_method}</b></div>
          <div>Amount: <b>{data.amount}</b></div>
        </div>
        <div className="col">
          <div>Dimensions: {data.dimensions}</div>
          <div>Weight: {data.weight}</div>
        </div>
      </div>
      <hr />
      <div>
        <table style={{ width: "100%", verticalAlign: 'top', borderColor: '#dee2e6', fontSize: 12 }}>
          <thead style={{ verticalAlign: "bottom", borderStyle: 'solid', borderBottomWidth: "0.4px" }}>
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
                  <span style={{ fontSize: "10px" }}>{product.name}</span><br />
                  <span style={{ fontSize: "8px" }}>SKU ID: {product.sku}</span>
                </td>
                <td style={{ padding: "3px" }}>{product.units}</td>
                <td style={{ padding: "3px" }}>₹{product.selling_price.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />

      <div>
        <div style={{ textAlign: 'center' }}>
          <div className="row justify-content-space-evenly" style={{ display: 'flex', justifyContent: 'space-evenly' }}>
            <span className="col-md-6">{data.date}</span>
            <span className="col-md-6">{data.route}</span>
          </div>
          <Barcode value={data.seller_order_id} height={60} fontSize={16} />
        </div>
        <div>Return Address:</div>
        <div>{data.seller_name} (Contact: {data.seller_phone || '-'})</div>
        <div>{data.seller_address}, {data.seller_address2} - {data.seller_pincode}</div>

      </div>




      <div className="footer" style={{ textAlign: 'center', fontSize: '10px', color: '#555' }}>
        <hr />
        <div>All orders are shipped exclusively via OrderzUp. We do not hold any responsibility for the products or services—any return or exchange is strictly subject to the store’s own policy.</div>
      </div>
    </div >
  );
};





const Orders: React.FC = () => {
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [channelAccountId, setChannelAccountId] = useState<string>("");
  const [channelAccounts, setChannelAccounts] = useState<Array<any>>([]);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [shipmentOptions, setShipmentOptions] = useState<any>([]);
  const [bestAddress, setBestAddress] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [commonWarehouses, setCommonWarehouses] = useState<any>(null)
  const [labelData, setLabelData] = useState<any>(labelData1);


  const labelRef = useRef<HTMLDivElement>(null);;
  useEffect(() => {
    fetchOrders(currentPage, rowsPerPage, filters);
    calculateTableHeight();
    fetchChannelAccounts();
  }, [currentPage, rowsPerPage]);

  const fetchChannelAccounts = async () => {
    try {
      // Replace with your actual API endpoint for fetching channel accounts
      const response = await appAxios.get(channelAccounts_url, {});
      const data = await response.data;
      setChannelAccounts(data);
    } catch (error) {
      console.error("Error fetching channel accounts", error);
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
      const response = await getAllOrders(page, limit, {
        // Include pagination parameters
        page,
        limit,
        // Spread the filter parameters
        ...filterParams,
      });

      setOrders(response.orders);
      setTotalOrders(response.total);
    } catch (error) {
      console.error("Error fetching orders", error);
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

    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when applying filters
    fetchOrders(1, rowsPerPage, newFilters);
  };

  const resetFilters = () => {
    setProductName("");
    setStartDate("");
    setEndDate("");
    setChannelAccountId("");
    setFilters({});
    setCurrentPage(1);
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
    console.log("ADFa", selectedWarehouse)
    try {
      await bookCourier(shipmentOrder?._id, courier_id, selectedWarehouse.warehouseAddress.warehouse_id)
    } catch (error) {
      console.log(error)
    }
  }




  const handlePrint = () => {
    if (labelRef.current) {
      const printWindow = window.open('', 'PRINT', 'width=400,height=600');
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
        // printWindow.close();
      }
    }
  };



  const handleSelectShipment = async (order_id: Order["_id"], shipment: any) => {
    const res = await updateOrder(order_id, {
      recomended_courier_id: shipment._id,
    })
    if (res) {
      fetchOrders(currentPage, rowsPerPage, filters);
      handleShipmentClose();
    }
  }

  const handleClose = () => {
    setShowModal(false);
    setEditOrder(null);
  };

  const handleShipmentClose = () => {
    setShowShipmentModal(false);
    setShipmentOrder(null);
    setBestAddress("");
    setShipmentOptions([]);
    setCommonWarehouses(null)
    setSelectedWarehouse(null)
  };


  const handleChangeWarehouse = async (row: Order, selectedWarehouse: any) => {
    setShipmentOptions([]);
    const response = await checkShipmentServiceavailablity(row, [selectedWarehouse]);
    setShipmentOptions(response.results);
    setSelectedWarehouse(response.selectedWarehouse)
  };


  const handleShipment = async (row: Order) => {
    if (row.issues && row.issues.length > 0) {
      handleEdit(row);
      toast.error("Please resolve the issues before proceeding with shipment.");
    } else {
      setShipmentOrder(row);
      const commonWarehouse = getCommonWarehouses(row)
      setCommonWarehouses(commonWarehouse)
      setShowShipmentModal(true);
      const response = await checkShipmentServiceavailablity(row, commonWarehouse);
      setShipmentOptions(response.results);
      setBestAddress(response.best_address);
      setSelectedWarehouse(response.selectedWarehouse)
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
        console.error("Error updating order", error);
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
          <strong>Channel OID:</strong> {row.channel_order_id || "—"}{" "}
          <br />
          <strong>
            Store OID:
            <span style={{ color: "blue" }}> {row.store_order_id || "—"} </span>
          </strong>
          <br />
          <strong>Channel:</strong>{" "}
          {row.channel_account_name || "—"}
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
            {row.product_name || "—"}<br />
          </span>
          SKU: {row.product_sku_id || "—"}
          <br />
          <strong>Qty:</strong> {row.quantity || "—"} pcs <br />
          <strong>Amt:</strong> ₹{row.total_amount || "—"} ({row.payment_method || "—"})<br />
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
          <BsPhoneFill /> {row.customer_phone || "—"}<br />
          {row.customer_email && <MdEmail />}{" "}
          {(row.customer_email || "") && (<br />)}
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
      cell: (row: any) => (
        <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
          {row?.recommended_courier_id && !row?.shipping_courier_id && (
            <Badge bg="primary" className="me-1" key={row?.recommended_courier_id} style={{ fontSize: 12, justifyContent: "center", display: "flex", alignItems: "center" }}>
              👍 {row?.recommended_courier_name || "—"} <br />
            </Badge>
          )}
          {row?.shipping_courier_id && (
            <>
              {row?.shipping_courier_name || "—"} <br />
            </>
          )}
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
              <strong>AWB:</strong> Not Assigned <br />
            </>
          )}
          <BsClockFill />{" "}
          <span
            style={{
              textTransform: "capitalize",
              color: "#213bb4",
              backgroundColor: "#00daeb",
              padding: "2px 5px",
              borderRadius: "5px",
            }}
          >
            {row.latest_status?.replaceAll("_", " ") || "—"}
          </span>
        </div>
      ),
      wrap: true,
      width: "200px",
      style: { margin: "10px 0", fontSize: "11px" },
    },
    {
      name: "Issues",
      cell: (row: any) => (
        <div>
          {row.issues && row.issues.length > 0 ? (
            <ul style={{ paddingLeft: "15px", margin: 0 }}>
              {row.issues.map((issue: any, index: any) => (
                <li key={index} style={{ fontSize: "13px", color: "#d9534f" }}>
                  {issue.message || issue} {/* Display the issue message */}
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ fontSize: "13px", color: "#5cb85c" }}>
              No Issues
            </span>
          )}
        </div>
      ),
      sortable: false,
      width: "150px",
      style: { margin: "10px 0" },
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
      cell: (row: Order) => (
        <>
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            onClick={() => handleEdit(row)}
          >
            Edit
          </Button>
          <Button
            // variant="success" // Changed to a more vibrant color for "Ship Now"
            size="lg"
            style={{ backgroundColor: "#F5891E", border: 0 }}
            className="fw-bold text-uppercase" // Added bold and uppercase styling
            onClick={() => handleShipment(row)}
          >
            🚚 Ship Now
          </Button>
        </>
      ),
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
  ];


  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Orders</h4>
        <div>
          <Button
            variant="outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="me-2"
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          <Button
            onClick={async () => {
              (await fetchNewOrders()) && fetchOrders(1, rowsPerPage, filters);
            }}
            className="me-2"
          >
            Fetch New Orders
          </Button>
          {/* <Button onClick={handleShow}>+ New Order</Button> */}
        </div>
      </div>

      {showFilters && (
        <Card className="mb-3">
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by product name"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
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
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button variant="primary" onClick={applyFilters}>
                Apply Filters
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

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
                <strong>Channel OID:</strong> {editOrder?.channel_order_id || "—"} <br />
                <strong>
                  Store OID:
                  <span style={{ color: "blue" }}> {editOrder?.store_order_id || "—"} </span>
                </strong>
                <br />
                <strong>Channel:</strong>{" "}
                {editOrder?.channel_account?.channel_account_name || "—"}
              </div>
            </div>
            <div className="col-lg-6" style={{ padding: 10, fontSize: 12 }}>
              {editOrder?.["product_name"]} <br />
              <b>
                <FaDollarSign size={12} /> ₹{editOrder?.["total_amount"]} ({editOrder?.["payment_method"]})
              </b>
              <br />
              QTY: {editOrder?.["quantity"]} pc <br />
              <BiCalendar size={12} /> Order Date:{" "}
              {editOrder?.["order_date"]?.split("T")[0]}{" "}
              {editOrder?.["order_date"]?.split("T")[1]?.split(":")[0]}:
              {editOrder?.["order_date"]?.split("T")[1]?.split(":")[1]}
            </div>
          </div>
          <div className='row'>
            <div className='col-lg-6' style={{ padding: 10, }}>
              {/* <BiPackage size={12} />  Weight: {editOrder?.['weight']} grams */}
            </div>
            <div className='col-lg-6' style={{ padding: 10, fontSize: 12 }}>
              {/* Dimensions: {editOrder?.['length']}cm X {editOrder?.['width']}cm X {editOrder?.['height']}cm */}
            </div>
          </div>

          <Form className="theme-form row" action='#'>
            <Form.Group className='col-lg-6'>
              <Form.Label className="col-form-label pt-0" >{"Customer Name"}</Form.Label>
              <Form.Control className="form-control" type="text" onChange={(e) => {
                let tempData = { ...editOrder }
                tempData['customer_name'] = e.target.value
                setEditOrder(tempData as Order);
              }} defaultValue={editOrder?.['customer_name']} placeholder="Enter Customer Name" />
            </Form.Group>
            <Form.Group className='col-lg-6'>
              <Form.Label className="col-form-label pt-0" >{"Customer Phone Number"}</Form.Label>
              <Form.Control className="form-control" type="number" onChange={(e) => {
                if (e.target.value.length > 9) {
                  let tempData = { ...editOrder }
                  tempData['customer_phone'] = e.target.value
                  setEditOrder(tempData as Order);
                }
              }} defaultValue={editOrder?.['customer_phone']} placeholder="Enter Customer Phone Number" />
            </Form.Group>
            <Form.Group className='col-lg-6'>
              <Form.Label className="col-form-label pt-0" >{"Customer Address"}</Form.Label>
              <Form.Control className="form-control" type="text" onChange={(e) => {
                let tempData = { ...editOrder }
                tempData['shipping_address'] = e.target.value
                setEditOrder(tempData as Order);
              }} defaultValue={editOrder?.['shipping_address']} placeholder="Enter Customer Address" />
            </Form.Group>
            <Form.Group className='col-lg-6'>
              <Form.Label className="col-form-label pt-0" >{"Customer Pin Code"}</Form.Label>
              <Form.Control className="form-control" type="number" onChange={(e) => {
                if (e.target.value.length == 6) {
                  let tempData = { ...editOrder }
                  tempData['shipping_pincode'] = Number(e.target.value)
                  setEditOrder(tempData as Order);

                  // CheckPinCode(e.target.value, (data) => {
                  //   if (data['Status'] == "Success") {
                  //     let tempData = { ...editOrder }
                  //     tempData['customer_pincode'] = e.target.value
                  //     tempData['customer_city'] = data['PostOffice'][0]['Block']
                  //     tempData['customer_state'] = data['PostOffice'][0]['State']
                  //     document.getElementById("pin_error").innerText = ""
                  //      setEditOrder(tempData as Order);
                  //     console.log(tempData);
                  //   } else {
                  //     document.getElementById("pin_error").innerText = "Error: " + data['Message']
                  //   }
                  // })
                }
              }} defaultValue={editOrder?.['shipping_pincode']} placeholder="Enter Pin Code" />
              <div id="pin_error" style={{ color: 'red' }}></div>
            </Form.Group>
            <Form.Group className='col-lg-6'>
              <Form.Label className="col-form-label pt-0" >{"Customer City"}</Form.Label>
              <Form.Control className="form-control" type="text" value={editOrder?.['shipping_city']} placeholder="Enter Customer City" disabled={true} />
            </Form.Group>
            <Form.Group className='col-lg-6'>
              <Form.Label className="col-form-label pt-0" >{"Customer State"}</Form.Label>
              <Form.Control className="form-control" type="text" value={editOrder?.['shipping_state']} placeholder="Enter Customer State" disabled={true} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{ color: "primary", }} className="m-r-15" onClick={handleEditSubmit} >{"Submit"}</Button>
          <Button style={{ color: "warning", }} className="m-r-15" onClick={handleClose} >{"Close"}</Button>


        </Modal.Footer>
      </Modal>


      <Modal show={showShipmentModal} onHide={handleShipmentClose} size='xl'>
        <Modal.Header>
          Select Shipment for {shipmentOrder?.order_id}
        </Modal.Header>
        <Modal.Body>
          <div className='row'>
            <div className="col-lg-3">
              <div>
                #{shipmentOrder?.order_id || "—"} <br />
                <strong>Channel OID:</strong> {shipmentOrder?.channel_order_id || "—"} <br />
                <strong>
                  Store OID:
                  <span style={{ color: "blue" }}> {shipmentOrder?.store_order_id || "—"} </span>
                </strong>
                <br />
                <strong>Channel:</strong>{" "}
                {shipmentOrder?.channel_account_name || "—"}
              </div>
            </div>
            <div className="col-lg-6" style={{ padding: 10, fontSize: 12 }}>
              {shipmentOrder?.["product_name"] || "-"} <br />
              <b>
                <FaDollarSign size={12} /> ₹{shipmentOrder?.["total_amount"]} ({shipmentOrder?.["payment_method"]})
              </b>
              <br />
              QTY: {shipmentOrder?.["quantity"]} pc <br />
              <BiCalendar size={12} /> Order Date:{" "}
              {shipmentOrder?.["order_date"]?.split("T")[0]}{" "}
              {shipmentOrder?.["order_date"]?.split("T")[1]?.split(":")[0]}:
              {shipmentOrder?.["order_date"]?.split("T")[1]?.split(":")[1]}
            </div>
            <div className='col-lg-3' style={{ padding: 10, fontSize: 12 }}>
              <div>
                {shipmentOrder?.customer_name || "—"} <br />
                <BsPhoneFill /> {shipmentOrder?.customer_phone || "—"}<br />
                {shipmentOrder?.customer_email && <MdEmail />}{" "}
                {(shipmentOrder?.customer_email || "") && (<br />)}
                <FaLocationPin /> {shipmentOrder?.shipping_address}, {shipmentOrder?.shipping_city},{" "}
                {shipmentOrder?.shipping_state}, {shipmentOrder?.shipping_country} - {shipmentOrder?.shipping_pincode}
              </div>
            </div>
          </div>
          {bestAddress != "" && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#e0f7fa", // Light teal background
                border: "2px solid #00bcd4", // Bright border
                borderRadius: 8,
                padding: "10px 16px",
                marginTop: 10,
                color: "#004d40", // Deep teal text
                fontWeight: "bold",
                fontSize: 15,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
              }}>
              <span style={{ fontSize: 14 }}><b>🏠 Best Address: </b>{bestAddress}</span><br />
            </div>)}
          {selectedWarehouse && (
            <div>
              <h5 style={{ margin: "16px 0", textAlign: 'center' }}>Available Warehouses</h5>
              <div className="row justify-content-center">
                {commonWarehouses.map((warehouse: any) => {
                  const isSelected = warehouse.warehouse_id === selectedWarehouse?.warehouseAddress?.warehouse_id;
                  return (
                    <div key={warehouse.warehouse_id} className="col-md-4 col-sm-6 mb-4">
                      <div
                        style={{
                          padding: "15px",
                          border: isSelected ? "2px solid #F5891E" : "1px solid #ddd",
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
                          shipmentOrder && handleChangeWarehouse(shipmentOrder, warehouse);
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
                          <strong style={{ fontSize: "16px" }}>{warehouse.warehouse_name}</strong>
                          <br />
                          📍 {warehouse.warehouse_address1}, {warehouse.warehouse_address2}, {warehouse.warehouse_city}, {warehouse.warehouse_state} - {warehouse.warehouse_pincode}
                          <br />
                          <small style={{ color: "#555" }}>
                            📦 <strong>Combo Stock:</strong> {warehouse.stock}
                            <br />
                            {isSelected && (
                              <>
                                🚚 <strong>Travel:</strong> {selectedWarehouse.distance} KM, {selectedWarehouse.duration}
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
                  name: 'Company Name',
                  selector: (row: any) => row.courier_name,
                  cell: (row: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12 }}>
                        <span style={{ fontSize: 14 }}><b>{row.courier_name}</b></span><br />
                        Calling: {row.call_before_delivery && "Available"}<br />
                        {/* Delivery Boy Contact: {row.delivery_boy_contact}<br /> */}
                        Chargeable Weight: {row.charge_weight} KG
                      </div>)
                  },
                  compact: true,
                  sortable: true
                },
                {
                  name: 'Performance',
                  selector: (row: any) => row.rating,
                  cell: (row: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12 }}>
                        Delivery: {row.delivery_performance}<br />
                        Pickup: {row.pickup_performance}<br />
                        RTO: {row.rto_performance}<br />
                        Tracking: {row.tracking_performance}<br />
                        <b>Overall: {row.rating}</b><br />
                      </div>)
                  },
                  compact: true,
                  sortable: true
                },
                {
                  name: 'Charges',
                  selector: (row: any) => row.total_amount,
                  cell: (row: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12, }}>
                        <u> <b style={{ textTransform: 'uppercase' }}>ZONE {row.zone}</b></u><br />
                        {row.cod_charges > 0 && row.cod_charges != 0 ? "COD: ₹" + row.cod_charges : ""}<br />
                        Freight: ₹{row.freight_charge}<br />

                        {parseFloat(row.other_charges) !== 0 && (
                          <>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip-top">
                                  18% GST on ₹{row.freight_charge + row.cod_charges} = {((row.freight_charge + row.cod_charges) * 0.18).toFixed(2)}<br />
                                  {(row.other_charges - ((row.freight_charge + row.cod_charges) * 0.18)) > 0 && `LM Surcharge ₹${(row.other_charges - ((row.freight_charge + row.cod_charges) * 0.18)).toFixed(2)}`}<br />
                                </Tooltip>
                              }
                            >
                              <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>
                                Other
                              </span>
                            </OverlayTrigger>: ₹{row.other_charges}
                            <br />
                          </>
                        )}
                        <span style={{ fontWeight: 800, textDecoration: 'underline' }}>Total: ₹{row.total_amount}</span><br /><br />
                        <i>RTO: ₹{row.rto_charges}</i><br />
                      </div>)
                  },
                  compact: true,
                  sortable: true
                },
                {
                  name: 'Estimated Delivery',
                  selector: (row: any) => row.etd_hours,
                  cell: (row: any) => {
                    return (
                      <div style={{ padding: 10, fontSize: 12, }}>
                        Date: {row.etd}<br />
                        Days: {row.estimated_delivery_days}<br />
                        Hours: {row.etd_hours}<br />

                      </div>)
                  },
                  compact: true,
                  sortable: true
                },
                {
                  name: 'More',
                  cell: (row: any) => {
                    return (
                      <div style={{ justifyContent: "center", alignItems: "center", display: "flex", flexDirection: 'column', padding: 10, fontSize: 12, }}>
                        <Button variant="primary" onClick={() => handleBookShipment(row._id)} >{"Book Shipment"}</Button>
                        < Button variant="danger" size="sm" style={{ margin: 5 }} onClick={() => shipmentOrder?._id && handleSelectShipment(shipmentOrder?._id, row)} > {"Select"}</Button >
                      </div>
                    )
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
          <Button style={{ color: "warning" }} className="m-r-15" onClick={handleShipmentClose} >{"Close"}</Button>


        </Modal.Footer>
      </Modal>
           <Button onClick={handlePrint}>Print it</Button>
      <div style={{ display: 'block' }}>
        <div ref={labelRef}>
          <ShippingLabel labelData={labelData} />
        </div>
      </div>

    </div >
  );
};

export { Orders };

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllOrders, createOrder, updateOrder } from "../../APIs/order";
import { fetchNewOrders } from "../../APIs/fetchOrder";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/dash";
import { BsClockFill, BsPhoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaLocationPin } from "react-icons/fa6";
import { FaDollarSign, FaTruck } from "react-icons/fa";
import { BiCalendar, BiPackage } from "react-icons/bi";

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
  total_amount: number;
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
const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [showModal, setShowModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [shipmentOrder, setShipmentOrder] = useState<Order | null>(null);
  const [users, setUsers] = useState<User[]>([]);
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

  useEffect(() => {
    fetchOrders(currentPage, rowsPerPage, filters);
    calculateTableHeight();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users"); // Replace with your user API
      const data = await res.json();
      setUsers(data);
      console.log("Users fetched successfully", users);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditOrder(null);
  };

  const handleShipmentClose = () => {
    setShowShipmentModal(false);
    setShipmentOrder(null);
  };

  const handleShipment = (row: Order) => {
    setShipmentOrder(row);
    setShowShipmentModal(true);
  };
  const handleShow = () => setShowModal(true);

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

  const handleToggleStatus = async (order: Order) => {
    const newStatus = order.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this order as ${newStatus}?`
      )
    ) {
      try {
        await updateOrder(order._id, { ...order, status: newStatus });
        fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      name: { value: string };
    };

    const formData = {
      name: form.name.value.trim(),
    };

    try {
      if (editOrder) {
        await updateOrder(editOrder._id, formData);
      } else {
        await createOrder(formData);
      }
      fetchOrders(currentPage, rowsPerPage, filters); // Refresh orders
      handleClose();
    } catch (error) {
      console.error("Error saving order", error);
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
          {row.channel_account?.channel_account_name || "—"}
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
            {row.product_name}{" "}
          </span>
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
          {row?.recomended_courier_id && (
            <>
              <strong>Recomended Courier:</strong>{" "}
              {row?.shipping_courier?.courier_name || "—"} <br />
            </>
          )}
          {row?.shipping_courier?.courier_name || "—"} <br />
          {row.awb_number ? (
            <>
              <FaTruck />{" "}
              <a
                href={row?.shipping_courier?.tracking_url?.replace(
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
            variant="success" // Changed to a more vibrant color for "Ship Now"
            size="lg"
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
          <Button onClick={handleShow}>+ New Order</Button>
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
                {shipmentOrder?.channel_account?.channel_account_name || "—"}
              </div>
            </div>
            <div className="col-lg-6" style={{ padding: 10, fontSize: 12 }}>
              {shipmentOrder?.["product_name"]} <br />
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
          {/* <DataTable
            style={{}}
            // progressPending={filteredData.length == 0}
            fixedHeader={true}
            data={shipmentOrder?.['companies']}
            highlightOnHover
            // conditionalRowStyles={conditionalRowStyles}
            columns={[
              {
                name: 'Company Name',
                selector: row => courier_name,
                cell: (row, index, column, id) => {
            console.log(row)
                  return (
          <div style={{ padding: 10, fontSize: 12 }}>
            <span style={{ fontSize: 14 }}><b>{courier_company_id}. {courier_name}</b></span><br />
            Calling: {call_before_delivery}<br />
            Delivery Boy Contact: {delivery_boy_contact}<br />
            Chargeable Weight: {charge_weight} KG
          </div>)
                },
          compact: true,
          sortable: true
              },
          {
            name: 'Performance',
                selector: row => rating,
                cell: (row, index, column, id) => {
                  return (
          <div style={{ padding: 10, fontSize: 12 }}>
            Delivery: {delivery_performance}<br />
            Pickup: {pickup_performance}<br />
            RTO: {rto_performance}<br />
            Tracking: {tracking_performance}<br />
            <b>Overall: {rating}</b><br />
          </div>)
                },
          compact: true,
          sortable: true
              },
          {
            name: 'Charges',
                selector: row => rate,
                cell: (row, index, column, id) => {
                  return (
          <div style={{ padding: 10, fontSize: 12, }}>
            <u> <b style={{ textTransform: 'uppercase' }}>ZONE {zone[2]}</b></u><br />
            {cod == 1 && cod_charges != 0 ? "COD: ₹" + cod_charges : ""}<br />
            Freight: ₹{freight_charge}<br />
            {other_charges != 0 ? "Other: ₹" + other_charges : ""}<br />
            <b>Total: ₹{rate}</b><br />
            RTO: ₹{rto_charges}<br />
          </div>)
                },
          compact: true,
          sortable: true
              },
          {
            name: 'Estimated Delivery',
                selector: row => etd_hours,
                cell: (row, index, column, id) => {
                  return (
          <div style={{ padding: 10, fontSize: 12, }}>
            Date: {etd}<br />
            Days: {estimated_delivery_days}<br />
            Hours: {etd_hours}<br />

          </div>)
                },
          compact: true,
          sortable: true
              },
          {
            name: 'More',
                selector: row => more,
                cell: (row, index, column, id) => {
                  return (
          <>
            <Btn attrBtn={{
              color: "primary", size: "xs", className: "m-r-15", onClick: () => handleBookShipment(shipment, shipment_courier_id']) }} >{"Book Shipment"}</Btn>
                < Btn attrBtn = {{ color: "danger", size: "xs", className: "m-r-15", onClick: () => handleSelectShipment(row) }} > { "Select"}</Btn>
        </>
        )
                },
        compact: true,
        center: true,
              },
            ]}
            // striped={true}
        center={true}
          /> */}
      </Modal.Body>
      <Modal.Footer>
        {/* <Btn attrBtn={{ color: "primary", className: "m-r-15", onClick: () => handleAddSubmit() }} >{"Submit"}</Btn> */}
        <Button style={{ color: "warning" }} className="m-r-15" onClick={handleShipmentClose} >{"Close"}</Button>


      </Modal.Footer>
    </Modal>
    </div >
  );
};

export { Orders };

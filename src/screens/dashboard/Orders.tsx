import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Card } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllOrders, createOrder, updateOrder } from "../../APIs/order";
import { fetchNewOrders } from "../../APIs/fetchOrder";
import { appAxios } from "../../axios/appAxios";
import { channelAccounts_url } from "../../URLs/dash";

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
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
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
  console.log(users);

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
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingOrder(null);
  };

  const handleShow = () => setShowModal(true);

  const handleEdit = (order: Order) => {
    setEditingOrder(order);
    setShowModal(true);
  };

  const handleToggleStatus = async (order: Order) => {
    const newStatus = order.status === "active" ? "inactive" : "active";
    if (
      window.confirm(
        `Are you sure you want to mark this order as ${newStatus}?`
      )
    ) {
      try {
        await updateOrder(order._id, { status: newStatus });
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
      if (editingOrder) {
        await updateOrder(editingOrder._id, formData);
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
          <strong>Order ID:</strong> {row.order_id || "—"} <br />
          <strong>Channel Order ID:</strong> {row.channel_order_id || "—"}{" "}
          <br />
          <strong>
            Store Order ID:
            <span style={{ color: "blue" }}> {row.store_order_id || "—"} </span>
          </strong>
          <br />
          <strong>Channel Account:</strong>{" "}
          {row.channel_account?.channel_account_name || "—"}
        </div>
      ),
      wrap: true,
      width: "250px",
      style: { margin: "10px 0" },
    },
    {
      name: "Product Details",
      cell: (row: Order) => (
        <div>
          <strong>Product:</strong>{" "}
          <span style={{ textDecoration: "underline" }}>
            {row.product_name}{" "}
          </span>
          <br />
          <strong>Quantity:</strong> {row.quantity || "—"} pcs <br />
          <strong>Amount:</strong> ₹{row.total_amount || "—"} <br />
          <strong>Payment:</strong> {row.payment_method || "—"}
        </div>
      ),
      wrap: true,
      width: "225px",
      style: { margin: "10px 0" },
    },
    {
      name: "Shipping Address",
      cell: (row: any) => (
        <div>
          <strong>Name:</strong> {row.customer_name || "—"} <br />
          <strong>Phone:</strong> {row.customer_phone || "—"} <br />
          {row.customer_email && <strong>Email:</strong>}{" "}
          {row.customer_email || ""}
          <strong>Address:</strong> {row.shipping_address}, {row.shipping_city},{" "}
          {row.shipping_state}, {row.shipping_country} - {row.shipping_pincode}
        </div>
      ),
      wrap: true,
      width: "225px",
      style: { margin: "10px 0" },
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
          <strong>Shipping Courier:</strong>{" "}
          {row?.shipping_courier?.courier_name || "—"} <br />
          {row.awb_number ? (
            <>
              <strong>AWB:</strong>{" "}
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
          <strong>Status:</strong>{" "}
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
      style: { margin: "10px 0" },
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
      style: { margin: "10px 0" },
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
            variant={
              row.status === "active" ? "outline-danger" : "outline-success"
            }
            size="sm"
            onClick={() => handleToggleStatus(row)}
          >
            {row.status === "active" ? "Deactivate" : "Activate"}
          </Button>
        </>
      ),
      width: "125px",
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

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingOrder ? "Edit Order" : "Create Order"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Order Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingOrder?.name || ""}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingOrder ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export { Orders };

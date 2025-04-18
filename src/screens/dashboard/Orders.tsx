import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Badge } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllOrders, createOrder, updateOrder } from "../../APIs/order";
import { fetchNewOrders } from "../../APIs/fetchOrder";

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
  payment_method: string;
  awb_number: string;
  channel_account: { channel_account_name: string };
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState<number>(0); // Total number of orders
  const [currentPage, setCurrentPage] = useState<number>(1); // Current page
  const [rowsPerPage, setRowsPerPage] = useState<number>(10); // Rows per page
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tableHeight, setTableHeight] = useState<string>("400px"); // Default height

  useEffect(() => {
    fetchOrders(currentPage, rowsPerPage);
    calculateTableHeight(); // Calculate height on initial load
    fetchUsers();
  }, [currentPage, rowsPerPage]);

  const fetchOrders = async (page: number, limit: number) => {
    try {
      const response = await getAllOrders(page, limit); // Pass page and limit to API
      setOrders(response.orders); // Assuming API returns { orders, total }
      setTotalOrders(response.total); // Set total number of orders
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  const calculateTableHeight = () => {
    const headerHeight = 200; // Approximate height of the header and other elements
    const availableHeight = window.innerHeight - headerHeight;
    setTableHeight(`${availableHeight}px`);
  };

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
    if (window.confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      try {
        await updateOrder(order._id, { status: newStatus });
        fetchOrders(currentPage, rowsPerPage); // Refresh orders
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
      fetchOrders(currentPage, rowsPerPage); // Refresh orders
      handleClose();
    } catch (error) {
      console.error("Error saving order", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page); // Update current page
  };

  const handleRowsPerPageChange = (newRowsPerPage: number, page: number) => {
    setRowsPerPage(newRowsPerPage); // Update rows per page
    setCurrentPage(page); // Reset to the current page
  };

  const columns = [
    {
      name: "Order Details",
      cell: (row: Order) => (
        <div>
          <strong>Order ID:</strong> {row.order_id || "—"} <br />
          <strong>Channel Order ID:</strong> {row.channel_order_id || "—"} <br />
          <strong>Store Order ID:<span style={{ color: 'blue' }}> {row.store_order_id || "—"} </span></strong><br />
          <strong>Channel Account:</strong> {row.channel_account?.channel_account_name || "—"}
        </div>
      ),
      wrap: true,
      width: "250px",
      style: { margin: '10px 0' }
    },
    {
      name: "Product Details",
      cell: (row: Order) => (
        <div>
          <strong>Product:</strong>{" "}
          <span style={{ textDecoration: "underline" }}>{row.product_name} </span>
          <br />
          <strong>Quantity:</strong> {row.quantity || "—"} pcs <br />
          <strong>Amount:</strong> ₹{row.total_amount || "—"} <br />
          <strong>Payment:</strong> {row.payment_method || "—"}
        </div>
      ),
      wrap: true,
      width: "225px",
      style: { margin: '10px 0' }
    },
    {
      name: "Shipping Address",
      cell: (row: Order) => (
        <div>
          <strong>Name:</strong> {row.customer_name || "—"} <br />
          <strong>Phone:</strong> {row.customer_phone || "—"} <br />
          {row.customer_email && <strong>Email:</strong>} {row.customer_email || ""}
          <strong>Address:</strong> {row.shipping_address}, {row.shipping_city}, {row.shipping_state},{" "}
          {row.shipping_country} - {row.shipping_pincode}
        </div>
      ),
      wrap: true,
      width: "225px",
      style: { margin: '10px 0' }
    },
    {
      name: "Courier Details",
      cell: (row: Order) => (
        <div style={{ fontSize: "13px", lineHeight: "1.5" }}>
          {row?.recomended_courier_id && (<><strong>Recomended Courier:</strong> {row?.shipping_courier?.courier_name || "—"} <br /></>)}
          <strong>Shipping Courier:</strong> {row?.shipping_courier?.courier_name || "—"} <br />
          {row.awb_number ? (
            <>
              <strong>AWB:</strong>{" "}
              <a
                href={row?.shipping_courier?.tracking_url?.replace("{{awb_number}}", row.awb_number)}
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
      style: { margin: '10px 0' },
    },
    {
      name: "Issues",
      cell: (row: Order) => (
        <div>
          {row.issues && row.issues.length > 0 ? (
            <ul style={{ paddingLeft: "15px", margin: 0 }}>
              {row.issues.map((issue, index) => (
                <li key={index} style={{ fontSize: "13px", color: "#d9534f" }}>
                  {issue.message || issue} {/* Display the issue message */}
                </li>
              ))}
            </ul>
          ) : (
            <span style={{ fontSize: "13px", color: "#5cb85c" }}>No Issues</span>
          )}
        </div>
      ),
      sortable: false,
      width: "150px",
      style: { margin: '10px 0' }
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
      style: { margin: '10px 0' }
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
            variant={row.status === "active" ? "outline-danger" : "outline-success"}
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
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "customer_name"),
      style: {
        backgroundColor: "#ffcccc", // Light red for missing customer name
        color: "black",
      },
    },
    {
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "customer_phone"),
      style: {
        backgroundColor: "#ffe6cc", // Light orange for invalid phone number
        color: "black",
      },
    },
    {
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "customer_email"),
      style: {
        backgroundColor: "#ffffcc", // Light yellow for invalid email
        color: "black",
      },
    },
    {
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "shipping_address"),
      style: {
        backgroundColor: "#e6ffcc", // Light green for missing shipping address
        color: "black",
      },
    },
    {
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "customer_pincode"),
      style: {
        backgroundColor: "#cce6ff", // Light blue for invalid pincode
        color: "black",
      },
    },
    {
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "high_volume"),
      style: {
        backgroundColor: "#d9ccff", // Light purple for high volume orders
        color: "black",
      },
    },
    {
      when: (row: Order) =>
        row.issues?.some((issue) => issue.field === "duplicate_order"),
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
          <Button onClick={async () => { (await fetchNewOrders()) && fetchOrders(1, rowsPerPage) }} className="me-2">Fetch New Orders</Button>
          <Button onClick={handleShow}>+ New Order</Button>
        </div>
      </div>

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
        // className="table-responsive"
        noDataComponent="No orders found"
        responsive
        striped
        persistTableHead
        progressPending={orders.length === 0}
        conditionalRowStyles={conditionalRowStyles} // Apply conditional row styles
      />
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{editingOrder ? "Edit Order" : "Create Order"}</Modal.Title>
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
    </div >
  );
};

export { Orders };
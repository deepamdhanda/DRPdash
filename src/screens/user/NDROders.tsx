import moment from "moment";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import DataTable from "react-data-table-component";
import { fetchNDROrders } from "../../APIs/user/fetchNdrOrders";

// TypeScript interfaces
interface OrderStatus {
  status: string;
}

interface UserChannel {
  _id: string;
}

interface Order {
  _id: string;
  order_id: number;
  channel_order_id: string;
  store_order_id: string;
  channel_id: string;
  order_date: string;
  order_status: string;
  customer_name: string;
  customer_email?: string;
  customer_phone: number;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  product_name: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus[];
  user_channel: UserChannel[];
  latest_status: OrderStatus;
}

// API Response interface
interface FetchOrdersResponse {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const NDROrders: React.FC = () => {
  // State management
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<string>("");

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [pagination, setPagination] = useState({
    limit: 10,
    page: 1,
    total: 0,
    totalPages: 0,
  });

  const [dateRange, setDateRange] = useState({
    from: moment().startOf("month"),
    to: moment(),
  });
  if (false) {
    setDateRange({
      from: moment().startOf("month"),
      to: moment(),
    });
  }
  // Refs to track initial load and prevent multiple calls
  const initialLoadRef = useRef(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Mock channels data
  const channels = useMemo(
    () => [
      { id: "6823c47b603122e88591943f", name: "Shopify Store 1" },
      { id: "67ee929eacedcc85796d1310", name: "Amazon Store" },
      { id: "67f04ea1d48b8e499859c6dd", name: "Flipkart Store" },
      { id: "67f04ea6d48b8e499859c6e2", name: "Website Direct" },
    ],
    []
  );

  // Action handlers (unchanged)
  const handleReattempt = async (order: Order) => {
    setActionLoading(`reattempt-${order._id}`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === order._id
            ? {
              ...o,
              latest_status: { status: "processing" },
              order_status: "processing",
            }
            : o
        )
      );
      alert(`Reattempt initiated for Order #${order.order_id}`);
    } catch (err) {
      alert("Failed to reattempt order");
    } finally {
      setActionLoading("");
    }
  };

  const handleReschedule = async (order: Order) => {
    setActionLoading(`reschedule-${order._id}`);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setOrders((prevOrders) =>
        prevOrders.map((o) =>
          o._id === order._id
            ? {
              ...o,
              latest_status: { status: "rescheduled" },
              order_status: "rescheduled",
            }
            : o
        )
      );
      alert(`Order #${order.order_id} has been rescheduled`);
    } catch (err) {
      alert("Failed to reschedule order");
    } finally {
      setActionLoading("");
    }
  };

  const handleCancel = async (order: Order) => {
    if (
      window.confirm(
        `Are you sure you want to cancel Order #${order.order_id}?`
      )
    ) {
      setActionLoading(`cancel-${order._id}`);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setOrders((prevOrders) =>
          prevOrders.map((o) =>
            o._id === order._id
              ? {
                ...o,
                latest_status: { status: "cancelled" },
                order_status: "cancelled",
              }
              : o
          )
        );
        alert(`Order #${order.order_id} has been cancelled`);
      } catch (err) {
        alert("Failed to cancel order");
      } finally {
        setActionLoading("");
      }
    }
  };

  // Optimized load orders function with useCallback to prevent recreation
  const loadOrders = useCallback(
    async (
      page: number = 1,
      limit: number = 10,
      search: string = "",
      channel: string = ""
    ) => {
      setLoading(true);
      setError("");

      try {
        const response: FetchOrdersResponse = await fetchNDROrders({
          from: dateRange.from.toString(),
          to: dateRange.to.toString(),
          page,
          limit,
          search,
          channel_id: channel,
        });

        setOrders(response.data);
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load orders");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [dateRange.from, dateRange.to]
  ); // Only depend on date range

  // Handle pagination change from DataTable
  const handlePageChange = useCallback(
    (page: number) => {
      loadOrders(page, pagination.limit, searchTerm, selectedChannel);
    },
    [loadOrders, pagination.limit, searchTerm, selectedChannel]
  );

  // Handle rows per page change from DataTable
  const handlePerRowsChange = useCallback(
    (newPerPage: number, page: number) => {
      loadOrders(page, newPerPage, searchTerm, selectedChannel);
    },
    [loadOrders, searchTerm, selectedChannel]
  );

  // Initial load effect - only runs once
  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      loadOrders(1, 10, "", "");
    }
  }, []); // Empty dependency array for initial load only

  // Debounced search effect - optimized to prevent multiple calls
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only trigger search if component has loaded initially
    if (initialLoadRef.current) {
      searchTimeoutRef.current = setTimeout(() => {
        loadOrders(1, pagination.limit, searchTerm, selectedChannel);
      }, 500);
    }

    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, loadOrders, pagination.limit, selectedChannel]);

  // Channel filter effect - optimized
  useEffect(() => {
    if (initialLoadRef.current) {
      loadOrders(1, pagination.limit, searchTerm, selectedChannel);
    }
  }, [selectedChannel, loadOrders, pagination.limit, searchTerm]);

  // Date range effect - optimized
  useEffect(() => {
    if (initialLoadRef.current) {
      loadOrders(1, pagination.limit, searchTerm, selectedChannel);
    }
  }, [
    dateRange.from,
    dateRange.to,
    loadOrders,
    pagination.limit,
    searchTerm,
    selectedChannel,
  ]);

  // Utility functions (unchanged)
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "badge bg-success";
      case "shipped":
        return "badge bg-primary";
      case "processing":
        return "badge bg-warning text-dark";
      case "open":
      case "undelivered":
        return "badge bg-info";
      case "cancelled":
        return "badge bg-danger";
      case "rescheduled":
        return "badge bg-secondary";
      default:
        return "badge bg-secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getChannelName = (channelId: string) => {
    const channel = channels.find((c) => c.id === channelId);
    return channel ? channel.name : "Unknown";
  };

  const isActionDisabled = (order: Order, action: string) => {
    const status = order.latest_status.status.toLowerCase();
    switch (action) {
      case "reattempt":
        return ["delivered", "cancelled"].includes(status);
      case "reschedule":
        return ["delivered", "cancelled"].includes(status);
      case "cancel":
        return ["delivered", "cancelled"].includes(status);
      default:
        return false;
    }
  };

  // DataTable columns configuration (unchanged)
  const columns = [
    {
      name: "Order ID",
      selector: (row: Order) => row.order_id,
      sortable: true,
      cell: (row: Order) => (
        <div>
          <div className="fw-bold text-primary">#{row.order_id}</div>
          <small className="text-muted">{row.channel_order_id}</small>
        </div>
      ),
      width: "150px",
    },
    {
      name: "Customer",
      selector: (row: Order) => row.customer_name,
      sortable: true,
      cell: (row: Order) => (
        <div>
          <div className="fw-bold">{row.customer_name}</div>
          <small className="text-muted">{row.customer_phone}</small>
          <br />
          <small className="text-muted">{row.customer_email}</small>
        </div>
      ),
      width: "200px",
    },
    {
      name: "Product",
      selector: (row: Order) => row.product_name,
      sortable: true,
      cell: (row: Order) => (
        <div>
          <div className="fw-medium">{row.product_name}</div>
          <small className="text-muted">Qty: {row.quantity}</small>
        </div>
      ),
      width: "180px",
    },
    {
      name: "Amount",
      selector: (row: Order) => row.total_amount,
      sortable: true,
      cell: (row: Order) => (
        <span className="fw-bold text-success">
          {formatCurrency(row.total_amount)}
        </span>
      ),
      width: "130px",
    },
    {
      name: "Status",
      selector: (row: Order) => row.latest_status.status,
      sortable: true,
      cell: (row: Order) => (
        <span className={getStatusBadgeClass(row.latest_status.status)}>
          {row.latest_status.status}
        </span>
      ),
      width: "120px",
    },
    {
      name: "Channel",
      selector: (row: Order) => getChannelName(row.channel_id),
      sortable: true,
      cell: (row: Order) => (
        <span className="badge bg-light text-dark border">
          {getChannelName(row.channel_id)}
        </span>
      ),
      width: "150px",
    },
    {
      name: "Created",
      selector: (row: Order) => row.createdAt,
      sortable: true,
      cell: (row: Order) => (
        <span className="text-muted small">{formatDate(row.createdAt)}</span>
      ),
      width: "160px",
    },
    {
      name: "Shipping",
      selector: (row: Order) => `${row.shipping_city}, ${row.shipping_state}`,
      sortable: true,
      cell: (row: Order) => (
        <div>
          <i className="fas fa-map-marker-alt text-muted me-1"></i>
          <span>
            {row.shipping_city}, {row.shipping_state}
          </span>
        </div>
      ),
      width: "180px",
    },
    {
      name: "Payment",
      selector: (row: Order) => row.payment_method,
      sortable: true,
      cell: (row: Order) => (
        <span className="small text-muted">
          <i className="fas fa-credit-card me-1"></i>
          {row.payment_method}
        </span>
      ),
      width: "180px",
    },
    {
      name: "Actions",
      cell: (row: Order) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => handleReattempt(row)}
            disabled={
              isActionDisabled(row, "reattempt") ||
              actionLoading === `reattempt-${row._id}`
            }
            title={
              isActionDisabled(row, "reattempt")
                ? "Cannot reattempt this order"
                : "Reattempt delivery"
            }
          >
            {actionLoading === `reattempt-${row._id}` ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-redo fa-xs me-1"></i>
                Retry
              </>
            )}
          </button>

          <button
            className="btn btn-sm btn-outline-warning"
            onClick={() => handleReschedule(row)}
            disabled={
              isActionDisabled(row, "reschedule") ||
              actionLoading === `reschedule-${row._id}`
            }
            title={
              isActionDisabled(row, "reschedule")
                ? "Cannot reschedule this order"
                : "Reschedule delivery"
            }
          >
            {actionLoading === `reschedule-${row._id}` ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-calendar-alt fa-xs me-1"></i>
                Reschedule
              </>
            )}
          </button>

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => handleCancel(row)}
            disabled={
              isActionDisabled(row, "cancel") ||
              actionLoading === `cancel-${row._id}`
            }
            title={
              isActionDisabled(row, "cancel")
                ? "Cannot cancel this order"
                : "Cancel order"
            }
          >
            {actionLoading === `cancel-${row._id}` ? (
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <>
                <i className="fas fa-times fa-xs me-1"></i>
                Cancel
              </>
            )}
          </button>
        </div>
      ),
      width: "280px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];

  // Custom styles for DataTable (unchanged)
  const customStyles = {
    header: {
      style: {
        minHeight: "56px",
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#f8f9fa",
        borderBottom: "1px solid #dee2e6",
        minHeight: "50px",
      },
    },
    headCells: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        color: "#495057",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    rows: {
      style: {
        minHeight: "70px",
        "&:hover": {
          backgroundColor: "#f8f9fa",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        fontSize: "14px",
      },
    },
    pagination: {
      style: {
        borderTop: "1px solid #dee2e6",
        backgroundColor: "#ffffff",
      },
    },
  };

  // Custom loading component
  const LoadingComponent = () => (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-3" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted">Loading orders...</p>
    </div>
  );

  // Custom no data component
  const NoDataComponent = () => (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
      <h5 className="text-muted">No orders found</h5>
      <p className="text-muted">Try adjusting your search or filter criteria</p>
    </div>
  );

  return (
    <>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />

      {/* FontAwesome */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      <div
        className="container-fluid py-4"
        style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}
      >
        <div className="container-xxl">
          {/* Header */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-primary text-white rounded-circle p-3 me-3">
                  <i className="fas fa-shopping-cart fa-lg"></i>
                </div>
                <div>
                  <h1 className="display-6 fw-bold text-dark mb-1">
                    NDR Order Management
                  </h1>
                  <p className="text-muted mb-0">
                    Manage and track all your orders across different channels
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card shadow-sm mb-4 border-0">
            <div className="card-header bg-white border-bottom">
              <h5 className="card-title mb-0">
                <i className="fas fa-filter me-2"></i>
                Filters
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* Search */}
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-search text-muted"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Order ID, Customer, Product, Email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setSearchTerm("")}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Channel Filter */}
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="fas fa-store text-muted"></i>
                    </span>
                    <select
                      className="form-select"
                      value={selectedChannel}
                      onChange={(e) => setSelectedChannel(e.target.value)}
                    >
                      <option value="">All Channels</option>
                      {channels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {/* Data Table */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">
                  <i className="fas fa-table me-2"></i>
                  Orders ({pagination.total} total, showing {orders.length} on
                  page {pagination.page})
                </h5>
                <div className="d-flex align-items-center text-muted small">
                  <i className="fas fa-info-circle me-1"></i>
                  Click column headers to sort
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              <DataTable
                columns={columns}
                data={orders}
                pagination
                paginationServer
                paginationTotalRows={pagination.total}
                paginationDefaultPage={pagination.page}
                paginationPerPage={pagination.limit}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                progressPending={loading}
                progressComponent={<LoadingComponent />}
                noDataComponent={<NoDataComponent />}
                customStyles={customStyles}
                striped
                responsive
                highlightOnHover
                pointerOnHover
                dense={false}
                fixedHeader
                fixedHeaderScrollHeight="600px"
                selectableRows={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bootstrap JS */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/js/bootstrap.bundle.min.js"></script>

      <style>{` 
        .card {
          border-radius: 12px;
        }
        .input-group-text {
          border-color: #dee2e6;
        }
        .badge {
          font-size: 0.75em;
          font-weight: 500;
        }
        .text-primary {
          color: #0d6efd !important;
        }
        .bg-primary {
          background-color: #0d6efd !important;
        }
        .btn-sm {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
        .gap-1 {
          gap: 0.25rem;
        }
      `}</style>
    </>
  );
};

export { NDROrders };

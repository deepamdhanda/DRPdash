import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Row, Col, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllOrders, getAllFilters } from "../../APIs/warehouse/order";
import { BsClockFill, BsPhoneFill } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { FaLocationPin } from "react-icons/fa6";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { FaTruck } from "react-icons/fa";


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
  product_sku: any;
  name: string;
  payment_method: string;
  pack_details: {
    length: number;
    breadth: number;
    height: number;
  };
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
  const [tableHeight, setTableHeight] = useState<string>("400px");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Filter states
  const [filters, setFilters] = useState<FilterParams>({});
  const [productName, setProductName] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [channelAccountId, setChannelAccountId] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [allStatus, setAllStatus] = useState<any[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>("")
  useEffect(() => {
    setIsLoading(false);
    fetchOrders(currentPage, rowsPerPage, filters);
    calculateTableHeight();
  }, [currentPage, rowsPerPage]);
  useEffect(() => {
    innitialFetch()
  }, [])
  const innitialFetch = async () => {
    const allFiltersData = await getAllFilters()
    setAllStatus(allFiltersData.statuses)
  }

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
      }, "/flagged");

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
    if (selectedStatuses) newFilters.selectedStatuses = selectedStatuses
    if (searchQuery) newFilters.searchQuery = searchQuery

    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when applying filters
    fetchOrders(1, rowsPerPage, newFilters);
  };

  const resetFilters = () => {
    setSearchQuery("")
    setProductName("");
    setStartDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    setEndDate(new Date());
    setChannelAccountId("");
    setFilters({});
    setCurrentPage(1);
    setSelectedStatuses([]);
    setShowFilters(false)
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







  const handleSchedulePickup = async (order: Order) => {
    if (order) { }
  }

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
          <strong>Pack:</strong> {`${row.pack_details?.length}x${row.pack_details?.breadth}x${row.pack_details?.height} cm`} <br />

        </div>
      ),
      wrap: true,
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
      cell: (row: any) => {
        const sortedStatus = row.status
          ? [...row.status].sort((a: any, b: any) => new Date(b.status_date).getTime() - new Date(a.status_date).getTime())
          : [];

        const latestStatus = sortedStatus?.[0]?.status?.replaceAll("_", " ") || "—";
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
                  href={row?.tracking_url?.replace("{{awb_number}}", row.awb_number)}
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
        const latestStatus = row.status?.length
          ? row.status.sort((a: any, b: any) =>
            new Date(b.status_date).getTime() - new Date(a.status_date).getTime()
          )[0]
          : null;
        return (
          < div style={{ textAlign: "center" }} >
            < div style={{ display: "flex", flexDirection: "row", justifyContent: 'center', gap: "5px" }} >
              {/* Edit or Schedule Pickup */}
              {latestStatus &&
                (latestStatus.status === "AWB & Label Generated" ||
                  latestStatus.status.toLowerCase().includes("pickup")) && (<Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleSchedulePickup(row)}
                  >
                    🗓️ Schedule Pickup
                  </Button>)}

            </div>
          </div>
        );
      },
      width: "200px",
    }

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

        </div>
      </div>

      <Modal show={showFilters} onHide={() => setShowFilters(false)} size="lg" centered>
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
            <Row className="mb-4">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    multiple
                    value={selectedStatuses}
                    onChange={(e) =>
                      setSelectedStatuses(Array.from(e.target.selectedOptions, (opt) => opt.value))
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
          <Button variant="primary" onClick={() => {
            applyFilters();
            setShowFilters(false);
          }}>
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
      />


    </div >
  );
};

export { FlaggedOrders };

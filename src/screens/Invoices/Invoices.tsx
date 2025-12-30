import { useEffect, useState } from "react";
import {
  fetchInvoices,
  fetchInvoicePools,
  InvoicePool,
} from "../../APIs/user/invoices";
import moment from "moment";
import { toast } from "react-toastify";
import {
  Modal,
  Button,
  Table,
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Invoice } from "./invoiceTypes";

// Invoice Modal Component
const InvoiceModal = ({
  invoice,
  show,
  onHide,
}: {
  invoice?: Invoice;
  show: boolean;
  onHide: () => void;
}) => {
  if (!invoice) return null;

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    const invoiceElement = document.getElementById("invoice-content");
    const invoiceContent = invoiceElement ? invoiceElement.innerHTML : "";
    printWindow?.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice._id}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
            @media print { 
              .no-print { display: none; } 
              body { margin: 0; }
              .container-fluid { padding: 0; }
            }
          </style>
        </head>
        <body>${invoiceContent}</body>
      </html>
    `);

    printWindow?.document.close();
    printWindow?.print();
  };

  const gstType =
    invoice.gst_breakup?.type === "intra_state"
      ? "Intra-State"
      : invoice.gst_breakup?.type === "union_territory"
      ? "Union Territory"
      : "Inter-State";

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className="fas fa-file-invoice me-2"></i>
          Invoice Details
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-0">
        <div id="invoice-content" className="p-4">
          {/* Invoice Header */}
          <div className="text-center mb-4">
            <h1 className="display-4 text-primary mb-2">₹ INVOICE</h1>
            <p className="text-muted mb-1">Invoice #{invoice._id}</p>
            <Badge
              bg={
                invoice.gst_breakup?.type === "intra_state"
                  ? "info"
                  : invoice.gst_breakup?.type === "union_territory"
                  ? "success"
                  : "warning"
              }
            >
              {gstType} GST
            </Badge>
          </div>

          {/* Company Information */}
          <Row className="mb-4">
            <Col md={6}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h5 className="card-title text-primary">
                    <i className="fas fa-building me-2"></i>
                    From:
                  </h5>
                  <div>
                    <p className="fw-bold mb-1">
                      BABITA BEAUTY AND COSMETIC PRODUCTS
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                      KHEWAT NO 582, KHASRA NO 208/3
                    </p>
                    <p className="mb-1">
                      DARA KALAN, LAKSHMAN COLONY, THANESAR, Kurukshetra,
                      Haryana
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-envelope me-1 text-muted"></i>
                      hello@orderzup.com
                    </p>

                    <p className="mb-0">
                      <i className="fas fa-file-invoice me-1 text-muted"></i>
                      <span className="fw-semibold">GSTIN:</span>{" "}
                      06EFZPB1531K1Z8
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 bg-light">
                <Card.Body>
                  <h5 className="card-title text-primary">
                    <i className="fas fa-user-tie me-2"></i>
                    To:
                  </h5>
                  <div>
                    <p className="fw-bold mb-2">{invoice.pool_name}</p>
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                      <span className="fw-semibold">State:</span>{" "}
                      {invoice.party_state || "N/A"}
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-file-invoice me-1 text-muted"></i>
                      <span className="fw-semibold">GSTIN:</span>{" "}
                      {invoice.gstin || "Not Available"}
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-id-card me-1 text-muted"></i>
                      <span className="fw-semibold">Pool Name:</span>{" "}
                      {invoice.pool_name}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Period and Service Information */}
          <Card className="bg-info bg-opacity-10 border-info mb-4">
            <Card.Body>
              <Row>
                <Col md={3}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-calendar-alt me-1"></i>
                    Invoice Date
                  </p>
                  <p className="fw-semibold mb-0">
                    {moment(invoice.createdAt).format("DD MMM, YYYY")}
                  </p>
                </Col>
                <Col md={3}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-calendar-check me-1"></i>
                    Period Start
                  </p>
                  <p className="fw-semibold mb-0">
                    {moment(invoice.period_start).format("DD MMM, YYYY")}
                  </p>
                </Col>
                <Col md={3}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-calendar-times me-1"></i>
                    Period End
                  </p>
                  <p className="fw-semibold mb-0">
                    {moment(invoice.period_end).format("DD MMM, YYYY")}
                  </p>
                </Col>
                <Col md={3}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-truck me-1"></i>
                    Service Type
                  </p>
                  <p className="fw-semibold mb-0">
                    {invoice.service_name || "Courier"}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Service Description */}
          {invoice.service_description && (
            <Card className="mb-4 border-primary">
              <Card.Body className="bg-light">
                <h6 className="text-primary mb-2">
                  <i className="fas fa-info-circle me-2"></i>
                  Service Description
                </h6>
                <p className="mb-0 text-muted">{invoice.service_description}</p>
              </Card.Body>
            </Card>
          )}

          {/* Transaction Summary */}
          {invoice.transactions && invoice.transactions.length > 0 && (
            <Card className="mb-4">
              <Card.Header className="bg-secondary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-receipt me-2"></i>
                  Transaction Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="text-center">
                  <Col md={4}>
                    <div className="p-3 bg-light rounded">
                      <i className="fas fa-exchange-alt text-primary mb-2 d-block fs-4"></i>
                      <h6 className="text-muted mb-1">Total Transactions</h6>
                      <h4 className="mb-0">{invoice.transactions.length}</h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 bg-light rounded">
                      <i className="fas fa-undo text-warning mb-2 d-block fs-4"></i>
                      <h6 className="text-muted mb-1">Refund Transactions</h6>
                      <h4 className="mb-0">
                        {invoice.refund_transactions?.length || 0}
                      </h4>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 bg-light rounded">
                      <i className="fas fa-money-bill-wave text-danger mb-2 d-block fs-4"></i>
                      <h6 className="text-muted mb-1">Total Refund Amount</h6>
                      <h4 className="mb-0">
                        ₹{(invoice.total_refund_amount || 0).toFixed(2)}
                      </h4>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {/* Invoice Items Table */}
          <Card className="mb-4">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <i className="fas fa-list-alt me-2"></i>
                Invoice Items
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>
                      <i className="fas fa-list-alt me-1"></i>
                      Description
                    </th>
                    <th className="text-center">
                      <i className="fas fa-hashtag me-1"></i>
                      Qty
                    </th>
                    <th className="text-end">Rate</th>
                    <th className="text-end">
                      <i className="fas fa-calculator me-1"></i>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.description}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">₹{item.rate.toFixed(2)}</td>
                        <td className="text-end">₹{item.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>
                        {invoice.service_description ||
                          "Services Rendered for Period"}
                      </td>
                      <td className="text-center">1</td>
                      <td className="text-end">
                        ₹{invoice.total_without_gst.toFixed(2)}
                      </td>
                      <td className="text-end">
                        ₹{invoice.total_without_gst.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Invoice Totals */}
          <Row className="justify-content-end mb-4">
            <Col md={6} lg={5}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>
                      <i className="fas fa-minus me-1"></i>Subtotal (Before
                      GST):
                    </span>
                    <span className="fw-semibold">
                      ₹{invoice.total_without_gst.toFixed(2)}
                    </span>
                  </div>

                  {/* GST Breakup */}
                  <div className="bg-light p-2 rounded mb-2">
                    <div className="fw-semibold mb-2 text-primary">
                      <i className="fas fa-percentage me-1"></i>
                      GST Breakup ({gstType}):
                    </div>
                    {invoice.gst_breakup?.type === "intra_state" ? (
                      <>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="ms-3">CGST (9%):</span>
                          <span>
                            ₹{(invoice.gst_breakup.cgst || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="ms-3">SGST (9%):</span>
                          <span>
                            ₹{(invoice.gst_breakup.sgst || 0).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : invoice.gst_breakup?.type === "union_territory" ? (
                      <>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="ms-3">CGST (9%):</span>
                          <span>
                            ₹{(invoice.gst_breakup.cgst || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="ms-3">UTGST (9%):</span>
                          <span>
                            ₹{(invoice.gst_breakup.utgst || 0).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="d-flex justify-content-between mb-1 small">
                        <span className="ms-3">IGST (18%):</span>
                        <span>
                          ₹{(invoice.gst_breakup?.igst || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between border-top pt-1 mt-1">
                      <span className="fw-semibold">Total GST:</span>
                      <span className="fw-semibold">
                        ₹{invoice.total_gst.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between border-top border-2 border-dark pt-2 mb-2 fw-bold fs-5">
                    <span>Grand Total:</span>
                    <span className="text-success">
                      ₹{invoice.grand_total.toFixed(2)}
                    </span>
                  </div>

                  {invoice.total_refund_amount > 0 && (
                    <>
                      <div className="d-flex justify-content-between pb-2 mb-2 text-danger">
                        <span>
                          <i className="fas fa-undo me-1"></i>Total Refund:
                        </span>
                        <span>- ₹{invoice.total_refund_amount.toFixed(2)}</span>
                      </div>
                      <div className="d-flex justify-content-between border-top border-2 pt-2 mb-2 fw-bold fs-5">
                        <span>Net Total (After Refund):</span>
                        <span className="text-primary">
                          ₹
                          {(
                            invoice.net_total_after_refund ||
                            invoice.grand_total
                          ).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  {invoice.pending_amount !== undefined &&
                    invoice.pending_amount > 0 && (
                      <div className="d-flex justify-content-between border-top border-2 border-warning pt-2 fw-bold fs-5 text-warning">
                        <span>
                          <i className="fas fa-exclamation-circle me-1"></i>
                          Pending Amount:
                        </span>
                        <span>₹{invoice.pending_amount.toFixed(2)}</span>
                      </div>
                    )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Footer Note */}
          <div className="text-center mt-4 pt-3 border-top">
            <p className="text-muted small mb-1">
              <i className="fas fa-info-circle me-1"></i>
              This is a computer-generated invoice and does not require a
              signature.
            </p>
            <p className="text-muted small mb-0">
              Thank you for your business!
            </p>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>
          Close
        </Button>
        <Button variant="primary" onClick={handleDownload}>
          <i className="fas fa-download me-2"></i>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
export const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 0,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [invoicePools, setInvoicePools] = useState<InvoicePool[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: moment().startOf("year").toString(),
    toDate: moment().toString(),
    pool_id: "",
  });

  const role = "admin"; // change this to "user" for testing

  const getInvoices = async (
    page = pagination.page,
    limit = pagination.limit
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      const data = await fetchInvoices({
        ...filters,
        page: page,
        limit: limit,
      });

      if (data?.invoices && data?.pagination) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      }
    } catch (err: any) {
      toast.error(err?.mesage || "Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  const getInvoicePools = async () => {
    setLoading(true);
    const users = await fetchInvoicePools();
    if (users.length) {
      setInvoicePools(users);
    }
    setLoading(false);
  };

  const downloadTransactionsCSV = (invoice: Invoice) => {
    if (!invoice.transactions || invoice.transactions.length === 0) {
      toast.warn("No transactions available for this invoice");
      return;
    }

    const headers = [
      "Transaction ID",
      "CR/DR",
      "Order ID",
      "Type",
      "Freight Charge",
      "COD Charges",
      "Commission",
      "GST (18%)",
      "Total Amount",
      "Zone",
      "Charged Weight",
      "Status",
      "Created At",
    ];

    const rows = [...invoice.transactions, ...invoice.refund_transactions].map(
      (t: any) => {
        const subtotal =
          (t.freight_charge || 0) + (t.cod_charges || 0) + (t.commission || 0);
        const gst = subtotal * 0.18;
        const totalAmount = subtotal + gst;

        return [
          t._id,
          t.cr_dr,
          t.order_id,
          t.type,
          t.freight_charge,
          t.cod_charges,
          t.commission,
          gst.toFixed(2),
          totalAmount.toFixed(2),
          t.zone,
          t.charged_weight,
          t.full_details?.status || "",
          new Date(t.createdAt).toLocaleString(),
        ];
      }
    );

    const csvContent = [headers, ...rows]
      .map((row) => row.map((v) => `"${v ?? ""}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `invoice_${invoice._id}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    getInvoicePools();
  }, []);

  useEffect(() => {
    getInvoices(1);
  }, [filters.fromDate, filters.toDate, filters.pool_id]);

  return (
    <>
      <link
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
      />

      <Container fluid className="py-4 bg-light min-vh-100">
        {/* Header */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col>
                <h1 className="display-6 text-primary mb-1">
                  <i className="fas fa-file-invoice me-2"></i>
                  Invoice Management
                </h1>
                <p className="text-muted mb-0">
                  Manage and download your invoices
                </p>
              </Col>
              <Col xs="auto" className="text-end">
                <p className="text-muted mb-1">
                  <i className="fas fa-chart-bar me-1"></i>
                  Total Invoices
                </p>
                <h2 className="text-primary mb-0">{pagination?.total || 0}</h2>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Filters */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">
              <i className="fas fa-filter me-2"></i>
              Filters
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-calendar-alt me-1"></i>
                    From Date
                  </Form.Label>
                  <Form.Control
                    max={filters.toDate}
                    type="date"
                    value={moment(filters?.fromDate).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setFilters((old) => ({
                        ...old,
                        fromDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <i className="fas fa-calendar-alt me-1"></i>
                    To Date
                  </Form.Label>
                  <Form.Control
                    min={filters.fromDate}
                    type="date"
                    value={moment(filters?.toDate).format("YYYY-MM-DD")}
                    onChange={(e) =>
                      setFilters((old) => ({
                        ...old,
                        toDate: e.target.value,
                      }))
                    }
                  />
                </Form.Group>
              </Col>

              {role === "admin" && (
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="fas fa-user me-1"></i>
                      Pool
                    </Form.Label>
                    <select
                      className="form-control"
                      name=""
                      id=""
                      value={filters.pool_id}
                      onChange={(e) =>
                        setFilters((old) => ({
                          ...old,
                          pool_id: e.target.value,
                        }))
                      }
                    >
                      <option value={""}>All Pools</option>
                      {!!invoicePools.length &&
                        invoicePools.map((pool) => {
                          return (
                            <option key={pool._id} value={pool._id}>
                              {pool.name}{" "}
                              {pool?.description && `(${pool.description})`}
                            </option>
                          );
                        })}
                    </select>
                  </Form.Group>
                </Col>
              )}

              <Col md={3} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => getInvoices(1)}
                >
                  <i className="fas fa-search me-2"></i>
                  Apply Filters
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <Spinner
                  animation="border"
                  variant="primary"
                  className="me-2"
                />
                <span className="text-muted">Loading invoices...</span>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-5">
                <i className="fas fa-file-invoice display-4 text-muted mb-3"></i>
                <p className="text-muted">No invoices found.</p>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <Table className="mb-0">
                    <thead className="table-primary">
                      <tr>
                        <th>
                          <i className="fas fa-hashtag me-1"></i>
                          Invoice ID
                        </th>
                        {role === "admin" && (
                          <th>
                            <i className="fas fa-user me-1"></i>
                            Pool
                          </th>
                        )}
                        <th>
                          <i className="fas fa-calendar me-1"></i>
                          Period
                        </th>
                        <th>
                          <i className="fas fa-exchange-alt me-1"></i>
                          Transactions
                        </th>
                        <th className="text-end">Net Total</th>
                        <th className="text-end">Grand Total</th>
                        {invoices.some(
                          (i) => i?.pending_amount && i?.pending_amount > 0
                        ) && <th className="text-end">Pending</th>}
                        <th className="text-end">
                          <i className="fas fa-percentage me-1"></i>
                          GST
                        </th>
                        <th className="text-end">Before GST</th>
                        <th>
                          <i className="fas fa-tag me-1"></i>
                          GST Type
                        </th>
                        <th>
                          <i className="fas fa-clock me-1"></i>
                          Created
                        </th>
                        <th>
                          <i className="fas fa-cogs me-1"></i>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv._id}>
                          <td className="text-primary fw-semibold">
                            <i className="fas fa-file-alt me-1"></i>
                            {inv._id.substring(0, 8)}...
                          </td>
                          {role === "admin" && (
                            <td>
                              <i className="fas fa-user-circle me-1 text-muted"></i>
                              {inv.pool_name}
                            </td>
                          )}
                          <td>
                            <small className="d-block">
                              {moment(inv.period_start).format("DD MMM")} -{" "}
                              {moment(inv.period_end).format("DD MMM, YY")}
                            </small>
                          </td>
                          <td>
                            <Badge bg="info" className="me-1">
                              {inv.transactions?.length || 0}
                            </Badge>
                            {inv.refund_transactions &&
                              inv.refund_transactions.length > 0 && (
                                <Badge bg="warning">
                                  <i className="fas fa-undo me-1"></i>
                                  {inv.refund_transactions.length}
                                </Badge>
                              )}
                          </td>
                          <td className="text-end fw-bold text-primary">
                            ₹
                            {(
                              inv.net_total_after_refund || inv.grand_total
                            ).toFixed(2)}
                          </td>
                          <td className="text-end fw-bold text-success">
                            ₹{inv.grand_total.toFixed(2)}
                          </td>
                          {invoices.some(
                            (i) => i?.pending_amount && i?.pending_amount > 0
                          ) && (
                            <td className="text-end fw-bold text-danger">
                              {inv?.pending_amount && inv?.pending_amount > 0
                                ? `₹${inv.pending_amount.toFixed(2)}`
                                : "-"}
                            </td>
                          )}
                          <td className="text-end">
                            ₹{inv.total_gst.toFixed(2)}
                          </td>
                          <td className="text-end">
                            ₹{inv.total_without_gst.toFixed(2)}
                          </td>
                          <td>
                            <Badge
                              bg={
                                inv.gst_breakup?.type === "intra_state"
                                  ? "info"
                                  : "warning"
                              }
                            >
                              {inv.gst_breakup?.type === "intra_state"
                                ? "Intra"
                                : "Inter"}
                            </Badge>
                          </td>
                          <td className="text-muted">
                            <small>
                              {moment(inv.createdAt).format("DD MMM, YYYY")}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleViewInvoice(inv)}
                                title="View Invoice"
                              >
                                <i className="fas fa-eye"></i>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-warning"
                                onClick={() => downloadTransactionsCSV(inv)}
                                title="Download Transactions CSV"
                              >
                                <i className="fas fa-file-csv"></i>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <Card.Footer className="bg-light">
                    <Row className="align-items-center">
                      <Col>
                        <p className="text-muted mb-0">
                          <i className="fas fa-info-circle me-1"></i>
                          Showing page <strong>
                            {pagination.page}
                          </strong> of <strong>{pagination.totalPages}</strong>
                        </p>
                      </Col>
                      <Col xs="auto">
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => getInvoices(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            <i className="fas fa-chevron-left me-1"></i>
                            Previous
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => getInvoices(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                          >
                            Next
                            <i className="fas fa-chevron-right ms-1"></i>
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Card.Footer>
                )}
              </>
            )}
          </Card.Body>
        </Card>

        {/* Invoice Modal */}
        {selectedInvoice && (
          <InvoiceModal
            invoice={selectedInvoice}
            show={showModal}
            onHide={() => setShowModal(false)}
          />
        )}
      </Container>
    </>
  );
};

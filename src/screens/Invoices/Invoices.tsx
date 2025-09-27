import React, { useEffect, useState } from "react";
import { fetchInvoices } from "../../APIs/user/invoices";
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
  Badge,
  Spinner,
} from "react-bootstrap";

type Invoice = {
  _id: string;
  user_id: string;
  period_start: string;
  period_end: string;
  grand_total: number;
  total_gst: number;
  total_without_gst: number;
  createdAt: string;
  company_name?: string;
  company_address?: string;
  items?: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
};

type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

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
    // Create a new window with the invoice content
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
            <h1 className="display-4 text-primary mb-2">
              <i className="fas fa-file-invoice-dollar me-2"></i>
              INVOICE
            </h1>
            <p className="text-muted">Invoice #{invoice._id}</p>
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
                    <p className="fw-bold mb-1">Your Company Name</p>
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                      123 Business Street
                    </p>
                    <p className="mb-1">City, State 12345</p>
                    <p className="mb-1">
                      <i className="fas fa-envelope me-1 text-muted"></i>
                      contact@yourcompany.com
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-phone me-1 text-muted"></i>
                      +1 (555) 123-4567
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
                    <p className="fw-bold mb-1">
                      {invoice.company_name || "Client Company"}
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-1 text-muted"></i>
                      {invoice.company_address || "Client Address"}
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-id-card me-1 text-muted"></i>
                      User ID: {invoice.user_id}
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Period Information */}
          <Card className="bg-info bg-opacity-10 border-info mb-4">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-calendar-alt me-1"></i>
                    Invoice Date
                  </p>
                  <p className="fw-semibold mb-0">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </Col>
                <Col md={4}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-calendar-check me-1"></i>
                    Period Start
                  </p>
                  <p className="fw-semibold mb-0">
                    {new Date(invoice.period_start).toLocaleDateString()}
                  </p>
                </Col>
                <Col md={4}>
                  <p className="text-muted mb-1">
                    <i className="fas fa-calendar-times me-1"></i>
                    Period End
                  </p>
                  <p className="fw-semibold mb-0">
                    {new Date(invoice.period_end).toLocaleDateString()}
                  </p>
                </Col>
              </Row>
            </Card.Body>
          </Card>

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
                    <th className="text-end">
                      <i className="fas fa-dollar-sign me-1"></i>
                      Rate
                    </th>
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
                        <td className="text-end">${item.rate.toFixed(2)}</td>
                        <td className="text-end">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>Services Rendered</td>
                      <td className="text-center">1</td>
                      <td className="text-end">
                        ${invoice.total_without_gst.toFixed(2)}
                      </td>
                      <td className="text-end">
                        ${invoice.total_without_gst.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Invoice Totals */}
          <Row className="justify-content-end mb-4">
            <Col md={6} lg={4}>
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>
                      <i className="fas fa-minus me-1"></i>Subtotal:
                    </span>
                    <span>${invoice.total_without_gst.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                    <span>
                      <i className="fas fa-percentage me-1"></i>GST:
                    </span>
                    <span>${invoice.total_gst.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top border-2 border-dark pt-2 fw-bold fs-5">
                    <span>
                      <i className="fas fa-dollar-sign me-1"></i>Total:
                    </span>
                    <span>${invoice.grand_total.toFixed(2)}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
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
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: moment().startOf("month").toString(),
    toDate: moment().toString(),
    userId: "",
  });

  // assume we get user role from auth context or props
  const role = "admin"; // change this to "user" for testing

  const getInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchInvoices(filters);

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

  const handleQuickDownload = (invoice: Invoice) => {
    // Quick download without modal
    const printWindow = window.open("", "_blank");
    printWindow?.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice._id}</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="container-fluid">
            <div class="text-center mb-4">
              <h1 class="display-4 text-primary"><i class="fas fa-file-invoice-dollar"></i> INVOICE</h1>
              <p class="text-muted">Invoice #${invoice._id}</p>
            </div>
            <div class="card mb-4 bg-light">
              <div class="card-body">
                <p><i class="fas fa-calendar-alt"></i> <strong>Period:</strong> ${new Date(
                  invoice.period_start
                ).toLocaleDateString()} - ${new Date(
      invoice.period_end
    ).toLocaleDateString()}</p>
                <p><i class="fas fa-calendar-check"></i> <strong>Created:</strong> ${new Date(
                  invoice.createdAt
                ).toLocaleDateString()}</p>
                ${
                  role === "admin"
                    ? `<p><i class="fas fa-user"></i> <strong>User ID:</strong> ${invoice.user_id}</p>`
                    : ""
                }
              </div>
            </div>
            <table class="table table-bordered">
              <tr>
                <td><i class="fas fa-minus"></i> <strong>Subtotal:</strong></td>
                <td class="text-end">$${invoice.total_without_gst.toFixed(
                  2
                )}</td>
              </tr>
              <tr>
                <td><i class="fas fa-percentage"></i> <strong>GST:</strong></td>
                <td class="text-end">$${invoice.total_gst.toFixed(2)}</td>
              </tr>
              <tr class="table-primary fw-bold">
                <td><i class="fas fa-dollar-sign"></i> <strong>Grand Total:</strong></td>
                <td class="text-end"><strong>$${invoice.grand_total.toFixed(
                  2
                )}</strong></td>
              </tr>
            </table>
            <div class="text-center mt-4">
              <p class="text-muted"><i class="fas fa-heart text-danger"></i> Thank you for your business!</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow?.document.close();
    printWindow?.print();
  };

  useEffect(() => {
    getInvoices();
  }, [filters]);

  return (
    <>
      {/* Bootstrap and Font Awesome CDN */}
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
                      User ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      value={filters.userId}
                      onChange={(e) =>
                        setFilters((old) => ({
                          ...old,
                          userId: e.target.value,
                        }))
                      }
                      placeholder="Enter User ID"
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={3} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={() => {
                    setPage(1);
                    getInvoices();
                  }}
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
                            User ID
                          </th>
                        )}
                        <th>
                          <i className="fas fa-calendar me-1"></i>
                          Period
                        </th>
                        <th>
                          <i className="fas fa-dollar-sign me-1"></i>
                          Grand Total
                        </th>
                        <th>
                          <i className="fas fa-percentage me-1"></i>
                          GST
                        </th>
                        <th>
                          <i className="fas fa-minus me-1"></i>
                          Without GST
                        </th>
                        <th>
                          <i className="fas fa-clock me-1"></i>
                          Created At
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
                            {inv._id}
                          </td>
                          {role === "admin" && (
                            <td>
                              <i className="fas fa-user-circle me-1 text-muted"></i>
                              {inv.user_id}
                            </td>
                          )}
                          <td>
                            <i className="fas fa-calendar-alt me-1 text-muted"></i>
                            {new Date(inv.period_start).toLocaleDateString()} -{" "}
                            {new Date(inv.period_end).toLocaleDateString()}
                          </td>
                          <td className="fw-bold text-success">
                            <i className="fas fa-dollar-sign me-1"></i>
                            {inv.grand_total.toFixed(2)}
                          </td>
                          <td>
                            <i className="fas fa-percentage me-1 text-muted"></i>
                            {inv.total_gst.toFixed(2)}
                          </td>
                          <td>
                            <i className="fas fa-minus me-1 text-muted"></i>
                            {inv.total_without_gst.toFixed(2)}
                          </td>
                          <td className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            {new Date(inv.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleViewInvoice(inv)}
                                title="View Invoice"
                              >
                                <i className="fas fa-eye me-1"></i>
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => handleQuickDownload(inv)}
                                title="Download Invoice"
                              >
                                <i className="fas fa-download me-1"></i>
                                Download
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
                          Showing page <strong>{page}</strong> of{" "}
                          <strong>{pagination.totalPages}</strong>
                        </p>
                      </Col>
                      <Col xs="auto">
                        <div className="btn-group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              setPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={page === 1}
                          >
                            <i className="fas fa-chevron-left me-1"></i>
                            Previous
                          </Button>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                              setPage((prev) =>
                                pagination && page < pagination.totalPages
                                  ? prev + 1
                                  : prev
                              )
                            }
                            disabled={page === pagination.totalPages}
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

import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllNDRReports, createNDRReport, updateNDRReport } from "../../APIs/user/ndrReport";

export interface User {
  _id: string;
  name: string;
}

export interface NDRReport {
  _id: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  stock: number;
  packing_cost: number;
  volumetric_weight: number;
  created_by: User;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

const NDRReports: React.FC = () => {
  const [ndr_reports, setNDRReports] = useState<NDRReport[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  const [showModal, setShowModal] = useState(false);
  const [editingNDRReport, setEditingNDRReport] = useState<NDRReport | null>(null);
  const [dimensions, setDimensions] = useState({
    length: 0,
    breadth: 0,
    height: 0,
  });
  const [volumetricWeight, setVolumetricWeight] = useState<number>(0);
  useEffect(() => {
    // Recalculate volumetric weight whenever dimensions change
    const { length, breadth, height } = dimensions;
    const calculatedVolumetricWeight = (length * breadth * height) / 5000;
    setVolumetricWeight(calculatedVolumetricWeight * 1000);
  }, [dimensions]);


  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [ndr_reportsData] = await Promise.all([
        getAllNDRReports(),
      ]);
      setNDRReports(ndr_reportsData);
    } catch (error) {
      console.error("Error loading ndr_reports or users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingNDRReport(null);
  };

  const handleShow = () => setShowModal(true);

  const handleDimensionChange = (field: "length" | "breadth" | "height", value: number) => {
    setDimensions((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleEdit = (ndr_report: NDRReport) => {
    setEditingNDRReport(ndr_report);
    setShowModal(true);
  };

  const handleToggleStatus = async (ndr_report: NDRReport) => {
    const newStatus = ndr_report.status === "active" ? "inactive" : "active";
    if (
      window.confirm(`Are you sure you want to mark this ndr report as ${newStatus}?`)
    ) {
      try {
        await updateNDRReport(ndr_report._id, { status: newStatus });
        fetchInitialData();
      } catch (error) {
        console.error("Error updating status", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as typeof e.target & {
      name: { value: string };
      weight: { value: number };
      length: { value: number };
      breadth: { value: number };
      height: { value: number };
      stock: { value: number };
      packing_cost: { value: number };
      volumetric_weight: { value: number };
    };

    const formData = {
      name: form.name.value.trim(),
      weight: form.weight.value,
      length: form.length.value,
      breadth: form.breadth.value,
      height: form.height.value,
      stock: form.stock.value,
      packing_cost: form.packing_cost.value,
      volumetric_weight: form.volumetric_weight.value,
    };

    try {
      if (editingNDRReport) {
        await updateNDRReport(editingNDRReport._id, formData);
      } else {
        await createNDRReport(formData);
      }
      fetchInitialData();
      handleClose();
    } catch (error) {
      console.error("Error saving ndr report", error);
    }
  };

  const columns = [
    {
      name: "AWB",
      selector: (row:any) => row.awb,
      sortable: true,
    },
    {
      name: "Order ID",
      selector: (row:any) => row.orderId,
      sortable: true,
    },
    {
      name: "Current Attempt",
      selector: (row:any) => row.currentAttempt,
      sortable: true,
      center: true,
    },
    {
      name: "Latest Status",
      selector: (row:any) => row.latestStatus,
      sortable: true,
      cell: (row:any) => (
        <span className={`badge bg-${row.latestStatus === 'pending' ? 'warning' : 'success'}`}>
          {row.latestStatus}
        </span>
      ),
    },
    {
      name: "Last Attempt Date",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.scanDateTime,
      format: (row:any) => new Date(row.attempts?.[row.currentAttempt - 1]?.scanDateTime).toLocaleString(),
      sortable: true,
    },
    {
      name: "NDR Reason",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.ndrReason || "-",
      wrap: true,
    },
    {
      name: "Resolution Action",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.resolutionAction || "-",
      wrap: true,
    },
    {
      name: "Customer Response",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.customerResponse || "-",
      wrap: true,
    },
    {
      name: "Seller Action",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.sellerFeedback?.action || "-",
      wrap: true,
    },
    {
      name: "Reschedule Date",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.sellerFeedback?.rescheduleDate,
      format: (row:any) => row.attempts?.[row.currentAttempt - 1]?.sellerFeedback?.rescheduleDate
        ? new Date(row.attempts[row.currentAttempt - 1].sellerFeedback.rescheduleDate).toLocaleDateString()
        : "-",
    },
    {
      name: "Updated Address",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.sellerFeedback?.updatedAddress || "-",
      wrap: true,
    },
    {
      name: "Remarks",
      selector: (row:any) => row.attempts?.[row.currentAttempt - 1]?.remarks || "-",
      wrap: true,
    },
    {
      name: "Created At",
      selector: (row:any) => row.createdAt,
      format: (row:any) => new Date(row.createdAt).toLocaleString(),
      sortable: true,
    },
    {
      name: "Updated At",
      selector: (row:any) => row.updatedAt,
      format: (row:any) => new Date(row.updatedAt).toLocaleString(),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row:any) => (
        <div>
          <Button size="sm" variant="primary" onClick={() => onEdit(row)}>
            Edit
          </Button>{" "}
          <Button size="sm" variant="danger" onClick={() => onDelete(row)}>
            Delete
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
    },
  ];


  return (
    <div className="container mt-4 ms-2 me-2">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>NDR Reports</h4>
        <Button onClick={handleShow}>+ New NDR Report</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : ndr_reports.length === 0 ? (
        <p>No ndr reports found.</p>
      ) : (
        <DataTable
          title="Your NDR Reports"
          data={ndr_reports}
          columns={columns as any}
          highlightOnHover
          pagination
          paginationRowsPerPageOptions={[10, 20, 50, 100, 200, 500, 1000]}
          responsive
          striped
          persistTableHead
        />
      )}

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingNDRReport ? "Edit NDR Report" : "Create NDR Report"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Report Name</Form.Label>
              <Form.Control
                name="name"
                defaultValue={editingNDRReport?.name || ""}
                placeholder="e.g. Undelivered due to address issue"
                required
              />
            </Form.Group>

            <div className="mb-2 row">
              <Form.Group className="mb-2 col-6">
                <Form.Label>Weight (gm)</Form.Label>
                <Form.Control
                  name="weight"
                  type="number"
                  defaultValue={editingNDRReport?.weight || ""}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-6">
                <Form.Label>Volumetric Weight (gm)</Form.Label>
                <Form.Control
                  name="volumetric_weight"
                  type="number"
                  value={volumetricWeight.toFixed(2)}
                  disabled
                />
              </Form.Group>
            </div>

            <div className="mb-2 row">
              <Form.Group className="mb-2 col-4">
                <Form.Label>Length (cm)</Form.Label>
                <Form.Control
                  name="length"
                  type="number"
                  value={dimensions.length}
                  onChange={(e) =>
                    handleDimensionChange("length", Number(e.target.value))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-4">
                <Form.Label>Breadth (cm)</Form.Label>
                <Form.Control
                  name="breadth"
                  type="number"
                  value={dimensions.breadth}
                  onChange={(e) =>
                    handleDimensionChange("breadth", Number(e.target.value))
                  }
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-4">
                <Form.Label>Height (cm)</Form.Label>
                <Form.Control
                  name="height"
                  type="number"
                  value={dimensions.height}
                  onChange={(e) =>
                    handleDimensionChange("height", Number(e.target.value))
                  }
                  required
                />
              </Form.Group>
            </div>

            <div className="mb-2 row">
              <Form.Group className="mb-2 col-6">
                <Form.Label>Available Stock</Form.Label>
                <Form.Control
                  name="stock"
                  type="number"
                  step={1}
                  defaultValue={editingNDRReport?.stock || ""}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2 col-6">
                <Form.Label>Cost per Piece (₹)</Form.Label>
                <Form.Control
                  name="packing_cost"
                  type="number"
                  defaultValue={editingNDRReport?.packing_cost || ""}
                  required
                />
              </Form.Group>
            </div>

            <Form.Group className="mb-2">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="latestStatus"
                defaultValue={editingNDRReport?.latestStatus || ""}
                required
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="resolved">Resolved</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>Channel</Form.Label>
              <Form.Control
                name="channel_name"
                value={editingNDRReport?.channel?.channel_account_name || ""}
                disabled
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingNDRReport ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </div>
  );
};

export { NDRReports };
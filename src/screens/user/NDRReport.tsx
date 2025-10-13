import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import DataTable from "react-data-table-component";
import { getAllNDRReports, updateNDRReport } from "../../APIs/user/ndrReport";

export interface User {
  _id: string;
  name: string;
}

export interface NDRReport {
  _id: string;
  awb: string;
  courier: string;
  order: any;
  attempts: any[];
  currentAttempt: number;
  latestStatus: string;
  action?: string;
  rescheduleDate?: string;
}

const NDRReports: React.FC = () => {
  const [ndr_reports, setNDRReports] = useState<NDRReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [rescheduleDate, setRescheduleDate] = useState<any>();
  const [sellerAction, setSellerAction] = useState<any>();
  const [showModal, setShowModal] = useState(false);
  const [editingNDRReport, setEditingNDRReport] = useState<NDRReport | null>(null);


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


  const handleEdit = (ndr_report: NDRReport) => {
    setEditingNDRReport(ndr_report);
    setShowModal(true);
  };


  const handleSubmit = async () => {

    try {
      if (editingNDRReport) {
        await updateNDRReport(editingNDRReport._id, {
          action: sellerAction,
          rescheduleDate: rescheduleDate || null,
        });
      }
      fetchInitialData();
      handleClose();
    } catch (error) {
      console.error("Error saving ndr report", error);
    }
  };

  const onEdit = (row: any) => {
    handleEdit(row);
  };
  const columns = [
    {
      name: "AWB",
      selector: (row: any) => row.awb,
      cell: (row: any) => (
        <div>
          <i>#{row.order.order_id}</i><br />
          <strong>{row.awb}</strong><br />
          <small className="text-muted">{row.courier || "—"}</small>
        </div>
      ),
      sortable: true,
    },

    {
      name: "Last Attempt Date",
      selector: (row: any) => {
        const lastAttempt = row.attempts?.[row.currentAttempt - 1];
        return lastAttempt?.scanDateTime?.split("T")[0] || "-";
      },
      cell: (row: any) => {
        const lastAttempt = row.attempts?.[row.currentAttempt - 1];
        const date = lastAttempt?.scanDateTime?.split("T")[0] || "-";
        const reason = lastAttempt?.ndrReason || "—";
        const badgeClass = row.latestStatus === "pending" ? "warning" : "success";

        return (
          <div >
            <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontWeight: 600, marginRight: 6 }}>#{row.currentAttempt}</span>
              <span
                className={`badge bg-${badgeClass}`}
                style={{ textTransform: "capitalize", fontSize: "0.85em" }}
              >
                {row.latestStatus}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
              <i className="bi bi-calendar-event" style={{ marginRight: 4 }}></i>
              <span style={{ fontSize: "0.9em" }}>{date}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", color: "#555" }}>
              <i className="bi bi-info-circle" style={{ marginRight: 4 }}></i>
              <span style={{ fontSize: "0.85em", fontStyle: "italic" }}>{reason}</span>
            </div>
          </div>

        );
      },
      sortable: true,
    },
    {
      name: "Resolution Action",
      selector: (row: any) => row.attempts?.[row.currentAttempt - 1]?.resolutionAction || "-",
      wrap: true,
    },
    {
      name: "Seller Action",
      selector: (row: any) => row.attempts?.[row.currentAttempt - 1]?.sellerFeedback?.action || "-",
      wrap: true,
    },
    {
      name: "Actions",
      cell: (row: any) => (
        <div>
          <Button size="sm" variant="primary" onClick={() => onEdit(row)}>
            Update NDR
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
      <Modal show={showModal} onHide={handleClose} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            Update NDR Report — {editingNDRReport?.awb} (#{editingNDRReport?.order?.order_id})
          </Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleSubmit}>
          <Modal.Body>

            {/* Seller Action */}
            <Form.Group className="mb-2">
              <Form.Label>Seller Action</Form.Label>
              <Form.Select
                value={sellerAction}
                onChange={(e) => setSellerAction(e.target.value)}
                required
              >
                <option value="">Select Action</option>
                <option value="cancel">Cancel Order</option>
                <option value="reschedule">Reschedule Pickup</option>
              </Form.Select>
            </Form.Group>

            {/* Reschedule Date */}
            {sellerAction === "reschedule" && (
              <Form.Group className="mb-2">
                <Form.Label>Reschedule Date</Form.Label>
                <Form.Control
                  type="date"
                  value={rescheduleDate || ""}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  required
                />
              </Form.Group>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {editingNDRReport ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>


    </div>
  );
};

export { NDRReports };
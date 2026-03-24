import React, { useEffect, useState, useRef } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { Modal, Button, Badge, Card, Form, InputGroup } from "react-bootstrap";
import { appAxios } from "../../axios/appAxios";
import { drpCrmBaseUrl } from "../../axios/urls";

// --- Types ---
type DiscrepancyStatus = "pending" | "dispute" | "accepted";

interface IChat {
  type: "reporter" | "admin";
  message: string;
  createdAt: string;
}

interface IWeightDiscrepancy {
  _id?: string;
  awb_number: string;
  orderId: string;
  order_createdAt: string;
  entered_weight: number;
  charge_weight: number;
  initial_amount: number;
  final_charge: number;
  status: DiscrepancyStatus;
  chat: IChat[];
  courier_images: string[];
}

const WeightDiscrepancy: React.FC = () => {
  const [data, setData] = useState<IWeightDiscrepancy[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Modal States ---
  const [selectedRow, setSelectedRow] = useState<IWeightDiscrepancy | null>(
    null
  );
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- API ---
  const fetchWeightDiscrepancies = async () => {
    try {
      setLoading(true);
      const res = await appAxios.get<{
        success: boolean;
        data: IWeightDiscrepancy[];
      }>(`${drpCrmBaseUrl}/user/weight-discrepancy`);
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeightDiscrepancies();
  }, []);

  // Scroll chat to bottom when modal opens or message adds
  useEffect(() => {
    if (showDisputeModal) {
      setTimeout(
        () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }),
        100
      );
    }
  }, [showDisputeModal, selectedRow?.chat]);

  // --- Actions ---
  const handleAccept = async () => {
    if (!selectedRow) return;

    try {
      const res = await appAxios.post(
        `${drpCrmBaseUrl}/user/weight-discrepancy/accept`,
        {
          awb_number: selectedRow.awb_number,
        }
      );

      if (res.data.success) {
        setData((prev) =>
          prev.map((d) =>
            d.awb_number === selectedRow.awb_number
              ? { ...d, status: "accepted" }
              : d
          )
        );
        setShowAcceptModal(false);
        setShowDisputeModal(false); // Close if open
      }
    } catch (err) {
      console.error("Failed to accept:", err);
    }
  };
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedRow) return;

    try {
      const res = await appAxios.post(
        `${drpCrmBaseUrl}/user/weight-discrepancy/message`,
        {
          awb_number: selectedRow.awb_number,
          message: chatMessage,
        }
      );

      if (res.data.success) {
        // The backend returns the updated document including the new status and chat
        const updatedItem = res.data.data;

        setData((prev) =>
          prev.map((d) =>
            d.awb_number === selectedRow.awb_number ? updatedItem : d
          )
        );
        setSelectedRow(updatedItem);
        setChatMessage("");
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  // --- Columns ---
  const columns: TableColumn<IWeightDiscrepancy>[] = [
    {
      name: "AWB",
      selector: (row) => row.awb_number,
      sortable: true,
      width: "140px",
    },
    {
      name: "Date",
      selector: (row) => new Date(row.order_createdAt).toLocaleDateString(),
      sortable: true,
      width: "110px",
    },
    {
      name: "Weight",
      cell: (row) => (
        <div>
          <div className="text-muted small">Entered: {row.entered_weight}g</div>
          <div className="fw-bold text-danger">
            Charged: {row.charge_weight}g
          </div>
        </div>
      ),
    },
    {
      name: "Extra Charge",
      selector: (row) => row.final_charge - row.initial_amount,
      cell: (row) => (
        <span className="fw-bold text-danger">
          ₹{row.final_charge - row.initial_amount}
        </span>
      ),
    },
    {
      name: "Status",
      selector: (row) => row.status,
      cell: (row) => {
        const map = {
          pending: "warning",
          dispute: "danger",
          accepted: "success",
        };
        return <Badge bg={map[row.status]}>{row.status.toUpperCase()}</Badge>;
      },
    },
    {
      name: "Actions",
      cell: (row) => {
        // SCENARIO 1: PENDING (Show Two Buttons)
        if (row.status === "pending") {
          return (
            <div className="d-flex gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  setSelectedRow(row);
                  setShowAcceptModal(true);
                }}
              >
                Accept
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => {
                  setSelectedRow(row);
                  setShowDisputeModal(true);
                }}
              >
                Dispute
              </Button>
            </div>
          );
        }

        // SCENARIO 2: ACCEPTED (Show 'Re-Dispute')
        if (row.status === "accepted") {
          return (
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => {
                setSelectedRow(row);
                setShowDisputeModal(true);
              }}
            >
              Raise Dispute
            </Button>
          );
        }

        // SCENARIO 3: DISPUTED (Show 'View Chat')
        if (row.status === "dispute") {
          return (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedRow(row);
                setShowDisputeModal(true);
              }}
            >
              View Chat
            </Button>
          );
        }
      },
      width: "200px",
    },
  ];

  return (
    <div className="p-4 bg-light min-vh-100">
      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0 fw-bold">Weight Discrepancy</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={data}
            progressPending={loading}
            pagination
            highlightOnHover
          />
        </Card.Body>
      </Card>

      {/* --- MODAL 1: SIMPLE ACCEPT CONFIRMATION --- */}
      <Modal
        show={showAcceptModal}
        onHide={() => setShowAcceptModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Accept Charges?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRow && (
            <div className="text-center">
              <p>
                You are accepting the carrier's weight of{" "}
                <strong>{selectedRow.charge_weight}g</strong>.
              </p>
              <h4 className="text-danger my-3">
                Extra Payable: ₹
                {selectedRow.final_charge - selectedRow.initial_amount}
              </h4>
              <p className="text-muted small">
                This amount will be deducted from your wallet immediately.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAcceptModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAccept}>
            Confirm & Pay
          </Button>
        </Modal.Footer>
      </Modal>

      {/* --- MODAL 2: DISPUTE & CHAT INTERFACE --- */}
      <Modal
        show={showDisputeModal}
        onHide={() => setShowDisputeModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedRow?.status === "accepted"
              ? "Raise New Dispute"
              : "Dispute Details"}
            <span className="text-muted ms-2 text-sm">
              #{selectedRow?.awb_number}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="d-flex flex-column h-100">
            {/* 1. Evidence Section (Top) */}
            <div className="bg-light p-3 border-bottom">
              <div className="d-flex gap-2 overflow-auto">
                {selectedRow?.courier_images.map((img, i) => (
                  <a href={img} target="_blank" rel="noreferrer" key={i}>
                    <img
                      src={img}
                      className="rounded border"
                      style={{ height: "60px" }}
                      alt="proof"
                    />
                  </a>
                ))}
                <div className="ms-auto text-end">
                  <div className="small text-muted">Courier Weight</div>
                  <div className="fw-bold">{selectedRow?.charge_weight}g</div>
                </div>
              </div>
            </div>

            {/* 2. Chat Section (Middle) */}
            <div
              className="p-3"
              style={{
                height: "350px",
                overflowY: "auto",
                background: "#f8f9fa",
              }}
            >
              {selectedRow?.chat.length === 0 && (
                <div className="text-center text-muted mt-5">
                  <p>No messages yet.</p>
                  <p className="small">
                    Describe your issue below to start the dispute.
                  </p>
                </div>
              )}
              {selectedRow?.chat.map((c, i) => (
                <div
                  key={i}
                  className={`d-flex mb-2 ${
                    c.type === "reporter"
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  <div
                    className={`p-2 rounded ${
                      c.type === "reporter"
                        ? "bg-primary text-white"
                        : "bg-white border"
                    }`}
                    style={{ maxWidth: "80%" }}
                  >
                    <div
                      className="small opacity-75 mb-1"
                      style={{ fontSize: "0.7em" }}
                    >
                      {c.type === "reporter" ? "You" : "Support"} •{" "}
                      {new Date(c.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </div>
                    {c.message}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* 3. Input Section (Bottom) */}
            <div className="p-3 border-top bg-white">
              <InputGroup className="mb-2">
                <Form.Control
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button variant="primary" onClick={handleSendMessage}>
                  Send
                </Button>
              </InputGroup>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default WeightDiscrepancy;

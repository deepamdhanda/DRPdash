import React from "react";
import { Modal, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaStore, FaBriefcase } from "react-icons/fa";

// Ensure you import or define your Order type appropriately
// import { Order } from "../types";

interface EditOrderModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editOrder: any; // Replace 'any' with your 'Order' type
  setEditOrder: React.Dispatch<React.SetStateAction<any>>;
  bestAddress?: string;
  hasValue: (val: any) => boolean;
  pincodeDetails: (data: { pincode: string }) => Promise<any>;
  toast: any; // Assuming react-hot-toast or react-toastify
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({
  show,
  onHide,
  onSubmit,
  editOrder,
  setEditOrder,
  bestAddress,
  hasValue,
  pincodeDetails,
  toast,
}) => {
  // --- Handlers ---

  const handleInputChange = (field: string, value: string) => {
    setEditOrder((prev: any) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = String(e.target.value || "");
    const digits = raw.replace(/\D/g, "").slice(0, 10);

    handleInputChange("customer_phone", digits ? `91${digits}` : "");
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pincode = e.target.value;

    // Temporarily update the pincode value
    handleInputChange("shipping_pincode", pincode);

    // Only fire API if exact 6 digits
    if (!/^\d{6}$/.test(pincode)) return;

    try {
      const data = await pincodeDetails({ pincode });

      if (Array.isArray(data) && data.length > 0) {
        const postOffice = data[0];
        setEditOrder((prev: any) => ({
          ...prev,
          shipping_city: postOffice?.district || "",
          shipping_state: postOffice?.statename || "",
          shipping_country: "India",
        }));
      } else {
        setEditOrder((prev: any) => ({
          ...prev,
          shipping_city: "",
          shipping_state: "",
        }));
      }
    } catch (error) {
      toast.error("Invalid Pincode or Pincode not found");
    }
  };

  // --- Formatting Helpers ---

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString)
      .toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(",", " -");
  };

  const calculateAmount = () => {
    if (editOrder?.first_line_item_price && editOrder?.quantity) {
      return Number(editOrder.first_line_item_price) * editOrder.quantity;
    }
    return editOrder?.total_amount || "—";
  };

  const isCOD = editOrder?.payment_method?.toLowerCase().includes("cod");

  if (!editOrder) {
    return;
  }

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Order #{editOrder?.order_id || "—"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="row g-3">
            {/* --- Order Info Card --- */}
            <div className="col-lg-6">
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={{ color: "#F5891E" }}>
                    #{editOrder?.order_id || "—"}
                  </span>
                </div>
                <div style={styles.smallText}>
                  {formatDate(editOrder?.createdAt)}
                </div>

                <div style={{ paddingTop: "5px" }}>
                  <div className="d-flex align-items-center mb-1">
                    <FaStore style={styles.icon} />
                    <span style={{ color: "#000" }}>
                      {editOrder?.channel_account_name || "—"}{" "}
                      {hasValue(editOrder?.store_order_id) && (
                        <>
                          -
                          <span
                            style={styles.clickableLink}
                            title={`Store Order ID: ${String(
                              editOrder?.store_order_id
                            ).trim()}\nChannel Order ID: ${String(
                              editOrder?.channel_order_id
                            ).trim()}`}
                          >
                            {" "}
                            {String(editOrder?.store_order_id).trim()}
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <div className="d-flex align-items-center">
                    <FaBriefcase style={styles.icon} />
                    <span style={{ color: "#000" }}>
                      {editOrder?.pool_name || "—"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- Product Info Card --- */}
            <div className="col-lg-6">
              <div className="d-flex gap-2">
                <div style={{ ...styles.card, flex: 1 }}>
                  <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                    <div style={styles.productTitle}>
                      {hasValue(editOrder?.product_name) ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`product-tooltip-${editOrder?._id}`}>
                              {String(editOrder?.product_name)}
                              <br />
                              ID: {editOrder?.product_sku_id || "—"}
                            </Tooltip>
                          }
                        >
                          <span style={{ cursor: "pointer" }}>
                            {String(editOrder?.product_name)}
                          </span>
                        </OverlayTrigger>
                      ) : (
                        "—"
                      )}
                    </div>

                    <div style={{ fontStyle: "italic", color: "#555" }}>
                      SKU:{" "}
                      {editOrder?.product_sku_id ? (
                        <span style={{ cursor: "pointer" }}>
                          {String(editOrder?.product_sku_id)}
                        </span>
                      ) : (
                        "—"
                      )}
                    </div>

                    <div style={{ fontWeight: 500 }}>
                      Qty:{" "}
                      <span style={{ color: "#000434" }}>
                        {editOrder?.quantity || "—"} pcs
                      </span>
                    </div>

                    <div style={{ fontWeight: 500 }}>
                      Amt:{" "}
                      <span style={{ color: isCOD ? "#d9534f" : "#28a745" }}>
                        ₹{calculateAmount()} ({isCOD ? "COD" : "Prepaid"})
                      </span>
                    </div>

                    {editOrder?.remittance_status &&
                      editOrder?.remittance_status !== "NA" && (
                        <span
                          style={{
                            ...styles.badge,
                            backgroundColor:
                              editOrder?.remittance_status === "pending"
                                ? "#ffc107"
                                : editOrder?.remittance_status === "completed"
                                ? "#28a745"
                                : editOrder?.remittance_status === "processing"
                                ? "#007bff"
                                : "#6c757d",
                          }}
                        >
                          {editOrder?.remittance_status.toUpperCase()}
                        </span>
                      )}
                  </div>
                </div>

                {/* --- AI Recommended Address --- */}
                {bestAddress && (
                  <div style={styles.aiCard}>
                    <div style={styles.aiBadge}>🤖 OU AI Recommended</div>
                    <div style={{ fontSize: 13, marginBottom: 6 }}>
                      🏠 <b>{bestAddress}</b>
                    </div>
                    <div style={styles.aiRiskBadge}>
                      🔄 RTO Risk:{" "}
                      <span style={{ color: "#F5891E", fontWeight: 600 }}>
                        ~10%
                      </span>{" "}
                      (Low)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="mt-4 mb-3" />

          {/* --- Form Inputs --- */}
          <div className="row g-3">
            <Form.Group className="col-lg-6">
              <Form.Label>Customer Name</Form.Label>
              <Form.Control
                type="text"
                name="customer_name"
                value={editOrder?.customer_name || ""}
                onChange={(e) =>
                  handleInputChange("customer_name", e.target.value)
                }
                placeholder="Enter Customer Name"
              />
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Customer Phone Number</Form.Label>
              <Form.Control
                type="text"
                inputMode="numeric"
                maxLength={10}
                name="customer_phone"
                value={
                  editOrder?.customer_phone
                    ? String(editOrder.customer_phone)
                        .replace(/^91/, "")
                        .slice(0, 10)
                    : ""
                }
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit Phone Number"
              />
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Customer Address</Form.Label>
              <Form.Control
                type="text"
                name="shipping_address"
                value={editOrder?.shipping_address || ""}
                onChange={(e) =>
                  handleInputChange("shipping_address", e.target.value)
                }
                placeholder="Enter Customer Address"
              />
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Customer Pin Code</Form.Label>
              <Form.Control
                type="number"
                name="shipping_pincode"
                value={editOrder?.shipping_pincode || ""}
                onChange={handlePincodeChange}
                placeholder="Enter 6-digit Pin Code"
              />
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Customer City</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={editOrder?.shipping_city || ""}
                placeholder="Auto-filled via Pincode"
              />
            </Form.Group>

            <Form.Group className="col-lg-6">
              <Form.Label>Customer State</Form.Label>
              <Form.Control
                type="text"
                disabled
                value={editOrder?.shipping_state || ""}
                placeholder="Auto-filled via Pincode"
              />
            </Form.Group>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="warning" onClick={onHide}>
            Close
          </Button>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// --- Extracted Styles ---
const styles: { [key: string]: React.CSSProperties } = {
  card: {
    border: "1px solid #F5891E",
    borderRadius: 10,
    padding: "12px 16px",
    backgroundColor: "#FFFFFF",
    boxShadow: "0 1px 6px rgba(0, 0, 0, 0.06)",
    fontSize: 13,
    color: "#000434",
    fontFamily: "Hiragino Maru Gothic ProN W4",
  },
  cardHeader: { fontWeight: 600, color: "#000434" },
  smallText: { fontSize: 9 },
  icon: { marginRight: "4px", color: "#555" },
  clickableLink: { color: "#007bff", fontWeight: 500, cursor: "pointer" },
  productTitle: {
    fontWeight: 600,
    fontSize: "12px",
    color: "#000434",
    textDecoration: "underline",
    marginBottom: "4px",
  },
  badge: {
    display: "inline-block",
    marginTop: "4px",
    padding: "2px 6px",
    fontSize: "10px",
    fontWeight: 600,
    borderRadius: "4px",
    color: "#fff",
  },
  aiCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    border: "1.5px solid #F5891E",
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 600,
    fontSize: 14,
    color: "#000434",
    textAlign: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    width: "40%", // Keeps it correctly sized relative to product card
  },
  aiBadge: {
    background: "linear-gradient(135deg, #F5891E, #000434)",
    color: "#FFFFFF",
    padding: "4px 12px",
    borderRadius: 24,
    fontSize: 12,
    fontWeight: 600,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
    marginBottom: 8,
  },
  aiRiskBadge: {
    backgroundColor: "#000434",
    color: "#FFFFFF",
    fontSize: 12,
    borderRadius: 16,
    padding: "4px 10px",
    fontWeight: 500,
    boxShadow: "0 0 8px #F5891E",
    userSelect: "none",
    width: "fit-content",
  },
};

import React, { useState } from "react";
import { Modal, Form, Button, Badge, Row, Col } from "react-bootstrap";

export interface LinkOrderData {
  product_name?: string;
  total_amount?: string | number;
  channel_account_name?: string;
  items: Array<{
    product: {
      _id: string;
      product_sku_id: string;
      product_sku_name: string;
    } | null;
    variantId?: string;
    quantity: number;
  }>;
}

// Added Warehouse interfaces to support the new stock payload
export interface Warehouse {
  _id: string;
  name: string;
}

export interface WarehouseStock {
  warehouse: Warehouse;
  stock: number;
}

export interface PhysicalDetails {
  weight: string | number;
  warehouse: WarehouseStock[]; // Replaced 'warehouseStock: number' with the array payload
  length: string | number;
  breadth: string | number;
  width: string | number;
  packWeight: string | number;
}

interface LinkProductModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (variantId?: string) => void;
  linkOrderData: LinkOrderData | null;
  physicalDetails: PhysicalDetails;
  setPhysicalDetails: React.Dispatch<React.SetStateAction<PhysicalDetails>>;
  warehouses?: Warehouse[]; // New prop to pass the list of available warehouses
}

export const LinkProductModal: React.FC<LinkProductModalProps> = ({
  show,
  onHide,
  onSubmit,
  linkOrderData,
  physicalDetails,
  setPhysicalDetails,
  warehouses = [], // Default to empty array if not provided
}) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    null
  );

  const handleInputChange = (
    field: keyof PhysicalDetails,
    value: string | number
  ) => {
    setPhysicalDetails((prev) => ({ ...prev, [field]: value }));
  };

  // New handler specifically for managing the warehouse stock array
  const handleWarehouseStockChange = (wh: Warehouse, stock: number) => {
    setPhysicalDetails((prev) => {
      const existingWarehouse = prev.warehouse || [];
      const index = existingWarehouse.findIndex(
        (w) => w.warehouse._id === wh._id
      );

      const updatedWarehouse = [...existingWarehouse];
      if (index !== -1) {
        updatedWarehouse[index] = { ...updatedWarehouse[index], stock };
      } else {
        updatedWarehouse.push({ warehouse: wh, stock });
      }

      return { ...prev, warehouse: updatedWarehouse };
    });
  };

  const handleClose = () => {
    setSelectedVariantId(null);
    onHide();
  };

  return (
    <>
      <style>{`
        /* Modern SaaS Aesthetics */
        .saas-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .saas-header {
          background-color: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.25rem 1.5rem;
        }
        .saas-context-card {
          background-color: #f1f5f9;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
        }
        .item-card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          transition: all 0.2s ease;
          background: #ffffff;
        }
        .item-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transform: translateY(-1px);
        }
        .item-card.unlinked {
          background-color: #fffbeb;
          border-color: #fde68a;
        }
        .saas-input {
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          padding: 0.6rem 0.75rem;
          font-size: 0.95rem;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }
        .saas-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .saas-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .btn-saas-primary {
          background-color: #0f172a;
          color: white;
          border-radius: 8px;
          font-weight: 500;
          padding: 0.5rem 1.25rem;
          border: none;
          transition: background-color 0.2s;
        }
        .btn-saas-primary:hover {
          background-color: #334155;
          color: white;
        }
        .badge-soft-success {
          background-color: #dcfce7;
          color: #166534;
          font-weight: 600;
          padding: 0.35rem 0.65rem;
        }
        .badge-soft-warning {
          background-color: #fef3c7;
          color: #92400e;
          font-weight: 600;
          padding: 0.35rem 0.65rem;
        }
        .section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 1rem;
        }
        .step-indicator {
          background: #e2e8f0;
          color: #475569;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .warehouse-stock-list {
          background-color: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          padding: 0.75rem;
          max-height: 180px;
          overflow-y: auto;
        }
        /* Custom Scrollbar for warehouse list */
        .warehouse-stock-list::-webkit-scrollbar {
          width: 6px;
        }
        .warehouse-stock-list::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>

      <Modal
        show={show}
        onHide={handleClose}
        size="lg"
        centered
        className="saas-modal"
        backdrop="static"
      >
        <div className="saas-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>
            {selectedVariantId ? "Link Variant ID" : "Order Items"}
          </h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleClose}
          ></button>
        </div>

        <Modal.Body className="p-4">
          {linkOrderData && (
            <>
              {/* Order Context Banner */}
              <div className="saas-context-card d-flex align-items-center justify-content-between">
                <div>
                  <div
                    className="text-uppercase"
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    Source Order
                  </div>
                  <div
                    className="fw-bold"
                    style={{ color: "#0f172a", fontSize: "1.1rem" }}
                  >
                    {linkOrderData.product_name || "Unknown Product"}
                  </div>
                </div>
                <div className="text-end">
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                    }}
                  >
                    {linkOrderData.channel_account_name || "Direct"}
                  </div>
                  <div className="fw-bold text-success">
                    ₹{linkOrderData.total_amount || "0"}
                  </div>
                </div>
              </div>

              {/* VIEW 1: List */}
              {!selectedVariantId ? (
                <div>
                  <div
                    className="text-uppercase mb-3"
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    Line Items ({linkOrderData.items.length})
                  </div>
                  <div className="d-flex flex-column gap-3">
                    {linkOrderData.items.map((item, index) => {
                      const isLinked = !!item.product?.product_sku_id;

                      return (
                        <div
                          key={index}
                          className={`item-card d-flex align-items-center justify-content-between ${
                            !isLinked ? "unlinked" : ""
                          }`}
                        >
                          <div className="d-flex align-items-start gap-3">
                            <div className="mt-1">
                              {isLinked ? (
                                <Badge pill className="badge-soft-success">
                                  Linked
                                </Badge>
                              ) : (
                                <Badge pill>Action Req</Badge>
                              )}
                            </div>
                            <div>
                              {isLinked ? (
                                <>
                                  <div
                                    className="fw-bold"
                                    style={{ color: "#0f172a" }}
                                  >
                                    {item.product?.product_sku_name}
                                  </div>
                                  <div
                                    style={{
                                      color: "#64748b",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    SKU: {item.product?.product_sku_id}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div
                                    className="fw-bold"
                                    style={{ color: "#0f172a" }}
                                  >
                                    Variant: {item.variantId || "N/A"}
                                  </div>
                                  <div
                                    style={{
                                      color: "#92400e",
                                      fontSize: "0.85rem",
                                    }}
                                  >
                                    Requires physical details to link.
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-4">
                            <div className="text-center">
                              <div
                                style={{
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  color: "#64748b",
                                  textTransform: "uppercase",
                                }}
                              >
                                Qty
                              </div>
                              <div
                                className="fw-bold"
                                style={{ color: "#0f172a" }}
                              >
                                {item.quantity}
                              </div>
                            </div>

                            {!isLinked && (
                              <Button
                                variant="outline-dark"
                                size="sm"
                                style={{ borderRadius: "6px", fontWeight: 600 }}
                                onClick={() =>
                                  setSelectedVariantId(
                                    item.variantId || "unknown"
                                  )
                                }
                              >
                                Link Now &rarr;
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* VIEW 2: Form */
                <div className="animate__animated animate__fadeIn">
                  <div className="d-flex align-items-center mb-4">
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none fw-medium me-3"
                      style={{ color: "#64748b" }}
                      onClick={() => setSelectedVariantId(null)}
                    >
                      &larr; Back
                    </Button>
                    <Badge
                      bg="light"
                      text="dark"
                      className="border px-3 py-2"
                      style={{ fontSize: "0.85rem", fontWeight: 500 }}
                    >
                      Configuring Variant:{" "}
                      <strong className="ms-1">{selectedVariantId}</strong>
                    </Badge>
                  </div>

                  {/* Step 1 */}
                  <div className="mb-4">
                    <div className="section-title">
                      <span className="step-indicator">1</span>
                      Inventory Settings
                    </div>
                    <Row className="g-3 ms-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="saas-label">
                            Item Weight (kg)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0.00"
                            className="saas-input"
                            value={physicalDetails.weight}
                            onChange={(e) =>
                              handleInputChange("weight", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Label className="saas-label">
                          Initial Stock per Warehouse
                        </Form.Label>
                        <div className="warehouse-stock-list">
                          {warehouses && warehouses.length > 0 ? (
                            warehouses.map((wh) => {
                              const currentStock =
                                physicalDetails.warehouse?.find(
                                  (w) => w.warehouse._id === wh._id
                                )?.stock;

                              return (
                                <div
                                  key={wh._id}
                                  className="d-flex align-items-center justify-content-between mb-2"
                                >
                                  <div
                                    className="fw-medium text-secondary text-truncate me-2"
                                    style={{ fontSize: "0.85rem" }}
                                    title={wh.name}
                                  >
                                    {wh.name}
                                  </div>
                                  <Form.Control
                                    type="number"
                                    className="saas-input"
                                    style={{
                                      width: "90px",
                                      padding: "0.25rem 0.5rem",
                                      textAlign: "right",
                                    }}
                                    placeholder="0"
                                    value={
                                      currentStock === undefined
                                        ? ""
                                        : currentStock
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      handleWarehouseStockChange(
                                        wh,
                                        val === "" ? 0 : parseInt(val, 10)
                                      );
                                    }}
                                  />
                                </div>
                              );
                            })
                          ) : (
                            <div
                              className="text-muted"
                              style={{ fontSize: "0.85rem" }}
                            >
                              No warehouses configured.
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Step 2 */}
                  <div>
                    <div className="section-title">
                      <span className="step-indicator">2</span>
                      Logistics & Packaging
                    </div>
                    <Row className="g-3 ms-4">
                      <Col xs={6} md={3}>
                        <Form.Group>
                          <Form.Label className="saas-label">
                            Length (cm)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            className="saas-input"
                            value={physicalDetails.length}
                            onChange={(e) =>
                              handleInputChange("length", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={3}>
                        <Form.Group>
                          <Form.Label className="saas-label">
                            Breadth (cm)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            className="saas-input"
                            value={physicalDetails.breadth}
                            onChange={(e) =>
                              handleInputChange("breadth", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={3}>
                        <Form.Group>
                          <Form.Label className="saas-label">
                            Height (cm)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            className="saas-input"
                            value={physicalDetails.width}
                            onChange={(e) =>
                              handleInputChange("width", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={6} md={3}>
                        <Form.Group>
                          <Form.Label className="saas-label">
                            Pack Wt. (kg)
                          </Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0.00"
                            className="saas-input"
                            value={physicalDetails.packWeight}
                            onChange={(e) =>
                              handleInputChange("packWeight", e.target.value)
                            }
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal.Body>

        {selectedVariantId && (
          <Modal.Footer
            className="border-top p-3"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <Button
              variant="link"
              className="text-decoration-none text-muted fw-medium"
              onClick={() => setSelectedVariantId(null)}
            >
              Cancel
            </Button>
            <button
              className="btn-saas-primary"
              onClick={() => onSubmit(selectedVariantId)}
            >
              Create & Link Product
            </button>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

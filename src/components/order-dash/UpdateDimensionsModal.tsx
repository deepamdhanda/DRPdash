import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import { appAxios } from "../../axios/appAxios";
import { products_url } from "../../URLs/user";

export interface UpdateDimensionsModalProps {
  show: boolean;
  onHide: () => void;
  productId: string | null;
  onSuccess: () => void;
}

export const UpdateDimensionsModal: React.FC<UpdateDimensionsModalProps> = ({
  show,
  onHide,
  productId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [productName, setProductName] = useState<string>("");

  const [dimensions, setDimensions] = useState({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productId || !show) return;

      setLoading(true);
      try {
        const response = await appAxios.get(`${products_url}/${productId}`);
        const data = response.data;

        setProductName(data.product_name || "Unknown Product");
        setDimensions({
          length: data.length?.toString() || "",
          breadth: data.breadth?.toString() || "",
          height: data.height?.toString() || "",
          weight: data.product_weight?.toString() || "",
        });
      } catch (error) {
        console.error("Failed to fetch product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId, show]);

  const handleInputChange = (field: keyof typeof dimensions, value: string) => {
    setDimensions((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!productId) return;

    setSaving(true);
    try {
      await appAxios.patch(`${products_url}/${productId}`, {
        length: parseFloat(dimensions.length),
        breadth: parseFloat(dimensions.breadth),
        height: parseFloat(dimensions.height),
        product_weight: parseFloat(dimensions.weight),
      });

      onSuccess();
      onHide();
    } catch (error) {
      console.error("Failed to update dimensions:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) onHide();
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
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 12px;
          padding: 1rem 1.25rem;
          margin-bottom: 1.5rem;
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
        .btn-saas-primary:disabled {
          background-color: #94a3b8;
          cursor: not-allowed;
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
      `}</style>

      <Modal
        show={show}
        onHide={handleClose}
        centered
        className="saas-modal"
        backdrop="static"
      >
        <div className="saas-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold" style={{ color: "#0f172a" }}>
            Missing Logistics Data
          </h5>
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={handleClose}
            disabled={saving}
          ></button>
        </div>

        <Modal.Body className="p-4">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="secondary" />
              <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                Fetching product details...
              </p>
            </div>
          ) : (
            <div className="animate__animated animate__fadeIn">
              {/* Context Banner */}
              <div className="saas-context-card d-flex align-items-center gap-3">
                <div style={{ fontSize: "1.5rem" }}>📦</div>
                <div>
                  <div className="fw-bold" style={{ color: "#92400e" }}>
                    Action Required
                  </div>
                  <div
                    style={{
                      color: "#b45309",
                      fontSize: "0.85rem",
                      lineHeight: "1.4",
                    }}
                  >
                    <strong>{productName}</strong> is missing critical
                    dimensions required for accurate shipping calculations.
                  </div>
                </div>
              </div>

              <div className="section-title">Physical Attributes</div>

              <Row className="g-3">
                {/* Weight Input */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="saas-label">
                      Product Weight (kg) <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="e.g. 1.25"
                      className="saas-input"
                      value={dimensions.weight}
                      onChange={(e) =>
                        handleInputChange("weight", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>

                {/* Logistics Input Grid */}
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="saas-label">Length (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      className="saas-input"
                      value={dimensions.length}
                      onChange={(e) =>
                        handleInputChange("length", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="saas-label">Breadth (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      className="saas-input"
                      value={dimensions.breadth}
                      onChange={(e) =>
                        handleInputChange("breadth", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
                <Col xs={4}>
                  <Form.Group>
                    <Form.Label className="saas-label">Height (cm)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      className="saas-input"
                      value={dimensions.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>

        {!loading && (
          <Modal.Footer
            className="border-top p-3"
            style={{ backgroundColor: "#f8fafc" }}
          >
            <Button
              variant="link"
              className="text-decoration-none text-muted fw-medium"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <button
              className="btn-saas-primary"
              onClick={handleSubmit}
              disabled={
                saving ||
                !dimensions.weight ||
                !dimensions.length ||
                !dimensions.breadth ||
                !dimensions.height
              }
            >
              {saving ? "Updating..." : "Save Dimensions"}
            </button>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
};

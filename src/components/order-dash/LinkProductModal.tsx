import React from "react";
import { Modal, Form, Button } from "react-bootstrap";

export interface LinkOrderData {
  product_name?: string;
  total_amount?: string | number;
  channel_account_name?: string;
}

export interface PhysicalDetails {
  weight: string | number;
  warehouseStock: number;
  length: string | number;
  breadth: string | number;
  width: string | number;
  packWeight: string | number;
}

interface LinkProductModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: () => void;
  linkOrderData: LinkOrderData | null;
  physicalDetails: PhysicalDetails;
  setPhysicalDetails: React.Dispatch<React.SetStateAction<PhysicalDetails>>;
}

export const LinkProductModal: React.FC<LinkProductModalProps> = ({
  show,
  onHide,
  onSubmit,
  linkOrderData,
  physicalDetails,
  setPhysicalDetails,
}) => {
  // Helper to update specific fields in physicalDetails
  const handleInputChange = (
    field: keyof PhysicalDetails,
    value: string | number
  ) => {
    setPhysicalDetails((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-primary">
          🔗 Link & Create Product
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {linkOrderData && (
          <div className="container-fluid">
            {/* Read-Only Info from Order/Channel */}
            <div className="row mb-4 p-3 bg-light rounded border">
              <div className="col-md-6">
                <small className="text-muted">Product Name (From Order)</small>
                <h6 className="fw-bold">{linkOrderData.product_name || "—"}</h6>
              </div>
              <div className="col-md-3">
                <small className="text-muted">Price</small>
                <div className="fw-bold">
                  ₹{linkOrderData.total_amount || "0"}
                </div>
              </div>
              <div className="col-md-3">
                <small className="text-muted">Channel</small>
                <div>{linkOrderData.channel_account_name || "—"}</div>
              </div>
            </div>

            <h6 className="text-primary mb-3">
              📦 Step 1: Physical Details (Required)
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold">
                    Item Weight (kg)
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g. 0.5"
                    value={physicalDetails.weight}
                    onChange={(e) =>
                      handleInputChange("weight", e.target.value)
                    }
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label className="small fw-bold">
                    Initial Stock
                  </Form.Label>
                  <Form.Control
                    type="number"
                    value={physicalDetails.warehouseStock}
                    onChange={(e) =>
                      handleInputChange(
                        "warehouseStock",
                        Number(e.target.value)
                      )
                    }
                  />
                  <Form.Text className="text-muted">
                    Added to primary warehouse
                  </Form.Text>
                </Form.Group>
              </div>
            </div>

            <h6 className="text-primary mt-4 mb-3">
              📐 Step 2: Packaging Dimensions
            </h6>
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Control
                  placeholder="Length (cm)"
                  type="number"
                  value={physicalDetails.length}
                  onChange={(e) => handleInputChange("length", e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Form.Control
                  placeholder="Breadth (cm)"
                  type="number"
                  value={physicalDetails.breadth}
                  onChange={(e) => handleInputChange("breadth", e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Form.Control
                  placeholder="Width/Height (cm)"
                  type="number"
                  value={physicalDetails.width}
                  onChange={(e) => handleInputChange("width", e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <Form.Control
                  placeholder="Pack Weight (kg)"
                  type="number"
                  value={physicalDetails.packWeight}
                  onChange={(e) =>
                    handleInputChange("packWeight", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={onSubmit}>
          Create & Link Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

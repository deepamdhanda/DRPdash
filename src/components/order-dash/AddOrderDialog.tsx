import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { pincodeDetails } from "../../APIs/pincodeAPIs";

// --- Types ---
export interface OrderItem {
  product: string;
  quantity: number;
}

export interface OrderFormData {
  channel_id: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  shipping_address: string;
  shipping_pincode: string | number;
  shipping_city: string;
  shipping_state: string;
  shipping_country: string;
  total_amount: number | string;
  items: OrderItem[];
}

export interface AddOrderModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (formData: OrderFormData) => Promise<void>;
  dropdownOptions: {
    channels: Array<{ _id: string; channel_account_name: string }>;
    products: Array<{ _id: string; product_sku_name: string }>;
  };
}

const initialFormState: OrderFormData = {
  channel_id: "",
  payment_method: "",
  customer_name: "",
  customer_phone: "",
  shipping_address: "",
  shipping_pincode: "",
  shipping_city: "",
  shipping_state: "",
  shipping_country: "India",
  total_amount: "",
  items: [{ product: "", quantity: 1 }],
};

const AddOrderModal: React.FC<AddOrderModalProps> = ({
  show,
  onClose,
  onSubmit,
  dropdownOptions,
}) => {
  const [formData, setFormData] = useState<OrderFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setFormData(initialFormState);
    }
  }, [show]);

  // --- Handlers ---
  const handleInputChange = (field: keyof OrderFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(-10);
    if (digits.length === 10) {
      handleInputChange("customer_phone", `91${digits}`);
    } else {
      handleInputChange("customer_phone", digits); // Store raw typing until 10 digits are hit
    }
  };

  const handlePincodeChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const pincode = e.target.value;
    handleInputChange("shipping_pincode", pincode);

    if (/^\d{6}$/.test(pincode)) {
      try {
        const data = await pincodeDetails({ pincode });
        if (data?.[0]) {
          setFormData((prev) => ({
            ...prev,
            shipping_city: data[0].district,
            shipping_state: data[0].statename,
            shipping_country: "India",
          }));
        }
      } catch (error) {
        toast.error("Pincode not found");
      }
    }
  };

  // --- Items Array Handlers ---
  const handleItemChange = (
    index: number,
    field: keyof OrderItem,
    value: string | number
  ) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleInputChange("items", updatedItems);
  };

  const handleAddItem = () => {
    handleInputChange("items", [
      ...formData.items,
      { product: "", quantity: 1 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    handleInputChange("items", updatedItems);
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.items.some((item) => !item.product)) {
      return toast.error("Please select a product for all items.");
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered backdrop="static">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h5 fw-bold">Add Manual Order</Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Row className="g-3">
            {/* --- CHANNEL & PAYMENT --- */}
            <Form.Group as={Col} lg={6}>
              <Form.Label className="small fw-bold text-muted">
                Channel Account
              </Form.Label>
              <Form.Select
                required
                value={formData.channel_id}
                onChange={(e) =>
                  handleInputChange("channel_id", e.target.value)
                }
              >
                <option value="" disabled>
                  Select a Channel Account
                </option>
                {dropdownOptions.channels.map((account) => (
                  <option key={account._id} value={account._id}>
                    {account.channel_account_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} lg={6}>
              <Form.Label className="small fw-bold text-muted">
                Payment Method
              </Form.Label>
              <Form.Select
                required
                value={formData.payment_method}
                onChange={(e) =>
                  handleInputChange("payment_method", e.target.value)
                }
              >
                <option value="" disabled>
                  Select Method
                </option>
                <option value="COD">COD - Cash on Delivery</option>
                <option value="PREPAID">Prepaid</option>
              </Form.Select>
            </Form.Group>

            {/* --- CUSTOMER DETAILS --- */}
            <Form.Group as={Col} lg={6}>
              <Form.Label className="small fw-bold text-muted">
                Customer Name
              </Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Full Name"
                value={formData.customer_name}
                onChange={(e) =>
                  handleInputChange("customer_name", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group as={Col} lg={6}>
              <Form.Label className="small fw-bold text-muted">
                Phone Number
              </Form.Label>
              <Form.Control
                type="tel"
                required
                placeholder="10-digit mobile number"
                value={formData.customer_phone.replace(/^91/, "")} // Strip 91 for display
                onChange={handlePhoneChange}
              />
            </Form.Group>

            {/* --- ADDRESS --- */}
            <Form.Group as={Col} lg={12}>
              <Form.Label className="small fw-bold text-muted">
                Full Address
              </Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Street, Landmark, Apartment"
                value={formData.shipping_address}
                onChange={(e) =>
                  handleInputChange("shipping_address", e.target.value)
                }
              />
            </Form.Group>

            <Form.Group as={Col} lg={4}>
              <Form.Label className="small fw-bold text-muted">
                Pincode
              </Form.Label>
              <Form.Control
                type="text"
                required
                maxLength={6}
                placeholder="6 Digit Pincode"
                value={formData.shipping_pincode}
                onChange={handlePincodeChange}
              />
            </Form.Group>

            <Form.Group as={Col} lg={4}>
              <Form.Label className="small fw-bold text-muted">City</Form.Label>
              <Form.Control
                type="text"
                readOnly
                placeholder="Auto-filled via Pincode"
                value={formData.shipping_city}
              />
            </Form.Group>

            <Form.Group as={Col} lg={4}>
              <Form.Label className="small fw-bold text-muted">
                State
              </Form.Label>
              <Form.Control
                type="text"
                readOnly
                placeholder="Auto-filled via Pincode"
                value={formData.shipping_state}
              />
            </Form.Group>

            {/* --- DYNAMIC ITEMS SECTION --- */}
            <Col lg={12} className="mt-4">
              <div className="p-4 bg-light rounded border">
                <h6 className="fw-bold mb-3">Order Items</h6>

                {formData.items.map((item, index) => (
                  <Row className="align-items-end mb-3" key={index}>
                    <Form.Group as={Col} md={7}>
                      <Form.Label className="small text-muted">
                        Select Product
                      </Form.Label>
                      <Form.Select
                        required
                        value={item.product}
                        onChange={(e) =>
                          handleItemChange(index, "product", e.target.value)
                        }
                      >
                        <option value="" disabled>
                          Select a Product SKU
                        </option>
                        {dropdownOptions.products.map((sku) => (
                          <option key={sku._id} value={sku._id}>
                            {sku.product_sku_name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <Form.Group as={Col} md={3}>
                      <Form.Label className="small text-muted">
                        Quantity
                      </Form.Label>
                      <Form.Control
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "quantity",
                            Number(e.target.value)
                          )
                        }
                      />
                    </Form.Group>

                    <Col md={2}>
                      {formData.items.length > 1 && (
                        <Button
                          variant="outline-danger"
                          className="w-100"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </Col>
                  </Row>
                ))}

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleAddItem}
                  className="fw-bold"
                >
                  + Add Another Item
                </Button>
              </div>
            </Col>

            {/* --- ORDER TOTAL --- */}
            <Form.Group as={Col} lg={12}>
              <Form.Label className="small fw-bold text-muted">
                Total Order Amount (₹)
              </Form.Label>
              <Form.Control
                type="number"
                required
                min="1"
                placeholder="Enter Total Final Amount"
                value={formData.total_amount}
                onChange={(e) =>
                  handleInputChange("total_amount", Number(e.target.value))
                }
              />
            </Form.Group>
          </Row>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddOrderModal;

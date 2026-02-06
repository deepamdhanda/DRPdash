import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Modal, Stack, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/customer/CustomerLayout";
import { ArrowLeft, Truck, MapPin, XCircle, Package, Edit } from "lucide-react";
import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { Order } from "../../Types/types";
import { toast } from "react-toastify";

type OrderParams = {
  orderId: string;
};

const OrderDashboard: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const { orderId } = useParams<OrderParams>();
  const navigate = useNavigate();

  const [showCancel, setShowCancel] = useState<boolean>(false);
  const [showAddress, setShowAddress] = useState<boolean>(false);
  const [trigger, setTrigger] = useState(false);
  // Mock status
  const isDelivered = false;
  const fetchOrders = async () => {
    try {
      const { data } = await customerAxios.get(
        `${drpCrmBaseUrl}/customer/orders/${orderId}`
      );
      setOrder(data.data);
      setFormData(data.data.customer_address_id);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, [trigger]);

  const handleCancel = async (reason: string) => {
    try {
      await customerAxios.patch(`${drpCrmBaseUrl}/customer/orders/${orderId}`, {
        reason,
      });
      toast.success("Updated successfully");
      setShowCancel(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  const [formData, setFormData] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await customerAxios.put(
        `${drpCrmBaseUrl}/customer/orders/${orderId}`,
        formData
      );
      toast.success("Address Updated Successfully");
      setShowAddress(false);
      setTrigger(!trigger);
    } catch (error) {
      console.error("Failed to update address", error);
    }
  };
  const [cancelReason, setCancelReason] = useState("");

  const cancellationReasons = [
    "Ordered by mistake / Change of mind",
    "Found a better price elsewhere",
    "Delivery time is too long",
    "Forgot to apply a discount code",
    "Incorrect shipping address",
    "Other",
  ];

  const handleConfirm = () => {
    handleCancel(cancelReason);
    setShowCancel(false);
  };
  return (
    <Layout title={`Order Details`}>
      <Button
        variant="link"
        onClick={() => navigate("/customer/order")}
        className="text-decoration-none ps-0 mb-4 text-amber fw-semibold d-flex align-items-center"
      >
        <ArrowLeft size={18} className="me-2" /> Back to Orders
      </Button>

      <Row className="g-4">
        {/* LEFT COLUMN: Order Info */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4 overflow-hidden">
            <div className="bg-white border-bottom p-4 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small text-uppercase fw-bold tracking-wider">
                  Order Reference
                </span>
                <h4 className="fw-bold mb-0">#{orderId}</h4>
              </div>
              {/* <Badge
                className={`status-badge ${
                  isDelivered ? "status-delivered" : "status-processing"
                }`}
              >
                {isDelivered ? "Delivered" : "In Progress"}
              </Badge> */}
            </div>

            <Card.Body className="p-4">
              {/* Items Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold mb-0 d-flex align-items-center">
                    <Package size={18} className="me-2 text-amber" /> Items
                    Summary
                  </h6>
                </div>

                <div className="d-flex align-items-center p-3 border rounded-3 mb-2 bg-light-subtle">
                  <div className="product-placeholder me-3">
                    <Package size={24} className="text-muted" />
                  </div>
                  <div className="flex-grow-1">
                    <p className="mb-0 fw-bold text-dark">
                      {order?.product_name}
                    </p>
                    <small className="text-muted">
                      {" "}
                      Qty: {order?.quantity}
                    </small>
                  </div>
                  <div className="fw-bold text-dark">
                    ₹{order?.total_amount}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <MapPin size={18} className="me-2 text-amber" /> Shipping
                  Address
                </h6>
                <div className="p-3 bg-light border rounded-3 d-flex justify-content-between align-items-start">
                  <div>
                    <p className="mb-1 fw-medium text-dark">
                      {order?.customer_name}
                    </p>
                    <p className="mb-0 small text-muted">
                      {order?.customer_address_id.addressLine1},
                      {order?.customer_address_id.addressLine2}
                      <br />
                      {order?.customer_address_id.city},{" "}
                      {order?.customer_address_id.state}{" "}
                      {order?.customer_address_id.pincode}
                    </p>
                  </div>
                  {!isDelivered && (
                    <Button
                      variant="link"
                      className="text-amber p-0 text-decoration-none small fw-bold"
                      onClick={() => setShowAddress(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN: Summary & Actions */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm p-4 mb-4">
            <h6 className="fw-bold mb-4 border-bottom pb-2">Order Summary</h6>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Subtotal</span>
              <span className="fw-medium text-dark">
                ₹{order?.total_amount}
              </span>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Shipping</span>
              <span className="text-success fw-medium">FREE</span>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-4">
              <span className="fw-bold">Total</span>
              <span className="fw-bold fs-5 text-dark">
                ₹{order?.total_amount}
              </span>
            </div>

            <Stack gap={3}>
              <Button
                className="btn-amber w-100 py-2 fw-bold d-flex align-items-center justify-content-center border-0"
                onClick={() => navigate(`/customer/track/${orderId}`)}
              >
                <Truck size={18} className="me-2" /> Track Package
              </Button>

              <Button
                variant="outline-dark"
                className="w-100 py-2 fw-bold d-flex align-items-center justify-content-center"
                onClick={() => setShowAddress(true)}
              >
                <Edit size={18} className="me-2" /> Update Address
              </Button>

              {!isDelivered && (
                <Button
                  variant="link"
                  className="text-danger mt-2 small text-decoration-none fw-bold"
                  onClick={() => setShowCancel(true)}
                >
                  <XCircle size={16} className="me-1" /> Cancel Order
                </Button>
              )}
            </Stack>
          </Card>
        </Col>
      </Row>

      {/* Modals are updated to match the theme in the CSS below */}
      <Modal show={showCancel} onHide={() => setShowCancel(false)} centered>
        <Modal.Body className="p-4 text-center">
          <div className="text-danger mb-3">
            <XCircle size={48} />
          </div>
          <h4 className="fw-bold">Cancel Order?</h4>
          <p className="text-muted">
            Please select a reason for cancellation. This action cannot be
            undone.
          </p>

          {/* Reason Selection */}
          <Form className="text-start my-4 px-2">
            {cancellationReasons.map((reason, index) => (
              <Form.Check
                type="radio"
                name="cancelReason"
                id={`reason-${index}`}
                key={index}
                label={reason}
                className="mb-2 small fw-medium"
                onChange={() => setCancelReason(reason)}
                checked={cancelReason === reason}
              />
            ))}
          </Form>

          <div className="d-flex gap-2 mt-4">
            <Button
              variant="light"
              className="flex-grow-1 fw-bold"
              onClick={() => setShowCancel(false)}
            >
              No, Keep
            </Button>
            <Button
              variant="danger"
              className="flex-grow-1 fw-bold"
              onClick={handleConfirm}
              // Disable button if no reason is selected
              disabled={!cancelReason}
            >
              Yes, Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showAddress} onHide={() => setShowAddress(false)} centered>
        <Modal.Header closeButton className="border-0 px-4 pt-4">
          <Modal.Title className="fw-bold">Update Shipping Address</Modal.Title>
        </Modal.Header>

        <Modal.Body className="px-4 pb-4">
          <p className="text-muted small mb-4">
            Changes are only possible before the order is shipped.
          </p>

          <Form onSubmit={handleSubmit}>
            {/* Address Line 1 */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Address Line 1
              </Form.Label>
              <Form.Control
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="House No, Building, Street"
                required
              />
            </Form.Group>

            {/* Address Line 2 */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold">
                Address Line 2 (Optional)
              </Form.Label>
              <Form.Control
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Area, Landmark"
              />
            </Form.Group>

            {/* City & State in one row */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold">State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Pincode */}
            <Form.Group className="mb-4">
              <Form.Label className="small fw-semibold">Pincode</Form.Label>
              <Form.Control
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="6-digit code"
                required
              />
            </Form.Group>

            <Button
              type="submit"
              className="btn-amber w-100 border-0 fw-bold py-2"
            >
              Save Address
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Layout>
  );
};

export default OrderDashboard;

"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
} from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../components/customer/CustomerLayout";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Copy,
} from "lucide-react";
import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";

const TrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const { data } = await customerAxios.get(
        `${drpCrmBaseUrl}/customer/orders/tracking/${orderId}`
      );
      setOrder(data.data);
    } catch (err) {
      console.error("Failed to fetch tracking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [orderId]);

  // --- DATA MAPPING LOGIC ---
  const trackingData = useMemo(() => {
    if (!order || !order.status)
      return { steps: [], edd: "TBA", currentStatus: "" };

    // 1. Sort status by date (Latest first for UI, or reverse if you want chronological)
    const sortedStatuses = [...order.status].sort(
      (a, b) =>
        new Date(b.status_date).getTime() - new Date(a.status_date).getTime()
    );

    // 2. Map to UI Steps
    const steps = sortedStatuses.map((s, index) => ({
      status: s.status.replace(/_/g, " "), // e.g. re_activate -> re activate
      date: new Date(s.status_date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: s.status_details?.origin || s.status_details?.destination || "",
      desc: s.status_details?.courier_name || "Status updated in system",
      completed: true, // If it's in the status array, it's a past event
      current: index === 0, // Most recent is the current state
    }));

    // 3. Extract EDD (Estimated Delivery Date) from the latest status with details
    const eddStatus = order.status.find((s: any) => s.status_details?.edd);
    const edd = eddStatus?.status_details?.edd || "Standard Delivery";

    return { steps, edd, currentStatus: steps[0]?.status || "" };
  }, [order]);

  if (loading)
    return (
      <Layout title="Loading...">
        <div className="p-5 text-center">Loading Tracking Info...</div>
      </Layout>
    );
  if (!order)
    return (
      <Layout title="Error">
        <div className="p-5 text-center text-danger">
          Failed to retrieve data
        </div>
      </Layout>
    );

  return (
    <Layout title="Track Package">
      <Container className="p-0">
        <Button
          variant="link"
          onClick={() => navigate(-1)}
          className="text-decoration-none ps-0 mb-4 text-secondary d-flex align-items-center"
        >
          <ArrowLeft size={18} className="me-2" /> Back to Order Details
        </Button>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4 overflow-hidden">
              <div className="bg-amber-light p-4 d-flex align-items-center justify-content-between">
                <div>
                  <p className="text-amber fw-bold mb-1 small text-uppercase tracking-wider">
                    Estimated Delivery
                  </p>
                  <h2 className="fw-bold mb-0 text-dark">{trackingData.edd}</h2>
                  <p className="text-muted small mb-0 mt-1">
                    Current Status: {trackingData.currentStatus}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-circle shadow-sm text-amber">
                  <Truck size={32} />
                </div>
              </div>

              <Card.Body className="p-4">
                <p className="fw-bold mb-2 small text-muted">
                  Shipment Progress
                </p>
                {/* Visual Progress: based on number of steps / 6 (assuming 6 steps total for 100%) */}
                <ProgressBar
                  now={Math.min((trackingData.steps.length / 6) * 100, 100)}
                  className="custom-progress mb-4"
                />

                <div className="timeline-container ps-2">
                  {trackingData.steps.map((step, index) => (
                    <div
                      key={index}
                      className="d-flex position-relative pb-5 timeline-item"
                    >
                      {index !== trackingData.steps.length - 1 && (
                        <div className="timeline-line bg-dark"></div>
                      )}

                      <div className="me-4 position-relative z-1">
                        {step.current ? (
                          <div className="pulse-container">
                            <div
                              className="bg-amber rounded-circle d-flex align-items-center justify-content-center text-white"
                              style={{ width: 32, height: 32 }}
                            >
                              <Truck size={16} />
                            </div>
                          </div>
                        ) : (
                          <div
                            className="bg-black rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: 32, height: 32 }}
                          >
                            <CheckCircle2 size={18} />
                          </div>
                        )}
                      </div>

                      <div className={step.current ? "" : "opacity-75"}>
                        <h6
                          className={`fw-bold mb-1 capitalize ${
                            step.current ? "text-amber" : "text-dark"
                          }`}
                        >
                          {step.status}
                        </h6>
                        <p className="text-muted small mb-1">{step.desc}</p>
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted fw-semibold bg-light px-2 py-1 rounded">
                            <Clock size={12} className="me-1" /> {step.date}
                          </small>
                          {step.location && (
                            <small className="text-muted">
                              <MapPin size={12} className="me-1" />{" "}
                              {step.location}
                            </small>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Courier Details from latest status */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <Package size={18} className="me-2 text-amber" /> Courier
                  Details
                </h6>
                <div className="d-flex align-items-center justify-content-between mb-3 bg-light p-3 rounded-3">
                  <span className="fw-bold">
                    {order.status.find(
                      (s: any) => s.status_details?.courier_name
                    )?.status_details.courier_name || "Shipping Partner"}
                  </span>
                </div>

                <div className="mb-3">
                  <label className="small text-muted fw-bold">AWB Code</label>
                  <div className="d-flex align-items-center mt-1">
                    <span className="fs-6 fw-bold me-2 font-monospace">
                      {order.status.find((s: any) => s.status_details?.awb_code)
                        ?.status_details.awb_code || "N/A"}
                    </span>
                    <Button variant="link" size="sm" className="text-muted p-0">
                      <Copy size={16} />
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Address from customer_address_id */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-3 d-flex align-items-center">
                  <MapPin size={18} className="me-2 text-amber" /> Shipping To
                </h6>
                <p className="mb-1 fw-bold">
                  {order.customer_address_id?.name}
                </p>
                <p className="text-muted small mb-0">
                  {order.customer_address_id?.addressLine1},{" "}
                  {order.customer_address_id?.addressLine2}
                  <br />
                  {order.customer_address_id?.city},{" "}
                  {order.customer_address_id?.state}{" "}
                  {order.customer_address_id?.pincode}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Layout>
  );
};

export default TrackingPage;

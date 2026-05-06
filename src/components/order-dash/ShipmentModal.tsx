import {
  CheckCircle2,
  Info,
  MapPin,
  PackageOpen,
  Plane,
  Scale,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Col,
  Form,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";

function ShipmentModal({
  showShipmentModal,
  handleShipmentClose,
  shipmentOrder,
  shipmentDetails,
  handleBookShipment,
}: any) {
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [sortBy, setSortBy] = useState("recommended"); // recommended, cheapest, fastest, best-rated
  const [filterType, setFilterType] = useState("all"); // all, air, surface

  // Process and sort couriers
  const { couriers, cheapestId, fastestId, bestRatedId } = useMemo(() => {
    if (!shipmentDetails?.couriers) {
      return {
        couriers: [],
        cheapestId: null,
        fastestId: null,
        bestRatedId: null,
      };
    }

    let list = [...shipmentDetails.couriers];

    // Helper to determine if a courier is surface (since the new API doesn't explicitly send is_surface)
    const checkIsSurface = (c: any) =>
      c.is_surface === true || c.name?.toLowerCase().includes("surface");

    // Identify smart tags using _id and total_amount
    const cheapest = [...list].sort(
      (a, b) => a.total_amount - b.total_amount
    )[0]?._id;
    const fastest = [...list].sort(
      (a, b) =>
        Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
    )[0]?._id;
    const bestRated = [...list].sort((a, b) => b.rating - a.rating)[0]?._id;

    // Filter
    if (filterType === "air") list = list.filter((c) => !checkIsSurface(c));
    if (filterType === "surface") list = list.filter((c) => checkIsSurface(c));

    // Sort using total_amount instead of rate
    if (sortBy === "cheapest")
      list.sort((a, b) => a.total_amount - b.total_amount);
    if (sortBy === "fastest")
      list.sort(
        (a, b) =>
          Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
      );
    if (sortBy === "best-rated") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "recommended") {
      // Custom recommendation logic: high rating + lower price
      list.sort(
        (a, b) => b.rating - a.rating || a.total_amount - b.total_amount
      );
    }

    return {
      couriers: list,
      cheapestId: cheapest,
      fastestId: fastest,
      bestRatedId: bestRated,
    };
  }, [shipmentDetails, sortBy, filterType]);

  const primaryDark = "#000434";
  const primaryAccent = "#F5891E";
  const softShadow = "0 2px 12px rgba(0,0,0,0.04)";
  const cardBorder = "1px solid #f1f3f5";

  return (
    <Modal
      show={showShipmentModal}
      onHide={handleShipmentClose}
      size="xl"
      centered
      backdrop="static"
    >
      <Modal.Header
        closeButton
        style={{
          backgroundColor: "#ffffff",
          borderBottom: cardBorder,
          padding: "16px 24px",
        }}
      >
        <Modal.Title
          style={{
            color: primaryDark,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "20px",
          }}
        >
          <PackageOpen color={primaryAccent} size={24} />
          Process Shipment
          <span
            style={{
              fontSize: "13px",
              backgroundColor: "#FFF7F0",
              color: primaryAccent,
              padding: "4px 10px",
              borderRadius: "6px",
              marginLeft: "8px",
              border: `1px solid ${primaryAccent}`,
              fontWeight: 600,
            }}
          >
            Order #{shipmentOrder?.order_id || "—"}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#f8f9fb", padding: "24px" }}>
        {shipmentDetails ? (
          <div className="d-flex flex-column" style={{ gap: "24px" }}>
            {/* ================= 1. TOP SUMMARY BAR ================= */}
            <Row className="g-3">
              {/* Dispatch From */}
              <Col lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-3"
                  style={{
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: softShadow,
                  }}
                >
                  <div
                    className="mt-1 p-2 rounded"
                    style={{ backgroundColor: "#FFF7F0" }}
                  >
                    <Store color={primaryAccent} size={20} />
                  </div>
                  <div>
                    <div
                      className="text-muted text-uppercase fw-bold mb-1"
                      style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                    >
                      Dispatch From
                    </div>
                    <div
                      className="fw-bold text-truncate"
                      style={{ fontSize: "13px", color: primaryDark }}
                    >
                      {shipmentDetails.fulfillment.warehouseDetails.name}
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "11px", lineHeight: "1.4" }}
                    >
                      {shipmentDetails.fulfillment.warehouseDetails.City},{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.State} -{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.pincode}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Shipping To */}
              <Col lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-3"
                  style={{
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: softShadow,
                  }}
                >
                  <div
                    className="mt-1 p-2 rounded"
                    style={{ backgroundColor: "#E6F4EA" }}
                  >
                    <MapPin color="#28a745" size={20} />
                  </div>
                  <div>
                    <div
                      className="text-muted text-uppercase fw-bold mb-1"
                      style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                    >
                      Shipping To
                    </div>
                    <div
                      className="fw-bold text-truncate"
                      style={{ fontSize: "13px", color: primaryDark }}
                    >
                      {shipmentOrder?.customer_name}
                    </div>
                    <div
                      className="text-muted mt-1"
                      style={{ fontSize: "11px", lineHeight: "1.4" }}
                    >
                      {shipmentOrder?.shipping_city},{" "}
                      {shipmentOrder?.shipping_state} -{" "}
                      {shipmentOrder?.shipping_pincode}
                    </div>
                    <div
                      className="mt-1 fw-bold"
                      style={{
                        fontSize: "11px",
                        color: shipmentOrder?.payment_method
                          ?.toLowerCase()
                          .includes("cod")
                          ? "#d9534f"
                          : "#28a745",
                      }}
                    >
                      {shipmentOrder?.payment_method
                        ?.toLowerCase()
                        .includes("cod")
                        ? "💰 COD: "
                        : "💳 Prepaid: "}{" "}
                      ₹{shipmentOrder?.total_amount}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Weight Summary */}
              <Col lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-3 position-relative"
                  style={{
                    borderRadius: "10px",
                    border: cardBorder,
                    boxShadow: softShadow,
                  }}
                >
                  <div
                    className="mt-1 p-2 rounded"
                    style={{ backgroundColor: "#F0F4FF" }}
                  >
                    <Scale color="#4285F4" size={20} />
                  </div>
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div
                        className="text-muted text-uppercase fw-bold"
                        style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                      >
                        Weight Summary
                      </div>
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip>
                            Higher of actual & volumetric is charged
                          </Tooltip>
                        }
                      >
                        <Info
                          size={14}
                          color="#adb5bd"
                          style={{ cursor: "pointer" }}
                        />
                      </OverlayTrigger>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: primaryDark,
                            fontWeight: 600,
                          }}
                        >
                          {shipmentDetails.weight.actual} kg
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          Actual
                        </div>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "14px", opacity: 0.5 }}
                      >
                        /
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: primaryDark,
                            fontWeight: 600,
                          }}
                        >
                          {shipmentDetails.weight.volumetric} kg
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "10px" }}
                        >
                          Volumetric
                        </div>
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "14px", opacity: 0.5 }}
                      >
                        =
                      </div>
                      <div
                        className="text-end px-2 py-1 rounded"
                        style={{ backgroundColor: "rgba(40, 167, 69, 0.1)" }}
                      >
                        <div
                          style={{
                            color: "#28a745",
                            fontSize: "14px",
                            fontWeight: 800,
                          }}
                        >
                          {shipmentDetails.weight.billable} kg
                        </div>
                        <div
                          className="fw-bold"
                          style={{ fontSize: "9px", color: "#28a745" }}
                        >
                          BILLABLE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* ================= 2. PACKAGE SELECTION ================= */}
            <div>
              <h6
                className="fw-bold text-uppercase mb-2"
                style={{
                  fontSize: "11px",
                  color: "#6c757d",
                  letterSpacing: "0.5px",
                }}
              >
                Select Packaging{" "}
                <span className="text-lowercase fw-normal ms-1">
                  ({shipmentDetails.recommendedPacks.length} options)
                </span>
              </h6>
              <Row className="g-3">
                {shipmentDetails.recommendedPacks.map(
                  (pack: any, index: number) => {
                    const isSelected = selectedPackageIndex === index;
                    return (
                      <Col md={6} lg={4} key={index}>
                        <div
                          onClick={() => setSelectedPackageIndex(index)}
                          className="d-flex align-items-center p-3 position-relative"
                          style={{
                            backgroundColor: isSelected ? "#FFF7F0" : "#ffffff",
                            border: isSelected
                              ? `1px solid ${primaryAccent}`
                              : cardBorder,
                            borderRadius: "10px",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            boxShadow: isSelected
                              ? "0 4px 12px rgba(245, 137, 30, 0.15)"
                              : softShadow,
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected)
                              e.currentTarget.style.transform = "translateY(0)";
                          }}
                        >
                          {isSelected && (
                            <CheckCircle2
                              color={primaryAccent}
                              size={18}
                              style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                backgroundColor: "#fff",
                                borderRadius: "50%",
                              }}
                            />
                          )}

                          <div
                            className="me-3 p-2 rounded-circle"
                            style={{
                              backgroundColor: isSelected
                                ? "rgba(245, 137, 30, 0.1)"
                                : "#f8f9fa",
                            }}
                          >
                            <PackageOpen
                              size={20}
                              color={isSelected ? primaryAccent : "#6c757d"}
                            />
                          </div>

                          <div className="flex-grow-1">
                            <div
                              className="fw-bold text-truncate"
                              style={{
                                fontSize: "13px",
                                color: isSelected ? "#a05206" : primaryDark,
                              }}
                            >
                              {pack.name}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "11px" }}
                            >
                              {pack.length} × {pack.breadth} × {pack.height} cm
                            </div>
                          </div>

                          <div
                            className="text-end ps-2"
                            style={{ borderLeft: "1px solid #e9ecef" }}
                          >
                            <div
                              className="fw-bold"
                              style={{ fontSize: "12px", color: primaryDark }}
                            >
                              ₹{pack.packingCost}
                            </div>
                            <div
                              className="text-muted"
                              style={{ fontSize: "10px" }}
                            >
                              Max {pack.maxWeight}kg
                            </div>
                          </div>
                        </div>
                      </Col>
                    );
                  }
                )}
              </Row>
            </div>

            {/* ================= 3. COURIER OPTIONS ================= */}
            <div
              className="d-flex flex-column flex-grow-1 bg-white p-3"
              style={{
                borderRadius: "12px",
                border: cardBorder,
                boxShadow: softShadow,
              }}
            >
              {/* Controls Toolbar */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 pb-3 border-bottom gap-3">
                <div className="d-flex align-items-center gap-2">
                  <h6
                    className="fw-bold mb-0 me-2"
                    style={{ color: primaryDark, fontSize: "15px" }}
                  >
                    Available Couriers
                  </h6>
                  <Badge
                    bg="light"
                    text="dark"
                    style={{ border: "1px solid #dee2e6", fontWeight: 600 }}
                  >
                    {couriers.length} Options
                  </Badge>
                </div>

                <div className="d-flex gap-3 align-items-center">
                  {/* Sorting */}
                  <div
                    className="d-flex rounded"
                    style={{
                      backgroundColor: "#f8f9fa",
                      padding: "4px",
                      border: cardBorder,
                    }}
                  >
                    {["recommended", "cheapest", "fastest", "best-rated"].map(
                      (sortOption) => (
                        <button
                          key={sortOption}
                          onClick={() => setSortBy(sortOption)}
                          style={{
                            border: "none",
                            background:
                              sortBy === sortOption ? "#fff" : "transparent",
                            color:
                              sortBy === sortOption ? primaryDark : "#6c757d",
                            padding: "4px 12px",
                            fontSize: "11px",
                            fontWeight: sortBy === sortOption ? 700 : 500,
                            borderRadius: "4px",
                            boxShadow:
                              sortBy === sortOption
                                ? "0 1px 3px rgba(0,0,0,0.1)"
                                : "none",
                            textTransform: "capitalize",
                            transition: "all 0.2s",
                          }}
                        >
                          {sortOption.replace("-", " ")}
                        </button>
                      )
                    )}
                  </div>

                  {/* Filter Toggle */}
                  <Form.Select
                    size="sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{
                      width: "120px",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderColor: "#dee2e6",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Types</option>
                    <option value="air">✈️ Air Only</option>
                    <option value="surface">🚚 Surface Only</option>
                  </Form.Select>
                </div>
              </div>

              {/* Courier List */}
              <div
                className="p-3"
                style={{ overflowY: "auto", maxHeight: "40vh" }}
              >
                {couriers.length === 0 ? (
                  <div
                    className="text-center py-4 text-muted"
                    style={{ fontSize: "13px" }}
                  >
                    No couriers match your filter criteria.
                  </div>
                ) : (
                  couriers.map((courier: any) => {
                    // Update variables to use `_id`
                    const isCheapest = courier._id === cheapestId;
                    const isFastest = courier._id === fastestId;
                    const isBestRated = courier._id === bestRatedId;
                    const isRecommended =
                      sortBy === "recommended" &&
                      courier._id === couriers[0]?._id;

                    // Derive surface flag safely from name if is_surface is missing
                    const isSurfaceCourier =
                      courier.is_surface === true ||
                      courier.name?.toLowerCase().includes("surface");

                    return (
                      <div
                        key={courier._id} // Changed to _id
                        className="mb-3 p-3 position-relative"
                        style={{
                          border: isRecommended
                            ? `1px solid ${primaryAccent}80`
                            : cardBorder,
                          backgroundColor: isRecommended
                            ? "#FFFAF5"
                            : "#ffffff",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 6px 16px rgba(0,0,0,0.06)";
                          e.currentTarget.style.borderColor = isRecommended
                            ? primaryAccent
                            : "#ced4da";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = isRecommended
                            ? `1px solid ${primaryAccent}80`
                            : cardBorder;
                        }}
                      >
                        {/* Smart Tags Array */}
                        <div
                          style={{
                            position: "absolute",
                            top: "-10px",
                            left: "16px",
                            display: "flex",
                            gap: "6px",
                          }}
                        >
                          {isRecommended && (
                            <span
                              style={{
                                background:
                                  "linear-gradient(135deg, #F5891E, #E0730A)",
                                color: "#fff",
                                padding: "2px 10px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              ★ Recommended
                            </span>
                          )}
                          {isCheapest && (
                            <span
                              style={{
                                backgroundColor: "#E6F4EA",
                                color: "#137333",
                                border: "1px solid #CEEAD6",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              📉 Cheapest
                            </span>
                          )}
                          {isFastest && (
                            <span
                              style={{
                                backgroundColor: "#E8F0FE",
                                color: "#1967D2",
                                border: "1px solid #D2E3FC",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              ⚡ Fastest
                            </span>
                          )}
                          {isBestRated && (
                            <span
                              style={{
                                backgroundColor: "#FEF7E0",
                                color: "#B06000",
                                border: "1px solid #FCE8B2",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                fontSize: "9px",
                                fontWeight: 700,
                              }}
                            >
                              🏆 Top Rated
                            </span>
                          )}
                        </div>

                        <Row className="align-items-center mt-2">
                          {/* LEFT: Courier Identity */}
                          <Col md={4} className="d-flex align-items-center">
                            <div
                              className="d-flex justify-content-center align-items-center me-3"
                              style={{
                                width: "42px",
                                height: "42px",
                                borderRadius: "8px",
                                backgroundColor: isSurfaceCourier
                                  ? "#F3F4F6"
                                  : "#EBF5FF",
                                color: isSurfaceCourier ? "#4B5563" : "#3B82F6",
                              }}
                            >
                              {isSurfaceCourier ? (
                                <Truck size={20} />
                              ) : (
                                <Plane size={20} />
                              )}
                            </div>
                            <div>
                              <div
                                className="fw-bold"
                                style={{ fontSize: "14px", color: primaryDark }}
                              >
                                {courier.courier_name}
                              </div>
                              <div
                                className="d-flex align-items-center gap-2 mt-1"
                                style={{ fontSize: "11px" }}
                              >
                                <span className="d-flex align-items-center gap-1 text-muted">
                                  <Star
                                    size={12}
                                    fill="#F5891E"
                                    color="#F5891E"
                                  />
                                  <span
                                    style={{
                                      fontWeight: 600,
                                      color: primaryDark,
                                    }}
                                  >
                                    {courier.rating}
                                  </span>
                                  /5
                                </span>
                                <span style={{ color: "#dee2e6" }}>|</span>
                                <span className="text-muted">
                                  {isSurfaceCourier ? "Surface" : "Air"}
                                </span>
                              </div>
                            </div>
                          </Col>

                          {/* MIDDLE: Delivery Stats */}
                          <Col
                            md={4}
                            className="text-center"
                            style={{
                              borderLeft: cardBorder,
                              borderRight: cardBorder,
                            }}
                          >
                            <div className="d-flex justify-content-around align-items-center">
                              <div>
                                <div
                                  className="text-muted text-uppercase fw-bold mb-1"
                                  style={{
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Est. Delivery
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{
                                    color: primaryDark,
                                    fontSize: "13px",
                                  }}
                                >
                                  {courier.etd}
                                </div>
                              </div>
                              <div>
                                <div
                                  className="text-muted text-uppercase fw-bold mb-1"
                                  style={{
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Transit Time
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{
                                    color: primaryDark,
                                    fontSize: "13px",
                                  }}
                                >
                                  {courier.estimated_delivery_days} Days
                                </div>
                              </div>
                              <div>
                                <div
                                  className="text-muted text-uppercase fw-bold mb-1"
                                  style={{
                                    fontSize: "9px",
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  Reliability
                                </div>
                                <div
                                  className="fw-bold"
                                  style={{ color: "#28a745", fontSize: "13px" }}
                                >
                                  {courier.rto_performance}/10
                                </div>
                              </div>
                            </div>
                          </Col>

                          {/* RIGHT: Price & CTA */}
                          <Col
                            md={4}
                            className="d-flex flex-row align-items-center justify-content-end gap-4"
                          >
                            <div className="text-end">
                              <div
                                className="text-muted text-uppercase fw-bold mb-1"
                                style={{
                                  fontSize: "9px",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                Final Rate
                              </div>
                              <div
                                className="fw-bold"
                                style={{
                                  fontSize: "20px",
                                  color: primaryDark,
                                  lineHeight: 1,
                                }}
                              >
                                {/* Changed from courier.rate to courier.total_amount */}
                                ₹{Number(courier.total_amount).toFixed(2)}
                              </div>
                            </div>
                            <Button
                              className="border-0 shadow-sm"
                              style={{
                                background:
                                  "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)",
                                fontWeight: 600,
                                padding: "8px 20px",
                                borderRadius: "8px",
                                fontSize: "12px",
                                transition: "all 0.3s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #F5891E 0%, #d97716 100%)";
                                e.currentTarget.style.transform = "scale(1.02)";
                                e.currentTarget.style.boxShadow =
                                  "0 4px 12px rgba(245, 137, 30, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)";
                                e.currentTarget.style.transform = "scale(1)";
                                e.currentTarget.style.boxShadow =
                                  "0 2px 4px rgba(0,0,0,0.1)";
                              }}
                              onClick={() => handleBookShipment(courier._id)} // Pass _id instead of id
                            >
                              Ship Now
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Loading State */
          <div
            className="d-flex flex-column align-items-center justify-content-center py-5"
            style={{ minHeight: "400px" }}
          >
            <div
              className="spinner-border mb-3"
              style={{
                color: primaryAccent,
                width: "2.5rem",
                height: "2.5rem",
              }}
              role="status"
            ></div>
            <h6 className="fw-bold" style={{ color: primaryDark }}>
              Analyzing Best Shipping Routes...
            </h6>
            <p className="text-muted" style={{ fontSize: "13px" }}>
              Comparing rates, delivery times, and reliability.
            </p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ShipmentModal;

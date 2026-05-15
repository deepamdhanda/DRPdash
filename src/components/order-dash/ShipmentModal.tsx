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
  const [sortBy, setSortBy] = useState("recommended");
  const [filterType, setFilterType] = useState("all");

  const { couriers, cheapestId, fastestId, bestRatedId } = useMemo(() => {
    if (!shipmentDetails?.couriers) {
      return { couriers: [], cheapestId: null, fastestId: null, bestRatedId: null };
    }

    let list = [...shipmentDetails.couriers];
    const checkIsSurface = (c: any) =>
      c.is_surface === true || c.name?.toLowerCase().includes("surface");

    const cheapest = [...list].sort((a, b) => a.total_amount - b.total_amount)[0]?._id;
    const fastest = [...list].sort(
      (a, b) => Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
    )[0]?._id;
    const bestRated = [...list].sort((a, b) => b.rating - a.rating)[0]?._id;

    if (filterType === "air") list = list.filter((c) => !checkIsSurface(c));
    if (filterType === "surface") list = list.filter((c) => checkIsSurface(c));

    if (sortBy === "cheapest") list.sort((a, b) => a.total_amount - b.total_amount);
    if (sortBy === "fastest")
      list.sort((a, b) => Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days));
    if (sortBy === "best-rated") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "recommended")
      list.sort((a, b) => b.rating - a.rating || a.total_amount - b.total_amount);

    return { couriers: list, cheapestId: cheapest, fastestId: fastest, bestRatedId: bestRated };
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
        style={{ backgroundColor: "#ffffff", borderBottom: cardBorder, padding: "14px 20px" }}
      >
        <Modal.Title
          style={{
            color: primaryDark,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            fontSize: "16px",
          }}
        >
          <PackageOpen color={primaryAccent} size={22} />
          Process Shipment
          <span
            style={{
              fontSize: "12px",
              backgroundColor: "#FFF7F0",
              color: primaryAccent,
              padding: "3px 8px",
              borderRadius: "6px",
              border: `1px solid ${primaryAccent}`,
              fontWeight: 600,
            }}
          >
            Order #{shipmentOrder?.order_id || "—"}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body style={{ backgroundColor: "#f8f9fb", padding: "16px" }}>
        {shipmentDetails ? (
          <div className="d-flex flex-column" style={{ gap: "16px" }}>

            {/* ===== 1. TOP SUMMARY BAR ===== */}
            <Row className="g-2">
              {/* Dispatch From */}
              <Col xs={12} sm={6} lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-2"
                  style={{ borderRadius: "10px", border: cardBorder, boxShadow: softShadow }}
                >
                  <div className="p-2 rounded flex-shrink-0" style={{ backgroundColor: "#FFF7F0" }}>
                    <Store color={primaryAccent} size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
                      Dispatch From
                    </div>
                    <div className="fw-bold text-truncate" style={{ fontSize: "12px", color: primaryDark }}>
                      {shipmentDetails.fulfillment.warehouseDetails.name}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "11px", lineHeight: "1.4" }}>
                      {shipmentDetails.fulfillment.warehouseDetails.City},{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.State} -{" "}
                      {shipmentDetails.fulfillment.warehouseDetails.pincode}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Shipping To */}
              <Col xs={12} sm={6} lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-2"
                  style={{ borderRadius: "10px", border: cardBorder, boxShadow: softShadow }}
                >
                  <div className="p-2 rounded flex-shrink-0" style={{ backgroundColor: "#E6F4EA" }}>
                    <MapPin color="#28a745" size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
                      Shipping To
                    </div>
                    <div className="fw-bold text-truncate" style={{ fontSize: "12px", color: primaryDark }}>
                      {shipmentOrder?.customer_name}
                    </div>
                    <div className="text-muted mt-1" style={{ fontSize: "11px", lineHeight: "1.4" }}>
                      {shipmentOrder?.shipping_city}, {shipmentOrder?.shipping_state} -{" "}
                      {shipmentOrder?.shipping_pincode}
                    </div>
                    <div
                      className="mt-1 fw-bold"
                      style={{
                        fontSize: "11px",
                        color: shipmentOrder?.payment_method?.toLowerCase().includes("cod") ? "#d9534f" : "#28a745",
                      }}
                    >
                      {shipmentOrder?.payment_method?.toLowerCase().includes("cod") ? "💰 COD: " : "💳 Prepaid: "}
                      ₹{shipmentOrder?.total_amount}
                    </div>
                  </div>
                </div>
              </Col>

              {/* Weight Summary */}
              <Col xs={12} sm={12} lg={4}>
                <div
                  className="bg-white p-3 h-100 d-flex align-items-start gap-2"
                  style={{ borderRadius: "10px", border: cardBorder, boxShadow: softShadow }}
                >
                  <div className="p-2 rounded flex-shrink-0" style={{ backgroundColor: "#F0F4FF" }}>
                    <Scale color="#4285F4" size={18} />
                  </div>
                  <div className="w-100">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "9px", letterSpacing: "0.5px" }}>
                        Weight Summary
                      </div>
                      <OverlayTrigger
                        placement="left"
                        overlay={<Tooltip>Higher of actual & volumetric is charged</Tooltip>}
                      >
                        <Info size={13} color="#adb5bd" style={{ cursor: "pointer" }} />
                      </OverlayTrigger>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ fontSize: "12px", color: primaryDark, fontWeight: 600 }}>
                          {shipmentDetails.weight.actual} kg
                        </div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>Actual</div>
                      </div>
                      <div className="text-muted" style={{ fontSize: "14px", opacity: 0.5 }}>/</div>
                      <div>
                        <div style={{ fontSize: "12px", color: primaryDark, fontWeight: 600 }}>
                          {shipmentDetails.weight.volumetric} kg
                        </div>
                        <div className="text-muted" style={{ fontSize: "10px" }}>Volumetric</div>
                      </div>
                      <div className="text-muted" style={{ fontSize: "14px", opacity: 0.5 }}>=</div>
                      <div className="text-end px-2 py-1 rounded" style={{ backgroundColor: "rgba(40,167,69,0.1)" }}>
                        <div style={{ color: "#28a745", fontSize: "14px", fontWeight: 800 }}>
                          {shipmentDetails.weight.billable} kg
                        </div>
                        <div className="fw-bold" style={{ fontSize: "9px", color: "#28a745" }}>BILLABLE</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>

            {/* ===== 2. PACKAGE SELECTION ===== */}
            <div>
              <h6 className="fw-bold text-uppercase mb-2" style={{ fontSize: "10px", color: "#6c757d", letterSpacing: "0.5px" }}>
                Select Packaging{" "}
                <span className="text-lowercase fw-normal ms-1">
                  ({shipmentDetails.recommendedPacks.length} options)
                </span>
              </h6>
              <Row className="g-2">
                {shipmentDetails.recommendedPacks.map((pack: any, index: number) => {
                  const isSelected = selectedPackageIndex === index;
                  return (
                    <Col xs={12} sm={6} lg={4} key={index}>
                      <div
                        onClick={() => setSelectedPackageIndex(index)}
                        className="d-flex align-items-center p-2 p-sm-3 position-relative"
                        style={{
                          backgroundColor: isSelected ? "#FFF7F0" : "#ffffff",
                          border: isSelected ? `1px solid ${primaryAccent}` : cardBorder,
                          borderRadius: "10px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          boxShadow: isSelected ? "0 4px 12px rgba(245,137,30,0.15)" : softShadow,
                        }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.transform = "translateY(-2px)"; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {isSelected && (
                          <CheckCircle2
                            color={primaryAccent}
                            size={18}
                            style={{ position: "absolute", top: "-8px", right: "-8px", backgroundColor: "#fff", borderRadius: "50%" }}
                          />
                        )}
                        <div
                          className="me-2 p-2 rounded-circle flex-shrink-0"
                          style={{ backgroundColor: isSelected ? "rgba(245,137,30,0.1)" : "#f8f9fa" }}
                        >
                          <PackageOpen size={18} color={isSelected ? primaryAccent : "#6c757d"} />
                        </div>
                        <div className="flex-grow-1 overflow-hidden">
                          <div className="fw-bold text-truncate" style={{ fontSize: "12px", color: isSelected ? "#a05206" : primaryDark }}>
                            {pack.name}
                          </div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>
                            {pack.length} × {pack.breadth} × {pack.height} cm
                          </div>
                        </div>
                        <div className="text-end ps-2 flex-shrink-0" style={{ borderLeft: "1px solid #e9ecef" }}>
                          <div className="fw-bold" style={{ fontSize: "12px", color: primaryDark }}>₹{pack.packingCost}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>Max {pack.maxWeight}kg</div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            </div>

            {/* ===== 3. COURIER OPTIONS ===== */}
            <div
              className="d-flex flex-column flex-grow-1 bg-white p-2 p-sm-3"
              style={{ borderRadius: "12px", border: cardBorder, boxShadow: softShadow }}
            >
              {/* Controls Toolbar */}
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-3 pb-3 border-bottom gap-2">
                <div className="d-flex align-items-center gap-2">
                  <h6 className="fw-bold mb-0" style={{ color: primaryDark, fontSize: "14px" }}>
                    Available Couriers
                  </h6>
                  <Badge bg="light" text="dark" style={{ border: "1px solid #dee2e6", fontWeight: 600 }}>
                    {couriers.length} Options
                  </Badge>
                </div>

                <div className="d-flex flex-wrap gap-2 align-items-center">
                  <div
                    className="d-flex flex-wrap rounded"
                    style={{ backgroundColor: "#f8f9fa", padding: "3px", border: cardBorder }}
                  >
                    {["recommended", "cheapest", "fastest", "best-rated"].map((sortOption) => (
                      <button
                        key={sortOption}
                        onClick={() => setSortBy(sortOption)}
                        style={{
                          border: "none",
                          background: sortBy === sortOption ? "#fff" : "transparent",
                          color: sortBy === sortOption ? primaryDark : "#6c757d",
                          padding: "3px 8px",
                          fontSize: "10px",
                          fontWeight: sortBy === sortOption ? 700 : 500,
                          borderRadius: "4px",
                          boxShadow: sortBy === sortOption ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                          textTransform: "capitalize",
                          transition: "all 0.2s",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {sortOption.replace("-", " ")}
                      </button>
                    ))}
                  </div>

                  <Form.Select
                    size="sm"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ width: "120px", fontSize: "11px", fontWeight: 600, borderColor: "#dee2e6", cursor: "pointer" }}
                  >
                    <option value="all">All Types</option>
                    <option value="air">✈️ Air Only</option>
                    <option value="surface">🚚 Surface Only</option>
                  </Form.Select>
                </div>
              </div>

              {/* Courier List */}
              <div style={{ overflowY: "auto", maxHeight: "42vh" }}>
                {couriers.length === 0 ? (
                  <div className="text-center py-4 text-muted" style={{ fontSize: "13px" }}>
                    No couriers match your filter criteria.
                  </div>
                ) : (
                  couriers.map((courier: any) => {
                    const isCheapest = courier._id === cheapestId;
                    const isFastest = courier._id === fastestId;
                    const isBestRated = courier._id === bestRatedId;
                    const isRecommended = sortBy === "recommended" && courier._id === couriers[0]?._id;
                    const isSurfaceCourier =
                      courier.is_surface === true || courier.name?.toLowerCase().includes("surface");

                    return (
                      <div
                        key={courier._id}
                        className="mb-2 p-2 p-sm-3 position-relative"
                        style={{
                          border: isRecommended ? `1px solid ${primaryAccent}80` : cardBorder,
                          backgroundColor: isRecommended ? "#FFFAF5" : "#ffffff",
                          borderRadius: "10px",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.06)";
                          e.currentTarget.style.borderColor = isRecommended ? primaryAccent : "#ced4da";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = isRecommended ? `${primaryAccent}80` : "#f1f3f5";
                        }}
                      >
                        {/* Smart Tags */}
                        <div style={{ position: "absolute", top: "-10px", left: "12px", display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          {isRecommended && (
                            <span style={{ background: "linear-gradient(135deg, #F5891E, #E0730A)", color: "#fff", padding: "2px 8px", borderRadius: "12px", fontSize: "9px", fontWeight: 700 }}>
                              ★ Recommended
                            </span>
                          )}
                          {isCheapest && (
                            <span style={{ backgroundColor: "#E6F4EA", color: "#137333", border: "1px solid #CEEAD6", padding: "2px 7px", borderRadius: "12px", fontSize: "9px", fontWeight: 700 }}>
                              📉 Cheapest
                            </span>
                          )}
                          {isFastest && (
                            <span style={{ backgroundColor: "#E8F0FE", color: "#1967D2", border: "1px solid #D2E3FC", padding: "2px 7px", borderRadius: "12px", fontSize: "9px", fontWeight: 700 }}>
                              ⚡ Fastest
                            </span>
                          )}
                          {isBestRated && (
                            <span style={{ backgroundColor: "#FEF7E0", color: "#B06000", border: "1px solid #FCE8B2", padding: "2px 7px", borderRadius: "12px", fontSize: "9px", fontWeight: 700 }}>
                              🏆 Top Rated
                            </span>
                          )}
                        </div>

                        {/* ── Courier Card Layout ── */}
                        <div className="mt-2">

                          {/* ROW 1 (all screens): Identity + Stats side by side */}
                          <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">

                            {/* Identity */}
                            <div className="d-flex align-items-center gap-2" style={{ minWidth: "140px", flex: "1 1 140px" }}>
                              <div
                                className="d-flex justify-content-center align-items-center flex-shrink-0"
                                style={{
                                  width: "38px", height: "38px", borderRadius: "8px",
                                  backgroundColor: isSurfaceCourier ? "#F3F4F6" : "#EBF5FF",
                                  color: isSurfaceCourier ? "#4B5563" : "#3B82F6",
                                }}
                              >
                                {isSurfaceCourier ? <Truck size={18} /> : <Plane size={18} />}
                              </div>
                              <div className="overflow-hidden">
                                <div className="fw-bold text-truncate" style={{ fontSize: "13px", color: primaryDark }}>
                                  {courier.courier_name}
                                </div>
                                <div className="d-flex align-items-center gap-1 mt-1 flex-wrap" style={{ fontSize: "10px" }}>
                                  <Star size={11} fill="#F5891E" color="#F5891E" />
                                  <span style={{ fontWeight: 600, color: primaryDark }}>{courier.rating}</span>
                                  <span className="text-muted">/5</span>
                                  <span style={{ color: "#dee2e6" }}>|</span>
                                  <span className="text-muted">{isSurfaceCourier ? "Surface" : "Air"}</span>
                                </div>
                              </div>
                            </div>

                            {/* Delivery Stats */}
                            <div
                              className="d-flex align-items-center justify-content-around gap-2"
                              style={{ flex: "2 1 200px", borderLeft: cardBorder, borderRight: cardBorder, padding: "0 12px" }}
                            >
                              {[
                                { label: "Est. Delivery", value: courier.etd, color: primaryDark },
                                { label: "Transit Time", value: `${courier.estimated_delivery_days} Days`, color: primaryDark },
                                { label: "Reliability", value: `${courier.rto_performance}/10`, color: "#28a745" },
                              ].map(({ label, value, color }, i, arr) => (
                                <div key={label} className="d-flex align-items-center gap-2">
                                  <div className="text-center">
                                    <div className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: "8px", letterSpacing: "0.5px" }}>
                                      {label}
                                    </div>
                                    <div className="fw-bold" style={{ color, fontSize: "12px" }}>{value}</div>
                                  </div>
                                  {i < arr.length - 1 && (
                                    <div style={{ width: "1px", height: "26px", background: "#e9ecef", flexShrink: 0 }} />
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* Ship Now Button — visible on md+ inline, hidden on small */}
                            <div className="d-none d-md-block flex-shrink-0">
                              <Button
                                className="border-0 shadow-sm"
                                style={{
                                  background: "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)",
                                  fontWeight: 600,
                                  padding: "8px 18px",
                                  borderRadius: "8px",
                                  fontSize: "12px",
                                  transition: "all 0.3s ease",
                                  whiteSpace: "nowrap",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "linear-gradient(135deg, #F5891E 0%, #d97716 100%)";
                                  e.currentTarget.style.transform = "scale(1.02)";
                                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,137,30,0.3)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)";
                                  e.currentTarget.style.transform = "scale(1)";
                                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                }}
                                onClick={() => handleBookShipment(courier._id)}
                              >
                                Ship Now
                              </Button>
                            </div>
                          </div>

                          {/* ROW 2: Charges Breakdown (full width) */}
                          <div
                            className="mt-2 pt-2"
                            style={{ borderTop: cardBorder }}
                          >
                            <div
                              style={{
                                background: "rgba(0,4,52,0.04)",
                                borderRadius: "8px",
                                padding: "7px 10px",
                              }}
                            >
                              <div className="d-flex align-items-center">
                                {[
                                  { label: "Freight", value: courier.freight_charge },
                                  { label: "COD", value: courier.cod_charges },
                                  { label: "Other", value: courier.other_charges },
                                ].map(({ label, value }, index, arr) => (
                                  <div key={label} className="d-flex align-items-center" style={{ flex: 1 }}>
                                    <div className="text-center" style={{ flex: 1 }}>
                                      <div className="text-muted text-uppercase fw-bold" style={{ fontSize: "8px", letterSpacing: "0.5px", marginBottom: "2px" }}>
                                        {label}
                                      </div>
                                      <div style={{ fontSize: "11px", color: "#333", fontWeight: 600, whiteSpace: "nowrap" }}>
                                        ₹{Number(value ?? 0).toFixed(2)}
                                      </div>
                                    </div>
                                    {index < arr.length - 1 && (
                                      <div style={{ width: "1px", height: "26px", background: "#d0d0d0", flexShrink: 0 }} />
                                    )}
                                  </div>
                                ))}

                                {/* Dashed divider before Total */}
                                <div style={{ width: "1px", height: "26px", borderLeft: "1.5px dashed #aaa", flexShrink: 0, margin: "0 2px" }} />

                                {/* Total */}
                                <div className="text-center" style={{ flex: 1 }}>
                                  <div className="text-uppercase fw-bold" style={{ fontSize: "8px", letterSpacing: "0.5px", color: "#000434", marginBottom: "2px" }}>
                                    Total
                                  </div>
                                  <div className="fw-bold" style={{ fontSize: "12px", color: "#000434", lineHeight: 1, whiteSpace: "nowrap" }}>
                                    ₹{Number(courier.total_amount).toFixed(2)}
                                  </div>
                                </div>

                                {/* Solid divider before RTO */}
                                <div style={{ width: "1px", height: "26px", background: "#d0d0d0", flexShrink: 0, margin: "0 2px" }} />

                                {/* RTO */}
                                <div
                                  className="text-center"
                                  style={{
                                    flex: 1,
                                    background: "rgba(192,57,43,0.07)",
                                    border: "1px solid rgba(192,57,43,0.18)",
                                    borderRadius: "6px",
                                    padding: "3px 5px",
                                    marginLeft: "3px",
                                  }}
                                >
                                  <div className="text-uppercase fw-bold" style={{ fontSize: "8px", letterSpacing: "0.5px", color: "#c0392b", marginBottom: "2px", opacity: 0.8 }}>
                                    RTO
                                  </div>
                                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#c0392b", whiteSpace: "nowrap" }}>
                                    ₹{Number(courier.rto_charges ?? 0).toFixed(2)}
                                  </div>
                                </div>

                                {/* Ship Now Button — visible only on small screens, inside charges row */}
                                <div className="d-md-none flex-shrink-0 ms-2">
                                  <Button
                                    className="border-0 shadow-sm"
                                    style={{
                                      background: "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)",
                                      fontWeight: 600,
                                      padding: "6px 14px",
                                      borderRadius: "8px",
                                      fontSize: "11px",
                                      transition: "all 0.3s ease",
                                      whiteSpace: "nowrap",
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = "linear-gradient(135deg, #F5891E 0%, #d97716 100%)";
                                      e.currentTarget.style.transform = "scale(1.02)";
                                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(245,137,30,0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = "linear-gradient(135deg, #000434 0%, #1a1e4a 100%)";
                                      e.currentTarget.style.transform = "scale(1)";
                                      e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                    }}
                                    onClick={() => handleBookShipment(courier._id)}
                                  >
                                    Ship Now
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: "300px" }}>
            <div
              className="spinner-border mb-3"
              style={{ color: primaryAccent, width: "2.5rem", height: "2.5rem" }}
              role="status"
            />
            <h6 className="fw-bold" style={{ color: primaryDark }}>Analyzing Best Shipping Routes...</h6>
            <p className="text-muted" style={{ fontSize: "13px" }}>Comparing rates, delivery times, and reliability.</p>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ShipmentModal;
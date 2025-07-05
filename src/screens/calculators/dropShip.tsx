import React, { useState, ChangeEvent } from "react";
import {
    Card,
    Col,
    Form,
    FormGroup,
    Row,
    Badge,
    OverlayTrigger,
    Tooltip,
} from "react-bootstrap";

const brandColors = {
    navy: "#000434",
    orange: "#F5891E",
    white: "#FFFFFF",
    grayBg: "#F5F7FA",
};

const DropShipCalculator: React.FC = () => {
    const [productCost, setProductCost] = useState<number>(56);
    const [packingCost, setPackingCost] = useState<number>(3);
    const [isPackingRefundable, setIsPackingRefundable] = useState<boolean>(false);

    const [freightCharges, setFreightCharges] = useState<number>(43);
    const [codCharges, setCodCharges] = useState<number>(25);
    const [rtoCharges, setRtoCharges] = useState<number>(45);
    const [fulfilmentGST, setFulfilmentGST] = useState<number>(18);

    const [cpp, setCpp] = useState<number>(70);
    const [sellingPrice, setSellingPrice] = useState<number>(499);
    const [totalOrders, setTotalOrders] = useState<number>(500);
    const [rtoPercentage, setRtoPercentage] = useState<number>(50);

    const netCODCost = (() => {
        const sum = freightCharges + codCharges;
        return sum + (sum * fulfilmentGST) / 100;
    })();

    const netRTOCost = (() => {
        const sum = freightCharges + rtoCharges;
        return sum + (sum * fulfilmentGST) / 100;
    })();

    const deliveredOrders = totalOrders - Math.floor((totalOrders * rtoPercentage) / 100);
    const rtoOrders = Math.floor((totalOrders * rtoPercentage) / 100);

    const deliveredUnitCost = productCost + packingCost + cpp + netCODCost;
    const rtoUnitCost = (isPackingRefundable ? 0 : packingCost) + cpp + netRTOCost;

    const deliveredInvestment = deliveredOrders * deliveredUnitCost;
    const rtoInvestment = rtoOrders * rtoUnitCost;
    const netInvestment = deliveredInvestment + rtoInvestment;

    const deliveredProfit = deliveredOrders * sellingPrice - deliveredInvestment;
    const rtoProfit = -rtoInvestment;
    const netProfit = deliveredProfit + rtoProfit;

    // const deliveredProfitPercentage = deliveredInvestment
    //     ? ((deliveredProfit / deliveredInvestment) * 100 - 100)
    //     : 0;
    // const rtoProfitPercentage = rtoInvestment
    //     ? ((rtoProfit / rtoInvestment) * 100 + 100)
    //     : 0;
    const netProfitPercentage = netInvestment ? (netProfit / netInvestment) * 100 : 0;

    const breakEvenOrders =
        (
            deliveredOrders * (sellingPrice - productCost - packingCost - netCODCost) -
            rtoOrders * ((isPackingRefundable ? 0 : packingCost) + netRTOCost)
        ) /
        (deliveredOrders + rtoOrders);

    const roi = netInvestment ? (netProfit / netInvestment) * 100 : 0;
    const roas = netInvestment ? ((sellingPrice * totalOrders) / netInvestment) : 0;
    const marginPerOrder = sellingPrice - deliveredUnitCost;
    const successRate = (deliveredOrders / totalOrders) * 100;
    const rtoRate = (rtoOrders / totalOrders) * 100;

    const handleNumberChange = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        min = 0
    ) => (e: ChangeEvent<HTMLInputElement>) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val) || val < min) val = min;
        setter(val);
    };

    const withTooltip = (text: string, tooltip: string) => (
        <OverlayTrigger placement="top" overlay={<Tooltip>{tooltip}</Tooltip>}>
            <span style={{ textDecoration: "underline dotted", cursor: "help" }}>{text}</span>
        </OverlayTrigger>
    );

    return (
        <div style={{ padding: "1rem", background: brandColors.grayBg, minHeight: "100vh" }}>
            <Card style={{ maxWidth: 1000, margin: "0 auto", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
                <Card.Header style={{
                    backgroundColor: brandColors.navy,
                    color: brandColors.white,
                    fontWeight: "700",
                    fontSize: "1.5rem",
                    textAlign: "center",
                    borderRadius: "16px 16px 0 0",
                    padding: "1rem 2rem",
                    position: "relative",
                }}>
                    OU AI Powered - Self Shipping Cost Calculator
                    <Badge
                        bg="white"
                        text="dark"
                        style={{
                            position: "absolute",
                            right: 20,
                            top: "50%",
                            transform: "translateY(-50%)",
                            fontWeight: "600",
                        }}
                    >
                        v1.0
                    </Badge>
                </Card.Header>

                <Card.Body style={{ padding: "2rem" }}>
                    <h5 style={{ color: brandColors.navy, marginBottom: "1rem" }}>💡 Input Your Order Economics</h5>
                    <Row className="g-3 mb-4">
                        <Col md={6} lg={4}>
                            <FormGroup>
                                <Form.Label>{withTooltip("Product Cost", "Cost of the product per unit")}</Form.Label>
                                <Form.Control type="number" value={productCost} onChange={handleNumberChange(setProductCost)} min={0} step={0.1} />
                            </FormGroup>
                        </Col>
                        <Col md={6} lg={4}>
                            <FormGroup>
                                <Form.Label>{withTooltip("Packing Cost", "Packing cost per unit")}</Form.Label>
                                <Form.Control type="number" value={packingCost} onChange={handleNumberChange(setPackingCost)} min={0} step={0.1} />
                                <Form.Check type="checkbox" label="Refundable on RTO?" checked={isPackingRefundable} onChange={() => setIsPackingRefundable(!isPackingRefundable)} style={{ marginTop: "0.5rem" }} />
                            </FormGroup>
                        </Col>
                        <Col md={6} lg={4}>
                            <FormGroup>
                                <Form.Label>CPP</Form.Label>
                                <Form.Control type="number" value={cpp} onChange={handleNumberChange(setCpp)} />
                            </FormGroup>
                        </Col>
                    </Row>

                    <Row className="g-3 mb-4">
                        <Col md={3}><FormGroup><Form.Label>Freight Charges</Form.Label><Form.Control type="number" value={freightCharges} onChange={handleNumberChange(setFreightCharges)} /></FormGroup></Col>
                        <Col md={3}><FormGroup><Form.Label>COD Charges</Form.Label><Form.Control type="number" value={codCharges} onChange={handleNumberChange(setCodCharges)} /></FormGroup></Col>
                        <Col md={3}><FormGroup><Form.Label>RTO Charges</Form.Label><Form.Control type="number" value={rtoCharges} onChange={handleNumberChange(setRtoCharges)} /></FormGroup></Col>
                        <Col md={3}><FormGroup><Form.Label>Fulfilment GST (%)</Form.Label><Form.Control type="number" value={fulfilmentGST} onChange={handleNumberChange(setFulfilmentGST)} /></FormGroup></Col>
                    </Row>

                    <Row className="g-3 mb-4">
                        <Col md={4}><FormGroup><Form.Label>Selling Price</Form.Label><Form.Control type="number" value={sellingPrice} onChange={handleNumberChange(setSellingPrice)} /></FormGroup></Col>
                        <Col md={4}><FormGroup><Form.Label>Total Orders</Form.Label><Form.Control type="number" value={totalOrders} onChange={handleNumberChange(setTotalOrders)} /></FormGroup></Col>
                        <Col md={4}><FormGroup><Form.Label>RTO %</Form.Label><Form.Control type="number" value={rtoPercentage} onChange={handleNumberChange(setRtoPercentage)} /></FormGroup></Col>
                    </Row>

                    <div
                        style={{
                            backgroundColor: brandColors.orange,
                            padding: "1.5rem",
                            borderRadius: 12,
                            color: brandColors.white,
                            fontWeight: "600",
                        }}
                    >
                        <h5 style={{ marginBottom: "1rem" }}>📊 Summary</h5>

                        {/* Order Details */}
                        <h6 style={{ borderBottom: `1px solid ${brandColors.white}`, paddingBottom: "0.3rem", marginBottom: "0.5rem" }}>
                            🧾 Order Summary
                        </h6>
                        <Row className="mb-3">
                            <Col md={6} lg={4}><p>Total Orders: {totalOrders}</p></Col>
                            <Col md={6} lg={4}><p>Delivered Orders: {deliveredOrders}</p></Col>
                            <Col md={6} lg={4}><p>RTO Orders: {rtoOrders}</p></Col>
                            <Col md={6} lg={4}><p>Success Rate: {successRate.toFixed(2)}%</p></Col>
                            <Col md={6} lg={4}><p>RTO Rate: {rtoRate.toFixed(2)}%</p></Col>
                        </Row>

                        {/* Profitability */}
                        <h6 style={{ borderBottom: `1px solid ${brandColors.white}`, paddingBottom: "0.3rem", marginBottom: "0.5rem" }}>
                            💸 Profitability
                        </h6>
                        <Row className="mb-3">
                            <Col md={6} lg={4}><p>Delivered Profit: ₹{deliveredProfit.toFixed(2)}</p></Col>
                            <Col md={6} lg={4}><p>RTO Loss: ₹{rtoProfit.toFixed(2)}</p></Col>
                            <Col md={6} lg={4}><p>Net Profit: ₹{netProfit.toFixed(2)}</p></Col>
                            <Col md={6} lg={4}><p>Profit %: {netProfitPercentage.toFixed(2)}%</p></Col>
                            <Col md={6} lg={4}><p>Margin Per Order: ₹{marginPerOrder.toFixed(2)}</p></Col>
                        </Row>

                        {/* Financial Efficiency */}
                        <h6 style={{ borderBottom: `1px solid ${brandColors.white}`, paddingBottom: "0.3rem", marginBottom: "0.5rem" }}>
                            📊 Financial Efficiency
                        </h6>
                        <Row>
                            <Col md={6} lg={4}><p>Break-even Orders: {breakEvenOrders}</p></Col>
                            <Col md={6} lg={4}><p>ROI: {roi.toFixed(2)}%</p></Col>
                            <Col md={6} lg={4}><p>ROAS: {roas.toFixed(2)}</p></Col>
                        </Row>
                    </div>

                </Card.Body>
            </Card>
        </div>
    );
};

export default DropShipCalculator;
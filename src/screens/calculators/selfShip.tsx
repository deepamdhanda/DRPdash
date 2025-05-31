import React, { useState, ChangeEvent } from "react";
import { Card, Col, Form, FormGroup, Row, Table, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

const brandColors = {
    navy: "#000434",
    orange: "#F5891E",
    white: "#FFFFFF",
};

const SelfShipCalculator: React.FC = () => {
    const [inventoryCost, setInventoryCost] = useState<number>(28000);
    const [packingCost, setPackingCost] = useState<number>(3);
    const [orderingInventory, setOrderingInventory] = useState<number>(500);
    const [shippingCost, setShippingCost] = useState<number>(3000);

    const [freightCharges, setFreightCharges] = useState<number>(43);
    const [codCharges, setCodCharges] = useState<number>(25);
    const [rtoCharges, setRtoCharges] = useState<number>(45);
    const [fulfilmentGST, setFulfilmentGST] = useState<number>(18);

    const [cpp, setCpp] = useState<number>(70);
    const [sellingPrice, setSellingPrice] = useState<number>(499);
    const [totalOrders, setTotalOrders] = useState<number>(500);
    const [rtoPercentage, setRtoPercentage] = useState<number>(50);

    const netProductPrice = packingCost + (inventoryCost + shippingCost) / (orderingInventory || 1);

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

    const deliveredInvestment = deliveredOrders * (netCODCost + cpp + netProductPrice);
    const rtoInvestment = rtoOrders * (netRTOCost + cpp);
    const netInvestment = deliveredInvestment + rtoInvestment;

    const deliveredProfit = deliveredOrders * sellingPrice - deliveredInvestment;
    const rtoProfit = -rtoInvestment;
    const netProfit = deliveredProfit + rtoProfit;

    const deliveredProfitPercentage = deliveredInvestment ? ((deliveredProfit / deliveredInvestment) * 100 - 100) : 0;
    const rtoProfitPercentage = rtoInvestment ? ((rtoProfit / rtoInvestment) * 100 + 100) : 0;
    const netProfitPercentage = netInvestment ? (netProfit / netInvestment) * 100 : 0;

    const handleNumberChange = (setter: React.Dispatch<React.SetStateAction<number>>, min = 0) => (
        e: ChangeEvent<HTMLInputElement>
    ) => {
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
        <div>
            <Card
                style={{
                    margin: "0 auto",
                    borderRadius: 10,
                    color: brandColors.navy,
                }}
            >
                <Card.Header
                    style={{
                        backgroundColor: brandColors.navy,
                        color: brandColors.white,
                        fontWeight: "700",
                        fontSize: "1.5rem",
                        textAlign: "center",
                        borderRadius: "10px 10px 0 0",
                        position: "relative",
                    }}
                >
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

                <Card.Body>
                    <div className="row">
                        <div className="col-md-9 mb-4">
                            {/* Product Details */}
                            <h5 className="mb-3" style={{ borderBottom: `2px solid ${brandColors.orange}`, paddingBottom: 5 }}>
                                Product Details
                            </h5>
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Total Inventory Cost", "Cost of all inventory you have")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={inventoryCost}
                                            onChange={handleNumberChange(setInventoryCost)}
                                            min={0}
                                            step={1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Packing Cost per Order", "Cost to pack one order")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={packingCost}
                                            onChange={handleNumberChange(setPackingCost)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Total Ordering Inventory", "Number of units in your inventory")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={orderingInventory}
                                            onChange={handleNumberChange(setOrderingInventory, 1)}
                                            min={1}
                                            step={1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Inventory Shipping Cost", "Cost to ship inventory to warehouse")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={shippingCost}
                                            onChange={handleNumberChange(setShippingCost)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            {/* Logistics & Charges */}
                            <h5 className="mb-3" style={{ borderBottom: `2px solid ${brandColors.orange}`, paddingBottom: 5 }}>
                                Logistics & Charges
                            </h5>
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Freight Charges", "Base freight cost per shipment")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={freightCharges}
                                            onChange={handleNumberChange(setFreightCharges)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("COD Charges", "Cash on Delivery handling cost")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={codCharges}
                                            onChange={handleNumberChange(setCodCharges)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("RTO Charges", "Return to origin cost")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={rtoCharges}
                                            onChange={handleNumberChange(setRtoCharges)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Fulfilment GST (%)", "Tax percentage on charges")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={fulfilmentGST}
                                            onChange={handleNumberChange(setFulfilmentGST)}
                                            min={0}
                                            max={100}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>

                            {/* Sales & Orders */}
                            <h5 className="mb-3" style={{ borderBottom: `2px solid ${brandColors.orange}`, paddingBottom: 5 }}>
                                Sales & Orders
                            </h5>
                            <Row className="g-3 mb-4">
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Cost Per Purchase (CPP)", "Advertising cost per sale")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={cpp}
                                            onChange={handleNumberChange(setCpp)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Selling Price", "Price at which you sell product")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={sellingPrice}
                                            onChange={handleNumberChange(setSellingPrice)}
                                            min={0}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("Total Orders", "Number of orders placed")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={totalOrders}
                                            onChange={handleNumberChange(setTotalOrders)}
                                            min={0}
                                            step={1}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col md={6}>
                                    <FormGroup>
                                        <Form.Label>{withTooltip("RTO Percentage (%)", "Percentage of orders returned")}</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={rtoPercentage}
                                            onChange={handleNumberChange(setRtoPercentage)}
                                            min={0}
                                            max={100}
                                            step={0.1}
                                        />
                                    </FormGroup>
                                </Col>
                            </Row>
                        </div>
                        {/* Summary */}
                        <div className="col-md-3">
                            <div
                                style={{
                                    backgroundColor: brandColors.orange,
                                    color: brandColors.navy,
                                    padding: "1rem",
                                    borderRadius: 10,
                                    marginTop: "2rem",
                                    boxShadow: `0 0 10px ${brandColors.navy}`,
                                    textAlign: "center",
                                }}
                            >
                                <h4 style={{ marginBottom: "1rem" }}>Summary</h4>
                                <p>
                                    <strong>Net Product Price:</strong> <span style={{ color: brandColors.white, fontWeight: 'bolder', fontSize: 13 }}>₹{netProductPrice.toFixed(2)}</span>
                                </p>
                                <p>
                                    <strong>Net Ads Spent:</strong> <span style={{ color: brandColors.white, fontWeight: 'bolder', fontSize: 13 }}>₹{(cpp * totalOrders).toFixed(2)}</span>
                                </p>
                                <p>
                                    <strong>Net Revenue Generated:</strong>  <span style={{ color: brandColors.white, fontWeight: 'bolder', fontSize: 13 }}>₹ {(sellingPrice * totalOrders).toFixed(2)}</span>
                                </p>
                                <p>
                                    <strong>Net Investment:</strong>  <span style={{ color: brandColors.white, fontWeight: 'bolder', fontSize: 13 }}>₹ {netInvestment.toFixed(2)}</span>
                                </p>
                            </div>

                            <Table
                                bordered
                                hover
                                responsive
                                style={{ backgroundColor: brandColors.white, marginTop: "1rem" }}
                            >
                                <thead style={{ backgroundColor: brandColors.orange, color: brandColors.white }}>
                                    <tr>
                                        <th>Details</th>
                                        <th>Delivered</th>
                                        <th>RTO</th>
                                        <th>Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Orders</td>
                                        <td>{deliveredOrders}</td>
                                        <td>{rtoOrders}</td>
                                        <td>{totalOrders}</td>
                                    </tr>
                                    <tr>
                                        <td>Net Profit (₹)</td>
                                        <td>{deliveredProfit.toFixed(2)}</td>
                                        <td>{rtoProfit.toFixed(2)}</td>
                                        <td>{netProfit.toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td>Profit Percentage (%)</td>
                                        <td>{deliveredProfitPercentage.toFixed(2)}%</td>
                                        <td>{rtoProfitPercentage.toFixed(2)}%</td>
                                        <td>{netProfitPercentage.toFixed(2)}%</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </div>
                    </div>
                    <footer
                        style={{
                            textAlign: "center",
                            marginTop: "1.5rem",
                            color: brandColors.orange,
                            fontWeight: "700",
                        }}
                    >
                        OU AI Powered &copy; 2025
                    </footer>
                </Card.Body >
            </Card >
        </div >
    );
};

export default SelfShipCalculator;

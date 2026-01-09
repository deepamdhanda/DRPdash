import { Button, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { motion } from "framer-motion";
import { Clock, Phone, Star, Sparkles, ChevronRight } from "lucide-react";
import DataTable from "react-data-table-component";
import OUAIIcon from "../assets/ouai_icon";

export interface Courier {
    _id: string;
    courier_name: string;
    zone: string;
    rating: number;
    etd: string;
    etd_hours: number;
    estimated_delivery_days: string;
    delivery_performance: number;
    pickup_performance: number;
    rto_performance: number;
    tracking_performance: number;
    total_amount: number;
    cod_charges: number;
    freight_charge: number;
    other_charges: number;
    call_before_delivery: boolean;
}

const PerformanceBar = ({ value, label }: { value: number; label?: string }) => (
    <div className="d-flex align-items-center gap-2">
        <div>{label}</div>
        <div
            className="progress rounded-pill"
            style={{
                width: 70,
                height: 6,
                backgroundColor: "rgba(0,4,52,0.05)",
                overflow: "hidden",
            }}
        >
            <div
                className="progress-bar"
                role="progressbar"
                style={{
                    width: `${value * 10}%`,
                    background: "linear-gradient(90deg, #f5891d, #ffb347)",
                    transition: "width 0.8s ease-in-out",
                    borderRadius: 6,
                }}
                aria-valuenow={value * 10}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#000434" }}>{value}</span>
    </div>
);

const ModernShipmentTable: React.FC<{
    shipmentOptions: Courier[];
    actionable?: boolean;
    handleBookShipment?: (id: string) => void;
    handleSelectShipment?: (orderId: string, courier: Courier) => void;
    shipmentOrder?: any;
}> = ({ shipmentOptions, actionable = true, handleBookShipment, handleSelectShipment, shipmentOrder }) => {
    return (
        <DataTable
            style={{}}
            // progressPending={filteredData.length == 0}
            fixedHeader={true}
            data={shipmentOptions}
            highlightOnHover
            // conditionalRowStyles={conditionalRowStyles}
            columns={[
                {
                    name: "Company Name",
                    selector: (row: any) => row.courier_name,
                    cell: (row: any, index: any) => {
                        return (
                            <div style={{ padding: 10, fontSize: 12 }}>
                                {index === 0 && (
                                    <div
                                        style={{
                                            border:
                                                "linear-gradient(135deg, rgb(245, 137, 30) 0%, rgb(234, 88, 12) 100%)",
                                            color: "#000434",
                                            padding: "4px 12px",
                                            borderRadius: 24,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: 6,
                                            letterSpacing: "0.03em",
                                            boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                                            marginBottom: 8,
                                            animation: "pulseGlow 1.8s infinite ease-in-out",
                                        }}
                                    >
                                        <OUAIIcon style={{ width: 20 }} /> OU AI Recomended
                                    </div>
                                )}
                                <span style={{ fontSize: 14 }}>
                                    <b>{row.courier_name}</b>
                                </span>
                                <br />
                                Calling: {row.call_before_delivery && "Available"}
                                <br />
                                {/* Delivery Boy Contact: {row.delivery_boy_contact}<br /> */}
                                Chargeable Weight: {row.charge_weight} KG
                            </div>
                        );
                    },
                    compact: true,
                    sortable: true,
                },
                {
                    name: "Performance",
                    selector: (row: any) => row.rating,
                    cell: (row: any) => {
                        return (
                            <div style={{ padding: 10, fontSize: 12 }}>
                                <PerformanceBar label="Delivery" value={row.delivery_performance} />

                                <PerformanceBar label="Pickup" value={row.pickup_performance} />

                                <PerformanceBar label="RTO" value={row.rto_performance} />

                                <PerformanceBar label="Tracking" value={row.tracking_performance} />

                                <b>Overall: {row.rating}/10</b>
                                <br />
                            </div>
                        );
                    },
                    compact: true,
                    sortable: true,
                },
                {
                    name: "Charges",
                    selector: (row: any) => row.total_amount,
                    cell: (row: any) => {
                        return (
                            <div style={{ padding: 10, fontSize: 12 }}>
                                <u>
                                    {" "}
                                    <b style={{ textTransform: "uppercase" }}>
                                        ZONE {row.zone}
                                    </b>
                                </u>
                                <br />
                                {row.cod_charges > 0 && row.cod_charges != 0
                                    ? "COD: ₹" + row.cod_charges
                                    : ""}
                                <br />
                                Freight: ₹{row.freight_charge}
                                <br />
                                {parseFloat(row.other_charges) !== 0 && (
                                    <>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={
                                                <Tooltip id="tooltip-top">
                                                    18% GST on ₹
                                                    {row.freight_charge + row.cod_charges} ={" "}
                                                    {(
                                                        (row.freight_charge + row.cod_charges) *
                                                        0.18
                                                    ).toFixed(2)}
                                                    <br />
                                                    {row.other_charges -
                                                        (row.freight_charge + row.cod_charges) *
                                                        0.18 >
                                                        0 &&
                                                        `LM Surcharge ₹${(
                                                            row.other_charges -
                                                            (row.freight_charge + row.cod_charges) *
                                                            0.18
                                                        ).toFixed(2)}`}
                                                    <br />
                                                </Tooltip>
                                            }
                                        >
                                            <span
                                                style={{
                                                    textDecoration: "underline dotted",
                                                    cursor: "help",
                                                }}
                                            >
                                                Other
                                            </span>
                                        </OverlayTrigger>
                                        : ₹{row.other_charges}
                                        <br />
                                    </>
                                )}
                                <i
                                    style={{
                                        fontWeight: 800,
                                        textDecoration: "line-through",
                                        color: "green",
                                    }}
                                >
                                    Platform Fee: ZERO
                                </i>
                                <br />
                                <br />
                                <span
                                    style={{
                                        fontWeight: 800,
                                        textDecoration: "underline",
                                    }}
                                >
                                    Total: ₹{row.total_amount}
                                </span>
                                <br />
                                <br />
                                <i>RTO: ₹{row.rto_charges}</i>
                                <br />
                            </div>
                        );
                    },
                    // compact: true,
                    sortable: true,
                },
                {
                    name: "Estimated Delivery",
                    selector: (row: any) => row.etd_hours,
                    cell: (row: any) => {
                        const deliveryDate = new Date(row.etd);
                        const formattedDate = deliveryDate.toLocaleDateString(
                            undefined,
                            {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            }
                        );

                        return (
                            <div
                                className="smart-estimate"
                                style={{
                                    background:
                                        "linear-gradient(135deg, #f3f9ff, #e6f2ff)",
                                    padding: "10px",
                                    fontSize: "13px",
                                    borderRadius: "10px",
                                    color: "#000434",
                                    fontFamily: "Hiragino Maru Gothic ProN W4",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                                }}
                            >
                                <div
                                    style={{
                                        border:
                                            "linear-gradient(135deg, rgb(245, 137, 30) 0%, rgb(234, 88, 12) 100%)",
                                        color: "#000434",
                                        padding: "4px 12px",
                                        borderRadius: 24,
                                        fontSize: 12,
                                        fontWeight: 600,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 6,
                                        letterSpacing: "0.03em",
                                        boxShadow: "0 0 6px rgba(0, 0, 0, 0.15)",
                                        marginBottom: 8,
                                        animation: "pulseGlow 1.8s infinite ease-in-out",
                                    }}
                                >
                                    <OUAIIcon style={{ width: 20 }} /> OU AI Estimated
                                </div>
                                <div style={{ marginBottom: "4px" }}>
                                    📅{" "}
                                    <strong style={{ color: "#F5891E" }}>Arrives:</strong>{" "}
                                    {formattedDate}
                                </div>

                                <div style={{ marginBottom: "4px" }}>
                                    ⏱️{" "}
                                    <span className="pulse-eta">
                                        {row.estimated_delivery_days}d {row.etd_hours}h
                                    </span>
                                </div>

                                <div
                                    style={{
                                        fontSize: "11px",
                                        marginTop: "6px",
                                        color: "#666",
                                        fontStyle: "italic",
                                    }}
                                >
                                    Based on courier history & zone analysis
                                </div>
                            </div>
                        );
                    },
                    // compact: true,
                    sortable: true,
                },
                actionable &&
                {
                    name: "More",
                    cell: (row: any) => {
                        return (
                            <div
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                    display: "flex",
                                    flexDirection: "column",
                                    padding: 10,
                                    fontSize: 12,
                                }}
                            >
                                <Button
                                    variant="primary"
                                    onClick={() => handleBookShipment(row._id)}
                                >
                                    {"Book Shipment"}
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    style={{ margin: 5 }}
                                    onClick={() =>
                                        shipmentOrder?._id &&
                                        handleSelectShipment(shipmentOrder?._id, row)
                                    }
                                >
                                    {" "}
                                    {"Select"}
                                </Button>
                            </div>
                        );
                    },
                    // compact: true,
                    center: true,

                },
            ]}
        />
    );
};

export default ModernShipmentTable;

import React, { useState } from "react";
import { Badge, Button, Dropdown, Collapse } from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  MoreVertical,
  Flag,
  Pencil,
  MapPin,
  Phone,
  Store,
  Plane,
  ChevronDown,
  ChevronUp,
  Package,
  Loader2,
} from "lucide-react";

// --- Types / Interfaces ---
export interface OrderTableProps {
  orders: any[];
  isLoading: boolean;
  page: number;
  limit: number;
  selectedOrders: string[];
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectOne: (orderId: string) => void;
  onEditOrder: (order: any) => void;
  onViewStatus: (statusList: any[]) => void;
  onShipNow: (order: any) => Promise<void>;
  onPickup: (order: any) => void;
  onPrintLabel: (labelData: any) => void;
  onAutoBook: (orders: any[]) => void;
  onCancelOrder: (orderId: string) => void;
}

const SkeletonRow = () => (
  <tr className="placeholder-glow">
    <td className="p-3">
      <span className="placeholder col-12 rounded"></span>
    </td>
    <td className="p-3">
      <span className="placeholder col-8 rounded"></span>
      <br />
      <span className="placeholder col-6 mt-1 rounded"></span>
    </td>
    <td className="p-3">
      <span className="placeholder col-10 rounded"></span>
      <br />
      <span className="placeholder col-7 mt-1 rounded"></span>
    </td>
    <td className="p-3">
      <span className="placeholder col-9 rounded"></span>
      <br />
      <span className="placeholder col-8 mt-1 rounded"></span>
    </td>
    <td className="p-3">
      <span className="placeholder col-6 rounded"></span>
    </td>
    <td className="p-3">
      <span className="placeholder col-5 rounded"></span>
    </td>
    <td className="p-3">
      <span className="placeholder col-8 rounded"></span>
    </td>
  </tr>
);

const OrdersTable: React.FC<OrderTableProps> = ({
  orders,
  isLoading,
  selectedOrders,
  onSelectAll,
  onSelectOne,
  onEditOrder,
  onViewStatus,
  onShipNow,
  onPickup,
  onPrintLabel,
  onAutoBook,
  onCancelOrder,
}) => {
  // State to track which rows have their multiple items expanded
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [shipLoading, setShipLoading] = useState<string | null>(null);
  const toggleItems = (orderId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedItems(newExpanded);
  };
  const handleShipNow = async (order: any) => {
    setShipLoading(order._id);
    await onShipNow(order);
    setShipLoading(null);
  };
  const getStatusBadgeVariant = (status: string) => {
    const s = status?.toLowerCase() || "";
    if (s.includes("new") || s.includes("open"))
      return { bg: "bg-primary-subtle", text: "text-primary" };
    if (s.includes("delivered"))
      return { bg: "bg-success-subtle", text: "text-success" };
    if (s.includes("transit") || s.includes("shipped"))
      return { bg: "bg-info-subtle", text: "text-info" };
    if (s.includes("cancelled") || s.includes("rto"))
      return { bg: "bg-danger-subtle", text: "text-danger" };
    return { bg: "bg-secondary-subtle", text: "text-secondary" };
  };

  const isAllSelected =
    selectedOrders.length === orders.length && orders.length > 0;

  return (
    <div
      className="bg-white rounded-3 shadow-sm border"
      style={{ minHeight: "500px", overflow: "hidden" }}
    >
      <div className="table-responsive">
        <table
          className="table table-hover align-middle mb-0 custom-table"
          style={{ fontSize: "13.5px" }}
        >
          <thead className="bg-light text-secondary">
            <tr>
              <th
                style={{ width: "40px" }}
                className="text-center py-3 border-bottom-0"
              >
                <input
                  type="checkbox"
                  className="form-check-input shadow-none cursor-pointer border-secondary-subtle"
                  checked={isAllSelected}
                  onChange={onSelectAll}
                  disabled={isLoading || orders.length === 0}
                />
              </th>
              <th
                className="fw-semibold py-3 border-bottom-0 text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Order Info
              </th>
              <th
                className="fw-semibold py-3 border-bottom-0 text-uppercase"
                style={{
                  fontSize: "11px",
                  letterSpacing: "0.5px",
                  width: "28%",
                }}
              >
                Items & Value
              </th>
              <th
                className="fw-semibold py-3 border-bottom-0 text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Customer Details
              </th>
              <th
                className="fw-semibold py-3 border-bottom-0 text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Status & Shipping
              </th>
              <th
                className="fw-semibold py-3 border-bottom-0 text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Risk Flags
              </th>
              <th
                className="text-end fw-semibold py-3 pe-4 border-bottom-0 text-uppercase"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="border-top-0">
            {isLoading ? (
              <>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-5">
                  <div className="d-flex flex-column align-items-center justify-content-center text-muted">
                    <Package size={48} className="mb-3 opacity-25" />
                    <h5 className="fw-semibold text-dark">No orders found</h5>
                    <p className="mb-0" style={{ fontSize: "14px" }}>
                      Adjust your filters or tab selection to see results.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const isChecked = selectedOrders.includes(order._id);
                const statusName =
                  order.latest_status?.toUpperCase() ||
                  order.order_status?.toUpperCase() ||
                  "NEW";

                const issues = order.issues || [];
                const hasRedFlags =
                  issues.length > 0 ||
                  !order.customer_phone ||
                  !order.shipping_pincode;
                const statusColors = getStatusBadgeVariant(statusName);

                const itemsList = order.items || [];
                const hasMultipleItems = itemsList.length > 1;
                const isItemsExpanded = expandedItems.has(order._id);

                return (
                  <tr
                    key={order._id}
                    style={{
                      backgroundColor: isChecked ? "#f0f7ff" : "transparent",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <td className="text-center py-3">
                      <input
                        type="checkbox"
                        className="form-check-input shadow-none cursor-pointer border-secondary-subtle"
                        checked={isChecked}
                        onChange={() => onSelectOne(order._id)}
                      />
                    </td>

                    {/* 1. Order Details */}
                    <td className="py-3">
                      <div className="d-flex flex-column gap-1">
                        <span className="fw-bold text-dark fs-6">
                          #{order.order_id || order.channel_order_id}
                        </span>
                        <span
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {new Date(
                            order.order_date || order.createdAt
                          ).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <div
                          className="d-flex align-items-center gap-1 text-secondary mt-1 bg-light rounded px-2 py-1 w-auto d-inline-flex"
                          style={{ fontSize: "11px", width: "fit-content" }}
                        >
                          <Store size={12} />
                          <span className="fw-medium">
                            {order.channel_account?.channel_account_name ||
                              "Manual Store"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Items & Value (WITH ACCORDION) */}
                    <td className="py-3 pe-4">
                      <div className="d-flex flex-column border rounded-3 p-2 bg-white shadow-sm">
                        {/* Financial Summary Header */}
                        <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom border-light">
                          <span className="d-flex align-items-center gap-1 fw-bold">
                            Amount :
                            <span className="fw-bold fs-6">
                              ₹{order.total_amount}
                            </span>
                          </span>
                          <Badge
                            bg="light"
                            text="dark"
                            className="border text-uppercase"
                            style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                          >
                            {order.payment_method}
                          </Badge>
                        </div>

                        {/* Single Item View */}
                        {!hasMultipleItems && itemsList.length > 0 && (
                          <div className="d-flex flex-column gap-1">
                            <span
                              className="fw-semibold text-dark text-truncate"
                              title={itemsList[0].product?.product_sku_name}
                            >
                              {itemsList[0].product?.product_sku_name ||
                                "Unknown Product"}
                            </span>
                            <div
                              className="d-flex justify-content-between text-muted"
                              style={{ fontSize: "12px" }}
                            >
                              <span>
                                SKU:{" "}
                                {itemsList[0].product?.product_sku_id || "N/A"}
                              </span>
                              <span className="fw-semibold bg-light px-2 rounded">
                                Qty: {itemsList[0].quantity}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Multiple Items Accordion View */}
                        {hasMultipleItems && (
                          <div className="d-flex flex-column">
                            {/* Accordion Toggle */}
                            <div
                              className="d-flex justify-content-between align-items-center cursor-pointer p-1 rounded hover-bg-light transition-all"
                              onClick={() => toggleItems(order._id)}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <Package size={14} className="text-primary" />
                                <span
                                  className="fw-semibold text-primary"
                                  style={{ fontSize: "13px" }}
                                >
                                  {itemsList.length} Items in Order
                                </span>
                              </div>
                              <div className="text-primary bg-primary-subtle rounded-circle p-1 d-flex">
                                {isItemsExpanded ? (
                                  <ChevronUp size={14} />
                                ) : (
                                  <ChevronDown size={14} />
                                )}
                              </div>
                            </div>

                            {/* Expanded Content */}
                            <Collapse in={isItemsExpanded}>
                              <div className="mt-2 pt-2 border-top border-light">
                                <div
                                  className="d-flex flex-column gap-2"
                                  style={{
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }}
                                >
                                  {itemsList.map((item: any, idx: number) => (
                                    <div
                                      key={idx}
                                      className="d-flex flex-column p-2 bg-light rounded border border-light"
                                    >
                                      <span
                                        className="fw-semibold text-dark text-wrap lh-sm mb-1"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {item.product?.product_sku_name ||
                                          "Unknown Product"}
                                      </span>
                                      <div
                                        className="d-flex justify-content-between text-secondary"
                                        style={{ fontSize: "11px" }}
                                      >
                                        <span>
                                          {item.product?.product_sku_id ||
                                            "No SKU"}
                                        </span>
                                        <span className="fw-bold text-dark">
                                          x{item.quantity}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Collapse>
                          </div>
                        )}

                        {itemsList.length === 0 && (
                          <span
                            className="text-muted fst-italic"
                            style={{ fontSize: "12px" }}
                          >
                            No items found
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. Customer Info */}
                    <td className="py-3">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span
                          className="fw-bold text-dark fs-6 text-truncate"
                          style={{ maxWidth: "160px" }}
                        >
                          {order.customer_name}
                        </span>
                        <button
                          className="btn btn-sm btn-light p-1 rounded-circle text-primary hover-shadow transition-all"
                          onClick={() => onEditOrder(order)}
                          title="Edit Customer"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                      <div
                        className="d-flex flex-column gap-1 text-secondary"
                        style={{ fontSize: "12px" }}
                      >
                        <span className="d-flex align-items-center gap-2">
                          <Phone size={12} className="opacity-75" />
                          {order.customer_phone || "No Phone"}
                        </span>
                        <span
                          className="d-flex align-items-start gap-2 text-wrap"
                          style={{ maxWidth: "200px" }}
                        >
                          <MapPin
                            size={12}
                            className="mt-1 opacity-75 flex-shrink-0"
                          />
                          <span className="lh-sm">
                            {order.shipping_city}, {order.shipping_state} <br />
                            <span className="fw-bold text-dark">
                              {order.shipping_pincode}
                            </span>
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* 4. Status & Courier */}
                    <td className="py-3">
                      <div className="d-flex flex-column align-items-start gap-2">
                        <Badge
                          className={`cursor-pointer px-3 py-2 rounded-pill fw-semibold ${statusColors.bg} ${statusColors.text} border-0`}
                          onClick={() => onViewStatus(order.status)}
                          title="Click to view timeline"
                        >
                          {statusName}
                        </Badge>

                        {order.awb_number ? (
                          <div
                            className="bg-light border rounded px-2 py-1 mt-1"
                            style={{ fontSize: "12px" }}
                          >
                            <span className="text-muted">AWB: </span>
                            <Link
                              to={`/track/${order.awb_number}`}
                              className="fw-bold text-primary text-decoration-none"
                            >
                              {order.awb_number}
                            </Link>
                          </div>
                        ) : order.recomended_courier_id ? (
                          <div
                            className="d-flex align-items-center gap-1 text-warning bg-warning bg-opacity-10 px-2 py-1 rounded mt-1"
                            style={{ fontSize: "11px", fontWeight: 600 }}
                          >
                            <Plane size={12} /> Rec:{" "}
                            {order.recomended_courier_id}
                          </div>
                        ) : (
                          <span
                            className="text-muted fst-italic mt-1"
                            style={{ fontSize: "12px" }}
                          >
                            Unassigned
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 5. Risk Flags */}
                    <td className="py-3">
                      <div
                        className="d-flex flex-wrap gap-1"
                        style={{ maxWidth: "160px" }}
                      >
                        {hasRedFlags ? (
                          <>
                            {issues.map((issue: any, idx: number) => (
                              <Badge
                                key={idx}
                                bg="danger"
                                className="d-flex align-items-center gap-1 fw-medium text-start text-wrap px-2 py-1 rounded"
                                style={{ fontSize: "11px" }}
                              >
                                <Flag size={10} />{" "}
                                {issue.message || "Action Required"}
                              </Badge>
                            ))}
                            {!order.customer_phone && (
                              <Badge
                                bg="danger"
                                className="fw-medium px-2 py-1 rounded"
                                style={{ fontSize: "11px" }}
                              >
                                Missing Phone
                              </Badge>
                            )}
                            {!order.shipping_pincode && (
                              <Badge
                                bg="danger"
                                className="fw-medium px-2 py-1 rounded"
                                style={{ fontSize: "11px" }}
                              >
                                Missing ZIP
                              </Badge>
                            )}
                          </>
                        ) : (
                          <div
                            className="d-flex align-items-center gap-1 text-success bg-success bg-opacity-10 px-2 py-1 rounded border border-success border-opacity-25"
                            style={{ fontSize: "12px", fontWeight: 600 }}
                          >
                            <span style={{ fontSize: "14px" }}>✓</span> Clear to
                            Ship
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 6. Actions */}
                    <td className="text-end pe-4 py-3">
                      <div className="d-flex align-items-center justify-content-end gap-2">
                        {order.awb_number ? (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="px-3 rounded-pill fw-semibold border-2"
                            style={{ fontSize: "12px" }}
                            onClick={() => onPickup(order)}
                          >
                            Pickup
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="rounded-pill d-flex align-items-center justify-content-center fw-semibold shadow-sm border-0 text-white"
                            style={{
                              fontSize: "12px",
                              backgroundColor: "#f97316",
                              width: "80px",
                            }}
                            onClick={() => handleShipNow(order)}
                          >
                            {shipLoading === order._id ? (
                              <Loader2
                                height={15}
                                width={15}
                                className="rotate"
                              />
                            ) : (
                              "Ship Now"
                            )}
                          </Button>
                        )}

                        <Dropdown align="end">
                          <Dropdown.Toggle
                            variant="light"
                            size="sm"
                            className="btn-icon rounded-circle p-2 border-0 shadow-none text-secondary bg-transparent hover-bg-light"
                          >
                            <MoreVertical size={16} />
                          </Dropdown.Toggle>
                          <Dropdown.Menu
                            className="shadow border-0 mt-2 rounded-3"
                            style={{ fontSize: "13px", minWidth: "180px" }}
                          >
                            {order.awb_number ? (
                              <Dropdown.Item
                                onClick={() => onPrintLabel(order.label)}
                                className="py-2 d-flex align-items-center gap-2 fw-medium"
                              >
                                🖨️ Print Label
                              </Dropdown.Item>
                            ) : (
                              <Dropdown.Item
                                onClick={() => onAutoBook([order])}
                                className="py-2 d-flex align-items-center gap-2 fw-medium"
                              >
                                📦 Auto Book
                              </Dropdown.Item>
                            )}
                            <Dropdown.Divider className="my-1" />
                            <Dropdown.Item
                              onClick={() => onCancelOrder(order._id)}
                              className="text-danger py-2 d-flex align-items-center gap-2 fw-medium"
                            >
                              ❌ Cancel Order
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;

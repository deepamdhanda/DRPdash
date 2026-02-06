import React, { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/customer/CustomerLayout";
import { Eye } from "lucide-react"; // Matching our Lucide icon set

import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { Order } from "../../Types/types";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const fetchOrders = async () => {
    try {
      const { data } = await customerAxios.get(
        `${drpCrmBaseUrl}/customer/orders`
      );
      setOrders(data.data);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  const navigate = useNavigate();

  // Mapping statuses to Amber/Black/White theme colors via CSS classes
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Delivered":
        return "status-delivered";
      case "Shipped":
        return "status-shipped";
      case "Processing":
        return "status-processing";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  return (
    <Layout title="All Orders">
      <div className="bg-white rounded-3 shadow-sm border overflow-hidden">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center bg-white">
          <h5 className="fw-bold mb-0">Order History</h5>
          <span className="badge bg-amber-light text-amber border-amber">
            {orders.length} Orders Total
          </span>
        </div>

        <div className="table-responsive">
          <Table hover className="align-middle mb-0 custom-table">
            <thead>
              <tr>
                <th className="ps-4">Order ID</th>
                <th>Items</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th className="text-end pe-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => (
                <tr
                  key={order._id}
                  onClick={() => navigate(`/customer/order/${order._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td className="ps-4 fw-semibold text-dark">{order._id}</td>
                  <td className="text-muted">{order.product_name}</td>
                  <td>{new Date(order.createdAt).toDateString()}</td>
                  <td className="fw-bold">₹{order.total_amount}</td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(order.status)}`}
                    >
                      {order.status[0].status}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <Button
                      variant="link"
                      className="p-0 text-amber"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents double navigation
                        navigate(`/customer/order/${order._id}`);
                      }}
                    >
                      <Eye size={18} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default OrderList;

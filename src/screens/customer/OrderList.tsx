import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { motion } from "framer-motion";
import Layout from "../../components/customer/CustomerLayout";
import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { Order } from "../../Types/types";

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const navigate = useNavigate();

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

  // Mapping statuses to Tailwind CSS classes
  const getStatusStyle = (status: string) => {
    const s = status?.toLowerCase() || "";
    switch (s) {
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "shipped":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // Framer Motion variants for staggered list animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <Layout title="All Orders">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
          <h5 className="text-lg font-bold text-gray-900 m-0">Order History</h5>
          <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-sm font-medium">
            {orders.length} Orders Total
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-600">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <motion.tbody
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="divide-y divide-gray-100"
            >
              {orders.map((order: any) => {
                // Safely extract status depending on data structure
                const statusText = order.status?.[0]?.status || "Unknown";

                return (
                  <motion.tr
                    variants={itemVariants}
                    key={order._id}
                    onClick={() => navigate(`/customer/order/${order._id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 truncate ">
                      {order._id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {order.product_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      ₹{order.total_amount}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 text-xs font-medium border rounded-full ${getStatusStyle(
                          statusText
                        )}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-amber-500 hover:text-amber-600 p-2 rounded-full hover:bg-amber-50 transition-colors inline-flex items-center justify-center opacity-70 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevents double navigation trigger
                          navigate(`/customer/order/${order._id}`);
                        }}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}

              {/* Empty state fallback */}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </motion.tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default OrderList;

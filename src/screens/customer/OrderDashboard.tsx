import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  MapPin,
  XCircle,
  Package,
  Edit,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "../../components/customer/CustomerLayout";
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
      if (data.data.customer_address_id) {
        setFormData(data.data.customer_address_id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  // Framer Motion variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  return (
    <Layout title={`Order Details`}>
      <button
        onClick={() => navigate("/customer/order")}
        className="flex items-center text-amber-600 font-semibold mb-6 hover:text-amber-700 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Orders
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Order Info */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 space-y-6"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 p-6 flex justify-between items-center">
              <div>
                <span className="text-gray-500 text-xs uppercase font-bold tracking-wider block mb-1">
                  Order Reference
                </span>
                <h4 className="text-2xl font-bold text-gray-900 m-0">
                  #{orderId}
                </h4>
              </div>
            </div>

            <div className="p-6">
              {/* Items Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h6 className="font-bold text-lg text-gray-900 flex items-center">
                    <Package size={20} className="mr-2 text-amber-500" /> Items
                    Summary
                  </h6>
                </div>

                <div className="flex items-center p-4 border border-gray-100 rounded-lg mb-3 bg-gray-50">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center mr-4 flex-shrink-0">
                    <Package size={24} className="text-gray-400" />
                  </div>
                  <div className="flex-grow">
                    <p className="mb-1 font-bold text-gray-900">
                      {order?.product_name}
                    </p>
                    <p className="text-sm text-gray-500 m-0">
                      Qty: {order?.quantity}
                    </p>
                  </div>
                  <div className="font-bold text-lg text-gray-900">
                    ₹{order?.total_amount}
                  </div>
                </div>
              </div>

              {/* Shipping Address Section */}
              <div>
                <h6 className="font-bold text-lg text-gray-900 mb-4 flex items-center">
                  <MapPin size={20} className="mr-2 text-amber-500" /> Shipping
                  Address
                </h6>
                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex justify-between items-start">
                  <div>
                    <p className="mb-1 font-semibold text-gray-900">
                      {order?.customer_name}
                    </p>
                    <p className="m-0 text-sm text-gray-600 leading-relaxed">
                      {order?.customer_address_id?.addressLine1},{" "}
                      {order?.customer_address_id?.addressLine2}
                      <br />
                      {order?.customer_address_id?.city},{" "}
                      {order?.customer_address_id?.state}{" "}
                      {order?.customer_address_id?.pincode}
                    </p>
                  </div>
                  {!isDelivered && (
                    <button
                      className="text-amber-600 hover:text-amber-700 font-bold text-sm underline-offset-2 hover:underline"
                      onClick={() => setShowAddress(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Summary & Actions */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h6 className="font-bold text-lg text-gray-900 mb-4 border-b border-gray-100 pb-3">
              Order Summary
            </h6>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">
                  ₹{order?.total_amount}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
            </div>
            <hr className="border-gray-100 my-4" />
            <div className="flex justify-between mb-6">
              <span className="font-bold text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">
                ₹{order?.total_amount}
              </span>
            </div>

            <div className="space-y-3">
              <button
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                onClick={() => navigate(`/customer/track/${orderId}`)}
              >
                <Truck size={18} className="mr-2" /> Track Package
              </button>

              <button
                className="w-full bg-white border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
                onClick={() => setShowAddress(true)}
              >
                <Edit size={18} className="mr-2" /> Update Address
              </button>

              {!isDelivered && (
                <div className="text-center mt-4">
                  <button
                    className="text-red-500 hover:text-red-600 text-sm font-bold flex items-center justify-center w-full transition-colors"
                    onClick={() => setShowCancel(true)}
                  >
                    <XCircle size={16} className="mr-1" /> Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- Cancel Order Modal --- */}
      <AnimatePresence>
        {showCancel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowCancel(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-xl z-10"
            >
              <div className="text-center">
                <div className="text-red-500 flex justify-center mb-4">
                  <XCircle size={48} />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">
                  Cancel Order?
                </h4>
                <p className="text-gray-500 text-sm mb-6">
                  Please select a reason for cancellation. This action cannot be
                  undone.
                </p>
              </div>

              {/* Reason Selection */}
              <form className="space-y-3 mb-6 px-2">
                {cancellationReasons.map((reason, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-3 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      className="w-4 h-4 text-amber-500 border-gray-300 focus:ring-amber-500"
                      onChange={() => setCancelReason(reason)}
                      checked={cancelReason === reason}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {reason}
                    </span>
                  </label>
                ))}
              </form>

              <div className="flex gap-3 mt-2">
                <button
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-lg transition-colors"
                  onClick={() => setShowCancel(false)}
                >
                  No, Keep
                </button>
                <button
                  className={`flex-1 font-bold py-3 rounded-lg transition-colors ${
                    !cancelReason
                      ? "bg-red-300 cursor-not-allowed text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                  onClick={handleConfirm}
                  disabled={!cancelReason}
                >
                  Yes, Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Update Address Modal --- */}
      <AnimatePresence>
        {showAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-black">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowAddress(false)}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative bg-white rounded-2xl w-full max-w-lg shadow-xl z-10 flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Update Shipping Address
                </h3>
                <button
                  onClick={() => setShowAddress(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-sm text-gray-500 mb-6">
                  Changes are only possible before the order is shipped.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1}
                      onChange={handleChange}
                      placeholder="House No, Building, Street"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2}
                      onChange={handleChange}
                      placeholder="Area, Landmark"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pb-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit code"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors mt-2"
                  >
                    Save Address
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default OrderDashboard;

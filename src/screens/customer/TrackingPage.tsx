"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Package,
  Copy,
} from "lucide-react";
import { toast } from "react-toastify";
import Layout from "../../components/customer/CustomerLayout";
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

  const handleCopyAwb = (awbCode: string) => {
    if (!awbCode || awbCode === "N/A") return;
    navigator.clipboard.writeText(awbCode);
    toast.success("AWB Code copied to clipboard!");
  };

  // --- DATA MAPPING LOGIC ---
  const trackingData = useMemo(() => {
    if (!order || !order.status)
      return { steps: [], edd: "TBA", currentStatus: "" };

    // 1. Sort status by date (Latest first)
    const sortedStatuses = [...order.status].sort(
      (a, b) =>
        new Date(b.status_date).getTime() - new Date(a.status_date).getTime()
    );

    // 2. Map to UI Steps
    const steps = sortedStatuses.map((s, index) => ({
      status: s.status.replace(/_/g, " "),
      date: new Date(s.status_date).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      location: s.status_details?.origin || s.status_details?.destination || "",
      desc: s.status_details?.courier_name || "Status updated in system",
      completed: true,
      current: index === 0, // Most recent is the current state
    }));

    // 3. Extract EDD
    const eddStatus = order.status.find((s: any) => s.status_details?.edd);
    const edd = eddStatus?.status_details?.edd || "Standard Delivery";

    return { steps, edd, currentStatus: steps[0]?.status || "" };
  }, [order]);

  // Framer Motion Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (loading) {
    return (
      <Layout title="Loading...">
        <div className="p-10 flex flex-col items-center justify-center text-gray-500 h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mb-4"></div>
          <p>Loading Tracking Info...</p>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout title="Error">
        <div className="p-10 text-center text-red-500 font-medium">
          Failed to retrieve data. Please try again later.
        </div>
      </Layout>
    );
  }

  const progressPercentage = Math.min(
    (trackingData.steps.length / 6) * 100,
    100
  );

  const awbCode =
    order.status.find((s: any) => s.status_details?.awb_code)?.status_details
      .awb_code || "N/A";

  const courierName =
    order.status.find((s: any) => s.status_details?.courier_name)
      ?.status_details.courier_name || "Shipping Partner";

  return (
    <Layout title="Track Package">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-amber-600 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" /> Back to Order Details
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Timeline */}
        <motion.div
          variants={fadeInVariants}
          initial="hidden"
          animate="show"
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            {/* Header / EDD */}
            <div className="bg-amber-50 p-6 flex items-center justify-between border-b border-amber-100">
              <div>
                <p className="text-amber-600 font-bold text-xs uppercase tracking-wider mb-1">
                  Estimated Delivery
                </p>
                <h2 className="text-3xl font-extrabold text-gray-900 m-0">
                  {trackingData.edd}
                </h2>
                <p className="text-gray-500 text-sm mt-1 capitalize">
                  Current Status:{" "}
                  <span className="font-semibold text-gray-700">
                    {trackingData.currentStatus}
                  </span>
                </p>
              </div>
              <div className="bg-white p-4 rounded-full shadow-sm text-amber-500">
                <Truck size={32} />
              </div>
            </div>

            <div className="p-6 md:p-8">
              <p className="font-bold text-sm text-gray-500 mb-3">
                Shipment Progress
              </p>

              {/* Custom Progress Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-8 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-amber-500 h-2.5 rounded-full"
                ></motion.div>
              </div>

              {/* Timeline Items */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="pl-2 relative"
              >
                {trackingData.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="flex relative pb-8 last:pb-0"
                  >
                    {/* Connecting Line (hide for last item) */}
                    {index !== trackingData.steps.length - 1 && (
                      <div className="absolute left-4 top-8 -bottom-2 w-0.5 bg-gray-200 z-0"></div>
                    )}

                    {/* Icon / Node */}
                    <div className="mr-6 relative z-10 flex-shrink-0">
                      {step.current ? (
                        <div className="relative flex h-8 w-8 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-8 w-8 bg-amber-500 text-white items-center justify-center shadow-md">
                            <Truck size={16} />
                          </span>
                        </div>
                      ) : (
                        <div className="relative flex h-8 w-8 bg-gray-900 rounded-full text-white items-center justify-center shadow-md">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 ${
                        !step.current ? "opacity-75" : "opacity-100"
                      }`}
                    >
                      <h6
                        className={`font-bold text-base capitalize mb-1 ${
                          step.current ? "text-amber-600" : "text-gray-900"
                        }`}
                      >
                        {step.status}
                      </h6>
                      <p className="text-sm text-gray-500 mb-2">{step.desc}</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
                          <Clock size={12} className="mr-1.5" /> {step.date}
                        </span>
                        {step.location && (
                          <span className="inline-flex items-center text-xs text-gray-500">
                            <MapPin size={12} className="mr-1" />{" "}
                            {step.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Cards */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h6 className="font-bold text-gray-900 mb-4 flex items-center">
              <Package size={18} className="mr-2 text-amber-500" /> Courier
              Details
            </h6>
            <div className="bg-gray-50 p-3 rounded-lg mb-4 border border-gray-100">
              <span className="font-bold text-gray-800">{courierName}</span>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">
                AWB Code
              </label>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-2 justify-between">
                <span className="font-mono font-bold text-gray-800 text-sm ml-1">
                  {awbCode}
                </span>
                <button
                  onClick={() => handleCopyAwb(awbCode)}
                  className="text-gray-400 hover:text-amber-500 hover:bg-amber-50 p-2 rounded-md transition-colors"
                  title="Copy AWB Code"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h6 className="font-bold text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
              <MapPin size={18} className="mr-2 text-amber-500" /> Shipping To
            </h6>
            <p className="font-bold text-gray-900 mb-1">
              {order.customer_address_id?.name || order.customer_name}
            </p>
            <p className="text-sm text-gray-500 leading-relaxed m-0">
              {order.customer_address_id?.addressLine1},{" "}
              {order.customer_address_id?.addressLine2}
              <br />
              {order.customer_address_id?.city},{" "}
              {order.customer_address_id?.state}{" "}
              {order.customer_address_id?.pincode}
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackingPage;

import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  X,
  Loader2,
  Zap,
  TrendingDown,
  Award,
  ArrowRight,
} from "lucide-react";

export default function ShipmentModal({
  showShipmentModal,
  handleShipmentClose,
  shipmentOrder,
  shipmentDetails,
  handleBookShipment,
}: any) {
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [sortBy, setSortBy] = useState("recommended");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    if (showShipmentModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showShipmentModal]);

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
    const checkIsSurface = (c: any) =>
      c.is_surface === true || c.name?.toLowerCase().includes("surface");

    const cheapest = [...list].sort(
      (a, b) => a.total_amount - b.total_amount
    )[0]?._id;
    const fastest = [...list].sort(
      (a, b) =>
        Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
    )[0]?._id;
    const bestRated = [...list].sort((a, b) => b.rating - a.rating)[0]?._id;

    if (filterType === "air") list = list.filter((c) => !checkIsSurface(c));
    if (filterType === "surface") list = list.filter((c) => checkIsSurface(c));

    if (sortBy === "cheapest")
      list.sort((a, b) => a.total_amount - b.total_amount);
    if (sortBy === "fastest")
      list.sort(
        (a, b) =>
          Number(a.estimated_delivery_days) - Number(b.estimated_delivery_days)
      );
    if (sortBy === "best-rated") list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "recommended")
      list.sort(
        (a, b) => b.rating - a.rating || a.total_amount - b.total_amount
      );

    return {
      couriers: list,
      cheapestId: cheapest,
      fastestId: fastest,
      bestRatedId: bestRated,
    };
  }, [shipmentDetails, sortBy, filterType]);

  return (
    <AnimatePresence>
      {showShipmentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 md:p-6">
          {/* Glassmorphic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleShipmentClose}
            className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />

          {/* Main Modal Container - Widened for SaaS Aesthetic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative w-full h-full sm:h-auto max-h-[100vh] sm:max-h-[95vh] max-w-[1300px] w-[96vw] bg-zinc-50 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-zinc-200 z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 text-[#F5891E] p-2 rounded-xl shadow-sm border border-orange-100/50 hidden sm:block">
                  <PackageOpen size={22} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2 sm:gap-3 tracking-tight">
                    Process Shipment
                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-md text-[11px] sm:text-[13px] font-bold tracking-wider">
                      ORD-{shipmentOrder?.order_id || "—"}
                    </span>
                  </h2>
                </div>
              </div>
              <button
                onClick={handleShipmentClose}
                className="p-2 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 custom-scrollbar">
              {shipmentDetails ? (
                <>
                  {/* --- 1. OVERVIEW WIDGETS --- */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                    {/* Dispatch */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl border border-zinc-200 shadow-sm flex items-start gap-3.5">
                      <div className="bg-zinc-100 text-zinc-600 p-2.5 rounded-lg shrink-0 border border-zinc-200/60">
                        <Store size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-1">
                          Dispatch From
                        </div>
                        <div className="text-[14px] font-bold text-zinc-900 truncate">
                          {shipmentDetails.fulfillment.warehouseDetails.name}
                        </div>
                        <div className="text-[12px] text-zinc-500 mt-0.5 leading-snug">
                          {shipmentDetails.fulfillment.warehouseDetails.City},{" "}
                          {shipmentDetails.fulfillment.warehouseDetails.State} -{" "}
                          {shipmentDetails.fulfillment.warehouseDetails.pincode}
                        </div>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl border border-zinc-200 shadow-sm flex items-start gap-3.5">
                      <div className="bg-zinc-100 text-zinc-600 p-2.5 rounded-lg shrink-0 border border-zinc-200/60">
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0 w-full">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-1">
                          Shipping To
                        </div>
                        <div className="text-[14px] font-bold text-zinc-900 truncate">
                          {shipmentOrder?.customer_name}
                        </div>
                        <div className="text-[12px] text-zinc-500 mt-0.5 leading-snug truncate">
                          {shipmentOrder?.shipping_city},{" "}
                          {shipmentOrder?.shipping_state} -{" "}
                          {shipmentOrder?.shipping_pincode}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold border bg-zinc-50 border-zinc-200">
                          {shipmentOrder?.payment_method
                            ?.toLowerCase()
                            .includes("cod") ? (
                            <>
                              <span className="text-red-600">COD</span> • ₹
                              {shipmentOrder?.total_amount}
                            </>
                          ) : (
                            <>
                              <span className="text-emerald-600">Prepaid</span>{" "}
                              • ₹{shipmentOrder?.total_amount}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Weight Calc */}
                    <div className="bg-white p-4 lg:p-5 rounded-xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest flex items-center gap-1.5">
                          <Scale size={14} className="text-zinc-400" /> Weight
                          Summary
                        </div>
                        <Info
                          size={14}
                          className="text-zinc-300 hover:text-zinc-500 cursor-help transition-colors"
                        />
                      </div>
                      <div className="flex items-center justify-between text-center bg-zinc-50 rounded-lg p-2.5 border border-zinc-100">
                        <div>
                          <div className="text-[13px] font-bold text-zinc-800">
                            {shipmentDetails.weight.actual} kg
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium">
                            Actual
                          </div>
                        </div>
                        <div className="text-zinc-300">/</div>
                        <div>
                          <div className="text-[13px] font-bold text-zinc-800">
                            {shipmentDetails.weight.volumetric} kg
                          </div>
                          <div className="text-[10px] text-zinc-400 font-medium">
                            Volumetric
                          </div>
                        </div>
                        <div className="text-zinc-300">=</div>
                        <div className="bg-emerald-50 border border-emerald-100 px-3 py-1 rounded shadow-sm">
                          <div className="text-[14px] font-black text-emerald-600">
                            {shipmentDetails.weight.billable} kg
                          </div>
                          <div className="text-[9px] font-bold text-emerald-600/70 tracking-widest mt-0.5">
                            BILLED
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- 2. PACKAGING --- */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <h6 className="text-[12px] font-bold text-zinc-800 uppercase tracking-wider m-0">
                        Packaging Selection
                      </h6>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {shipmentDetails.recommendedPacks.map(
                        (pack: any, index: number) => {
                          const isSelected = selectedPackageIndex === index;
                          return (
                            <div
                              key={index}
                              onClick={() => setSelectedPackageIndex(index)}
                              className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 flex items-center border ${
                                isSelected
                                  ? "bg-orange-50/40 border-[#F5891E] shadow-[0_2px_12px_rgba(245,137,30,0.12)] ring-1 ring-[#F5891E]/30"
                                  : "bg-white border-zinc-200 shadow-sm hover:border-zinc-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-white rounded-full">
                                  <CheckCircle2
                                    className="text-[#F5891E]"
                                    size={20}
                                  />
                                </div>
                              )}
                              <div
                                className={`p-2.5 rounded-full mr-3 shrink-0 ${
                                  isSelected
                                    ? "bg-orange-100 text-[#F5891E]"
                                    : "bg-zinc-100 text-zinc-500"
                                }`}
                              >
                                <PackageOpen size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`text-[13px] font-bold truncate ${
                                    isSelected
                                      ? "text-orange-950"
                                      : "text-zinc-900"
                                  }`}
                                >
                                  {pack.name}
                                </div>
                                <div className="text-[11px] text-zinc-500 mt-0.5">
                                  {pack.length}×{pack.breadth}×{pack.height} cm
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* --- 3. COURIERS LIST --- */}
                  <div className="bg-white rounded-xl border border-zinc-200 shadow-sm flex flex-col flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 lg:px-6 border-b border-zinc-200 gap-4 bg-zinc-50/50 rounded-t-xl">
                      <div className="flex items-center gap-2">
                        <h6 className="text-[14px] font-bold text-zinc-900 m-0">
                          Available Routes
                        </h6>
                        <span className="bg-white text-zinc-600 px-2 py-0.5 rounded text-[11px] font-bold border border-zinc-200 shadow-sm">
                          {couriers.length} Found
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
                        <div className="flex p-1 bg-zinc-200/60 rounded-lg shrink-0">
                          {[
                            "recommended",
                            "cheapest",
                            "fastest",
                            "best-rated",
                          ].map((sortOption) => (
                            <button
                              key={sortOption}
                              onClick={() => setSortBy(sortOption)}
                              className={`px-4 py-1.5 text-[11px] font-bold rounded-md capitalize transition-all duration-200 ${
                                sortBy === sortOption
                                  ? "bg-white text-zinc-900 shadow-sm"
                                  : "text-zinc-500 hover:text-zinc-800"
                              }`}
                            >
                              {sortOption.replace("-", " ")}
                            </button>
                          ))}
                        </div>
                        <select
                          value={filterType}
                          onChange={(e) => setFilterType(e.target.value)}
                          className="bg-white border border-zinc-200 text-zinc-700 text-[11px] font-bold rounded-lg focus:ring-[#F5891E] focus:border-[#F5891E] px-3 py-2 outline-none cursor-pointer shrink-0 shadow-sm"
                        >
                          <option value="all">All Modes</option>
                          <option value="air">✈️ Air</option>
                          <option value="surface">🚚 Surface</option>
                        </select>
                      </div>
                    </div>

                    {/* Courier List - Wide Horizontal Layout */}
                    <div className="p-2 sm:p-4 lg:p-6 overflow-y-auto max-h-[55vh] bg-zinc-50/30 rounded-b-xl space-y-4">
                      {couriers.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 text-[13px] font-medium">
                          No couriers match your criteria.
                        </div>
                      ) : (
                        couriers.map((courier: any) => {
                          const isRecommended =
                            sortBy === "recommended" &&
                            courier._id === couriers[0]?._id;
                          const isSurfaceCourier =
                            courier.is_surface === true ||
                            courier.name?.toLowerCase().includes("surface");

                          return (
                            <motion.div
                              layout
                              key={courier._id}
                              className={`relative bg-white p-4 lg:p-5 rounded-xl border transition-all duration-200 hover:shadow-md ${
                                isRecommended
                                  ? "border-[#F5891E]/40 shadow-[0_2px_16px_rgba(245,137,30,0.06)]"
                                  : "border-zinc-200 shadow-sm"
                              }`}
                            >
                              {/* Smart Tags Array */}
                              <div className="absolute -top-3 left-4 flex gap-1.5 z-10">
                                {isRecommended && (
                                  <Badge
                                    icon={
                                      <Star size={10} className="fill-white" />
                                    }
                                    text="Recommended"
                                    bg="bg-gradient-to-r from-[#F5891E] to-[#E0730A]"
                                    textCol="text-white"
                                    border="border-transparent"
                                  />
                                )}
                                {courier._id === cheapestId && (
                                  <Badge
                                    icon={<TrendingDown size={10} />}
                                    text="Cheapest"
                                    bg="bg-emerald-100"
                                    textCol="text-emerald-700"
                                    border="border-emerald-200"
                                  />
                                )}
                                {courier._id === fastestId && (
                                  <Badge
                                    icon={<Zap size={10} />}
                                    text="Fastest"
                                    bg="bg-blue-100"
                                    textCol="text-blue-700"
                                    border="border-blue-200"
                                  />
                                )}
                                {courier._id === bestRatedId && (
                                  <Badge
                                    icon={<Award size={10} />}
                                    text="Top Rated"
                                    bg="bg-amber-100"
                                    textCol="text-amber-700"
                                    border="border-amber-200"
                                  />
                                )}
                              </div>

                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-0 items-center mt-2 lg:mt-0">
                                {/* 1. Courier Identity (Col 3) */}
                                <div className="lg:col-span-3 flex items-center gap-3">
                                  <div
                                    className={`flex justify-center items-center w-12 h-12 rounded-xl shrink-0 border ${
                                      isSurfaceCourier
                                        ? "bg-zinc-50 border-zinc-200 text-zinc-500"
                                        : "bg-blue-50 border-blue-100 text-blue-500"
                                    }`}
                                  >
                                    {isSurfaceCourier ? (
                                      <Truck size={22} />
                                    ) : (
                                      <Plane size={22} />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[15px] font-bold text-zinc-900 truncate">
                                      {courier.courier_name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1 text-[11px]">
                                      <span className="flex items-center gap-1 bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 font-bold border border-zinc-200">
                                        <Star
                                          size={10}
                                          className="text-[#F5891E] fill-[#F5891E]"
                                        />{" "}
                                        {courier.rating}
                                      </span>
                                      <span className="text-zinc-500 font-medium">
                                        {isSurfaceCourier
                                          ? "Surface Cargo"
                                          : "Air Express"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 2. Delivery Stats (Col 3) */}
                                <div className="lg:col-span-3 flex lg:justify-center gap-8 lg:gap-10 lg:border-l lg:border-zinc-100 lg:px-6">
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                                      Delivery By
                                    </span>
                                    <span className="text-[13px] font-bold text-zinc-900">
                                      {courier.etd}
                                    </span>
                                    <span className="text-[11px] text-zinc-500 font-medium">
                                      {courier.estimated_delivery_days} transit
                                      days
                                    </span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                                      Risk Score
                                    </span>
                                    <span className="text-[13px] font-bold text-emerald-600">
                                      {courier.rto_performance}/10
                                    </span>
                                    <span className="text-[11px] text-zinc-500 font-medium">
                                      Reliability
                                    </span>
                                  </div>
                                </div>

                                {/* 3. Detailed Price Breakdown (Col 4) */}
                                <div className="lg:col-span-4 lg:border-l lg:border-zinc-100 lg:px-6">
                                  <div className="flex flex-col gap-1.5 text-[11px] text-zinc-600">
                                    <div className="flex justify-between items-center">
                                      <span>Freight Charge</span>
                                      <span className="font-semibold text-zinc-900">
                                        ₹{courier.freight_charge || "0.00"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>COD Fees</span>
                                      <span className="font-semibold text-zinc-900">
                                        ₹{courier.cod_charges || "0.00"}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span>Other Surcharges</span>
                                      <span className="font-semibold text-zinc-900">
                                        ₹{courier.other_charges || "0.00"}
                                      </span>
                                    </div>
                                    {/* RTO displayed subtly as an extra condition */}
                                    <div className="flex justify-between items-center text-red-500/80 mt-1 border-t border-zinc-100 pt-1">
                                      <span className="italic">
                                        RTO (If Failed)
                                      </span>
                                      <span className="font-medium">
                                        ₹{courier.rto_charges || "0.00"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* 4. Total & Action (Col 2) */}
                                <div className="lg:col-span-2 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 lg:border-l lg:border-zinc-100 lg:pl-6">
                                  <div className="text-left lg:text-right">
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                                      Total
                                    </div>
                                    <div className="text-[20px] lg:text-[22px] font-bold text-neutral-900 leading-none">
                                      ₹{Number(courier.total_amount).toFixed(2)}
                                    </div>
                                  </div>

                                  {/* Sleek, aesthetic "Book" button */}
                                  <button
                                    onClick={() =>
                                      handleBookShipment(courier._id)
                                    }
                                    className="group relative inline-flex items-center justify-center gap-2 px-5 py-2 lg:py-2.5 text-[12px] font-bold text-white bg-neutral-700 rounded-full overflow-hidden transition-all duration-300 hover:bg-[#F5891E] shadow-sm hover:shadow-[0_4px_12px_rgba(245,137,30,0.3)] w-32 shrink-0"
                                  >
                                    <span>Book</span>
                                    <ArrowRight
                                      size={14}
                                      className="transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Loading State */
                <div className="flex flex-col items-center justify-center py-24 min-h-[400px]">
                  <Loader2
                    className="animate-spin text-[#F5891E] mb-4"
                    size={44}
                  />
                  <h6 className="text-[18px] font-bold text-zinc-900 mb-1 tracking-tight">
                    Analyzing Routes...
                  </h6>
                  <p className="text-[14px] text-zinc-500 font-medium">
                    Calculating freight, COD charges, and delivery timelines.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Reusable micro-component for Smart Tags
const Badge = ({
  text,
  icon,
  bg,
  textCol,
  border,
}: {
  text: string;
  icon: React.ReactNode;
  bg: string;
  textCol: string;
  border: string;
}) => (
  <span
    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm ${bg} ${textCol} border ${border}`}
  >
    {icon} {text}
  </span>
);

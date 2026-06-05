import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Info,
  MapPin,
  Package,
  Calculator,
  Truck,
  IndianRupee,
} from "lucide-react";
import { drpCrmBaseUrl } from "../../axios/urls";
import RecomendedCouriers, {
  Courier,
} from "../../components/RecomendedCouriers";

// Reusable Tooltip Label Component
const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <div className="flex items-center gap-1.5 mb-1.5 relative group w-fit cursor-help">
    <label className="block text-sm font-semibold text-gray-700 cursor-help">
      {label}
    </label>
    <Info className="w-3.5 h-3.5 text-gray-400" />
    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-56 p-2 bg-gray-800 text-white text-xs font-normal rounded-lg shadow-lg z-10 pointer-events-none">
      {tooltip}
      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const ShippingCalculator: React.FC = () => {
  const [pickupPincode, setPickupPincode] = useState<string>("");
  const [deliveryPincode, setDeliveryPincode] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [isCOD, setIsCOD] = useState<boolean>(false);
  const [length, setLength] = useState<string>("");
  const [breadth, setBreadth] = useState<string>("");
  const [height, setHeight] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [chargeableWeight, setChargeableWeight] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shippingRates, setShippingRates] = useState<Courier[]>([]);

  // Auto-calculate chargeable weight
  useEffect(() => {
    const l = parseFloat(length) || 0;
    const b = parseFloat(breadth) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;

    const volumetricWeight = (l * b * h) / 5000;
    const calculatedWeight = Math.max(volumetricWeight, w);
    setChargeableWeight(calculatedWeight);
  }, [length, breadth, height, weight]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShippingRates([]);

    // Validation
    if (!pickupPincode || pickupPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pickup pincode");
      return;
    }
    if (!deliveryPincode || deliveryPincode.length !== 6) {
      toast.error("Please enter a valid 6-digit delivery pincode");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (chargeableWeight <= 0) {
      toast.error("Please enter valid dimensions or weight");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${drpCrmBaseUrl}/user/courier/check-delivery`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            pickup_pincode: pickupPincode,
            delivery_pincode: deliveryPincode,
            amount: parseFloat(amount),
            is_cod: isCOD,
            length: parseFloat(length),
            breadth: parseFloat(breadth),
            height: parseFloat(height),
            weight: parseFloat(weight),
            chargeable_weight: chargeableWeight,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch shipping rates");
      }

      const data = await response.json();
      console.log(data.data);
      const couriers = data?.data || [];
      setShippingRates(couriers);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while fetching rates.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-10 text-black">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#000434] text-white py-4 px-6 relative flex items-center justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-center">
            OU AI Powered - Shipping Charge Calculator
          </h2>
          <span className="absolute right-4 md:right-6 px-2.5 py-1 text-xs font-bold text-[#000434] bg-white rounded-md">
            v1.0
          </span>
        </div>

        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Location Details */}
            <section>
              <div className="flex items-center gap-2 border-b-2 border-[#F5891E] pb-2 mb-4">
                <MapPin className="w-5 h-5 text-[#000434]" />
                <h3 className="text-lg font-bold text-gray-900">
                  Location Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <LabelWithTooltip
                    label="Pickup Pincode"
                    tooltip="6-digit pincode where shipment will be picked up"
                  />
                  <input
                    type="text"
                    value={pickupPincode}
                    onChange={(e) =>
                      setPickupPincode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
                <div>
                  <LabelWithTooltip
                    label="Delivery Pincode"
                    tooltip="6-digit pincode where shipment will be delivered"
                  />
                  <input
                    type="text"
                    value={deliveryPincode}
                    onChange={(e) =>
                      setDeliveryPincode(
                        e.target.value.replace(/\D/g, "").slice(0, 6)
                      )
                    }
                    placeholder="Enter 6-digit pincode"
                    maxLength={6}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Order Details */}
            <section>
              <div className="flex items-center gap-2 border-b-2 border-[#F5891E] pb-2 mb-4">
                <IndianRupee className="w-5 h-5 text-[#000434]" />
                <h3 className="text-lg font-bold text-gray-900">
                  Order Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <LabelWithTooltip
                    label="Amount (₹)"
                    tooltip="Total order value in rupees"
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Payment Method
                  </label>
                  <div className="pt-2">
                    <label className="inline-flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={isCOD}
                        onChange={(e) => setIsCOD(e.target.checked)}
                        className="w-5 h-5 text-[#F5891E] rounded border-gray-300 focus:ring-[#F5891E] cursor-pointer"
                      />
                      <span className="ml-2 text-gray-700 font-medium group-hover:text-gray-900">
                        Cash on Delivery (COD)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </section>

            {/* Package Details */}
            <section>
              <div className="flex items-center gap-2 border-b-2 border-[#F5891E] pb-2 mb-4">
                <Package className="w-5 h-5 text-[#000434]" />
                <h3 className="text-lg font-bold text-gray-900">
                  Package Details
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <LabelWithTooltip
                    label="Length (cm)"
                    tooltip="Package length in centimeters"
                  />
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="cm"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
                <div>
                  <LabelWithTooltip
                    label="Breadth (cm)"
                    tooltip="Package breadth in centimeters"
                  />
                  <input
                    type="number"
                    value={breadth}
                    onChange={(e) => setBreadth(e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="cm"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
                <div>
                  <LabelWithTooltip
                    label="Height (cm)"
                    tooltip="Package height in centimeters"
                  />
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="0"
                    step="0.1"
                    placeholder="cm"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
                <div>
                  <LabelWithTooltip
                    label="Weight (kg)"
                    tooltip="Actual package weight in kilograms"
                  />
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="kg"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Chargeable Weight Info */}
            <div className="bg-[#F5891E]/10 border border-[#F5891E]/30 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F5891E]/20 rounded-full flex items-center justify-center shrink-0">
                  <Calculator className="w-5 h-5 text-[#F5891E]" />
                </div>
                <div>
                  <div className="text-sm text-[#000434] font-semibold">
                    Calculated Chargeable Weight
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">
                    Max(Volumetric Weight, Actual Weight) • Volumetric = (L × B
                    × H) ÷ 5000
                  </div>
                </div>
              </div>
              <div className="text-2xl font-bold text-[#000434]">
                {chargeableWeight.toFixed(2)}{" "}
                <span className="text-base font-medium text-gray-600">kg</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-10 py-3.5 bg-[#000434] text-white font-semibold rounded-xl hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mx-auto shadow-md shadow-gray-300"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Fetching Rates...
                  </span>
                ) : (
                  <>
                    <Truck className="w-5 h-5" />
                    Calculate Shipping Charges
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Display */}
          {error && !loading && shippingRates.length === 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          {/* Results Table */}
          {shippingRates.length > 0 && !loading && (
            <div className="mt-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-3">
                Available Courier Options
              </h3>
              <RecomendedCouriers
                shipmentOptions={shippingRates}
                actionable={false}
              />
            </div>
          )}

          <footer className="text-center mt-12 text-sm text-[#F5891E] font-bold">
            OU AI Powered &copy; 2025
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;

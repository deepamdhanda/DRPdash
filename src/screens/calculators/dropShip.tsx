import React, { useState, ChangeEvent } from "react";
import { Info, Lightbulb, BarChart3 } from "lucide-react";

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
    <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs font-normal rounded-lg shadow-lg z-10 pointer-events-none">
      {tooltip}
      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
    </div>
  </div>
);

const DropShipCalculator: React.FC = () => {
  const [productCost, setProductCost] = useState<number>(56);
  const [packingCost, setPackingCost] = useState<number>(3);
  const [isPackingRefundable, setIsPackingRefundable] =
    useState<boolean>(false);

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

  const deliveredOrders =
    totalOrders - Math.floor((totalOrders * rtoPercentage) / 100);
  const rtoOrders = Math.floor((totalOrders * rtoPercentage) / 100);

  const deliveredUnitCost = productCost + packingCost + cpp + netCODCost;
  const rtoUnitCost =
    (isPackingRefundable ? 0 : packingCost) + cpp + netRTOCost;

  const deliveredInvestment = deliveredOrders * deliveredUnitCost;
  const rtoInvestment = rtoOrders * rtoUnitCost;
  const netInvestment = deliveredInvestment + rtoInvestment;

  const deliveredProfit = deliveredOrders * sellingPrice - deliveredInvestment;
  const rtoProfit = -rtoInvestment;
  const netProfit = deliveredProfit + rtoProfit;

  const netProfitPercentage = netInvestment
    ? (netProfit / netInvestment) * 100
    : 0;

  const breakEvenOrders =
    (deliveredOrders * (sellingPrice - productCost - packingCost - netCODCost) -
      rtoOrders * ((isPackingRefundable ? 0 : packingCost) + netRTOCost)) /
    (deliveredOrders + rtoOrders);

  const roi = netInvestment ? (netProfit / netInvestment) * 100 : 0;
  const roas = netInvestment ? (sellingPrice * totalOrders) / netInvestment : 0;
  const marginPerOrder = sellingPrice - deliveredUnitCost;
  const successRate = totalOrders ? (deliveredOrders / totalOrders) * 100 : 0;
  const rtoRate = totalOrders ? (rtoOrders / totalOrders) * 100 : 0;

  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<number>>, min = 0) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < min) val = min;
      setter(val);
    };

  return (
    <div className="w-full max-w-5xl mx-auto text-black">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#000434] text-white py-4 px-6 relative flex items-center justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-center">
            OU AI Powered - Drop Shipping Cost Calculator
          </h2>
          <span className="absolute right-4 md:right-6 px-2.5 py-1 text-xs font-bold text-[#000434] bg-white rounded-md">
            v1.0
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-6 h-6 text-[#000434]" />
            <h3 className="text-xl font-bold text-[#000434]">
              Input Your Order Economics
            </h3>
          </div>

          {/* Inputs Section */}
          <div className="space-y-6 mb-10">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <LabelWithTooltip
                  label="Product Cost"
                  tooltip="Cost of the product per unit"
                />
                <input
                  type="number"
                  value={productCost}
                  onChange={handleNumberChange(setProductCost)}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
              <div>
                <LabelWithTooltip
                  label="Packing Cost"
                  tooltip="Packing cost per unit"
                />
                <input
                  type="number"
                  value={packingCost}
                  onChange={handleNumberChange(setPackingCost)}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
                <label className="flex items-center gap-2 mt-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPackingRefundable}
                    onChange={() =>
                      setIsPackingRefundable(!isPackingRefundable)
                    }
                    className="w-4 h-4 text-[#F5891E] rounded border-gray-300 focus:ring-[#F5891E]"
                  />
                  Refundable on RTO?
                </label>
              </div>
              <div>
                <LabelWithTooltip
                  label="CPP (Cost Per Purchase)"
                  tooltip="Advertising cost per sale"
                />
                <input
                  type="number"
                  value={cpp}
                  onChange={handleNumberChange(setCpp)}
                  min={0}
                  step={0.1}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-t border-gray-100 pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Freight Charges
                </label>
                <input
                  type="number"
                  value={freightCharges}
                  onChange={handleNumberChange(setFreightCharges)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  COD Charges
                </label>
                <input
                  type="number"
                  value={codCharges}
                  onChange={handleNumberChange(setCodCharges)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  RTO Charges
                </label>
                <input
                  type="number"
                  value={rtoCharges}
                  onChange={handleNumberChange(setRtoCharges)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Fulfilment GST (%)
                </label>
                <input
                  type="number"
                  value={fulfilmentGST}
                  onChange={handleNumberChange(setFulfilmentGST)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-100 pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Selling Price
                </label>
                <input
                  type="number"
                  value={sellingPrice}
                  onChange={handleNumberChange(setSellingPrice)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Total Orders
                </label>
                <input
                  type="number"
                  value={totalOrders}
                  onChange={handleNumberChange(setTotalOrders)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  RTO %
                </label>
                <input
                  type="number"
                  value={rtoPercentage}
                  onChange={handleNumberChange(setRtoPercentage)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Summary Dashboard */}
          <div className="bg-[#F5891E] text-white p-6 md:p-8 rounded-2xl shadow-md">
            <div className="flex items-center gap-2 mb-6 border-b border-white/20 pb-4">
              <BarChart3 className="w-6 h-6 text-[#000434]" />
              <h3 className="text-2xl font-bold text-[#000434]">Summary</h3>
            </div>

            <div className="space-y-8">
              {/* Order Summary */}
              <section>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3">
                  🧾 Order Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      Total Orders
                    </div>
                    <div className="text-lg font-bold">{totalOrders}</div>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      Delivered
                    </div>
                    <div className="text-lg font-bold">{deliveredOrders}</div>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      RTO Orders
                    </div>
                    <div className="text-lg font-bold">{rtoOrders}</div>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      Success Rate
                    </div>
                    <div className="text-lg font-bold">
                      {successRate.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      RTO Rate
                    </div>
                    <div className="text-lg font-bold">
                      {rtoRate.toFixed(2)}%
                    </div>
                  </div>
                </div>
              </section>

              {/* Profitability */}
              <section>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3">
                  💸 Profitability
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      Delivered Profit
                    </div>
                    <div className="text-lg font-bold">
                      ₹{deliveredProfit.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white/10 p-3 rounded-lg border border-red-400/30">
                    <div className="text-xs text-red-100 font-medium">
                      RTO Loss
                    </div>
                    <div className="text-lg font-bold text-red-100">
                      ₹{rtoProfit.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#000434]/20 p-3 rounded-lg border border-[#000434]/10">
                    <div className="text-xs text-white/80 font-medium">
                      Net Profit
                    </div>
                    <div
                      className={`text-lg font-bold ${
                        netProfit >= 0 ? "text-green-100" : "text-red-200"
                      }`}
                    >
                      ₹{netProfit.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      Profit %
                    </div>
                    <div className="text-lg font-bold">
                      {netProfitPercentage.toFixed(2)}%
                    </div>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg">
                    <div className="text-xs text-white/80 font-medium">
                      Margin Per Order
                    </div>
                    <div className="text-lg font-bold">
                      ₹{marginPerOrder.toFixed(2)}
                    </div>
                  </div>
                </div>
              </section>

              {/* Financial Efficiency */}
              <section>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-3">
                  📊 Financial Efficiency
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-[#000434]/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-white/80 font-medium">
                      Break-even Orders:
                    </span>
                    <span className="text-lg font-bold">
                      {breakEvenOrders.toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-white/80 font-medium">
                      Return on Inv. (ROI):
                    </span>
                    <span className="text-lg font-bold">{roi.toFixed(2)}%</span>
                  </div>
                  <div className="bg-[#000434]/10 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm text-white/80 font-medium">
                      ROAS:
                    </span>
                    <span className="text-lg font-bold">{roas.toFixed(2)}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <footer className="text-center mt-8 text-sm text-[#F5891E] font-bold">
            OU AI Powered &copy; 2025
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DropShipCalculator;

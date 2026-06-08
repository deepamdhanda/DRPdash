import React, { useState, ChangeEvent } from "react";
import { Info } from "lucide-react";

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

  const netProductPrice =
    packingCost + (inventoryCost + shippingCost) / (orderingInventory || 1);

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

  const deliveredInvestment =
    deliveredOrders * (netCODCost + cpp + netProductPrice);
  const rtoInvestment = rtoOrders * (netRTOCost + cpp);
  const netInvestment = deliveredInvestment + rtoInvestment;

  const deliveredProfit = deliveredOrders * sellingPrice - deliveredInvestment;
  const rtoProfit = -rtoInvestment;
  const netProfit = deliveredProfit + rtoProfit;

  const deliveredProfitPercentage = deliveredInvestment
    ? (deliveredProfit / deliveredInvestment) * 100 - 100
    : 0;
  const rtoProfitPercentage = rtoInvestment
    ? (rtoProfit / rtoInvestment) * 100 + 100
    : 0;
  const netProfitPercentage = netInvestment
    ? (netProfit / netInvestment) * 100
    : 0;

  const handleNumberChange =
    (setter: React.Dispatch<React.SetStateAction<number>>, min = 0) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val) || val < min) val = min;
      setter(val);
    };

  return (
    <div className="w-full max-w-6xl mx-auto text-black">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#000434] text-white py-4 px-6 relative flex items-center justify-center">
          <h2 className="text-xl md:text-2xl font-bold text-center">
            OU AI Powered - Self Shipping Cost Calculator
          </h2>
          <span className="absolute right-4 md:right-6 px-2.5 py-1 text-xs font-bold text-[#000434] bg-white rounded-md">
            v1.0
          </span>
        </div>

        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Input Sections (Left 2 Columns) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Product Details */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-[#F5891E] pb-2 mb-4">
                  Product Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <LabelWithTooltip
                      label="Total Inventory Cost"
                      tooltip="Cost of all inventory you have"
                    />
                    <input
                      type="number"
                      value={inventoryCost}
                      onChange={handleNumberChange(setInventoryCost)}
                      min={0}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="Packing Cost per Order"
                      tooltip="Cost to pack one order"
                    />
                    <input
                      type="number"
                      value={packingCost}
                      onChange={handleNumberChange(setPackingCost)}
                      min={0}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="Total Ordering Inventory"
                      tooltip="Number of units in your inventory"
                    />
                    <input
                      type="number"
                      value={orderingInventory}
                      onChange={handleNumberChange(setOrderingInventory, 1)}
                      min={1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="Inventory Shipping Cost"
                      tooltip="Cost to ship inventory to warehouse"
                    />
                    <input
                      type="number"
                      value={shippingCost}
                      onChange={handleNumberChange(setShippingCost)}
                      min={0}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Logistics & Charges */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-[#F5891E] pb-2 mb-4">
                  Logistics & Charges
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <LabelWithTooltip
                      label="Freight Charges"
                      tooltip="Base freight cost per shipment"
                    />
                    <input
                      type="number"
                      value={freightCharges}
                      onChange={handleNumberChange(setFreightCharges)}
                      min={0}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="COD Charges"
                      tooltip="Cash on Delivery handling cost"
                    />
                    <input
                      type="number"
                      value={codCharges}
                      onChange={handleNumberChange(setCodCharges)}
                      min={0}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="RTO Charges"
                      tooltip="Return to origin cost"
                    />
                    <input
                      type="number"
                      value={rtoCharges}
                      onChange={handleNumberChange(setRtoCharges)}
                      min={0}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="Fulfilment GST (%)"
                      tooltip="Tax percentage on charges"
                    />
                    <input
                      type="number"
                      value={fulfilmentGST}
                      onChange={handleNumberChange(setFulfilmentGST)}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                </div>
              </section>

              {/* Sales & Orders */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 border-b-2 border-[#F5891E] pb-2 mb-4">
                  Sales & Orders
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <LabelWithTooltip
                      label="Cost Per Purchase (CPP)"
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
                  <div>
                    <LabelWithTooltip
                      label="Selling Price"
                      tooltip="Price at which you sell product"
                    />
                    <input
                      type="number"
                      value={sellingPrice}
                      onChange={handleNumberChange(setSellingPrice)}
                      min={0}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="Total Orders"
                      tooltip="Number of orders placed"
                    />
                    <input
                      type="number"
                      value={totalOrders}
                      onChange={handleNumberChange(setTotalOrders)}
                      min={0}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                  <div>
                    <LabelWithTooltip
                      label="RTO Percentage (%)"
                      tooltip="Percentage of orders returned"
                    />
                    <input
                      type="number"
                      value={rtoPercentage}
                      onChange={handleNumberChange(setRtoPercentage)}
                      min={0}
                      max={100}
                      step={0.1}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5891E]/30 focus:border-[#F5891E] outline-none transition-all"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Summary & Table (Right 1 Column) */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Summary Card */}
              <div className="bg-[#F5891E] text-[#000434] p-6 rounded-2xl shadow-md">
                <h4 className="text-xl font-bold mb-4 text-center border-b border-[#000434]/20 pb-2">
                  Summary
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">
                      Net Product Price:
                    </span>
                    <span className="text-white font-black text-base">
                      ₹{netProductPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">
                      Net Ads Spent:
                    </span>
                    <span className="text-white font-black text-base">
                      ₹{(cpp * totalOrders).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">Net Revenue:</span>
                    <span className="text-white font-black text-base">
                      ₹{(sellingPrice * totalOrders).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-[#000434]/20">
                    <span className="font-bold text-sm">Net Investment:</span>
                    <span className="text-white font-black text-lg">
                      ₹{netInvestment.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Table */}
              {/* Wrap with overflow container */}
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F5891E] text-white">
                    <tr>
                      <th className="px-3 py-2.5 font-semibold text-left">
                        Details
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-center">
                        Delivered
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-center">
                        RTO
                      </th>
                      <th className="px-3 py-2.5 font-semibold text-center">
                        Net
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-900">
                        Orders
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {deliveredOrders}
                      </td>
                      <td className="px-3 py-2.5 text-center">{rtoOrders}</td>
                      <td className="px-3 py-2.5 text-center font-bold">
                        {totalOrders}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-900">
                        Net Profit (₹)
                      </td>
                      <td className="px-3 py-2.5 text-center text-green-600 font-medium">
                        {deliveredProfit.toFixed(2)}
                      </td>
                      <td className="px-3 py-2.5 text-center text-red-600 font-medium">
                        {rtoProfit.toFixed(2)}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-center font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {netProfit.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-medium text-gray-900">
                        Profit (%)
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {deliveredProfitPercentage.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {rtoProfitPercentage.toFixed(2)}%
                      </td>
                      <td className="px-3 py-2.5 text-center font-bold">
                        {netProfitPercentage.toFixed(2)}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <footer className="text-center mt-10 text-sm text-[#F5891E] font-bold">
            OU AI Powered &copy; 2025
          </footer>
        </div>
      </div>
    </div>
  );
};

export default SelfShipCalculator;

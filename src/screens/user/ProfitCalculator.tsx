import React, { useState } from "react";
import {
  Truck,
  Package,
  ShoppingBag,
  ShoppingCart,
  Calculator,
} from "lucide-react";
import SelfShipCalculator from "../calculators/selfShip";
import DropShipCalculator from "../calculators/dropShip";

export interface ProfitCalculator {
  _id: string;
  name: string;
  length: number;
  breadth: number;
  height: number;
  weight: number;
  stock: number;
  packing_cost: number;
  volumetric_weight: number;
  status: "active" | "inactive" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

type TabKey =
  | "SelfShip"
  | "DropShip"
  | "RoposoClout"
  | "AmazonEasyShip"
  | "Meesho";

const tabs: { id: TabKey; label: string; icon: React.ElementType }[] = [
  { id: "SelfShip", label: "Self Ship", icon: Truck },
  { id: "DropShip", label: "Drop Ship", icon: Package },
  { id: "RoposoClout", label: "Roposo Clout", icon: ShoppingBag },
  { id: "AmazonEasyShip", label: "Amazon Easy Ship", icon: ShoppingCart },
  { id: "Meesho", label: "Meesho", icon: Calculator },
];

export const ProfitCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("SelfShip");

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            Profit Calculator
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Estimate your profits across different shipping and marketplace
            models.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50/50 scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 outline-none
                  ${
                    isActive
                      ? "border-orange-600 text-orange-600 bg-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-orange-600" : "text-gray-400"
                  }`}
                />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8 bg-white min-h-[400px]">
          {activeTab === "SelfShip" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <SelfShipCalculator />
            </div>
          )}

          {activeTab === "DropShip" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <DropShipCalculator />
            </div>
          )}

          {activeTab === "RoposoClout" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-2">
                Roposo Clout Content
              </h5>
              <p className="text-gray-500 max-w-sm">
                Calculator for Roposo Clout is currently under development and
                will be available soon.
              </p>
            </div>
          )}

          {activeTab === "AmazonEasyShip" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-2">
                Amazon Easy Ship Content
              </h5>
              <p className="text-gray-500 max-w-sm">
                Calculator for Amazon Easy Ship is currently under development
                and will be available soon.
              </p>
            </div>
          )}

          {activeTab === "Meesho" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-center justify-center h-64 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                <Calculator className="w-8 h-8 text-gray-400" />
              </div>
              <h5 className="text-lg font-bold text-gray-900 mb-2">
                Meesho Content
              </h5>
              <p className="text-gray-500 max-w-sm">
                Calculator for Meesho is currently under development and will be
                available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

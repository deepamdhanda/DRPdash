import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAccountSummary, getOrdersSummary } from "../../APIs/user/dashboard";
import { getAllChannelAccounts } from "../../APIs/user/channelAccount";
import { ChannelAccount } from "./ChannelAccounts";
import { ProductSKU } from "./ProductSKUs";
import { getAllProductSKUs } from "../../APIs/user/productSKU";
import { useUserStore } from "../../store/useUserStore";
import {
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Map,
  Rocket,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export const Dashboard: React.FC = () => {
  const { username } = useUserStore();

  const [channelAccounts, setChannelAccounts] = useState<ChannelAccount[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [startDate, setStartDate] = useState<Date | null>(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [productSKUs, setProductSKUs] = useState<ProductSKU[]>([]);
  const [productSKUId, setProductSKUId] = useState<string>();

  const [dateWiseSummary, setDateWiseSummary] = useState<any[]>([]);
  const [stateWiseSummary, setStateWiseSummary] = useState<any[]>([]);
  const [accountSummary, setAccountSummary] = useState<any>({});

  const [barData, setBarData] = useState<any[]>([]);
  const [donutData, setDonutData] = useState<any[]>([]);
  const [stateBarData, setStateBarData] = useState<any[]>([]);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [activeStateStatuses, setActiveStateStatuses] = useState<string[]>([]);

  const statusColors: Record<string, string> = {
    Delivered: "#28a745",
    RTO: "#dc3545",
    Transit: "#007bff",
    Pickup: "#fd7e14",
    New: "#17a2b8",
    Cancelled: "#a71d2a",
    Pending: "#ffc107",
    Failed: "#b22222",
    Processing: "#17a2b8",
    OnHold: "#ff8800",
    Returned: "#800080",
    Partial: "#20c997",
    Scheduled: "#00796b",
    Completed: "#2e7d32",
    Error: "#e53935",
    Other: "#6c757d",
  };

  useEffect(() => {
    const initialFetch = async () => {
      const productSKUData = await getAllProductSKUs();
      const channelAccountsData = await getAllChannelAccounts();
      setProductSKUs(productSKUData.data);
      setChannelAccounts(channelAccountsData.data);
    };
    initialFetch();
    fetchAccountSummary();
  }, []);

  const fetchOrderSummary = async () => {
    try {
      let data: any = {};
      if (selectedChannel) data.channel_account_id = selectedChannel;
      if (startDate) data.startDate = startDate;
      data.endDate = endDate ? endDate : new Date().toISOString().slice(0, 10);

      const res: any = await getOrdersSummary(data);
      if (res) {
        setDateWiseSummary(res.data.dateLevel);
        setStateWiseSummary(res.data.state);
      }
    } catch (error) {
      console.error("Failed to fetch order summary", error);
    }
  };

  useEffect(() => {
    fetchOrderSummary();
  }, [selectedChannel, productSKUId, startDate, endDate]);

  const fetchAccountSummary = async () => {
    const res = await getAccountSummary();
    if (res) setAccountSummary(res);
  };

  useEffect(() => {
    if (dateWiseSummary?.length > 0) {
      const formattedBarData = dateWiseSummary.map((day: any) => {
        const obj: any = { date: day.date };
        day.statuses.forEach((s: any) => {
          obj[s.status] = s.count;
        });
        return obj;
      });
      const statuses = Array.from(
        new Set(
          dateWiseSummary.flatMap((d) => d.statuses.map((s: any) => s.status))
        )
      );
      setBarData(formattedBarData);
      setActiveStatuses(statuses as string[]);
    }

    if (stateWiseSummary?.length > 0) {
      const formattedStateData = stateWiseSummary.map((state: any) => {
        const obj: any = { state: state.state || "Other" };
        state.statuses.forEach((s: any) => {
          obj[s.status] = s.count;
        });
        return obj;
      });
      const stateStatuses = Array.from(
        new Set(
          stateWiseSummary.flatMap((s: any) =>
            s.statuses.map((st: any) => st.status)
          )
        )
      );
      setStateBarData(formattedStateData);
      setActiveStateStatuses(stateStatuses as string[]);

      const statusCounts: Record<string, number> = {};
      stateWiseSummary.forEach((state) => {
        state.statuses.forEach((s: any) => {
          statusCounts[s.status] = (statusCounts[s.status] || 0) + s.count;
        });
      });
      const formattedDonut = Object.keys(statusCounts).map((key) => ({
        name: key,
        value: statusCounts[key],
      }));
      setDonutData(formattedDonut);
    }
  }, [dateWiseSummary, stateWiseSummary]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-100 p-4 rounded-xl shadow-xl shadow-gray-200/50 min-w-[160px]">
          <p className="font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
            {label}
          </p>
          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600">{entry.name}</span>
                </div>
                <span className="font-medium text-gray-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Welcome back, {username} 👋
        </h2>
        <p className="text-gray-500 mt-1">
          Your control panel for managing orders, inventory, finances, and
          fulfillment.
        </p>
      </div>

      {/* Stats Quick Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {accountSummary.counts?.map((item: any) => (
          <div
            key={item.label}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow"
          >
            <h4 className="text-sm font-medium text-gray-500 mb-2">
              {item.label}
            </h4>
            <p className="text-2xl font-bold text-[#F5891E] tracking-tight">
              {item.count}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-12 bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-800 font-medium mr-4 shrink-0">
            <Filter size={18} className="text-[#F5891E]" />
            <span>Filters</span>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] block p-2.5 outline-none transition-all"
            >
              <option value="">All Channel Accounts</option>
              {channelAccounts.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.channel_account_name} ({ch.pool_id?.name})
                </option>
              ))}
            </select>

            <select
              value={productSKUId}
              onChange={(e) => setProductSKUId(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] block p-2.5 outline-none transition-all"
            >
              <option value="">All Product SKUs</option>
              {productSKUs.map((sku) => (
                <option key={sku._id} value={sku._id}>
                  {sku.product_sku_id} - {sku.product_sku_name}
                </option>
              ))}
            </select>

            <div className="relative w-full">
              <DatePicker
                selectsRange
                startDate={startDate}
                endDate={endDate}
                maxDate={new Date()}
                monthsShown={1}
                onChange={(dates: any) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  setEndDate(end);
                }}
                isClearable
                placeholderText="Select date range"
                className="w-full bg-gray-50/50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-2 focus:ring-[#F5891E]/20 focus:border-[#F5891E] block p-2.5 pl-10 outline-none transition-all"
              />
              <Calendar
                size={16}
                className="absolute left-3.5 top-3 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {donutData.length > 0 && (
          <div className="md:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 mb-6">
              <PieChart size={20} className="text-[#F5891E]" />
              <h3 className="font-semibold text-gray-800">
                Status Distribution
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {donutData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={statusColors[entry.name] || statusColors.Other}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Bar Chart - Daily Order Summary */}
        {barData.length > 0 && (
          <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={20} className="text-[#F5891E]" />
              <h3 className="font-semibold text-gray-800">
                Daily Order Summary
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#888" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#888" }}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={<CustomTooltip />}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px", paddingTop: "20px" }}
                  />
                  {activeStatuses.map((status) => (
                    <Bar
                      key={status}
                      dataKey={status}
                      stackId="a"
                      fill={statusColors[status] || statusColors.Other}
                      maxBarSize={40}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {stateBarData.length > 0 && (
          <div className="md:col-span-8 bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] min-h-[400px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Map size={20} className="text-[#F5891E]" />
              <h3 className="font-semibold text-gray-800">
                State-wise Distribution
              </h3>
            </div>
            <div className="flex-1 w-full h-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateBarData}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f0f0f0"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#888" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="state"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#888" }}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    content={<CustomTooltip />}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: "13px", paddingTop: "10px" }}
                  />
                  {activeStateStatuses.map((status) => (
                    <Bar
                      key={status}
                      dataKey={status}
                      stackId="a"
                      fill={statusColors[status] || statusColors.Other}
                      maxBarSize={30}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="md:col-span-4 bg-linear-to-br from-[#FFF8F1] to-white rounded-2xl p-6 border border-orange-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-100">
            <div className="bg-linear-to-br from-[#F5891E] to-[#FF6B35] p-2 rounded-xl shadow-sm shadow-orange-200">
              <Rocket size={20} className="text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">
              Quick Start Guide
            </h3>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "Create a Pool",
                desc: "Define dispatch hubs for allocation",
                path: "/user/pools",
              },
              {
                title: "Add Channels",
                desc: "Connect Amazon, Shopify, etc.",
                path: "/user/channel_accounts",
              },
              {
                title: "Set Up Warehouses",
                desc: "Register storage locations",
                path: "/user/Warehouses",
              },
              {
                title: "Link SKUs",
                desc: "Map internal SKUs to external",
                path: "/user/ChannelSKU",
              },
              {
                title: "Wallet Recharge",
                desc: "Maintain shipping balance",
                path: "/user/Wallet",
              },
            ].map((step, idx) => (
              <Link
                key={idx}
                to={step.path}
                className="group flex flex-col p-3.5 bg-white rounded-xl border border-gray-100 hover:border-orange-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <span className="text-[14px] font-semibold text-gray-800 group-hover:text-[#F5891E] transition-colors">
                  {step.title}
                </span>
                <span className="text-[13px] text-gray-500 mt-0.5 leading-snug">
                  {step.desc}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

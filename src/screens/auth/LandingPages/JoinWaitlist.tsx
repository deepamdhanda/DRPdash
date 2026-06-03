import { useState } from "react";
import { Twitter, Linkedin, Mail } from "lucide-react";
import {
  AlertTriangle,
  TrendingDown,
  Clock,
  RefreshCw,
  Truck,
  LayoutDashboard,
  ShoppingBag,
  Cpu,
  TrendingUp,
 
  XCircle,
  CheckCircle2,
  Check,
  ArrowRight,
} from "lucide-react";
import AuthPage from "./AuthForm";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const problems = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
      title: "Fake COD Orders",
      description:
        "Up to 15% of COD orders are fraudulent — draining cash and increasing returns.",
      badge: "₹40L+ lost/year",
    },
    {
      icon: <TrendingDown className="w-5 h-5 text-red-600" />,
      title: "Sky-High RTO",
      description:
        "30%+ return rates eating into margins with every failed delivery attempt.",
      badge: "30%+ RTO rate",
    },
    {
      icon: <Clock className="w-5 h-5 text-red-600" />,
      title: "Manual Operations",
      description:
        "Hours spent on order routing, courier selection, and status tracking every day.",
      badge: "4+ hrs/day wasted",
    },
    {
      icon: <RefreshCw className="w-5 h-5 text-red-600" />,
      title: "Inventory Sync Issues",
      description:
        "Overselling and stockouts from disconnected channels and delayed syncing.",
      badge: "5-8% revenue loss",
    },
    {
      icon: <Truck className="w-5 h-5 text-red-600" />,
      title: "Delivery Delays",
      description:
        "Wrong courier picks, no zone optimization — leading to SLA breaches.",
      badge: "23% late deliveries",
    },
    {
      icon: <LayoutDashboard className="w-5 h-5 text-red-600" />,
      title: "Dashboard Chaos",
      description:
        "Juggling 5+ tools for orders, shipping, returns, analytics, and tracking.",
      badge: "5+ scattered tools",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* NAV */}
      <nav className="sticky top-0 bg-white border-b border-gray-100 h-24 z-50">
        <div className=" mx-auto px-6 md:px-12 h-full flex items-center gap-10 justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="./Orderzup.png"
              alt="OrderzUp Logo"
              className="w-12 h-12 object-contain"
            />
            <span className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Orderz<span className="text-orange-500">Up</span>
            </span>
          </div>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-10">
            {["Features", "Product", "Pricing", "Compare"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-8">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3.5 rounded-full text-lg shadow-lg shadow-orange-500/30 transition-all">
              Sign in
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 flex flex-col justify-center gap-1.5"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className="w-6 h-0.5 bg-gray-800"></div>
            <div className="w-6 h-0.5 bg-gray-800"></div>
            <div className="w-6 h-0.5 bg-gray-800"></div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4 text-base font-medium text-gray-700 shadow-sm">
          {["Features", "Product", "Pricing", "Compare"].map((item) => (
            <a key={item} href="#" className="hover:text-orange-500 py-2">
              {item}
            </a>
          ))}
          <a href="#" className="hover:text-orange-500 py-2 font-bold">
            Sign In
          </a>
        </div>
      )}

      {/* HERO */}
      <section className="pt-14 pb-8 md:pt-24 md:pb-12 px-6 md:px-12 overflow-hidden max-w-[1400px] mx-auto">
        <div className=" mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: CONTENT */}
          <div className="relative">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-600 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full mb-10 uppercase tracking-wide">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              🚀 BETA WAS A MASSIVE SUCCESS — NOW LIVE
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#060741] leading-[1.1] tracking-tight mb-8">
              Stop Losing Profit
              <br />
              <span className="bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent">
                to Logistics Chaos.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-lg sm:text-xl leading-relaxed max-w-lg mb-10">
              The AI Operating System that slashes RTOs by 30%, detects COD
              fraud before it ships, and automates your entire fulfillment
              pipeline — so you scale faster, not harder.
            </p>

            {/* Checklist */}
            <div className="space-y-4 mb-10">
              {[
                "No credit card required",
                "Setup in under 5 minutes",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-orange-500 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-lg text-gray-600 font-medium">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg shadow-orange-500/30 transition-all text-center">
                Start for Free →
              </button>
              <button className="border border-gray-300 text-[#04053e] font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-50 transition-all text-center">
                ▶ See It in Action
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-10 border-t border-gray-100">
              {[
                { val: "₹2Cr+", label: "Saved Brands" },
                { val: "50K+", label: "Orders Done" },
                { val: "30%", label: "Lower RTO" },
                { val: "99.9%", label: "Accuracy" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <h3 className="text-3xl font-extrabold text-[#060741]">
                    {val}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <AuthPage />
        </div>
      </section>

      {/* {problem section } */}
      <section className="bg-white py-20 px-4 ">
        {/* Tag */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 border border-red-300 text-red-500 text-lg font-medium px-4 py-1.5 rounded-full bg-red-50">
            <AlertTriangle className="w-3.5 h-3.5" />
            THE PROBLEM
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h2 className="text-7xl font-extrabold text-[#0f1035] leading-tight">
            Your Logistics Stack Is
          </h2>
          <h2 className="text-7xl font-extrabold text-[#ef4444] leading-tight">
            Quietly Killing Profits.
          </h2>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-500 text-3xl max-w-xl mx-auto mb-14 leading-tight">
          Every manual process, every missed fraud signal, every wrong courier
          pick —<br />
          it all compounds into silent profit erosion.
        </p>

        {/* Cards Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((item, i) => (
            <div
              key={i}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md  hover:border-red-200 hover:shadow-red-200  transition-shadow duration-200 flex flex-col mb-4 mt-4">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-bold text-[#0f1035] mb-5">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-xl leading-relaxed mb-5 flex-1">
                {item.description}
              </p>
              <div className="mt-auto pt-5">
                {" "}
                {/* Badge */}
                <span className="inline-block bg-red-50 text-red-500 text-lg font-semibold px-3 py-1.5 rounded-full border border-red-100">
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ONE PLATFORM SECTION */}
      <section className="bg-[#f5f5f7] py-24 px-6">
        {/* Tag */}
        <div className="flex justify-center mb-8">
          <span className="inline-flex items-center gap-2 border border-orange-300 text-orange-500 text-sm font-semibold px-5 py-2 rounded-full bg-[#fff7ed] shadow-sm">
            ⚡ Built for D2C operators
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h2 className="text-6xl md:text-7xl font-extrabold leading-tight">
            <span className="text-[#0f1035]">One Platform. </span>
            <span className="text-orange-500">Total Control.</span>
          </h2>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-500 text-xl max-w-lg mx-auto mb-16">
          Every module your operations team needs, unified in one clean
          dashboard.
        </p>

        {/* Dashboard Mockup */}
        <div className="max-w-7xl max-h-8xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Browser chrome bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
            <div className="flex gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-[#ff5f57]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#febc2e]" />
              <div className="w-3.5 h-3.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-sm text-gray-400 font-medium">
              orderzup.io/dashboard
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-green-500">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live
            </span>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-100 bg-white">
            <button className="flex items-center gap-2 bg-orange-500 text-white text-sm font-bold px-5 py-2.5 rounded-xl whitespace-nowrap shadow-md shadow-orange-200">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Orders Dashboard
            </button>
            <button className="flex items-center gap-2 text-gray-500 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 whitespace-nowrap">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              Courier AI
            </button>
            <button className="flex items-center gap-2 text-gray-500 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 whitespace-nowrap">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              Fraud Detection
            </button>
            <button className="flex items-center gap-2 text-gray-500 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 whitespace-nowrap">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
              Analytics
            </button>
          </div>

          {/* Table Header */}
          <div className="px-8 pt-6 pb-4 flex items-center justify-between ml-3.5 mr-3.5">
            <div>
              <h3 className="text-xl font-extrabold text-[#0f1035]">
                All Orders
              </h3>
              <p className="text-sm text-gray-400 mt-0.5">
                2,847 orders today · 99.9% sync
              </p>
            </div>
            <div className="flex gap-2">
              <span className="border border-green-300 text-green-600 text-xs font-bold px-4 py-2 rounded-full bg-green-50">
                Auto-sync ON
              </span>
              <span className="border border-gray-200 text-gray-500 text-xs font-semibold px-4 py-2 rounded-full bg-white">
                Filter
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="px-8 pb-8 overflow-x-auto w-full">
            <div className="border border-gray-200 rounded-2xl overflow-hidden px-10 pb-10">
              <table className="w-full text-lg">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-200  ">
                    <th className="text-left py-3 font-medium text-lg uppercase tracking-wide">
                      Order ID
                    </th>
                    <th className="text-left py-3 font-medium text-lg uppercase tracking-wide">
                      Customer
                    </th>
                    <th className="text-left py-3 font-medium text-lg uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left py-3 font-medium text-lg uppercase tracking-wide">
                      Courier
                    </th>
                    <th className="text-left py-3 font-medium text-lg uppercase tracking-wide">
                      Risk
                    </th>
                    <th className="text-right py-3 font-medium text-lg uppercase tracking-wide">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      id: "#ORD-18429",
                      customer: "Priya M.",
                      status: "Dispatched",
                      statusColor:
                        "text-blue-600 bg-blue-50 border border-blue-100",
                      courier: "Delhivery",
                      risk: "LOW",
                      riskColor: "text-green-700 bg-green-100",
                      value: "₹1,299",
                    },
                    {
                      id: "#ORD-18428",
                      customer: "Rahul S.",
                      status: "Flagged",
                      statusColor:
                        "text-red-500 bg-red-50 border border-red-100",
                      courier: "Pending",
                      risk: "HIGH",
                      riskColor: "text-red-700 bg-red-100",
                      value: "₹4,850",
                    },
                    {
                      id: "#ORD-18427",
                      customer: "Ananya K.",
                      status: "In Transit",
                      statusColor:
                        "text-violet-600 bg-violet-50 border border-violet-100",
                      courier: "Blue Dart",
                      risk: "LOW",
                      riskColor: "text-green-700 bg-green-100",
                      value: "₹2,150",
                    },
                    {
                      id: "#ORD-18426",
                      customer: "Vikas P.",
                      status: "Delivered",
                      statusColor:
                        "text-green-600 bg-green-50 border border-green-100",
                      courier: "Xpressbees",
                      risk: "LOW",
                      riskColor: "text-green-700 bg-green-100",
                      value: "₹890",
                    },
                    {
                      id: "#ORD-18425",
                      customer: "Sneha R.",
                      status: "Processing",
                      statusColor:
                        "text-gray-500 bg-gray-50 border border-gray-200",
                      courier: "DTDC",
                      risk: "MED",
                      riskColor: "text-yellow-700 bg-yellow-100",
                      value: "₹3,490",
                    },
                  ].map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors">
                      <td className="py-4 font-bold text-orange-500">
                        {row.id}
                      </td>
                      <td className="py-4 text-gray-800 font-medium">
                        {row.customer}
                      </td>
                      <td className="py-4">
                        <span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full ${row.statusColor}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">{row.courier}</td>
                      <td className="py-4">
                        <span
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg ${row.riskColor}`}>
                          {row.risk}
                        </span>
                      </td>
                      <td className="py-4 text-right font-bold text-gray-800">
                        {row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="bg-[#f5f5f7] py-24 px-6">
        {/* Tag */}
        <div className="flex justify-center mb-6 ">
          <span className="inline-flex items-center gap-2 border border-orange-300 text-orange-500 text-sm font-semibold px-5 py-2 rounded-full bg-[#fff7ed] shadow-sm">
            Up and running in minutes
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-4">
          <h2 className="text-6xl md:text-7xl font-extrabold leading-tight">
            <span className="text-[#0f1035]">How </span>
            <span className="text-orange-500">OrderzUp</span>
            <span className="text-[#0f1035]"> Works</span>
          </h2>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-500 text-xl max-w-lg mx-auto mb-16">
          From integration to intelligent automation in three clean steps.
        </p>

        {/* Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {[
            {
              num: "01",
              badge: "Supports 15+ channels",
              title: "Connect Your Store",
              description:
                "One-click integration with Shopify, WooCommerce, Amazon, Meesho, and more. Your orders start flowing in under 5 minutes.",
              icon: <ShoppingBag className="w-6 h-6 text-orange-500" />,
            },
            {
              num: "02",
              badge: "90% less manual work",
              title: "Automate Operations",
              description:
                "AI takes over courier allocation, fraud detection, address validation, and NDR management — automatically, every order.",
              icon: <Cpu className="w-6 h-6 text-orange-500" />,
            },
            {
              num: "03",
              badge: "ROI in 30 days",
              title: "Scale Profitably",
              description:
                "Watch your RTO drop, margins expand, and operations scale without adding headcount. Real metrics, real results.",
              icon: <TrendingUp className="w-6 h-6 text-orange-500" />,
            },
          ].map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl p-7 h-full border border-gray-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 transition-all duration-200 flex flex-col gap-5">
                {/* Top row: icon + big number */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    {step.icon}
                  </div>
                  <span className="text-6xl font-black text-orange-100 leading-none select-none">
                    {step.num}
                  </span>
                </div>

                {/* Badge */}
                <div>
                  <span className="inline-block bg-gray-100 text-gray-700 text-lg font-extrabold px-3 py-1.5 rounded-full">
                    {step.badge}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-[#0f1035]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-500 text-base leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY SWITCH SECTION */}
      <section className="bg-white py-24 px-6">
        {/* Headline */}
        <div className="text-center mb-4">
          <h2 className="text-5xl md:text-7xl font-extrabold leading-tight">
            <span className="text-[#0f1035]">Why Brands Switch to </span>
            <span className="text-orange-500">OrderzUp</span>
          </h2>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-500 text-xl max-w-lg mx-auto mb-16">
          Traditional tools were built for tracking. OrderzUp was built for
          intelligence.
        </p>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-3 border-b border-gray-200">
            <div className="px-14 py-8 bg-white">
              <p className="text-gray-400 text-2xl font-semibold">Feature</p>
            </div>
            <div className="px-14 py-8 bg-white border-l border-gray-200 text-center">
              <p className="font-semibold text-gray-700 text-2xl">
                Traditional Tools
              </p>
              <p className="text-gray-400 text-md mt-1">
                Shiprocket, manual dashboards
              </p>
            </div>
            <div className="px-14 py-8 bg-orange-50 border-l border-orange-200 text-center">
              <div className="flex items-center justify-center gap-2">
                <p className="font-semibold text-[#0f1035] text-2xl">
                  OrderzUp
                </p>
                <span className="bg-orange-500 text-white text-md font-bold px-2.5 py-1 rounded-md">
                  AI-Powered
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">The AI Logistics OS</p>
            </div>
          </div>

          {/* Rows */}
          {[
            {
              feature: "AI-Powered Courier Allocation",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "COD Fraud Detection & Blocking",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "Real-time Address Validation",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "Unified Multi-Channel OMS",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "AI Risk Scoring per Order",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "Automated NDR Management",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "Predictive RTO Reduction",
              traditional: "cross",
              orderzup: "check",
            },
            {
              feature: "Profitability Analytics",
              traditional: "text",
              traditionalText: "Basic",
              orderzup: "check",
            },
            {
              feature: "Real-time Inventory Sync",
              traditional: "text",
              traditionalText: "Manual",
              orderzup: "check",
            },
            {
              feature: "Multiple Courier Partners",
              traditional: "check-gray",
              orderzup: "check",
            },
          ].map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
              {/* Feature name */}
              <div className="px-14 py-8 flex items-center">
                <p className="text-[#0f1035] font-medium text-lg">
                  {row.feature}
                </p>
              </div>

              {/* Traditional */}
              <div className="px-14 py-8 border-l border-gray-100 flex items-center justify-center">
                {row.traditional === "cross" && (
                  <XCircle className="w-7 h-7 text-red-400" />
                )}
                {row.traditional === "text" && (
                  <span className="text-gray-400 text-base italic">
                    {row.traditionalText}
                  </span>
                )}
                {row.traditional === "check-gray" && (
                  <Check className="w-6 h-6 text-gray-400" />
                )}
              </div>

              {/* OrderzUp */}
              <div className="px-14 py-8 bg-orange-50/60 border-l border-orange-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
            </div>
          ))}

          {/* CTA Banner */}
          <div className="bg-[#060741] px-14 py-8 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-b-2xl">
            <div>
              <p className="text-white font-extrabold text-2xl">
                Ready to see the difference?
              </p>
              <p className="text-gray-400 text-base mt-1">
                Join brands already scaling smarter with OrderzUp
              </p>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg shadow-orange-500/30 transition-all whitespace-nowrap flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#010327] text-white py-16 md:py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
            {/* Left Section */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="./Orderzup.png"
                  alt="OrderzUp Logo"
                  className="w-10 h-10 object-contain brightness-0 invert"
                />
                <h2 className="text-3xl font-extrabold tracking-tight">
                  Orderz<span className="text-orange-500">Up</span>
                </h2>
              </div>

              <p className="text-gray-400 text-base leading-relaxed max-w-sm mb-8">
                The AI Logistics OS for modern D2C brands. Reduce RTO, automate
                fulfillment, and scale profitably.
              </p>

              <div className="flex gap-4">
                <button className="w-10 h-10 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  <Twitter size={18} />
                </button>

                <button className="w-10 h-10 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  <Linkedin size={18} />
                </button>

                <button className="w-10 h-10 border border-gray-700 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  <Mail size={18} />
                </button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Product</h3>
              <ul className="space-y-4 text-gray-400 text-base">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Changelog
                  </a>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Company</h3>
              <ul className="space-y-4 text-gray-400 text-base">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Press
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-gray-100">Legal</h3>
              <ul className="space-y-4 text-gray-400 text-base">
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors">
                    GDPR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-[#1E266D] mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-500">
              © 2026 OrderzUp Technologies Pvt. Ltd. All rights reserved.
            </p>

            <div className="flex items-center gap-3 text-gray-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { useState } from "react";
import { Twitter, Linkedin, Mail } from "lucide-react";
import AuthPage from "./AuthForm";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                className="text-lg font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
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
      <section className="pt-14 pb-20 md:pt-24 md:pb-32 px-6 md:px-12 overflow-hidden max-w-[1400px] mx-auto">
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
                    strokeWidth={2.5}
                  >
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
                  <h3 className="text-3xl font-extrabold text-[#03045E]">
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
                    className="hover:text-orange-400 transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
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
                    className="hover:text-orange-400 transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
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
                    className="hover:text-orange-400 transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-orange-400 transition-colors"
                  >
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

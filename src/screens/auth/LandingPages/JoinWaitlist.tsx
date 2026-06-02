import { useState } from "react";
import { Twitter, Linkedin, Mail } from "lucide-react";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
  };
  return (
    <div className="min-h-screen bg-white">

      {/* NAV */}
      <nav className="sticky top-0 bg-white border-b border-gray-100 h-24 z-50">
        <div className="max-w-7xl mx-auto px-8 md:px-12 h-full flex items-center gap-10 justify-between">
          {/* Logo */}
          <div className="flex items-center ">
            <img
              src="./Orderzup.png"
              alt="OrderzUp Logo"
              className="w-12 h-12"
            />

            <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Orderz<span className="text-orange-500">Up</span>
            </span>
          </div>

          {/* Center Nav Links */}
          <div className="hidden md:flex items-center gap-12 ">
            {["Features", "Product", "Pricing", "Compare"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xl font-medium text-[#707684] hover:text-gray-900 transition-colors">
                {item}
              </a>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-8">
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-5 rounded-full text-xl shadow-lg transition-all">
              Sign in
            </button>
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <div className="w-5 h-0.5 bg-gray-800 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-800 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-800"></div>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-6 py-4 flex flex-col gap-4 text-sm font-medium text-gray-700">
          {["Features", "Product", "Pricing", "Compare"].map((item) => (
            <a key={item} href="#" className="hover:text-orange-500">
              {item}
            </a>
          ))}
          <a href="#" className="hover:text-orange-500">
            Sign In
          </a>
        </div>
      )}

      {/* HERO */}
      <section className="px-10 md:px-40 pt-14 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-8xl   grid md:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div className="relative mlx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-semibold px-5 py-3 rounded-full mb-12 uppercase tracking-wide">
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              🚀 BETA WAS A MASSIVE SUCCESS — NOW LIVE FOR EVERYONE
            </div>

            {/* Headline */}
            <h1 className="text-8xl lg:text-7xl font-black text-[#060741] leading-[1.02] tracking-tight mb-8">
              Stop Losing Profit
              <br />
              <span className="bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent">
                to Logistics Chaos.
              </span>
            </h1>

            {/* Description */}
            <p className="text-gray-500 text-2xl leading-relaxed max-w-xl mb-12">
              The AI Operating System that slashes RTOs by 30%, detects COD
              fraud before it ships, and automates your entire fulfillment
              pipeline — so you scale faster, not harder.
            </p>

            {/* Checklist */}
            <div className="space-y-4 mb-12">
              {[
                "No credit card required",
                "Setup in under 5 minutes",
                "Cancel anytime",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-orange-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>

                  <span className="text-2xl text-gray-600">{item}</span>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-5">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-5 rounded-full text-xl shadow-lg transition-all">
                Start for Free →
              </button>

              <button className="border border-gray-300 text-[#04053e] font-bold px-10 py-5 rounded-full text-xl hover:bg-gray-50 transition-all">
                ▶ See It in Action
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-20 pt-10 border-t border-gray-100">
              {[
                { val: "₹2Cr+", label: "Saved for Brands" },
                { val: "50K+", label: "Orders Processed" },
                { val: "30%", label: "Lower RTO" },
                { val: "99.9%", label: "Sync Accuracy" },
              ].map(({ val, label }) => (
                <div key={label}>
                  <h3 className="text-4xl font-extrabold text-[#03045E]">
                    {val}
                  </h3>

                  <p className="text-base text-gray-400 mt-2">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: LOGIN CARD */}
          <div className="relative  ">
            <div className="absolute -inset-4 bg-gradient-to-br from-orange-100 via-orange-50 to-white rounded-3xl blur-2xl opacity-70 pointer-events-none" />

            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
              {/* Card header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                    Welcome back
                  </p>
                  <p className="text-white font-bold text-base">
                    Sign in to OrderzUp
                  </p>
                </div>
                <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black">
                  ⚡
                </div>
              </div>

              <div className="px-7 py-8">
                {success ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-bold text-lg mb-1">
                      Logged in!
                    </p>
                    <p className="text-gray-400 text-sm">
                      Redirecting to your dashboard…
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-5">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 rounded-xl py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-xs text-gray-400 font-medium">
                        or email
                      </span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@brand.com"
                        required
                        className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Password
                        </label>
                        <a
                          href="#"
                          className="text-xs text-orange-500 font-medium hover:underline">
                          Forgot?
                        </a>
                      </div>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="w-full border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 rounded-xl px-4 py-3 pr-14 text-sm text-gray-800 placeholder-gray-300 outline-none transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-medium">
                          {showPass ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold py-3.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                      {loading ? "Signing in…" : "Sign In →"}
                    </button>

                    <p className="text-center text-xs text-gray-400">
                      Don't have an account?{" "}
                      <a
                        href="#"
                        className="text-orange-500 font-semibold hover:underline">
                        Start for free
                      </a>
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

{/* FOOTER */}
<footer className="bg-[#010327] text-white py-20 px-10 md:px-20">
  <div className="max-w-7xl mx-auto">
    <div className="grid md:grid-cols-4 gap-20">
      {/* Left Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
         <img src="../assets/logo.png" alt="OrderzUp Logo" />
          <h2 className="text-3xl font-extrabold">
            Orderz<span className="text-orange-500">Up</span>
          </h2>
        </div>

        <p className="text-gray-400 text-lg leading-relaxed max-w-sm mb-8">
          The AI Logistics OS for modern D2C brands. Reduce RTO,
          automate fulfillment, and scale profitably.
        </p>

        <div className="flex gap-4">
          <button className="w-12 h-12 border border-gray-500 rounded-xl flex items-center justify-center hover:border-white transition">
            <Twitter size={20} />
          </button>

          <button className="w-12 h-12 border border-gray-500 rounded-xl flex items-center justify-center hover:border-white transition">
            <Linkedin size={20} />
          </button>

          <button className="w-12 h-12 border border-gray-500 rounded-xl flex items-center justify-center hover:border-white transition">
            <Mail size={20} />
          </button>
        </div>
      </div>

      {/* Product */}
      <div>
        <h3 className="font-bold text-xl mb-6">Product</h3>

        <ul className="space-y-4 text-gray-400 text-lg">
          <li><a href="#">Features</a></li>
          <li><a href="#">Integrations</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">Changelog</a></li>
        </ul>
      </div>

      {/* Company */}
      <div>
        <h3 className="font-bold text-xl mb-6">Company</h3>

        <ul className="space-y-4 text-gray-400 text-lg">
          <li><a href="#">About</a></li>
          <li><a href="#">Blog</a></li>
          <li><a href="#">Careers</a></li>
          <li><a href="#">Press</a></li>
        </ul>
      </div>

      {/* Legal */}
      <div>
        <h3 className="font-bold text-xl mb-6">Legal</h3>

        <ul className="space-y-4 text-gray-400 text-lg">
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Security</a></li>
          <li><a href="#">GDPR</a></li>
        </ul>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-[#1E266D] mt-16 pt-10 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-gray-500 text-base">
        © 2026 OrderzUp Technologies Pvt. Ltd. All rights reserved.
      </p>

      <div className="flex items-center gap-3 text-gray-400">
        <span className="w-3 h-3 rounded-full bg-green-500"></span>
        <span>All systems operational</span>
      </div>
    </div>
  </div>
</footer>



    </div>


    
  );
}

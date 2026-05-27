import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logoImg from "../../assets/logo.png";
import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";
import { toast } from "react-toastify";

type Step = "phone" | "otp";

const LoginScreen: React.FC = () => {
  const [step, setStep] = useState<Step>("phone");
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
  const [phone, setPhone] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await customerAxios.post(
        `${drpCrmBaseUrl}/customer/auth/send-otp`,
        { phone }
      );
      if (data.success) {
        setStep("otp");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    try {
      const { data } = await customerAxios.post(
        `${drpCrmBaseUrl}/customer/auth/confirm-otp`,
        { phone, otp: finalOtp }
      );
      if (data.success) {
        navigate("/customer/order");
      }
      toast.success("Welcome");
    } catch (err) {
      toast.error("Wrong Or Expired OTP");
    }
  };

  // Framer Motion variants
  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } },
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      {/* Left Side */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-amber-50 items-center justify-center p-12"
      >
        <div className="max-w-md mx-auto">
          <h1 className="text-5xl font-bold mb-8 leading-tight text-gray-900">
            Discover a world of{" "}
            <span className="text-amber-500">possibilities</span> tailored just
            for you.
          </h1>
          <ul className="space-y-6 mb-10">
            {[
              "Gain access to powerful tools and resources designed to enhance your experience.",
              "Be the first to know about new features, updates, and special events.",
              "Connect with other users and share insights, tips, and experiences.",
              "We prioritize your security and privacy with industry-leading protections.",
            ].map((text, idx) => (
              <li key={idx} className="flex items-start">
                <CheckCircle
                  className="text-amber-500 mt-1 mr-4 flex-shrink-0"
                  size={20}
                />
                <p className="text-gray-700 m-0">{text}</p>
              </li>
            ))}
          </ul>
          <p className="text-gray-500">
            Have questions? Visit our{" "}
            <a
              href="#"
              className="text-amber-500 font-semibold hover:underline"
            >
              Help Center
            </a>
          </p>
        </div>
      </motion.div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[400px]">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center mb-4 gap-2">
              <img src={logoImg} alt="Logo" className="w-8 h-auto" />
              <span className="text-2xl font-bold text-gray-900">
                Orderz<span className="text-amber-500">Up</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {step === "phone" ? "Login with mobile number" : "Verify OTP"}
            </h2>
            <p className="text-sm text-gray-500">
              {step === "phone"
                ? "Please confirm your country code and enter your mobile number"
                : "Enter the 4-digit code sent to your device"}
            </p>
          </motion.div>

          {/* Form Area with AnimatePresence for smooth toggling */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {step === "phone" ? (
                <motion.form
                  key="phone-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSendOTP}
                >
                  <div className="flex rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500 overflow-hidden mb-6 transition-all">
                    <select className="bg-gray-50 px-3 py-3 border-r border-gray-300 text-gray-700 outline-none cursor-pointer">
                      <option>🇮🇳 +91</option>
                    </select>
                    <input
                      type="tel"
                      className="flex-1 px-4 py-3 outline-none w-full text-gray-900 placeholder-gray-400"
                      placeholder="98658 98569"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-md transition-colors"
                  >
                    Send OTP
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleVerifyOTP}
                >
                  <div className="flex justify-center gap-4 mb-8">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        className="w-14 h-14 text-center text-2xl font-semibold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-gray-900"
                        value={digit}
                        ref={(el: any) => (inputRefs.current[idx] = el)}
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                          handleChange(e.target, idx)
                        }
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
                          handleKeyDown(e, idx)
                        }
                        required
                      />
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-md transition-colors mb-4"
                  >
                    Verify & Proceed
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="text-amber-500 hover:text-amber-600 font-semibold text-sm hover:underline"
                    >
                      Change Phone Number
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

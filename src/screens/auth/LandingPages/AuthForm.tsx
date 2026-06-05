import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LoginUser, RegisterUser } from "../../../APIs/authAPIs";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z
    .string()
    .regex(/^(?:\+?91|0)?[6-9]\d{9}$/, "Please enter a valid phone number"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: LoginValues) => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("path");

    await LoginUser(data, (verified: boolean, email: string) => {
      if (verified) {
        navigate(path ? path : "/user");
      } else {
        navigate(`/verify?email=${email}`);
      }
    });
  };

  const onRegister = async (data: RegisterValues) => {
    const searchParams = new URLSearchParams(window.location.search);
    const queryParams = Object.fromEntries(searchParams.entries());

    const payload = {
      ...data,
      params: queryParams,
    };
    await RegisterUser(payload, (email: string) =>
      navigate("/verify?email=" + email)
    );
  };

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    resetLogin();
    resetRegister();
    setShowPassword(false);
  };

  return (
    <>
      <div className="w-full flex flex-col justify-center bg-white relative py-20 px-10 sm:px-8 border rounded-2xl border-neutral-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={isLogin ? "login" : "register"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="mb-10 text-center md:text-left">
              <h3 className="text-5xl font-extrabold text-orange-400 mb-3 tracking-tight">
                {isLogin ? "Welcome back" : "Create an account"}
              </h3>
              <p className="text-gray-500 font-medium">
                {isLogin
                  ? "Enter your details to access your dashboard."
                  : "Register to get started with OrderzUp."}
              </p>
            </div>

            <form
              onSubmit={
                isLogin
                  ? handleLoginSubmit(onLogin)
                  : handleRegisterSubmit(onRegister)
              }
              className="space-y-5"
              noValidate
            >
              {/* Full Name (Register Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    className="w-full px-5 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#f5891e] focus:ring-2 focus:ring-[#f5891e]/20 outline-none transition-all"
                    type="text"
                    placeholder="e.g. Jane Doe"
                    {...registerRegister("name")}
                  />
                  {registerErrors.name && (
                    <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                      {registerErrors.name.message}
                    </span>
                  )}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#f5891e] focus:ring-2 focus:ring-[#f5891e]/20 outline-none transition-all"
                  type="email"
                  placeholder="you@company.com"
                  {...(isLogin
                    ? loginRegister("email")
                    : registerRegister("email"))}
                />
                {(loginErrors.email || registerErrors.email) && (
                  <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                    ⚠️{" "}
                    {loginErrors.email?.message ||
                      registerErrors.email?.message}
                  </span>
                )}
              </div>

              {/* Phone Number (Register Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#f5891e] focus:ring-2 focus:ring-[#f5891e]/20 outline-none transition-all"
                    type="text"
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    {...registerRegister("phone", {
                      onChange: (e) => {
                        e.target.value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                      },
                    })}
                  />
                  {registerErrors.phone && (
                    <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                      ⚠️ {registerErrors.phone.message}
                    </span>
                  )}
                </div>
              )}

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  {isLogin && (
                    <Link
                      to="/forgotPassword"
                      className="text-sm font-semibold text-[#f5891e] hover:text-[#e07715] transition-colors"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    className="w-full pl-4 pr-12 py-3.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#f5891e] focus:ring-2 focus:ring-[#f5891e]/20 outline-none transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...(isLogin
                      ? loginRegister("password")
                      : registerRegister("password"))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {(loginErrors.password || registerErrors.password) && (
                  <span className="text-red-500 text-xs font-medium mt-1.5 flex items-center gap-1">
                    ⚠️{" "}
                    {loginErrors.password?.message ||
                      registerErrors.password?.message}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-8 py-4 bg-[#f5891e] hover:bg-[#e07715] text-white text-base font-bold rounded-xl shadow-lg shadow-[#f5891e]/30 transition-all active:scale-[0.98]"
              >
                {isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Toggle Form Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 font-medium">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  onClick={toggleForm}
                  className="text-[#f5891e] font-bold hover:underline focus:outline-none"
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
};

export default AuthPage;

const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M17.94 17.94C16.14 19.24 14.12 20 12 20 5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-6.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line
      x1="1"
      y1="1"
      x2="23"
      y2="23"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

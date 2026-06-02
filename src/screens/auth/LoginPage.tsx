import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LoginUser, RegisterUser } from "../../APIs/authAPIs";
import BG from "../../assets/bg.jpg";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().regex(/^(?:\+?91|0)?[6-9]\d{9}$/),
});

export const AuthPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm({ resolver: zodResolver(loginSchema) });

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onLogin = async (data: any) => {
    const params = new URLSearchParams(window.location.search);
    const path = params.get("path");

    await LoginUser(data, (verified: boolean, email: string) => {
      if (verified) {
        if (path) {
          navigate(path);
        } else {
          navigate("/user");
        }
      } else {
        navigate(`/verify?email=${email}`);
      }
    });
  };

  const onRegister = async (data: any) => {
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
  };

  return (
    <div
      className="min-h-screen bg-repeat bg-contain bg-center text-black"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-[#f5f7fae6] p-4 md:p-20 gap-4">
        {/* Left Info Card */}
        <div className="w-full md:w-[480px] flex-1 md:flex-none bg-linear-to-br from-[#000434] to-[#191970] text-white text-center rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-8 flex flex-col justify-center min-h-[25%] md:min-h-[480px] relative top-[5%] md:top-0 z-10 md:z-auto">
          <h2 className="text-2xl font-bold mb-4">
            {isLogin ? "New Here?" : "Already have an account?"}
          </h2>
          <p className="text-lg mb-6 text-gray-200">
            {isLogin
              ? "Create your account and start reducing RTOs today."
              : "Login to your dashboard and manage your orders effortlessly."}
          </p>
          <button
            onClick={toggleForm}
            className="bg-[#f5891e] text-white border-none py-3 px-6 text-base rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#d97715]"
          >
            {isLogin ? "Create Account" : "Login"}
          </button>
        </div>

        {/* Right Form Card */}
        <div className="w-full md:w-[480px] flex-1 md:flex-none bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.1)] p-8 flex flex-col justify-center min-h-[25%] md:min-h-[480px] relative -top-[5%] md:top-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-[1.8rem] font-bold mb-2 text-[#000434]">
                {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
              </h3>
              <p className="text-base mb-6 text-gray-500">
                {isLogin
                  ? "Login to continue managing your orders"
                  : "Start your journey with OrderzUp"}
              </p>

              <form
                onSubmit={
                  isLogin
                    ? handleLoginSubmit(onLogin)
                    : handleRegisterSubmit(onRegister)
                }
                className="flex flex-col gap-4"
              >
                {!isLogin && (
                  <div className="flex flex-col">
                    <input
                      className="p-3 border border-gray-300 rounded-lg text-base w-full focus:outline-none focus:border-[#f5891e] focus:ring-1 focus:ring-[#f5891e]"
                      type="text"
                      placeholder="Full Name"
                      {...registerRegister("name")}
                    />
                    {registerErrors.name && (
                      <span className="text-red-500 text-sm mt-1">
                        {registerErrors.name.message as string}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col">
                  <input
                    className="p-3 border border-gray-300 rounded-lg text-base w-full focus:outline-none focus:border-[#f5891e] focus:ring-1 focus:ring-[#f5891e]"
                    type="email"
                    placeholder="Email"
                    {...(isLogin
                      ? loginRegister("email")
                      : registerRegister("email"))}
                  />
                  {(loginErrors.email || registerErrors.email) && (
                    <span className="text-red-500 text-sm mt-1">
                      {
                        (loginErrors.email?.message ||
                          registerErrors.email?.message) as string
                      }
                    </span>
                  )}
                </div>

                {!isLogin && (
                  <div className="flex flex-col">
                    <input
                      className="p-3 border border-gray-300 rounded-lg text-base w-full focus:outline-none focus:border-[#f5891e] focus:ring-1 focus:ring-[#f5891e]"
                      type="text"
                      placeholder="Phone Number"
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
                  </div>
                )}

                {isLogin && (
                  <Link
                    to="/forgotPassword"
                    className="text-[#000434] hover:text-[#f5891e] underline text-sm transition-colors w-max"
                  >
                    Forgot Password ?
                  </Link>
                )}

                <div className="flex flex-col">
                  <div className="relative">
                    <input
                      className="p-3 pr-11 border border-gray-300 rounded-lg text-base w-full focus:outline-none focus:border-[#f5891e] focus:ring-1 focus:ring-[#f5891e]"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...(isLogin
                        ? loginRegister("password")
                        : registerRegister("password"))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-1.5 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                  {(loginErrors.password || registerErrors.password) && (
                    <span className="text-red-500 text-sm mt-1">
                      {
                        (loginErrors.password?.message ||
                          registerErrors.password?.message) as string
                      }
                    </span>
                  )}
                </div>

                <button
                  className="p-3 text-base font-bold bg-[#f5891e] hover:bg-[#d97715] transition-colors border-none rounded-lg text-white cursor-pointer mt-2"
                  type="submit"
                >
                  {isLogin ? "Login" : "Sign Up"}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
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
      d="M17.94 17.94C16.14 19.24 14.12 20 12 20 5 20 1 12 1 12a21.8 21.8 0 0 1 5.06-6.94"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 1l22 22"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResendOTP, VerifyUser } from "../../APIs/authAPIs";
import { useNavigate, useLocation } from "react-router-dom";

// Define the form schema with Zod
const verifySchema = z.object({
  email: z.string().email("Invalid email address"),
  otp: z.string().min(6, "OTP must be at least 6 characters"),
});

// TypeScript type derived from the schema
export type VerifyFormData = z.infer<typeof verifySchema>;

const VerifyPage: React.FC = () => {
  // Step 1: Extract email from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromUrl = queryParams.get("email") || "";
  const navigate = useNavigate();

  useEffect(() => {
    if (!emailFromUrl) {
      console.error("Email not found in query params");
      navigate("/");
    }
  }, [emailFromUrl, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: emailFromUrl,
    },
  });

  if (!emailFromUrl) return null; // Optional fallback

  const handleResendOtp = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await ResendOTP({ email: emailFromUrl }, () => {
        console.log("OTP Resent");
      });
    } catch (error) {
      console.error("Error while resending OTP", error);
    }
  };

  const onSubmit = async (data: VerifyFormData) => {
    try {
      await VerifyUser(data, () => {
        navigate("/user");
      });
    } catch (error) {
      console.error("Verify failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url(/src/assets/bg.jpg)] bg-repeat bg-contain py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Orderz Up
          </h2>
          <h5 className="mt-2 text-sm font-semibold text-gray-700 underline decoration-orange-500 underline-offset-4">
            Where Every Order Takes Off.
          </h5>
          <p className="mt-4 text-sm text-gray-500">Please verify your email</p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              disabled={true}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors disabled:bg-gray-100 disabled:text-gray-500 ${
                errors.email
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-300"
              }`}
              placeholder="your@email.com"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* OTP Field */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-gray-700"
              >
                One Time Password
              </label>
              <a
                href="#"
                onClick={handleResendOtp}
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
              >
                Resend OTP
              </a>
            </div>
            <input
              id="otp"
              type="text"
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors focus:ring-2 focus:border-transparent ${
                errors.otp
                  ? "border-red-500 focus:ring-red-200"
                  : "border-gray-300 focus:ring-orange-500/20 focus:border-orange-500"
              }`}
              placeholder="••••••••"
              {...register("otp")}
            />
            {errors.otp && (
              <p className="mt-1.5 text-xs text-red-500 font-medium">
                {errors.otp.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-[#F5891E] to-[#FF6B35] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        {/* Footer Section */}
        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-600">
            Want to use a different account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="font-semibold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;

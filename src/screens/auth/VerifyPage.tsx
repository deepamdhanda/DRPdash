// VerifyPage.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./style.module.css";
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
      navigate("/login");
    }
  }, [emailFromUrl, navigate]);

  if (!emailFromUrl) return null; // Optional fallback

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      // name: "Admin",
      email: emailFromUrl,
      // password: "Admin@123",
    },
  });

  const handleResendOtp = async () => {
    try {
      await ResendOTP({ email: emailFromUrl }, () => {
        console.log("OTP Resent");
      });
    } catch (error) {
      console.error("Error while resending OTP", error);
    }
  };

  const onSubmit = async (data: VerifyFormData) => {
    // Simulate API call

    try {
      await VerifyUser(data, () => {
        navigate("/user");
      });
      // Navigate to dashboard or home page
    } catch (error) {
      console.error("Verify failed:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>Orderz Up</h2>
          <h5 style={{ color: "black", textDecoration: "underline" }}>
            Where Every Order Takes Off.
          </h5>
          <p>Please verify your email</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              disabled={true}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="your@email.com"
              {...register("email")}
            />
            {errors.email && (
              <div className={styles.errorMessage}>{errors.email.message}</div>
            )}
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="password" className="form-label">
                One Time Password
              </label>
              <a
                href="#"
                className={styles.forgotPassword}
                onClick={handleResendOtp}
              >
                Resend OTP
              </a>
            </div>
            <input
              id="otp"
              type="otp"
              className={`form-control ${errors.otp ? "is-invalid" : ""}`}
              placeholder="••••••••"
              {...register("otp")}
            />
            {errors.otp && (
              <div className={styles.errorMessage}>{errors.otp.message}</div>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.loginButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify"}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Want to use different account?{" "}
            <a
              href="#"
              onClick={() => {
                navigate("/login");
              }}
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyPage;

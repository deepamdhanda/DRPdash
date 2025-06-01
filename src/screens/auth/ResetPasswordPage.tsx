// ResetPasswordPage.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./style.module.css";
import { ResetPassword } from "../../APIs/authAPIs";
import { useNavigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';


// Define the form schema with Zod
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// TypeScript type derived from the schema
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage: React.FC = () => {
  // Step 1: Extract email from query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const emailFromUrl = queryParams.get('email') || '';
  const resetToken = queryParams.get('token') || '';
  const navigate = useNavigate();
  useEffect(() => {
    if (!emailFromUrl || !resetToken || emailFromUrl == '' || resetToken == '') {
      console.error("Email or Token not found in query params");
      navigate("/login");
    }
  }, [emailFromUrl, resetToken, navigate]);

  if (!emailFromUrl) return null; // Optional fallback


  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      // name: "Admin",
      email: emailFromUrl,
      // password: "Admin@123",
    },
  });


  const onSubmit = async (data: ResetPasswordFormData) => {
    // Simulate API call

    try {
      await ResetPassword({ ...data, resetToken }, () => {
        navigate("/login");
      });
      // Navigate to dashboard or home page
    } catch (error) {
      console.error("ResetPassword failed:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>Orderz Up</h2>
<h5  style={{color:"black", textDecoration:"underline"}}>Where Every Order Takes Off.</h5>
          <p>Reset your Password</p>
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
                New Password
              </label>
            </div>
            <input
              id="password"
              type="password"
              className={`form-control ${errors.password ? "is-invalid" : ""}`}
              placeholder="••••••••"
              {...register("password")}
            />
            {errors.password && (
              <div className={styles.errorMessage}>
                {errors.password.message}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.loginButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Reseting Password..." : "Reset Password"}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Remember Password? <a href="#" onClick={() => { navigate('/login') }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

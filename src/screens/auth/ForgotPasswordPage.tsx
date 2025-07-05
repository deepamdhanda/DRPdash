// ForgotPasswordPage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./style.module.css";
import { ForgotPassword } from "../../APIs/authAPIs";
import { useNavigate } from "react-router-dom";


// Define the form schema with Zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// TypeScript type derived from the schema
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordPage: React.FC = () => {
  // Step 1: Extract email from query params
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      // name: "Admin",
      // email: emailFromUrl,
      // password: "Admin@123",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Simulate API call
    try {
      await ForgotPassword(data, () => {
        navigate("/user");
      });
      // Navigate to dashboard or home page
    } catch (error) {
      console.error("ForgotPassword failed:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>Orderz Up</h2>
          <h5 style={{ color: "black", textDecoration: "underline" }}>Where Every Order Takes Off.</h5>
          <p>Forgot Password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              placeholder="your@email.com"
              {...register("email")}
            />
            {errors.email && (
              <div className={styles.errorMessage}>{errors.email.message}</div>
            )}
          </div>


          <button
            type="submit"
            className={`btn btn-primary ${styles.loginButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending Email..." : "Forgot Password"}
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

export default ForgotPasswordPage;

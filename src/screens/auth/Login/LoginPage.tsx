// LoginPage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./LoginPage.module.css";
import { LoginUser } from "../../../APIs/auth";
import { useNavigate } from "react-router-dom";

// Define the form schema with Zod
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// TypeScript type derived from the schema
export type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@admin.com",
      password: "Admin@123",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    // Simulate API call
    await LoginUser(data, () => {
      navigate("/dashboard");
    });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network request
      console.log("Login successful!");
      // Navigate to dashboard or home page
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>DRP CRM</h2>
          <p>Please sign in to continue</p>
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

          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <a href="#" className={styles.forgotPassword}>
                Forgot Password?
              </a>
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

          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="rememberMe"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className={`btn btn-primary ${styles.loginButton}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Don't have an account? <a href="#">Sign up</a>
          </p>
          <div className={styles.socialLogin}>
            <button className={`btn ${styles.socialButton}`}>
              <i className="fab fa-google"></i> Google
            </button>
            <button className={`btn ${styles.socialButton}`}>
              <i className="fab fa-facebook-f"></i> Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

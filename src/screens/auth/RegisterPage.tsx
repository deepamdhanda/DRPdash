// RegisterPage.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "./style.module.css";
import { RegisterUser } from "../../APIs/authAPIs";
import { useNavigate } from "react-router-dom";

// Define the form schema with Zod
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().regex(/^(?:\+?91|0091|91|0)?[6-9]\d{9}$/, "Phone number must be valid"),
});

// TypeScript type derived from the schema
export type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      // name: "Admin",
      // email: "admin@admin.com",
      // password: "Admin@123",
    },
  });

  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    // Simulate API call
    await RegisterUser(data, (email) => {
      navigate("/verify?email=" + email);
    });
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network request
      console.log("Register successful!");
      // Navigate to dashboard or home page
    } catch (error) {
      console.error("Register failed:", error);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>Orderz Up</h2>
<h5  style={{color:"black", textDecoration:"underline"}}>Where Every Order Takes Off.</h5>
          <p>Please sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="name"
              className={`form-control ${errors.name ? "is-invalid" : ""}`}
              placeholder="your name"
              {...register("name")}
            />
            {errors.name && (
              <div className={styles.errorMessage}>{errors.name.message}</div>
            )}
          </div>
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
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              id="phone"
              type="phone"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              placeholder="+91 12345 67890"
              {...register("phone")}
            />
            {errors.phone && (
              <div className={styles.errorMessage}>{errors.phone.message}</div>
            )}
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="password" className="form-label">
                Password
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
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <p>
            Already have an account? <a href="#" onClick={() => { navigate('/login') }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

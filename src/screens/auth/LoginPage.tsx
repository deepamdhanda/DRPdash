import React, { useState, useEffect } from "react";
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
  // const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    await LoginUser(data, (verified, email) => {
      if (verified) {
        navigate("/user");
      } else {
        navigate(`/verify?email=${email}`);
      }
    });
  };

  const onRegister = async (data: any) => {
    await RegisterUser(data, (email) => navigate("/verify?email=" + email));
  };

  const toggleForm = () => {
    setIsLogin((prev) => !prev);
    resetLogin();
    resetRegister();
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const styles = {
    container: {
      display: "flex",
      flexDirection: isMobile ? ("column" as const) : ("row" as const),
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      backgroundColor: "#f5f7fae6",
      padding: isMobile ? "1rem" : "20rem",
      gap: "1rem",
    },
    card: {
      flex: "1 1 400px",
      width: isMobile ? "100%" : "480px",
      backgroundColor: "#fff",
      borderRadius: "16px",
      boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
      padding: "2rem",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      minHeight: isMobile ? "25%" : "480px",
    },
    infoCard: {
      background: "linear-gradient(135deg, #000434, #191970)",
      color: "#fff",
      textAlign: "center" as const,
    },
    infoText: {
      fontSize: "1.2rem",
      marginBottom: "1.5rem",
    },
    switchBtn: {
      backgroundColor: "#f5891e",
      color: "#fff",
      border: "none",
      padding: "0.75rem 1.5rem",
      fontSize: "1rem",
      borderRadius: "8px",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    formTitle: {
      fontSize: "1.8rem",
      fontWeight: "bold",
      marginBottom: "0.5rem",
      color: "#000434",
    },
    subtitle: {
      fontSize: "1rem",
      marginBottom: "1.5rem",
      color: "#555",
    },
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
    },
    input: {
      padding: "0.75rem 1rem",
      border: "1px solid #ddd",
      borderRadius: "8px",
      fontSize: "1rem",
      width: "100%",
    },
    submitBtn: {
      padding: "0.75rem",
      fontSize: "1rem",
      fontWeight: "bold",
      backgroundColor: "#f5891e",
      border: "none",
      borderRadius: "8px",
      color: "white",
      cursor: "pointer",
    },
    error: {
      color: "red",
      fontSize: "0.8rem",
      marginTop: "-0.5rem",
    },
  };

  return (
    <div
      style={{
        backgroundImage: `url(${BG})`,
        backgroundRepeat: "repeat",
        backgroundSize: "contain",
        backgroundPosition: "center",
      }}
    >
      <div style={styles.container}>
        {/* Left Info Card */}
        <div
          style={{
            ...styles.card,
            ...styles.infoCard,
            top: isMobile ? "5%" : 0,
            position: isMobile ? "relative" : "static",
          }}
        >
          <h2>{isLogin ? "New Here?" : "Already have an account?"}</h2>
          <p style={styles.infoText}>
            {isLogin
              ? "Create your account and start reducing RTOs today."
              : "Login to your dashboard and manage your orders effortlessly."}
          </p>
          <button onClick={toggleForm} style={styles.switchBtn}>
            {isLogin ? "Create Account" : "Login"}
          </button>
        </div>

        {/* Right Form Card */}
        <div
          style={{
            ...styles.card,
            position: isMobile ? "relative" : "static",
            top: isMobile ? "-5%" : 0,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.5 }}
            >
              <h3 style={styles.formTitle}>
                {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
              </h3>
              <p style={styles.subtitle}>
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
                style={styles.form}
              >
                {!isLogin && (
                  <>
                    <input
                      style={styles.input}
                      type="text"
                      placeholder="Full Name"
                      {...registerRegister("name")}
                    />
                    {registerErrors.name && (
                      <span style={styles.error}>
                        {registerErrors.name.message}
                      </span>
                    )}
                  </>
                )}

                <input
                  style={styles.input}
                  type="email"
                  placeholder="Email"
                  {...(isLogin
                    ? loginRegister("email")
                    : registerRegister("email"))}
                />
                {(loginErrors.email || registerErrors.email) && (
                  <span style={styles.error}>
                    {loginErrors.email?.message ||
                      registerErrors.email?.message}
                  </span>
                )}

                {!isLogin && (
                  <>
                    <input
                      style={styles.input}
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
                  </>
                )}
                {isLogin ? (
                  <Link to="/forgotPassword">
                    <div className="text-primary text-decoration-underline">
                      Forgot Password ?
                    </div>
                  </Link>
                ) : (
                  ""
                )}
                <div style={{ position: "relative" }}>
                  <input
                    style={{
                      ...styles.input,
                      paddingRight: "42px",
                    }}
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
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex",
                      alignItems: "center",
                      color: "#666",
                    }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {(loginErrors.password || registerErrors.password) && (
                  <span style={styles.error}>
                    {loginErrors.password?.message ||
                      registerErrors.password?.message}
                  </span>
                )}

                <button style={styles.submitBtn} type="submit">
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
    />
    <path d="M1 1l22 22" stroke="currentColor" strokeWidth="2" />
  </svg>
);

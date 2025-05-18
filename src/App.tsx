import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {
  const navigator = useNavigate();
  const location = useLocation();
  const authRoutes = ["/login", "/register", "/verify", "/forgotPassword", "/resetPassword"];
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      if (!authRoutes.includes(location.pathname)) {
        console.log("No token found, Invalid Path, redirecting to login");
        navigator("/login");
      }
      // console.log("No token found, Valid Path, redirecting to path");
    } else {
      // console.log("Token found, redirecting to dashboard");
      navigator("/dashboard");
    }
  }, []);
  return (
    <>
      <ToastContainer />
      <Outlet />
    </>
  );
}

export default App;

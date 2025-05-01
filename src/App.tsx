import "./App.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Cookies from "js-cookie";
function App() {
  const navigator = useNavigate();
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      console.log("No token found, redirecting to login");
      navigator("/login");
    } else {
      console.log("Token found, redirecting to dashboard");
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

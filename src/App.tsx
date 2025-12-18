// import "./App.css";
// import { ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Outlet, useLocation, useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import "bootstrap/dist/css/bootstrap.min.css";
// import axios from "axios";

// function App() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useState<string | null>(null);
//   const authRoutes = [
//     "/login",
//     "/register",
//     "/verify",
//     "/forgotPassword",
//     "/resetPassword",
//     "/",
//   ];

//   const checkLogin = async () => {
//     try {
//       const { data } = await axios.get(
//         "http://localhost:5001/api/auth/verify/me",
//         {
//           withCredentials: true,
//         }
//       );
//       setUser(data.role);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     checkLogin();

//     const currentPath = location.pathname + location.search;
//     // const token = Cookies.get("authToken");
//     // const role = Cookies.get("roleType");
//     // if (currentPath === "/") {
//     //   navigate(`/login`, { replace: true });

//     // }

//     console.log(user);
//     if (!user) {
//       if (!authRoutes.includes(location.pathname)) {
//         console.log("No token found, Invalid Path, redirecting to login");
//         navigate(`/login`);
//       }
//     } else {
//       // If user has token, check role and path match
//       if (
//         (user == "user" && !location.pathname.startsWith("/user")) ||
//         (user == "warehouse" && !location.pathname.startsWith("/warehouse"))
//       ) {
//         const redirectPath = user == "user" ? "/user" : "/warehouse";
//         console.log(
//           `Role ${
//             user as any
//           } accessing wrong path, redirecting to ${redirectPath}`
//         );
//         navigate(redirectPath);
//       }
//     }
//   }, [ , location.search, navigate]);

//   return (
//     <>
//       <ToastContainer
//         position="top-right"
//         autoClose={10000}
//         newestOnTop={true}
//         closeOnClick={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//       <Outlet />
//     </>
//   );
// }

// export default App;

import axios from "axios";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { drpCrmBaseUrl } from "./axios/urls";
import { useUserStore } from "./store/useUserStore";
import { useLocation } from "react-router-dom";

const App = () => {
  const { username, setUsername } = useUserStore();
  const location = useLocation();
  const setUserName = async () => {
    try {
      const { data } = await axios.get(`${drpCrmBaseUrl}/auth/verify/me`, {
        withCredentials: true,
      });
      const userString = data.username;
      setUsername(userString);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    if (!username) {
      setUserName();
    }
  }, [location.pathname]);
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={10000}
        newestOnTop={true}
        closeOnClick={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Outlet />
    </>
  );
};

export default App;

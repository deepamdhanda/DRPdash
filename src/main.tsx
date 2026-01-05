import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import LoginPage from "./screens/auth/LoginPage.tsx";
import RegisterPage from "./screens/auth/RegisterPage.tsx";
import VerifyPage from "./screens/auth/VerifyPage.tsx";
import ForgotPasswordPage from "./screens/auth/ForgotPasswordPage.tsx";
import ResetPasswordPage from "./screens/auth/ResetPasswordPage.tsx";
import LandingPage from "./screens/auth/landingPage.tsx";
import JoinWaitList from "./screens/auth/LandingPages/JoinWaitlist.tsx";
import UserPanel from "./screens/user/DashboardPanel/DashboardPannel.tsx";
import { userRoutes } from "./screens/user/index.tsx";
import WarehouseDashboardPanel from "./screens/warehouse/DashboardPanel/DashboardPannel.tsx";
import { warehouseRoutes } from "./screens/warehouse/index.tsx";
import EcomCreditScoreLandingPage from "./screens/auth/LandingPages/EcomCreditScore/index.tsx";
import GetStarted from "./screens/user/GetStarted.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // General app layout
    children: [
      {
        path: "score",
        // index: true, // This will be the default route
        element: <EcomCreditScoreLandingPage />, // or a default landing page
      },
      {
        path: "waiting",
        element: <JoinWaitList />, // or a default landing page
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
      {
        path: "landing-page",
        element: <LandingPage />,
      },
      {
        path: "verify",
        element: <VerifyPage />,
      },
      {
        path: "forgotPassword",
        element: <ForgotPasswordPage />,
      },
      {
        path: "resetPassword",
        element: <ResetPasswordPage />,
      },
      {
        path: "get-started", // /get-started
        element: <GetStarted />, // or a default dashboard
      },
      {
        path: "user",
        element: <UserPanel />, // <-- This becomes the layout for all /Dashboard/* routes
        children: userRoutes,
      },
      {
        path: "warehouse",
        element: <WarehouseDashboardPanel />, // <-- This becomes the layout for all /Dashboard/* routes
        children: warehouseRoutes,
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);

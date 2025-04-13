import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./screens/dashboard/Dashboard.tsx";
import DashboardPanel from "./screens/dashboard/DashboardPanel/DashboardPannel.tsx";
import { Pools } from "./screens/dashboard/Pools.tsx";
import LoginPage from "./screens/auth/Login/LoginPage.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // General app layout
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPanel />, // <-- This becomes the layout for all /Dashboard/* routes
        children: [
          {
            index: true, // /Dashboard
            element: <Dashboard />, // or a default dashboard
          },
          {
            path: "pools", // /Dashboard/pools
            element: <Pools />,
          },
        ],
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);

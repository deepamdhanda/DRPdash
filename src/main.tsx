import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./screens/dashboard/Dashboard.tsx";
import DashboardPanel from "./screens/dashboard/DashboardPanel/DashboardPannel.tsx";
import { Pools } from "./screens/dashboard/Pools.tsx";
import { Finances } from "./screens/dashboard/Finances.tsx";
import LoginPage from "./screens/auth/LoginPage.tsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { ChannelAccounts } from "./screens/dashboard/ChannelAccounts.tsx";
import { Products } from "./screens/dashboard/Products.tsx";
import { ProductSKUs } from "./screens/dashboard/ProductSKUs.tsx";
import { Orders } from "./screens/dashboard/Orders.tsx";
import { Warehouses } from "./screens/dashboard/Warehouse.tsx";
import { ChannelSKU } from "./screens/dashboard/ChannelSKU.tsx";
import RegisterPage from "./screens/auth/RegisterPage.tsx";
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
        path: "register",
        element: <RegisterPage />,
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
          {
            path: "finance", // /Dashboard/pools
            element: <Finances />,
          },
          {
            path: "channel_accounts", // /Dashboard/pools
            element: <ChannelAccounts />,
          },
          {
            path: "products", // /Dashboard/pools
            element: <Products />,
          },
          {
            path: "productSKU", // /Dashboard/pools
            element: <ProductSKUs />,
          },
          {
            path: "channelSKU", // /Dashboard/pools
            element: <ChannelSKU />,
          },
          {
            path: "orders", // /Dashboard/pools
            element: <Orders />,
          },
          {
            path: "warehouses", // /Dashboard/pools
            element: <Warehouses />,
          },
        ],
      },
    ],
  },
]);
createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./screens/user/Dashboard.tsx";
import UserPanel from "./screens/user/UserPanel/UserPannel.tsx";
import { UserPools } from "./screens/user/Pools/UserPools.tsx";
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
        path: "user",
        element: <UserPanel />, // <-- This becomes the layout for all /user/* routes
        children: [
          {
            index: true, // /user
            element: <Dashboard />, // or a default dashboard
          },
          {
            path: "pools", // /user/pools
            element: <UserPools />,
          },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />
);

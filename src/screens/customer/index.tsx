import Login from "./CustomerLogin";
import OrderDashboard from "./OrderDashboard";
import OrderList from "./OrderList";
import TrackingPage from "./TrackingPage";

const customerRoutes = [
  {
    path: "/customer/login",
    element: <Login />,
  },
  {
    path: "/customer/order",
    element: <OrderList />,
  },
  {
    path: "/customer/order/:orderId",
    element: <OrderDashboard />,
  },
  {
    path: "/customer/track/:orderId",
    element: <TrackingPage />,
  },
];

export default customerRoutes;

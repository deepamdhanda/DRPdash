import { Dashboard } from "./Dashboard.tsx";
import { Finances } from "./Finances.tsx";
import { Products } from "./Products.tsx";
import { Orders } from "./Orders.tsx";
import { Warehouses } from "./Warehouse.tsx";
import { ProductPacks } from "./ProductPacks.tsx";
import { ScanOrders } from "./ScanOrders.tsx";
import { NDRORders } from "./NDROders.tsx";
import { FlaggedOrders } from "../warehouse/FlaggedOrders.tsx";
import { Invoices } from "../Invoices/Invoices.tsx";

export const warehouseRoutes = [
  {
    index: true, // /Dashboard
    element: <Dashboard />, // or a default dashboard
  },

  {
    path: "finance", // /Dashboard/pools
    element: <Finances />,
  },
  {
    path: "products", // /Dashboard/pools
    element: <Products />,
  },
  {
    path: "productPacks", // /Dashboard/pools
    element: <ProductPacks />,
  },
  {
    path: "orders", // /Dashboard/pools
    element: <Orders />,
  },
  {
    path: "flaggedOrders", // /Dashboard/pools
    element: <FlaggedOrders />,
  },
  {
    path: "scanOrders", // /Dashboard/pools
    element: <ScanOrders />,
  },
  {
    path: "NDR", // /Dashboard/pools
    element: <NDRORders />,
  },
  {
    path: "warehouses", // /Dashboard/pools
    element: <Warehouses />,
  },
];

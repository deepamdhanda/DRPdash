import { Dashboard } from "./Dashboard.tsx";
import { Pools } from "./Pools.tsx";
import { Finances } from "./Finances.tsx";
import { ChannelAccounts } from "./ChannelAccounts.tsx";
import { Products } from "./Products.tsx";
import { ProductSKUs } from "./ProductSKUs.tsx";
import { Orders } from "./Orders.tsx";
import { Warehouses } from "./Warehouse.tsx";
import { ChannelSKU } from "./ChannelSKU.tsx";
import { ProductPacks } from "./ProductPacks.tsx";

import { ScanOrders } from "./ScanOrders.tsx";
import { ProfitCalculator } from "./ProfitCalculator.tsx";
import { NDRReports } from "./NDRReport.tsx";
import { FlaggedOrders } from "./FlaggedOrders.tsx";
import SettingsPage from "./Settings.tsx";
import { CODRemittances } from "./CODRemittances.tsx";
import { Invoices } from "../Invoices/Invoices.tsx";
import DamageReport from "./DamageReport.tsx";
import ShippingCalculator from "./ShippingChargeCalculator.tsx";
import WeightDiscrepancy from "./WeightDiscrepancy.tsx";
import DiscoverDashboard from "./Discovery.tsx";
import OrderDash from "./OrderDash.tsx";
import { WalletTransactionsComponent } from "./WalletTransactions.tsx";
import { WalletRechargeComponent } from "./WalletRecharge.tsx";
import CheckoutCustomizerPage from "./CheckoutCustomizerPage.tsx";

export const userRoutes = [
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
    path: "wallet-transactions", // /Dashboard/pools
    element: <WalletTransactionsComponent />,
  },
  {
    path: "wallet-recharge", // /Dashboard/pools
    element: <WalletRechargeComponent />,
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
    path: "productPacks", // /Dashboard/pools
    element: <ProductPacks />,
  },
  {
    path: "profitCalculator", // /Dashboard/pools
    element: <ProfitCalculator />,
  },
  {
    path: "channelSKU", // /Dashboard/pools
    element: <ChannelSKU />,
  },
  {
    path: "NDR", // /Dashboard/pools
    element: <NDRReports />,
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
    path: "warehouses", // /Dashboard/pools
    element: <Warehouses />,
  },
  {
    path: "CODRemittance", // /Dashboard/pools
    element: <CODRemittances />,
  },
  {
    path: "Invoices", // /Dashboard/pools
    element: <Invoices />,
  },
  {
    path: "settings", // /Dashboard/pools
    element: <SettingsPage />,
  },
  {
    path: "damage-report",
    element: <DamageReport />,
  },
  {
    path: "shipping-charge-calculator",
    element: <ShippingCalculator />,
  },
  {
    path: "weight-discrepancy",
    element: <WeightDiscrepancy />,
  },
  {
    path: "product-discovery",
    element: <DiscoverDashboard />,
  },
  { path: "order-dash", element: <OrderDash /> },
  { path: "checkout-customizer", element: <CheckoutCustomizerPage /> }
];

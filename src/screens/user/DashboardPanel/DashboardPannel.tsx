import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import SupportChatWidget from "./SupportChatWidget";
import axios from "axios";
import { drpCrmBaseUrl } from "../../../axios/urls";
import { useUserStore } from "../../../store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Link2,
  Wallet,
  Warehouse,
  Scale,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  ShieldAlert,
  ScanLine,
  Boxes,
  Tags,
  PackagePlus,
  WalletCards,
  BadgeIndianRupee,
  ReceiptText,
  ChartNoAxesCombined,
  Calculator,
  Layers3,
  RadioTower,
  ClipboardX,
} from "lucide-react";

type NavLink = {
  name: string;
  icon: React.ReactNode;
  path: string;
};

const iconProps = { size: 20, strokeWidth: 2.5 };

const navGroups: NavLink[][] = [
  [
    {
      name: "Dashboard",
      icon: <LayoutDashboard {...iconProps} />,
      path: "/user",
    },
  ],
  [
    {
      name: "View Orders",
      icon: <ShoppingBag {...iconProps} />,
      path: "/user/order-dash",
    },
    {
      name: "Flagged Orders",
      icon: <ShieldAlert {...iconProps} />,
      path: "/user/flaggedOrders",
    },
    {
      name: "Scan Orders",
      icon: <ScanLine {...iconProps} />,
      path: "/user/scanOrders",
    },
    { name: "NDR", icon: <Truck {...iconProps} />, path: "/user/NDR" },
  ],
  [
    {
      name: "View Products",
      icon: <Boxes {...iconProps} />,
      path: "/user/Products",
    },
    {
      name: "Product SKUs",
      icon: <Tags {...iconProps} />,
      path: "/user/ProductSKU",
    },
    {
      name: "Product Packs",
      icon: <PackagePlus {...iconProps} />,
      path: "/user/ProductPacks",
    },
    {
      name: "Channel SKU",
      icon: <Link2 {...iconProps} />,
      path: "/user/ChannelSKU",
    },
  ],
  [
    {
      name: "Ledger",
      icon: <WalletCards {...iconProps} />,
      path: "/user/Finance",
    },
    {
      name: "COD Remittance",
      icon: <BadgeIndianRupee {...iconProps} />,
      path: "/user/CODRemittance",
    },
    { name: "Wallet", icon: <Wallet {...iconProps} />, path: "/user/Wallet" },
    {
      name: "Invoices",
      icon: <ReceiptText {...iconProps} />,
      path: "/user/Invoices",
    },
  ],
  [
    {
      name: "Profit Calculator",
      icon: <ChartNoAxesCombined {...iconProps} />,
      path: "/user/ProfitCalculator",
    },
    {
      name: "Shipping Calculator",
      icon: <Calculator {...iconProps} />,
      path: "/user/shipping-charge-calculator",
    },
  ],
  [
    { name: "Pools", icon: <Layers3 {...iconProps} />, path: "/user/pools" },
    {
      name: "Channel Accounts",
      icon: <RadioTower {...iconProps} />,
      path: "/user/channel_accounts",
    },
    {
      name: "Warehouse",
      icon: <Warehouse {...iconProps} />,
      path: "/user/Warehouses",
    },
    {
      name: "Damage Reports",
      icon: <ClipboardX {...iconProps} />,
      path: "/user/damage-report",
    },
    {
      name: "Weight Discrepancy",
      icon: <Scale {...iconProps} />,
      path: "/user/weight-discrepancy",
    },
  ],
];

const UserPanel: React.FC = () => {
  const { username, reset } = useUserStore();
  const [activeLink, setActiveLink] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    let matchedName = "";

    navGroups.forEach((group) => {
      group.forEach((link) => {
        if (link.path === currentPath) matchedName = link.name;
      });
    });

    if (matchedName) {
      setActiveLink(matchedName);
      document.title = `${matchedName} - OrderzUp`;
    } else {
      document.title = "Dashboard - OrderzUp";
    }
  }, [location.pathname]);

  const handleLinkClick = (name: string, path: string) => {
    setActiveLink(name);
    navigate(path);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    reset();
    await axios.post(
      `${drpCrmBaseUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
    navigate("/login");
  };

  const NavItem = ({ link }: { link: NavLink }) => {
    const isActive = activeLink === link.name;

    return (
      <div
        onClick={() => handleLinkClick(link.name, link.path)}
        className={`group flex items-center gap-4 px-4 py-3 mx-4 mb-1 rounded-xl cursor-pointer transition-all duration-200 ${
          isActive
            ? "bg-linear-to-tr to-[#f5891d]/40 from-amber-600 text-white border border-white shadow-md  font-semibold"
            : "text-neutral-500 font-medium hover:text-[#F5891E] hover:bg-orange-50"
        }`}
      >
        <span
          className={`${
            isActive
              ? "text-white"
              : "text-neutral-500 group-hover:text-[#F5891E]"
          } transition-colors`}
        >
          {link.icon}
        </span>
        <span className="text-[15px]">{link.name}</span>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-neutral-50 font-sans overflow-hidden">
      {/* Mobile Dark Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Flat layout with robust typography and orange theme */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-neutral-200 flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo Section */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div className="flex items-center justify-center gap-3">
            <img src="/Orderzup.png" alt="Logo Icon" className="w-15" />
            <span className="font-bold text-[#000967] text-5xl">
              Orderz<span className="text-[#F5891E]">Up</span>
            </span>
          </div>
          <button
            className="md:hidden text-neutral-400 hover:text-[#F5891E]"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* User Greeting Divider */}
        <div className="px-8 pb-4">
          <div className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wider pb-2">
            Hello, <span className="text-[#F5891E]">{username}</span>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 pb-6">
          {navGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {/* Divider lines between groups */}
              {groupIndex > 0 && (
                <div className="h-px bg-linear-to-r from-transparent to-neutral-300 my-4 mx-8"></div>
              )}
              {group.map((link) => (
                <NavItem key={link.name} link={link} />
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Pinned Log Out Section */}
        <div className="mt-auto pb-6 pt-4 px-4 bg-white">
          <div className="border-t border-neutral-100 mb-3 mx-4"></div>
          <div
            onClick={handleLogout}
            className="group flex items-center gap-4 px-4 py-3 mx-4 rounded-xl cursor-pointer text-neutral-600 font-medium hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut
              size={20}
              strokeWidth={2.5}
              className="text-neutral-400 group-hover:text-red-600"
            />
            <span className="text-[15px]">Sign Out</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative bg-neutral-50">
        {/* Mobile Header */}
        <header className="md:hidden bg-white p-4 flex items-center justify-between z-30 shadow-sm border-b border-neutral-200">
          <div className="flex items-center justify-center gap-2">
            <img src="/Orderzup.png" alt="Logo Icon" className="w-10" />
            <span className="font-bold text-[#000967] text-4xl">
              Orderz<span className="text-[#F5891E]">Up</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-neutral-600 hover:bg-orange-50 hover:text-[#F5891E] rounded-md transition-colors"
          >
            <Menu size={26} strokeWidth={2.5} />
          </button>
        </header>

        {/* Scrollable Main Views */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>

        <SupportChatWidget />
      </main>
    </div>
  );
};

export default UserPanel;

import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import SupportChatWidget from "./SupportChatWidget";
import axios from "axios";
import { drpCrmBaseUrl } from "../../../axios/urls";
import { useUserStore } from "../../../store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Truck,
  Wallet,
  Warehouse,
  Scale,
  Menu,
  X,
  LogOut,
  ShoppingBag,
  Boxes,
  PackagePlus,
  BadgeIndianRupee,
  ReceiptText,
  ChartNoAxesCombined,
  Calculator,
  Layers3,
  ClipboardX,
} from "lucide-react";

type NavLink = {
  name: string;
  icon: React.ReactNode;
  path: string;
  children?: { link: string; name: string }[];
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
      name: "Orders",
      icon: <ShoppingBag {...iconProps} />,
      path: "/user/order-dash",
      children: [
        { name: "Order", link: "/user/order-dash" },
        { name: "Old Orders", link: "/user/orders" },
        { name: "Flagged Order", link: "/user/flaggedOrders" },
      ],
    },
  ],

  [
    {
      name: "Business Account",
      icon: <Layers3 {...iconProps} />,
      path: "/user/pools",
      children: [
        { name: "Business Accounts", link: "/user/pools" },
        { name: "Channel Accounts", link: "/user/channel_accounts" },
      ],
    },
  ],

  [
    {
      name: "Warehouses",
      icon: <Warehouse {...iconProps} />,
      path: "/user/warehouses",
    },
  ],

  [
    {
      name: "Products",
      icon: <Boxes {...iconProps} />,
      path: "/user/products",
      children: [
        { name: "Product", link: "/user/products" },
        { name: "Product SKU", link: "/user/productSKU" },
        { name: "Channel SKU", link: "/user/channelSKU" },
      ],
    },
    {
      name: "Product Packs",
      icon: <PackagePlus {...iconProps} />,
      path: "/user/ProductPacks",
    },
  ],

  [
    {
      name: "COD Remittance",
      icon: <BadgeIndianRupee {...iconProps} />,
      path: "/user/CODRemittance",
    },
    {
      name: "Invoices",
      icon: <ReceiptText {...iconProps} />,
      path: "/user/Invoices",
    },
    {
      name: "Wallet",
      icon: <Wallet {...iconProps} />,
      path: "/user/Wallet",
    },
  ],

  [
    { name: "NDR", icon: <Truck {...iconProps} />, path: "/user/NDR" },
    {
      name: "Damage Report",
      icon: <ClipboardX {...iconProps} />,
      path: "/user/damage-report",
    },
    {
      name: "Weight Discrepancy",
      icon: <Scale {...iconProps} />,
      path: "/user/weight-discrepancy",
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
];

const UserPanel: React.FC = () => {
  const { username, reset } = useUserStore();
  const [activeLink, setActiveLink] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [nlink, setNlink] = useState<{ name: string; link: string }[] | null>(
    null
  );
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  useEffect(() => {
    const currentPath = location.pathname;
    let matchedParent = null;

    // Search through groups to find a matching parent OR a matching child
    for (const group of navGroups) {
      for (const item of group) {
        if (
          item.path === currentPath ||
          item.children?.some((child) => child.link === currentPath)
        ) {
          matchedParent = item;
          break;
        }
      }
      if (matchedParent) break;
    }

    // Apply the active states
    if (matchedParent) {
      setActiveLink(matchedParent.name);
      setNlink(matchedParent.children || null);
      document.title = `${matchedParent.name} - OrderzUp`;
    } else {
      setActiveLink("");
      setNlink(null);
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
            ? "bg-linear-to-tr to-[#f5891d]/40 from-amber-600 text-white border border-white shadow-md font-semibold"
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

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-white/90 border-r border-neutral-200 flex flex-col transform transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Header/Logo */}
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

        {/* User Greeting */}
        <div className="px-8 pb-4">
          <div className="text-[13px] font-semibold text-neutral-400 uppercase tracking-wider pb-2">
            Hello, <span className="text-[#F5891E]">{username}</span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-hide py-2 pb-6">
          {navGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && group.length > 1 && (
                <div className="h-px bg-linear-to-r from-transparent to-neutral-300 my-4 mx-8" />
              )}
              {group.map((link) => (
                <NavItem key={link.name} link={link} />
              ))}
            </React.Fragment>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="mt-auto pb-6 pt-4 px-4 bg-white">
          <div className="border-t border-neutral-100 mb-3 mx-4" />
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

      {/* Main Content */}
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

        {/* Scrollable Views */}
        <div className="flex-1 overflow-y-auto ">
          <div className="hidden md:flex h-20 items-center justify-between px-8 bg-white/60 backdrop-blur-md border-b border-neutral-200 z-10 sticky top-0">
            <nav className="flex space-x-2">
              {nlink?.map((item) => {
                const isActive = location.pathname === item.link;
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    className={`relative px-5 py-2 rounded-full text-sm font-bold transition-colors ${
                      isActive
                        ? "text-[#F5891E] hover:text-orange-600!"
                        : "text-neutral-500! hover:text-neutral-800!"
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <motion.div
                        layoutId="desktop-underline"
                        className="absolute left-0 right-0 bottom-0 h-0.75 bg-[#F5891E] rounded-t-md mx-4"
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-8">
              <div className="text-orange-700 text-sm hidden md:block font-black">
                {today}
              </div>

              {/* 3. User Section */}
              <button className="flex items-center space-x-3  p-2 rounded-lg transition-colors">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-orange-900 leading-tight">
                    {username}
                  </p>
                </div>
                {/* User Avatar Placeholder */}
                <div className="h-10 w-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {username?.slice(0, 1)}
                </div>
              </button>
            </div>
          </div>
          <div className="p-4 md:p-8">
            <Outlet />
          </div>
        </div>
        {nlink && nlink.length > 0 && (
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] z-30 px-2 py-2 flex justify-around">
            {nlink.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={`relative flex-1 text-center py-3 text-sm font-bold transition-colors ${
                    isActive ? "text-[#F5891E]!" : "text-neutral-500!"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      layoutId="mobile-underline"
                      className="absolute left-1/4 right-1/4 bottom-0 h-1 bg-[#F5891E]! rounded-t-md"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        )}
        <SupportChatWidget />
      </main>
    </div>
  );
};

export default UserPanel;

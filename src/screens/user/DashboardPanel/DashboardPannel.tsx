import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "./dashboardPannel.css";
import { FaSignOutAlt } from "react-icons/fa";
import logoImg from "../../../assets/logo.png";
import logoImg1 from "../../../assets/logo1.png";
import SupportChatWidget from "./SupportChatWidget";
import axios from "axios";
import { drpCrmBaseUrl } from "../../../axios/urls";
import { useUserStore } from "../../../store/useUserStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingCart,
  Flag,
  Scan,
  Truck,
  Package,
  Tag,
  Gift,
  Link2,
  DollarSign,
  Wallet,
  FileText,
  Calculator,
  Settings,
  Layers,
  Radio,
  Warehouse,
  ChevronRight,
} from "lucide-react";
import { BsGraphUp } from "react-icons/bs";

type NavLink = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavLink[];
};

type TNavLinkName =
  | ""
  | "Dashboard"
  | "Orders"
  | "Pools"
  | "Channels"
  | "Products"
  | "Product SKUs"
  | "Channels linked SKU"
  | "NDR"
  | "Finance"
  | "invoices"
  | "SignOut";

const navLinks: NavLink[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/user",
  },
  {
    name: "Orders",
    icon: <ShoppingCart size={20} />,
    children: [
      {
        name: "View Orders",
        icon: <ShoppingCart size={18} />,
        path: "/user/orders",
      },
      {
        name: "Flagged Orders",
        icon: <Flag size={18} />,
        path: "/user/flaggedOrders",
      },
      {
        name: "Scan Orders",
        icon: <Scan size={18} />,
        path: "/user/scanOrders",
      },
      { name: "NDR", icon: <Truck size={18} />, path: "/user/NDR" },
    ],
  },
  {
    name: "Products",
    icon: <Package size={20} />,
    children: [
      {
        name: "View Products",
        icon: <Package size={18} />,
        path: "/user/Products",
      },
      {
        name: "Product SKUs",
        icon: <Tag size={18} />,
        path: "/user/ProductSKU",
      },
      {
        name: "Product Packs",
        icon: <Gift size={18} />,
        path: "/user/ProductPacks",
      },
      {
        name: "Channel SKU",
        icon: <Link2 size={18} />,
        path: "/user/ChannelSKU",
      },
    ],
  },
  {
    name: "Finance",
    icon: <DollarSign size={20} />,
    children: [
      { name: "Ledger", icon: <FileText size={18} />, path: "/user/Finance" },
      {
        name: "COD Remittance",
        icon: <DollarSign size={18} />,
        path: "/user/CODRemittance",
      },
      { name: "Wallet", icon: <Wallet size={18} />, path: "/user/Wallet" },
      {
        name: "Invoices",
        icon: <FileText size={18} />,
        path: "/user/Invoices",
      },
    ],
  },
  {
    name: "Calculators",
    icon: <Calculator size={20} />,
    children: [
      {
        name: "Profit Calculator",
        icon: <BsGraphUp size={18} />,
        path: "/user/ProfitCalculator",
      },
      {
        name: "Shipping Calculator",
        icon: <Truck size={18} />,
        path: "/user/shipping-charge-calculator",
      },
    ],
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    children: [
      { name: "Pools", icon: <Layers size={18} />, path: "/user/pools" },
      {
        name: "Channel Accounts",
        icon: <Radio size={18} />,
        path: "/user/channel_accounts",
      },
      {
        name: "Warehouse",
        icon: <Warehouse size={18} />,
        path: "/user/Warehouses",
      },
    ],
  },
];

const UserPanel: React.FC = () => {
  const { username } = useUserStore();
  const [activeLink, setActiveLink] = useState<TNavLinkName>("");
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = window.innerWidth < 787;
  const { reset } = useUserStore();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [sidebarHovered, setSidebarHovered] = useState<boolean>(false);

  // Automatically sync active link with current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedLink = navLinks.find((link) => link.path === currentPath);
    if (matchedLink) {
      setActiveLink(matchedLink.name as TNavLinkName);
      document.title = `${matchedLink.name} - Orderz Up`; // Dynamically update the title
    } else {
      document.title = "Dashboard - Orderz Up"; // Default title
    }
  }, [location.pathname]);

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };
  const NavItem = ({ link, level = 0 }: { link: NavLink; level?: number }) => {
    const isExpanded = expandedItems.has(link.name);
    const isHovered = hoveredItem === link.name;
    const isActive = activeLink === link.name;
    const hasChildren = link.children && link.children.length > 0;

    const handleMouseEnter = () => {
      if (!isMobile && hasChildren) {
        setHoveredItem(link.name);
      }
    };

    const handleMouseLeave = () => {
      if (!isMobile) {
        setHoveredItem(null);
      }
    };

    const handleClick = () => {
      if (hasChildren) {
        if (isMobile) {
          toggleExpanded(link.name);
        }
      } else if (link.path) {
        handleLinkClick(link.name, link.path);
      }
    };

    const showName = isMobile || sidebarOpen || sidebarHovered;

    return (
      <div
        className="position-relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ marginBottom: "4px" }}
      >

        {!hasChildren && (
        <motion.div
          className={`d-flex align-items-center justify-content-between px-3 py-2 rounded mx-2 `}
          style={{
            cursor: "pointer",
            transition: "all 0.2s",
            background: isActive
              ? "linear-gradient(90deg, #F5891E 0%, #FF6B35 100%)"
              : "transparent",
            boxShadow: isActive ? "0 4px 6px rgba(245, 137, 30, 0.3)" : "none",
          }}
          onClick={handleClick}
          whileHover={{
            x: level === 0 ? 4 : 2,
            backgroundColor: isActive ? undefined : "#FFF5E6",
            color: isActive ? undefined : "#F5891E!important",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="d-flex align-items-center gap-3">
            <span style={{ color: isActive ? "white" : "#F5891E" }}>
              {link.icon}
            </span>
            {showName && (
              <span
                className="fw-medium nav-name"
                style={{
                  fontSize: "14px",
                  color: isActive ? "white" : "#F5891E",
                }}
              >
                {link.name}
              </span>
            )}
          </div>
          {hasChildren && (
            <motion.span
              transition={{ duration: 0.2 }}
              style={{ color: isActive ? "white" : "white" }}
              className="nav-name"
            >
              <ChevronRight size={16} />
            </motion.span>
          )}
        </motion.div>)}
        {/* Always show children with a separator to reduce clicks */}
        {hasChildren && (
          <div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 8px" }} />
            {link.children?.map((child) => (
              <div
                key={child.name}
                className="d-flex align-items-center gap-3 px-3 py-2 mx-2"
                style={{
                  cursor: "pointer",
                  transition: "all 0.15s",
                  marginLeft: level === 0 ? 24 : 32,
                  backgroundColor:
                    activeLink === child.name ? "#FFF5E6" : "transparent",
                  color: activeLink === child.name ? "#F5891E" : "#fff",
                  borderLeft: activeLink === child.name ? "4px solid #F5891E" : "4px solid transparent",
                }}
                onClick={() => child.path && handleLinkClick(child.name, child.path)}
                onMouseEnter={(e) => {
                  if (activeLink !== child.name) {
                    e.currentTarget.style.backgroundColor = "#FFF5E6";
                    e.currentTarget.style.color = "#F5891E";
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeLink !== child.name) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#fff";
                  }
                }}
              >
                <span style={{ color: "#F5891E" }}>{child.icon}</span>
                {(isMobile || sidebarOpen || sidebarHovered) && (
                  <span className="fw-medium" style={{ fontSize: "14px" }}>
                    {child.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  const handleLinkClick = async (name: string, path?: string) => {
    setSidebarOpen(false);
    if (name === "SignOut") {
      reset();
      await axios.post(
        `${drpCrmBaseUrl}/auth/logout`,
        {},
        { withCredentials: true }
      );
      navigate("/login");
      return;
    }
    setActiveLink(name as TNavLinkName);
    if (path) navigate(path);
  };

  return (
    <div id="user-panel" className="nav-visible">
      {isMobile && (
        <button
          className="hamburger-menu"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "X" : "☰"}
        </button>
      )}
      <div
        className={`sidebar sidebar-visible`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
        style={{
          display:
            isMobile && !sidebarOpen ? "none!imporant" : "flex!important",
        }}
      >
        <nav className="nav-1">
          <div>
            <div className="nav-logo">
              <span className="nav-logo-icon">
                <img src={logoImg} style={{ width: "30px " }} />
              </span>
              <span className="nav-logo-name">
                <img src={logoImg1} style={{ width: "100px " }} />
              </span>
            </div>
            <div
              style={{
                margin: "5px 0 15px 0",
                padding: "10px 10px",
                borderWidth: "1px 0",
                borderColor: "#F5891E",
                borderStyle: "solid",
                fontSize: "14px",
                fontWeight: "200",
              }}
            >
              Hello, {username}!
            </div>
            <div className="nav-list-1">
              {navLinks.map((link) => (
                <NavItem key={link.name} link={link} />
              ))}
            </div>
          </div>
          <div
            className={`nav-link-1 ${activeLink === "SignOut" ? "active" : ""}`}
            onClick={() => handleLinkClick("SignOut")}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
            <span className="nav-name"> Sign Out</span>
          </div>
        </nav>
      </div>
      {isMobile && sidebarOpen && (
        <div
          className={`side-mobile ${sidebarOpen ? " open" : ""}`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          <nav className="nav-1">
            <div>
              <div className="nav-logo">
                <span className="nav-logo-icon">
                  <img src={logoImg} style={{ width: "30px " }} />
                </span>
                <span className="nav-logo-name">
                  <img src={logoImg1} style={{ width: "100px " }} />
                </span>
              </div>
              <div
                style={{
                  margin: "5px 0 15px 0",
                  padding: "10px 10px",
                  borderWidth: "1px 0",
                  borderColor: "#F5891E",
                  borderStyle: "solid",
                  fontSize: "14px",
                  fontWeight: "200",
                }}
              >
                Hello, {username}!
              </div>
              <div className="nav-list-2">
                {navLinks.map((link) => (
                  <NavItem key={link.name} link={link} />
                ))}
              </div>
            </div>
            <div
              className={`nav-link-1 ${
                activeLink === "SignOut" ? "active" : ""
              }`}
              onClick={() => handleLinkClick("SignOut")}
            >
              <span className="nav-icon">
                <FaSignOutAlt />
              </span>
              <span className="nav-name"> Sign Out</span>
            </div>
          </nav>
        </div>
      )}
      <div className="main-content" style={{ backgroundColor: "#f6f7f9" }}>
        {/* hello */}
        <Outlet />
        <SupportChatWidget />
      </div>
    </div>
  );
};

export default UserPanel;

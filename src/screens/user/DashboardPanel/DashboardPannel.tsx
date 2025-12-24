import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { drpCrmBaseUrl } from "../../../axios/urls";
import { useUserStore } from "../../../store/useUserStore";
import logoImg from "../../../assets/logo.png";
import logoImg1 from "../../../assets/logo1.png";
import SupportChatWidget from "./SupportChatWidget";
import "bootstrap/dist/css/bootstrap.min.css";

// Types
type NavLink = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavLink[];
};

type TNavLinkName = string;

// Navigation structure
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
    name: "Profit Calculator",
    icon: <Calculator size={20} />,
    path: "/user/ProfitCalculator",
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
  const { username, reset } = useUserStore();
  const [activeLink, setActiveLink] = useState<TNavLinkName>("");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 787);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 787);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sync active link with current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const findActiveLink = (links: NavLink[]): string | null => {
      for (const link of links) {
        if (link.path === currentPath) return link.name;
        if (link.children) {
          const childMatch = findActiveLink(link.children);
          if (childMatch) return childMatch;
        }
      }
      return null;
    };

    const matchedLink = findActiveLink(navLinks);
    if (matchedLink) {
      setActiveLink(matchedLink);
      document.title = `${matchedLink} - Orderz Up`;
    }
  }, [location.pathname]);

  const handleLinkClick = (name: string, path?: string) => {
    if (path) {
      setActiveLink(name);
      navigate(path);
      if (isMobile) setSidebarOpen(false);
    }
  };

  const toggleExpanded = (name: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
    }
    setExpandedItems(newExpanded);
  };

  const handleSignOut = async () => {
    reset();
    await axios.post(
      `${drpCrmBaseUrl}/auth/logout`,
      {},
      { withCredentials: true }
    );
    navigate("/login");
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

    return (
      <div
        className="position-relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ marginBottom: "4px" }}
      >
        <motion.div
          className={`d-flex align-items-center justify-content-between px-3 py-2 rounded mx-2 ${
            isActive ? "text-white" : "text-dark"
          }`}
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
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="d-flex align-items-center gap-3">
            <span style={{ color: isActive ? "white" : "#F5891E" }}>
              {link.icon}
            </span>
            <span className="fw-medium" style={{ fontSize: "14px" }}>
              {link.name}
            </span>
          </div>
          {hasChildren && (
            <motion.span
              animate={{ rotate: isExpanded || isHovered ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: isActive ? "white" : "#6c757d" }}
            >
              <ChevronRight size={16} />
            </motion.span>
          )}
        </motion.div>

        {/* Desktop: Hover menu */}

        <AnimatePresence initial={false}>
          {isHovered && (
            <motion.div
              animate={{ transform: "translateX(15px)" }}
              transition={{ duration: 0.4 }}
              className="py-2"
            >
              {link.children?.map((child) => (
                <div
                  key={child.name}
                  className="d-flex align-items-center gap-3 px-3 py-2 ml-5"
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    backgroundColor:
                      activeLink === child.name ? "#FFF5E6" : "transparent",
                    color: activeLink === child.name ? "#F5891E" : "#212529",
                    borderLeft:
                      activeLink === child.name
                        ? "4px solid #F5891E"
                        : "4px solid transparent",
                  }}
                  onClick={() =>
                    child.path && handleLinkClick(child.name, child.path)
                  }
                  onMouseEnter={(e) => {
                    if (activeLink !== child.name) {
                      e.currentTarget.style.backgroundColor = "#f8f9fa";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeLink !== child.name) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span style={{ color: "#F5891E" }}>{child.icon}</span>
                  <span className="fw-medium" style={{ fontSize: "14px" }}>
                    {child.name}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile: Expandable menu */}
        {isMobile && hasChildren && (
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={false}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{ overflow: "hidden" }}
              >
                {link.children?.map((child) => (
                  <motion.div
                    key={child.name}
                    animate={{ x: 10, opacity: 1 }}
                    className="d-flex align-items-center gap-3 px-3 py-2 rounded mx-2"
                    style={{
                      cursor: "pointer",
                      marginLeft: "32px",
                      marginBottom: "4px",
                      transition: "all 0.2s",
                      backgroundColor:
                        activeLink === child.name ? "#FFE8CC" : "transparent",
                      color: activeLink === child.name ? "#F5891E" : "#6c757d",
                    }}
                    onClick={() =>
                      child.path && handleLinkClick(child.name, child.path)
                    }
                  >
                    <span style={{ color: "#F5891E" }}>{child.icon}</span>
                    <span className="fw-medium" style={{ fontSize: "14px" }}>
                      {child.name}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    );
  };

  const Sidebar = () => (
    <div className="d-flex flex-column h-100 bg-white">
      <div
        className="d-flex align-items-center justify-content-center gap-3 py-3 m-1"
        style={{ background: "#000434", borderRadius: "5px" }}
      >
        <img src={logoImg} alt="Logo" style={{ height: "35px" }} />
        <img src={logoImg1} alt="Brand" style={{ height: "35px" }} />
      </div>
      {/* Logo Section */}
      <div className="p-4 border-bottom">
        <div
          className="px-3 py-2 rounded"
          style={{
            background: "linear-gradient(90deg, #FFF5E6 0%, #FFE8CC 100%)",
            borderLeft: "4px solid #F5891E",
          }}
        >
          <p className="mb-0 small text-muted">Hello,</p>
          <p className="mb-0 fw-semibold">{username}!</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-fill overflow-auto py-3">
        {navLinks.map((link) => (
          <NavItem key={link.name} link={link} />
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-top">
        <motion.div
          className="d-flex align-items-center gap-3 px-3 py-2 rounded"
          style={{
            cursor: "pointer",
            transition: "all 0.2s",
            color: "#6c757d",
          }}
          onClick={handleSignOut}
          whileHover={{
            x: 4,
            backgroundColor: "#FFEBEE",
            color: "#DC3545",
          }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={20} />
          <span className="fw-medium" style={{ fontSize: "14px" }}>
            Sign Out
          </span>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div
      className="d-flex"
      style={{ height: "100vh", backgroundColor: "#f8f9fa", color: "#262626" }}
    >
      {/* Mobile Header */}
      {isMobile && (
        <div
          className="position-fixed top-0 start-0 end-0  border-bottom d-flex align-items-center justify-content-between px-3"
          style={{ height: "64px", zIndex: 1040, background: "#000434" }}
        >
          <div
            className="d-flex align-items-center justify-content-center gap-3 py-3"
            style={{ borderRadius: "5px" }}
          >
            <img src={logoImg} alt="Logo" style={{ height: "35px" }} />
            <img src={logoImg1} alt="Brand" style={{ height: "35px" }} />
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn btn-light rounded"
            style={{ padding: "8px 12px" }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <div
          className="border-end bg-white shadow-sm"
          style={{ width: "280px" }}
        >
          <Sidebar />
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="position-fixed top-0 start-0 end-0 bottom-0"
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1050,
              }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="position-fixed top-0 start-0 bottom-0 bg-white shadow"
              style={{ width: "280px", zIndex: 1051 }}
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-fill overflow-auto">
        <div>
          <Outlet />
        </div>
        <SupportChatWidget />
      </div>
    </div>
  );
};

export default UserPanel;

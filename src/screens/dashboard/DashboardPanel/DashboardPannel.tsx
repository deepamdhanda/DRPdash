import React, { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./dashboardPannel.css";
import {
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaTachometerAlt,
  FaLayerGroup,
  FaSatelliteDish,
  FaBarcode,
  FaLink,
  FaTruckLoading,
  FaRupeeSign
} from "react-icons/fa";

type NavLink = {
  name: string;
  icon: React.ReactNode;
  path?: string;
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
  | "SignOut";

const navLinks: NavLink[] = [
  { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
  { name: "Orders", icon: <FaClipboardList />, path: "/dashboard/orders" },
  { name: "Pools", icon: <FaLayerGroup />, path: "/dashboard/pools" },
  { name: "Channels Accounts", icon: <FaSatelliteDish />, path: "/dashboard/channel_accounts" },
  { name: "Products", icon: <FaBoxOpen />, path: "/dashboard/Products" },
  { name: "ProductSKU", icon: <FaBarcode />, path: "/dashboard/ProductSKU" },
  { name: "ChannelSKU", icon: <FaLink />, path: "/dashboard/ChannelSKU" },
  { name: "NDR", icon: <FaTruckLoading />, path: "/dashboard/NDR" },
  { name: "Finance", icon: <FaRupeeSign />, path: "/dashboard/Finance" },
  { name: "Warehouse", icon: <FaRupeeSign />, path: "/dashboard/Warehouses" },
  { name: "SignOut", icon: <FaSignOutAlt /> },
];

const UserPanel: React.FC = () => {
  const [activeLink, setActiveLink] = useState<TNavLinkName>("");
  const navigate = useNavigate();
  const location = useLocation();

  // Automatically sync active link with current URL
  useEffect(() => {
    const currentPath = location.pathname;
    const matchedLink = navLinks.find((link) => link.path === currentPath);
    if (matchedLink) {
      setActiveLink(matchedLink.name as TNavLinkName);
    }
  }, [location.pathname]);

  const handleLinkClick = (name: string, path?: string) => {
    setActiveLink(name as TNavLinkName);
    if (path) navigate(path);
  };

  return (
    <div id="user-panel" >
      <div className={`sidebar `}>
        <nav className="nav">
          <div>
            <div className="nav-logo">
              <span className="nav-logo-icon">🛒</span>
              <span className="nav-logo-name">MyStore</span>
            </div>
            <div className="nav-list">
              {navLinks.slice(0, -1).map((link) => (
                <div
                  key={link.name}
                  className={`nav-link ${activeLink === link.name ? "active" : ""}`}
                  onClick={() => handleLinkClick(link.name, link.path)}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-name"> {link.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`nav-link ${activeLink === "SignOut" ? "active" : ""}`}
            onClick={() => handleLinkClick("SignOut")}
          >
            <span className="nav-icon"><FaSignOutAlt /></span>
            <span className="nav-name"> Sign Out</span>
          </div>
        </nav>
      </div>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default UserPanel;

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
  FaRupeeSign,
} from "react-icons/fa";
import Cookies from "js-cookie";
import logoImg from "../../../assets/logo.png";
import logoImg1 from "../../../assets/logo1.png";

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
  {
    name: "Channels Accounts",
    icon: <FaSatelliteDish />,
    path: "/dashboard/channel_accounts",
  },
  { name: "Products", icon: <FaBoxOpen />, path: "/dashboard/Products" },
  { name: "Product SKUs", icon: <FaBarcode />, path: "/dashboard/ProductSKU" },
  { name: "Product Packs", icon: <FaBarcode />, path: "/dashboard/ProductPacks" },
  { name: "ChannelSKU", icon: <FaLink />, path: "/dashboard/ChannelSKU" },
  { name: "NDR", icon: <FaTruckLoading />, path: "/dashboard/NDR" },
  { name: "Finance", icon: <FaRupeeSign />, path: "/dashboard/Finance" },
  { name: "Warehouse", icon: <FaRupeeSign />, path: "/dashboard/Warehouses" },
  { name: "SignOut", icon: <FaSignOutAlt /> },
];

const DashboardPanel: React.FC = () => {
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
    if (name === "SignOut") {
      // Handle sign out logic here
      console.log("Signing out...");
      Cookies.remove("authToken");
      navigate("/login");
      return;
    }
    setActiveLink(name as TNavLinkName);
    if (path) navigate(path);
  };

  return (
    <div id="user-panel" className="nav-visible">
      <div className={`sidebar sidebar-visible`}>
        <nav className="nav">
          <div>
            <div className="nav-logo">
              <span className="nav-logo-icon"><img src={logoImg} style={{ width: '30px ' }} /></span>
              <span className="nav-logo-name"><img src={logoImg1} style={{ width: '100px ' }} /></span>
            </div>
            <div style={{ margin: '5px 0 15px 0', padding: '10px 10px', borderWidth: "1px 0", borderColor: '#F5891E', borderStyle: 'solid', fontSize: '14px', fontWeight: '200' }}>
              Hello, {Cookies.get('username')}!
            </div>
            <div className="nav-list">
              <center>
                {navLinks.slice(0, -1).map((link) => (
                  <div
                    key={link.name}
                    className={`nav-link ${activeLink === link.name ? "active" : ""
                      }`}
                    onClick={() => handleLinkClick(link.name, link.path)}
                  >
                    <span className="nav-icon">{link.icon}</span>
                    <span className="nav-name"> {link.name}</span>
                  </div>
                ))}
              </center>
            </div>
          </div>
          <div
            className={`nav-link ${activeLink === "SignOut" ? "active" : ""}`}
            onClick={() => handleLinkClick("SignOut")}
          >
            <span className="nav-icon">
              <FaSignOutAlt />
            </span>
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

export default DashboardPanel;

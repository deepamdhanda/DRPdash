import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./dashboardPannel.css";
import { FaBoxOpen, FaUsers, FaClipboardList, FaHeart, FaFolderOpen, FaChartLine, FaSignOutAlt } from "react-icons/fa";

type NavLink = {
  name: string;
  icon: React.ReactNode;
  path?: string;
};

type TNavLinkName =
  | "Dashboard"
  | "Customers"
  | "Orders"
  | "Wishlist"
  | "Inventory"
  | "Analytics"
  | "SignOut";

const navLinks: NavLink[] = [
  { name: "Dashboard", icon: <FaBoxOpen />, path: "/user/dashboard" },
  { name: "Customers", icon: <FaUsers />, path: "/user/customers" },
  { name: "Orders", icon: <FaClipboardList />, path: "/user/orders" },
  { name: "Wishlist", icon: <FaHeart />, path: "/user/wishlist" },
  { name: "Inventory", icon: <FaFolderOpen />, path: "/user/inventory" },
  { name: "Analytics", icon: <FaChartLine />, path: "/user/analytics" },
  { name: "SignOut", icon: <FaSignOutAlt /> },
];

const UserPanel: React.FC = () => {
  const [navVisible, setNavVisible] = useState(true);
  const [activeLink, setActiveLink] = useState<TNavLinkName>("Dashboard");
  const navigate = useNavigate();

  const handleToggle = () => {
    setNavVisible(!navVisible);
  };

  const handleLinkClick = (name: string, path?: string) => {
    setActiveLink(name as TNavLinkName);
    if (path) navigate(path);
  };

  return (
    <div id="user-panel" className={navVisible ? "nav-visible" : ""}>
      {/* <header className="header">
        <div className="header-toggle" onClick={handleToggle}>
          <i className="fa-solid fa-bars"></i>
        </div>
        <div className="header-title">Admin Panel</div>
        <div className="header-img">
          <img src="https://i.imgur.com/hczKIze.jpg" alt="User Avatar" />
        </div>
      </header> */}

      <div className={`sidebar ${navVisible ? "sidebar-visible" : ""}`}>
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

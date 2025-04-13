import React, { useState } from "react";
import "./userPanel.css"; // Import your CSS file here
import { Outlet } from "react-router-dom";

type NavLink = {
  name: string;
  icon: string;
};
type TNavLinkName =
  | "Dashboard"
  | "Users"
  | "Messages"
  | "Bookmark"
  | "Files"
  | "Stats"
  | "SignOut";
const navLinks: NavLink[] = [
  { name: "Dashboard", icon: "bx-grid-alt" },
  { name: "Users", icon: "bx-user" },
  { name: "Messages", icon: "bx-message-square-detail" },
  { name: "Bookmark", icon: "bx-bookmark" },
  { name: "Files", icon: "bx-folder" },
  { name: "Stats", icon: "bx-bar-chart-alt-2" },
  { name: "SignOut", icon: "bx-log-out" },
];

const UserPanel: React.FC = () => {
  const [navVisible, setNavVisible] = useState<boolean>(true);
  const [activeLink, setActiveLink] = useState<TNavLinkName>("Dashboard");

  const handleToggle = () => {
    setNavVisible((prev) => !prev);
  };

  const handleLinkClick = (name: string) => {
    setActiveLink(name as TNavLinkName);
  };

  return (
    <div id="body-pd" className={navVisible ? "body-pd" : ""}>
      <header className={`header ${navVisible ? "body-pd" : ""}`} id="header">
        <div className="header_toggle">
          <i onClick={handleToggle} className="fa-solid fa-bars"></i>
        </div>
        <div className="header_img">
          <img src="https://i.imgur.com/hczKIze.jpg" alt="User Avatar" />
        </div>
      </header>

      <div className={`l-navbar ${navVisible ? "show" : ""}`} id="nav-bar">
        <nav className="nav">
          <div>
            <a href="#" className="nav_logo">
              <i className="bx bx-layer nav_logo-icon"></i>
              <span className="nav_logo-name">DRP CRM</span>
            </a>
            <div className="nav_list">
              {navLinks.slice(0, -1).map((link) => (
                <a
                  key={link.name}
                  href="#"
                  className={`nav_link ${
                    activeLink === link.name ? "active" : ""
                  }`}
                  onClick={() => handleLinkClick(link.name)}
                >
                  <i className={`bx ${link.icon} nav_icon`}></i>
                  <span className="nav_name">{link.name}</span>
                </a>
              ))}
            </div>
          </div>
          <a
            href="#"
            className={`nav_link ${activeLink === "SignOut" ? "active" : ""}`}
            onClick={() => handleLinkClick("SignOut")}
          >
            <i className="bx bx-log-out nav_icon"></i>
            <span className="nav_name">SignOut</span>
          </a>
        </nav>
      </div>

      <div className="height-100 bg-light">
        <Outlet />
      </div>
    </div>
  );
};

export default UserPanel;

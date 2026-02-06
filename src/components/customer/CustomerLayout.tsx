import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShoppingBag, LogOut } from "lucide-react";
import "./customer.css";
import { toast } from "react-toastify";
import { customerAxios } from "../../axios/customerAxios";
import { drpCrmBaseUrl } from "../../axios/urls";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = "Dashboard" }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const handleLogout = async () => {
    try {
      await customerAxios.post(`${drpCrmBaseUrl}/customer/auth/logout`);
      navigate("/customer/login");
    } catch (err: any) {
      toast.error(err.message);
    }
  };
  return (
    <div className="d-flex min-vh-100 bg-light">
      <aside className="sidebar1 bg-white border-end d-none d-md-flex flex-column">
        <div className="p-4 border-bottom d-flex align-items-center">
          <span
            className="mb-0 text-amber"
            style={{ fontSize: "30px", fontWeight: "800" }}
          >
            OrderzUp
          </span>
        </div>

        <Nav className="flex-column p-3 flex-grow-1">
          <Nav.Link
            as={Link}
            to="/customer/order"
            className={`sidebar-link d-flex align-items-center rounded-3 mb-2 ${
              isActive("/customer/order") ? "active" : ""
            }`}
          >
            <ShoppingBag size={20} className="me-3" />
            <span>All Orders</span>
          </Nav.Link>
        </Nav>

        <div className="p-3 border-top mt-auto">
          <button
            onClick={handleLogout}
            className="btn btn-logout w-100 d-flex align-items-center justify-content-center gap-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <Navbar bg="white" className="header border-bottom px-4">
          <div className="d-flex align-items-center justify-content-between w-100">
            <h1 className="h4 fw-bold mb-0 text-dark">{title}</h1>

            <div className="d-flex align-items-center">
              <div className="user-avatar ms-3">AB</div>
            </div>
          </div>
        </Navbar>

        <main className="content-scroll flex-grow-1 p-4 overflow-auto">
          <Container fluid className="p-0">
            {children}
          </Container>
        </main>

        <footer className="bg-white text-center py-3 text-muted small border-top">
          © 2026 OrderzUp Customer Portal
        </footer>
      </div>
    </div>
  );
};

export default Layout;

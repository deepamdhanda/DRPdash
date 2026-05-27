import React from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShoppingBag, LogOut } from "lucide-react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 z-10">
        <div className="p-6 border-b border-gray-100 flex items-center">
          <span className="text-3xl font-extrabold text-amber-500">
            OrderzUp
          </span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link
            to="/customer/order"
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive("/customer/order")
                ? "bg-amber-50 text-amber-600 font-semibold shadow-sm"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
            }`}
          >
            <ShoppingBag size={20} className="mr-3" />
            <span>All Orders</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-600 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors font-medium"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm border border-amber-200 ml-4 shadow-sm">
              AB
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {/* AnimatePresence handles unmounting animations if you change keys on route changes */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname} // Triggers animation on route change
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="bg-white text-center py-4 text-gray-400 text-sm border-t border-gray-200">
          © 2026 OrderzUp Customer Portal
        </footer>
      </div>
    </div>
  );
};

export default Layout;

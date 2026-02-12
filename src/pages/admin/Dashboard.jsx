import React, { useState } from "react";
import {
  FaBox,
  FaClipboardList,
  FaUsers,
  FaChartLine,
  FaSignOutAlt,
  FaTicketAlt,
  FaBars
} from "react-icons/fa";
import ProductManager from "./ProductManager";
import OrderManager from "./OrderManager";
import AdminAnalytics from "./AdminAnalytics";
import CouponManager from "./CouponManager";
import UserManager from "./UserManager";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  // Handle responsive sidebar state
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { id: "products", label: "Products", icon: <FaBox className="h-5 w-5" /> },
    { id: "orders", label: "Orders", icon: <FaClipboardList className="h-5 w-5" /> },
    { id: "coupons", label: "Coupons", icon: <FaTicketAlt className="h-5 w-5" /> },
    { id: "users", label: "Users", icon: <FaUsers className="h-5 w-5" /> },
    { id: "analytics", label: "Analytics", icon: <FaChartLine className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans relative overflow-x-hidden">

      {/* MOBILE BACKDROP */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-20 md:hidden transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`bg-white text-gray-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-30 border-r border-gray-100
          fixed inset-y-0 left-0 md:relative md:translate-x-0
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full md:w-20 md:translate-x-0"} 
        `}
      >
        <div className="p-6 flex items-center justify-between border-b border-gray-100 h-20">
          {isSidebarOpen ? (
            <h1 className="text-2xl font-extrabold tracking-wider text-indigo-600">
              ADMIN
            </h1>
          ) : (
            <span className="text-2xl font-extrabold text-indigo-600 mx-auto">A</span>
          )}

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <FaBars />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isSidebarOpen={isSidebarOpen}
              active={activeTab === item.id}
              onClick={() => {
                setActiveTab(item.id);
                // Close sidebar on mobile when item clicked
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            />
          ))}

          <div className="pt-6">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full relative font-medium
              text-red-500 hover:bg-red-50 hover:text-red-600
              ${!isSidebarOpen && "justify-center"}
            `}
              title="Logout"
            >
              <FaSignOutAlt className="h-5 w-5 group-hover:scale-110 transition-transform" />
              {isSidebarOpen && <span className="font-semibold">Logout</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full">
        {/* TOP HEADER */}
        <header className="bg-white shadow-sm h-16 md:h-20 flex items-center justify-between px-4 md:px-8 mx-2 md:mx-6 mt-4 rounded-2xl z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
            >
              <FaBars className="h-5 w-5" />
            </button>
            <h2 className="text-lg md:text-2xl font-bold text-gray-800 capitalize truncate max-w-[150px] md:max-w-none">
              {activeTab} Ops
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-semibold text-gray-700">{currentUser?.displayName || "Admin User"}</p>
              <p className="text-xs text-gray-500">{currentUser?.email}</p>
            </div>
            <div className="h-8 w-8 md:h-10 md:w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold border-2 border-indigo-200">
              {currentUser?.email?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-20 md:pb-0">
            {activeTab === "products" && <ProductManager />}
            {activeTab === "orders" && <OrderManager />}
            {activeTab === "analytics" && <AdminAnalytics />}
            {activeTab === "users" && <UserManager />}
            {activeTab === "coupons" && <CouponManager />}
          </div>
        </main>
      </div>
    </div>
  );
};

const MenuItem = ({ icon, label, active, onClick, isSidebarOpen }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group w-full relative font-medium
      ${active
        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
      }
      ${!isSidebarOpen && "justify-center"}
    `}
    title={!isSidebarOpen ? label : ""}
  >
    <span className={`text-xl transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`}>{icon}</span>
    {isSidebarOpen && <span className="whitespace-nowrap">{label}</span>}

    {!isSidebarOpen && active && (
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 rounded-l-full"></div>
    )}
  </button>
);

export default Dashboard;

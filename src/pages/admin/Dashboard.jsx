import React, { useState } from "react";
import {
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  TicketIcon,
} from "@heroicons/react/24/outline";
import ProductManager from "./ProductManager";
import OrderManager from "./OrderManager";
import AdminAnalytics from "./AdminAnalytics";
import CouponManager from "./CouponManager";
import UserManager from "./UserManager";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-5 text-xl font-bold border-b">🛠 Admin Panel</div>

        <nav className="p-4 space-y-2">
          <MenuItem
            icon={<ShoppingBagIcon className="h-5 w-5" />}
            label="Products"
            active={activeTab === "products"}
            onClick={() => setActiveTab("products")}
          />
          <MenuItem
            icon={<ClipboardDocumentListIcon className="h-5 w-5" />}
            label="Orders"
            active={activeTab === "orders"}
            onClick={() => setActiveTab("orders")}
          />
          <MenuItem
            icon={<TicketIcon className="h-5 w-5" />}
            label="Coupons"
            active={activeTab === "coupons"}
            onClick={() => setActiveTab("coupons")}
          />
          <MenuItem
            icon={<UsersIcon className="h-5 w-5" />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <MenuItem
            icon={<ChartBarIcon className="h-5 w-5" />}
            label="Analytics"
            active={activeTab === "analytics"}
            onClick={() => setActiveTab("analytics")}
          />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 mt-6 text-red-600 hover:bg-red-50 rounded-lg w-full"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">
        {activeTab === "products" && <ProductManager />}
        {activeTab === "orders" && <OrderManager />}
        {activeTab === "analytics" && <AdminAnalytics />}
        {activeTab === "users" && <UserManager />}
        {activeTab === "coupons" && <CouponManager />}
      </main>
    </div>
  );
};

const MenuItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-2 rounded-lg w-full text-left ${active
      ? "bg-blue-600 text-white"
      : "hover:bg-gray-100 text-gray-700"
      }`}
  >
    {icon}
    {label}
  </button>
);

export default Dashboard;

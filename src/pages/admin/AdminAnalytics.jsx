import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  CubeIcon,
  ClockIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const AdminAnalytics = () => {
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    users: 0,
    products: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const ordersSnap = await getDocs(collection(db, "orders"));
        const usersSnap = await getDocs(collection(db, "users"));
        const productsSnap = await getDocs(collection(db, "products"));

        let revenue = 0;
        let pendingOrders = 0;
        let deliveredOrders = 0;
        let cancelledOrders = 0;

        ordersSnap.forEach((d) => {
          const data = d.data();
          revenue += data.totalAmount || 0;
          if (data.status === "pending") pendingOrders++;
          if (data.status === "delivered") deliveredOrders++;
          if (data.status === "cancelled") cancelledOrders++;
        });

        const totalOrders = ordersSnap.size;
        const avgOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;

        setStats({
          orders: totalOrders,
          users: usersSnap.size,
          revenue,
          products: productsSnap.size,
          avgOrderValue,
          pendingOrders,
          deliveredOrders,
          cancelledOrders,
        });
      } catch (error) {
        console.error("Analytics load error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white h-32 rounded-2xl animate-pulse border border-gray-100"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="bg-blue-100 p-3 rounded-full">
          <ChartBarIcon className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of your store performance</p>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<CurrencyRupeeIcon className="h-6 w-6" />}
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          subtitle="All time earnings"
          color="green"
        />
        <StatCard
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          title="Total Orders"
          value={stats.orders}
          subtitle={`Avg ₹${stats.avgOrderValue.toLocaleString()} per order`}
          color="blue"
        />
        <StatCard
          icon={<UsersIcon className="h-6 w-6" />}
          title="Total Users"
          value={stats.users}
          subtitle="Registered customers"
          color="purple"
        />
        <StatCard
          icon={<CubeIcon className="h-6 w-6" />}
          title="Total Products"
          value={stats.products}
          subtitle="In your catalog"
          color="orange"
        />
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          <ClockIcon className="h-5 w-5 text-gray-400" />
          Order Status Breakdown
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-yellow-600">Pending</p>
                <p className="text-3xl font-black text-yellow-700 mt-1">{stats.pendingOrders}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            {stats.orders > 0 && (
              <div className="mt-3">
                <div className="w-full bg-yellow-100 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.pendingOrders / stats.orders * 100)}%` }}></div>
                </div>
                <p className="text-xs text-yellow-600 mt-1">{Math.round(stats.pendingOrders / stats.orders * 100)}% of orders</p>
              </div>
            )}
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-green-600">Delivered</p>
                <p className="text-3xl font-black text-green-700 mt-1">{stats.deliveredOrders}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            {stats.orders > 0 && (
              <div className="mt-3">
                <div className="w-full bg-green-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${(stats.deliveredOrders / stats.orders * 100)}%` }}></div>
                </div>
                <p className="text-xs text-green-600 mt-1">{Math.round(stats.deliveredOrders / stats.orders * 100)}% of orders</p>
              </div>
            )}
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600">Cancelled</p>
                <p className="text-3xl font-black text-red-700 mt-1">{stats.cancelledOrders}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <ShoppingBagIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
            {stats.orders > 0 && (
              <div className="mt-3">
                <div className="w-full bg-red-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.cancelledOrders / stats.orders * 100)}%` }}></div>
                </div>
                <p className="text-xs text-red-600 mt-1">{Math.round(stats.cancelledOrders / stats.orders * 100)}% of orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color }) => {
  const colors = {
    green: { bg: "bg-green-50", icon: "bg-green-100 text-green-600", border: "border-green-100" },
    blue: { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", border: "border-blue-100" },
    purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", border: "border-purple-100" },
    orange: { bg: "bg-orange-50", icon: "bg-orange-100 text-orange-600", border: "border-orange-100" },
  };

  const c = colors[color] || colors.blue;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${c.border} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`${c.icon} p-3 rounded-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{title}</p>
      <h2 className="text-3xl font-black text-gray-900 mt-1">{value}</h2>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  );
};

export default AdminAnalytics;

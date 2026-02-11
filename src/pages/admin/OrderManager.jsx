import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (!window.confirm(`Update status to ${newStatus}?`)) return;

    try {
      // 1. Update global order
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });

      // 2. Ideally update the user's copy as well... 
      // (Simplified here: real apps use Cloud Functions to sync)

      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Failed to update status");
    }
  };

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Order ID / Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">{order.createdAt?.toDate().toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{order.paymentMethod.toUpperCase()}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                    <p className="text-xs text-gray-500">{order.shippingAddress?.city}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-500">{order.items.length} Items</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                      }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select
                      className="border border-gray-200 rounded px-2 py-1 text-xs font-bold text-gray-700 outline-none hover:border-gray-400 transition"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 font-medium">
                    No orders found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderManager;

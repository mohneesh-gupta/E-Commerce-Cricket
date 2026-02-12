import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const ORDERS_PER_PAGE = 10;

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
      // Find the order to get userId
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // 1. Update global order
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });

      // 2. Sync to user's order copy
      if (order.userId) {
        try {
          const userOrdersRef = collection(db, "users", order.userId, "orders");
          const userOrderQuery = query(userOrdersRef, where("orderId", "==", orderId));
          const userOrderSnap = await getDocs(userOrderQuery);

          for (const userOrderDoc of userOrderSnap.docs) {
            await updateDoc(doc(db, "users", order.userId, "orders", userOrderDoc.id), { status: newStatus });
          }
        } catch (syncErr) {
          console.warn("Could not sync user order copy:", syncErr);
        }
      }

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

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders ({orders.length})</option>
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
              {paginatedOrders.map(order => (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <td className="p-4">
                      <p className="font-mono font-bold text-gray-900">#{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">{order.createdAt?.toDate().toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{order.paymentMethod?.toUpperCase()}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
                      <p className="text-xs text-gray-500">{order.shippingAddress?.phone}</p>
                      <p className="text-xs text-gray-400">{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                      <p className="text-xs text-gray-500">{order.items?.length} Items</p>
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
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
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

                  {/* Expanded row - full address details */}
                  {expandedOrder === order.id && (
                    <tr className="bg-blue-50/30">
                      <td colSpan="5" className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-bold text-gray-500 uppercase text-xs mb-1">Full Address</p>
                            <p className="text-gray-900">{order.shippingAddress?.addressLine}</p>
                            <p className="text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                          </div>
                          <div>
                            <p className="font-bold text-gray-500 uppercase text-xs mb-1">Contact</p>
                            <p className="text-gray-900">{order.shippingAddress?.fullName}</p>
                            <p className="text-gray-700">📞 {order.shippingAddress?.phone}</p>
                          </div>
                          <div>
                            <p className="font-bold text-gray-500 uppercase text-xs mb-1">Order Info</p>
                            <p className="text-gray-700">Payment: {order.paymentMethod?.toUpperCase()}</p>
                            <p className="text-gray-700">Shipping: {order.shippingMethod || "Standard"}</p>
                            <p className="text-gray-700">Subtotal: ₹{order.subtotal} | Shipping: ₹{order.shippingCost || 0}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500">
              Showing {(currentPage - 1) * ORDERS_PER_PAGE + 1}-{Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm font-bold rounded border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm font-bold rounded transition ${currentPage === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 hover:bg-white text-gray-700"
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm font-bold rounded border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManager;

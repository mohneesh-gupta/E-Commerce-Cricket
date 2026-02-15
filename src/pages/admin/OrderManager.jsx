import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, updateDoc, doc, where, writeBatch, increment } from "firebase/firestore";
import { db } from "../../firebase/config";
import toast from "react-hot-toast";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { getDirectImageUrl } from "../../utils/imageUtils";
import ConfirmModal from "../../components/ConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { Truck } from "lucide-react";

const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Modal State for Shipping
  const [showShipModal, setShowShipModal] = useState(false);
  const [shippingData, setShippingData] = useState({
    orderId: null,
    deliveryPartner: "Delhivery",
    awbId: ""
  });

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "warning"
  });

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

  const initiateStatusUpdate = (orderId, newStatus, currentStatus) => {
    // Prevent editing if delivered or cancelled
    if (currentStatus === "delivered" || currentStatus === "cancelled") {
      toast.error("Cannot modify completed or cancelled orders");
      return;
    }

    if (newStatus === "shipped") {
      setShippingData({ orderId, deliveryPartner: "Delhivery", awbId: "" });
      setShowShipModal(true);
    } else {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    setConfirmModal({
      isOpen: true,
      title: "Update Order Status?",
      message: `Are you sure you want to change the status to ${newStatus.toUpperCase()}?`,
      type: newStatus === "cancelled" ? "danger" : "warning",
      onConfirm: () => performStatusUpdate(orderId, newStatus, additionalData)
    });
  };

  const performStatusUpdate = async (orderId, newStatus, additionalData = {}) => {

    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      const batch = writeBatch(db);

      const updateData = {
        status: newStatus,
        ...additionalData,
      };

      // Add timestamp for specific statuses
      if (newStatus === "accepted") updateData.acceptedAt = new Date();
      if (newStatus === "shipped") updateData.shippedAt = new Date();
      if (newStatus === "delivered") updateData.deliveredAt = new Date();
      if (newStatus === "cancelled") updateData.cancelledAt = new Date();

      // RESTORE STOCK when order is cancelled
      if (newStatus === "cancelled" && order.items) {
        for (const item of order.items) {
          const productRef = doc(db, "products", item.productId);
          batch.update(productRef, {
            stock: increment(item.quantity) // Add back the quantity
          });
        }
      }

      // 1. Update global order
      const orderRef = doc(db, "orders", orderId);
      batch.update(orderRef, updateData);

      // 2. Sync to user's order copy
      if (order.userId) {
        const userOrdersRef = collection(db, "users", order.userId, "orders");
        const userOrderQuery = query(userOrdersRef, where("orderId", "==", orderId));
        const userOrderSnap = await getDocs(userOrderQuery);

        userOrderSnap.docs.forEach((docSnap) => {
          batch.update(docSnap.ref, updateData);
        });
      }

      await batch.commit();

      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, ...updateData } : o));
      toast.success(`Order marked as ${newStatus}`);
      setShowShipModal(false);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const handleShipSubmit = (e) => {
    e.preventDefault();
    if (!shippingData.deliveryPartner || !shippingData.awbId) {
      toast.error("Please fill all shipping details");
      return;
    }
    updateOrderStatus(shippingData.orderId, "shipped", {
      deliveryPartner: shippingData.deliveryPartner,
      awbId: shippingData.awbId
    });
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
    <div className="max-w-6xl mx-auto space-y-6 relative">

      {/* SHIPPING MODAL */}
      <AnimatePresence>
        {showShipModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShipModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowShipModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-400" />
              </button>

              {/* Icon & Title */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Mark as Shipped</h3>
                <p className="text-center text-gray-500 mt-1">
                  Enter shipping details to update order status
                </p>
              </div>

              <form onSubmit={handleShipSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Delivery Partner</label>
                  <div className="relative">
                    <select
                      className="w-full border border-gray-200 rounded-xl p-3.5 pl-4 pr-10 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      value={shippingData.deliveryPartner}
                      onChange={(e) => setShippingData({ ...shippingData, deliveryPartner: e.target.value })}
                    >
                      <option value="Delhivery">Delhivery</option>
                      <option value="BlueDart">BlueDart</option>
                      <option value="DTDC">DTDC</option>
                      <option value="XpressBees">XpressBees</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">AWB / Tracking ID</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl p-3.5 font-medium bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                    placeholder="e.g. 1234567890"
                    value={shippingData.awbId}
                    onChange={(e) => setShippingData({ ...shippingData, awbId: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowShipModal(false)}
                    className="flex-1 px-6 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    Confirm Shipment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Orders ({orders.length})</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
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
            <tbody>
              {paginatedOrders.map((order, index) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer border-t-2 border-gray-200"
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
                          order.status === 'accepted' ? 'bg-indigo-100 text-indigo-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                        }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        className={`border border-gray-200 rounded px-2 py-1 text-xs font-bold outline-none transition ${order.status === 'delivered' || order.status === 'cancelled'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'text-gray-700 hover:border-gray-400 cursor-pointer'
                          }`}
                        value={order.status}
                        onChange={(e) => initiateStatusUpdate(order.id, e.target.value, order.status)}
                        disabled={order.status === 'delivered' || order.status === 'cancelled'}
                      >
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>

                  {/* Expanded row - Order Items + Details */}
                  {expandedOrder === order.id && (
                    <tr className="bg-blue-50/30 border-b-2 border-gray-200">
                      <td colSpan="5" className="p-6">
                        {/* ORDER ITEMS SECTION */}
                        <div className="mb-6">
                          <h3 className="font-bold text-gray-900 uppercase text-sm mb-4 flex items-center gap-2">
                            <span className="text-blue-600">📦</span>
                            Ordered Items ({order.items?.length || 0})
                          </h3>
                          <div className="bg-white rounded-xl p-4 space-y-3">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-center p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={getDirectImageUrl(item.image) || "https://placehold.co/100"}
                                    className="w-full h-full object-cover"
                                    alt={item.name}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <p className="text-sm text-gray-600">Qty: <span className="font-bold text-gray-900">{item.quantity}</span></p>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-sm text-gray-600">Price: <span className="font-bold text-gray-900">₹{item.price}</span></p>
                                    <span className="text-gray-300">•</span>
                                    <p className="text-sm font-bold text-blue-600">Total: ₹{item.price * item.quantity}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ADDRESS AND CONTACT DETAILS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="font-bold text-gray-500 uppercase text-xs mb-2">📍 Full Address</p>
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-gray-900 font-medium">{order.shippingAddress?.addressLine}</p>
                              <p className="text-gray-700">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-gray-500 uppercase text-xs mb-2">👤 Contact</p>
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-gray-900 font-bold">{order.shippingAddress?.fullName}</p>
                              <p className="text-gray-700">📞 {order.shippingAddress?.phone}</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-gray-500 uppercase text-xs mb-2">💳 Order Info</p>
                            <div className="bg-white rounded-lg p-3">
                              <p className="text-gray-700">Payment: <span className="font-bold">{order.paymentMethod?.toUpperCase()}</span></p>
                              <p className="text-gray-700">Shipping: <span className="font-bold">{order.shippingMethod || "Standard"}</span></p>
                              <p className="text-gray-700">Subtotal: <span className="font-bold">₹{order.subtotal}</span></p>
                              {order.shippingCost > 0 && (
                                <p className="text-gray-700">Shipping: <span className="font-bold">₹{order.shippingCost}</span></p>
                              )}
                              {order.deliveryPartner && (
                                <div className="mt-2 text-blue-800 bg-blue-100 p-2 rounded">
                                  <p className="font-bold text-xs uppercase">🚚 Shipping Info</p>
                                  <p className="text-xs">{order.deliveryPartner} - {order.awbId}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}

                  {/* Separator row - only if not expanded */}
                  {expandedOrder !== order.id && index < paginatedOrders.length - 1 && (
                    <tr>
                      <td colSpan="5" className="p-0">
                        <div className="h-0.5 bg-gray-200"></div>
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default OrderManager;

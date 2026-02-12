import React, { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getDirectImageUrl } from "../utils/imageUtils";

const OrderHistory = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const fetchOrders = async () => {
            try {
                const q = query(
                    collection(db, "users", currentUser.uid, "orders"),
                    orderBy("createdAt", "desc")
                );
                const snap = await getDocs(q);
                setOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                    📦
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                <p className="text-gray-500 mb-8 max-w-sm">
                    It looks like you haven't placed any orders yet. Start shopping to fill your history!
                </p>
                <Link
                    to="/products"
                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition shadow-lg hover:-translate-y-1"
                >
                    Explore Products
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        {/* HEADER */}
                        <div className="bg-gray-50 p-6 flex flex-wrap gap-4 justify-between items-center border-b border-gray-100">
                            <div className="flex gap-6 text-sm">
                                <div>
                                    <p className="font-bold text-gray-500 uppercase text-xs">Order Placed</p>
                                    <p className="font-medium text-gray-900">{order.createdAt?.toDate().toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-500 uppercase text-xs">Total</p>
                                    <p className="font-medium text-gray-900">₹{order.totalAmount}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="font-bold text-gray-500 uppercase text-xs">Ship To</p>
                                    <p className="font-medium text-gray-900">{order.shippingAddress?.fullName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {order.status}
                                </span>
                                <p className="text-xs text-gray-400 font-mono">#{order.orderId ? order.orderId.slice(0, 8) : order.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        {/* SHIPPING ADDRESS */}
                        {order.shippingAddress && (
                            <div className="px-6 py-4 bg-blue-50/40 border-b border-gray-100">
                                <p className="font-bold text-gray-500 uppercase text-xs mb-2">📍 Delivery Address</p>
                                <div className="text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                    {order.shippingAddress.phone && (
                                        <p className="mt-1 text-gray-500">📞 {order.shippingAddress.phone}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* BODY */}
                        <div className="p-6">
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 items-center">
                                        <img src={getDirectImageUrl(item.image) || "https://placehold.co/100"} className="w-16 h-16 object-cover rounded-lg bg-gray-100" alt={item.name} />
                                        <div className="flex-1">
                                            <Link to={`/product/${item.productId}`} className="font-bold text-gray-900 hover:underline line-clamp-1">
                                                {item.name}
                                            </Link>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;

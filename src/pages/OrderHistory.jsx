import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { getDirectImageUrl } from "../utils/imageUtils";
import { TruckIcon, MapPinIcon } from "@heroicons/react/24/outline";

const OrderHistory = () => {
    const { currentUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, "users", currentUser.uid, "orders"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setOrders(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        return () => unsubscribe();
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
        <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
            <div className="mb-8">
                <h1 className="text-4xl font-black text-gray-900 mb-2">My Orders</h1>
                <p className="text-gray-500 font-medium">{orders.length} {orders.length === 1 ? 'order' : 'orders'} placed</p>
            </div>

            <div className="space-y-6">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                        {/* HEADER */}
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 p-5 flex flex-wrap gap-6 justify-between items-center border-b border-gray-200">
                            <div className="flex gap-8 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">📅</span>
                                    <div>
                                        <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Order Placed</p>
                                        <p className="font-bold text-gray-900">{order.createdAt?.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">💰</span>
                                    <div>
                                        <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Total</p>
                                        <p className="font-bold text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="text-lg">📦</span>
                                    <div>
                                        <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider">Items</p>
                                        <p className="font-bold text-gray-900">{order.items?.length} {order.items?.length === 1 ? 'item' : 'items'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${order.status === 'delivered' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-200' :
                                        order.status === 'accepted' ? 'bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700 ring-1 ring-red-200' :
                                                'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200'
                                    }`}>
                                    {order.status}
                                </span>
                                <p className="text-[10px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">#{order.orderId ? order.orderId.slice(0, 8) : order.id.slice(0, 8)}</p>
                            </div>
                        </div>

                        {/* Tracking Info if Shipped */}
                        {order.status === 'shipped' && order.deliveryPartner && (
                            <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <TruckIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Shipped via</p>
                                        <p className="font-bold text-indigo-900 text-sm">{order.deliveryPartner}</p>
                                    </div>
                                </div>
                                <div className="sm:text-right">
                                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Tracking ID</p>
                                    <p className="font-mono font-bold text-indigo-900 text-sm">{order.awbId}</p>
                                </div>
                            </div>
                        )}

                        {/* DELIVERY ADDRESS - ONE LINE */}
                        {order.shippingAddress && (
                            <div className="px-5 py-3 bg-blue-50/40 border-b border-gray-100">
                                <div className="flex items-start gap-2 text-sm">
                                    <MapPinIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-500 uppercase text-[10px] tracking-wider mb-1">Delivery Address</p>
                                        <p className="text-gray-900 font-medium truncate">
                                            {order.shippingAddress.fullName} · {order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                                            {order.shippingAddress.phone && (
                                                <span className="text-gray-600"> · 📞 {order.shippingAddress.phone}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PRODUCTS */}
                        <div className="p-5">
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex gap-4 items-center p-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                    >
                                        <div className="relative">
                                            <img
                                                src={getDirectImageUrl(item.image) || "https://placehold.co/100"}
                                                className="w-20 h-20 object-cover rounded-lg bg-gray-100 ring-1 ring-gray-200 group-hover/item:ring-2 group-hover/item:ring-blue-300 transition-all"
                                                alt={item.name}
                                            />
                                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                                {item.quantity}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/product/${item.productId}`}
                                                className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 block"
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="flex items-center gap-3 mt-1">
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                                <span className="text-gray-300">•</span>
                                                <p className="text-sm font-bold text-gray-900">₹{item.price?.toLocaleString('en-IN')}</p>
                                                <span className="text-gray-300">•</span>
                                                <p className="text-sm font-bold text-blue-600">₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ORDER TOTAL */}
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Order Total</p>
                                    <p className="text-2xl font-black text-gray-900">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;

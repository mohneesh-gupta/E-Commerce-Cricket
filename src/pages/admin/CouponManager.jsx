import React, { useState, useEffect } from "react";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { TrashIcon, PlusIcon, TicketIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const CouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCoupon, setNewCoupon] = useState({
        code: "",
        discount: "",
        name: "",
    });

    /* ---------------- FETCH COUPONS ---------------- */
    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const snap = await getDocs(collection(db, "coupons"));
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setCoupons(data);
        } catch (error) {
            console.error("Error fetching coupons:", error);
            toast.error("Failed to load coupons");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- ADD COUPON ---------------- */
    const handleAddCoupon = async (e) => {
        e.preventDefault();
        if (!newCoupon.code || !newCoupon.discount || !newCoupon.name) {
            toast.error("All fields are required");
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, "coupons"), {
                code: newCoupon.code.toUpperCase(),
                discount: Number(newCoupon.discount),
                name: newCoupon.name,
                isActive: true,
                createdAt: serverTimestamp(),
            });
            toast.success("Coupon added successfully");
            setNewCoupon({ code: "", discount: "", name: "" });
            fetchCoupons();
        } catch (error) {
            console.error("Error adding coupon:", error);
            toast.error("Failed to add coupon");
            setLoading(false);
        }
    };

    /* ---------------- DELETE COUPON ---------------- */
    const handleDeleteCoupon = async (id) => {
        if (!window.confirm("Delete this coupon?")) return;
        try {
            setLoading(true);
            await deleteDoc(doc(db, "coupons", id));
            toast.success("Coupon deleted");
            fetchCoupons();
        } catch (error) {
            console.error("Error deleting coupon:", error);
            toast.error("Failed to delete coupon");
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                    <TicketIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Coupon Management</h2>
                    <p className="text-sm text-gray-500">Create and manage discount codes</p>
                </div>
            </div>

            {/* CREATE FORM */}
            <form onSubmit={handleAddCoupon} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coupon Code</label>
                    <input
                        type="text"
                        placeholder="e.g. SALE50"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Discount (%)</label>
                    <input
                        type="number"
                        placeholder="e.g. 50"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.discount}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                    <input
                        type="text"
                        placeholder="e.g. Sawan Special"
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                        value={newCoupon.name}
                        onChange={(e) => setNewCoupon({ ...newCoupon, name: e.target.value })}
                    />
                </div>
                <button
                    disabled={loading}
                    className="bg-blue-600 text-white font-bold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Coupon
                </button>
            </form>

            {/* LIST */}
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Discount</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {coupons.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No coupons found. Create one above!
                                </td>
                            </tr>
                        ) : (
                            coupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{coupon.code}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{coupon.discount}%</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{coupon.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleDeleteCoupon(coupon.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition"
                                            title="Delete Coupon"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CouponManager;

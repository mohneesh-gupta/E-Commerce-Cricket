import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import toast from "react-hot-toast";

const Profile = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        displayName: "",
        phone: "",
        address: {
            fullName: "",
            phone: "",
            pincode: "",
            addressLine: "",
            city: "",
            state: "",
        },
    });

    useEffect(() => {
        if (!currentUser) return;
        const fetchUser = async () => {
            const snap = await getDoc(doc(db, "users", currentUser.uid));
            if (snap.exists()) {
                const data = snap.data();
                setFormData({
                    displayName: data.displayName || currentUser.displayName || "",
                    phone: data.phone || "",
                    address: {
                        fullName: data.address?.fullName || "",
                        phone: data.address?.phone || "",
                        pincode: data.address?.pincode || "",
                        addressLine: data.address?.addressLine || "",
                        city: data.address?.city || "",
                        state: data.address?.state || "",
                    },
                });
            }
            setLoading(false);
        };
        fetchUser();
    }, [currentUser]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateDoc(doc(db, "users", currentUser.uid), {
                displayName: formData.displayName,
                phone: formData.phone,
                address: formData.address,
                updatedAt: new Date(),
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* PERSONAL INFO */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Personal Info</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="label">Full Name</label>
                                    <input
                                        className="input-field border w-full p-2 rounded"
                                        value={formData.displayName}
                                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Contact Phone</label>
                                    <input
                                        className="input-field border w-full p-2 rounded"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="+91..."
                                    />
                                </div>
                                <div>
                                    <label className="label">Email</label>
                                    <input
                                        className="input-field border w-full p-2 rounded bg-gray-100 text-gray-500"
                                        value={currentUser?.email}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ADDRESS BOOK */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Default Address</h2>
                            <p className="text-sm text-gray-500 mb-6">This address will be pre-filled at checkout.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    placeholder="Receiver Name"
                                    className="border border-gray-300 p-3 rounded-lg"
                                    value={formData.address.fullName}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, fullName: e.target.value } })}
                                />
                                <input
                                    placeholder="Receiver Phone"
                                    className="border border-gray-300 p-3 rounded-lg"
                                    value={formData.address.phone}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, phone: e.target.value } })}
                                />
                                <input
                                    placeholder="Pincode"
                                    className="border border-gray-300 p-3 rounded-lg"
                                    value={formData.address.pincode}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })}
                                />
                                <input
                                    placeholder="City"
                                    className="border border-gray-300 p-3 rounded-lg"
                                    value={formData.address.city}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })}
                                />
                                <div className="md:col-span-2">
                                    <textarea
                                        placeholder="Full Address (House No, Building, Street, Area)"
                                        className="w-full border border-gray-300 p-3 rounded-lg h-24"
                                        value={formData.address.addressLine}
                                        onChange={(e) => setFormData({ ...formData, address: { ...formData.address, addressLine: e.target.value } })}
                                    />
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-black text-white px-8 py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* TEMP DEV BUTTON */}
                <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
                    <p className="text-sm text-yellow-800 mb-2 font-bold">⚠️ Developer Tool (Use for Testing)</p>
                    <button
                        onClick={async () => {
                            if (!currentUser) return;
                            try {
                                await updateDoc(doc(db, "users", currentUser.uid), { role: "admin" });
                                alert("You are now an Admin! Refresh the page to see the Dashboard link in your profile menu.");
                                window.location.reload();
                            } catch (e) {
                                alert("Error: " + e.message);
                            }
                        }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                    >
                        Make Me Admin ⚡
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;

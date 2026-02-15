import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";
import { UsersIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const USERS_PER_PAGE = 10;

    const fetchUsers = async () => {
        try {
            const snap = await getDocs(collection(db, "users"));
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        if (!window.confirm(`Change role to "${newRole}"?`)) return;
        try {
            await updateDoc(doc(db, "users", userId), { role: newRole });
            setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            toast.success(`User role updated to ${newRole}`);
        } catch (error) {
            console.error("Role update failed:", error);
            toast.error("Failed to update role");
        }
    };

    // Filter users by search
    const filteredUsers = users.filter((u) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            u.email?.toLowerCase().includes(q) ||
            u.role?.toLowerCase().includes(q) ||
            u.id?.toLowerCase().includes(q)
        );
    });

    // Pagination
    const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * USERS_PER_PAGE,
        currentPage * USERS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading users...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                        <p className="text-sm text-gray-500">{users.length} total users</p>
                    </div>
                </div>
                <div className="relative w-full sm:w-64">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={users.length} color="blue" />
                <StatCard label="Admins" value={users.filter((u) => u.role === "admin").length} color="purple" />
                <StatCard label="Regular Users" value={users.filter((u) => u.role === "user" || !u.role).length} color="green" />
                <StatCard label="Today's Signups" value={users.filter((u) => {
                    if (!u.createdAt) return false;
                    const created = u.createdAt.toDate ? u.createdAt.toDate() : new Date(u.createdAt);
                    const today = new Date();
                    return created.toDateString() === today.toDateString();
                }).length} color="orange" />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors border-t-2 border-gray-200">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {user.email ? user.email[0].toUpperCase() : "?"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 break-all">{user.email || "No email"}</p>
                                                <p className="text-xs text-gray-400 font-mono">{user.id.slice(0, 12)}...</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${user.role === "admin"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-green-100 text-green-700"
                                            }`}
                                        >
                                            {user.role || "user"}
                                        </span>
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {user.createdAt?.toDate
                                            ? user.createdAt.toDate().toLocaleDateString()
                                            : user.createdAt
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : "N/A"}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                                            >
                                                View Profile
                                            </Link>
                                            <select
                                                value={user.role || "user"}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-bold text-gray-700 outline-none hover:border-gray-400 transition bg-white"
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                                        No users found.
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
                            Showing {(currentPage - 1) * USERS_PER_PAGE + 1}-{Math.min(currentPage * USERS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length}
                        </p>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm font-bold rounded border border-gray-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                ← Prev
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

const StatCard = ({ label, value, color }) => {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        purple: "bg-purple-50 text-purple-600 border-purple-100",
        green: "bg-green-50 text-green-600 border-green-100",
        orange: "bg-orange-50 text-orange-600 border-orange-100",
    };

    return (
        <div className={`p-4 rounded-xl border ${colors[color]} bg-white`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60">{label}</p>
            <p className="text-2xl font-black mt-1">{value}</p>
        </div>
    );
};

export default UserManager;

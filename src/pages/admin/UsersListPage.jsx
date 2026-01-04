import React, { useEffect, useState, useCallback } from 'react';
import { getAllUsers, deleteUser, toggleUserRole } from '../../api/userAPI';
import { isLoggedIn } from '../../api/authAPI';

const UsersListPage = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const { token, user: currentUser } = isLoggedIn();

    const fetchUsers = useCallback(() => {
        setLoading(true);
        getAllUsers(token)
            .then(data => {
                if (data.error) {
                    console.error(data.error);
                } else {
                    setUsers(data);
                    setFilteredUsers(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Handle Search
    useEffect(() => {
        const results = users.filter(user =>
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(results);
    }, [searchTerm, users]);

    const handleRoleToggle = (id) => {
        if (id === currentUser._id) {
            alert("You cannot change your own role.");
            return;
        }

        toggleUserRole(id, token).then(data => {
            if (data.success) {
                alert(data.message);
                fetchUsers(); 
            } else {
                alert(data?.error || "Failed to update role. Please check console.");
                alert(data.error);
            }
        }).catch(err => {
            console.error("Network Error:", err);
            alert("Server connection failed.");
        });
    };

    const handleDelete = (id) => {
        if (id === currentUser._id) {
            alert("Security Error: You cannot delete your own admin account.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            deleteUser(id, token).then(data => {
                if (data.success) {
                    alert("User removed successfully.");
                    fetchUsers();
                } else {
                    alert(data.error || "Failed to delete user.");
                }
            });
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-6xl mx-auto bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">

                {/* Header Section */}
                <div className="bg-slate-900 p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">User Management</h2>
                            <p className="text-slate-400 text-sm mt-1">Review permissions and active accounts</p>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                className="block w-full md:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
                            <span className="text-slate-500 font-medium">Synchronizing user database...</span>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-gray-200">
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">S.No.</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">User Profile</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Permissions</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Verification</th>
                                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, i) => (
                                        <tr key={user._id} className="hover:bg-slate-50/80 transition-all duration-200">
                                            <td className="p-5 text-sm text-slate-400 font-mono">{i + 1}</td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                                                        {user.username.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800">{user.username} {user._id === currentUser._id && "(You)"}</span>
                                                        <span className="text-xs text-slate-500">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm ${user.role === 1
                                                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                                    : "bg-slate-50 text-slate-600 border-slate-200"
                                                    }`}>
                                                    {user.role === 1 ? "Administrator" : "Client User"}
                                                </span>
                                            </td>

                                            <td className="p-5">
                                                <div className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold ${user.isVerified ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${user.isVerified ? "bg-emerald-500" : "bg-rose-500 animate-pulse"}`}></span>
                                                    {user.isVerified ? "Verified" : "Pending"}
                                                </div>
                                            </td>

                                            <td className="p-5 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleRoleToggle(user._id)}
                                                        className="text-slate-400 hover:text-indigo-600 transition-colors p-2"
                                                        title="Toggle Admin/Client Role"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user._id)}
                                                        className={`p-2 rounded-lg transition-all ${user._id === currentUser._id ? "text-gray-200 cursor-not-allowed" : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"}`}
                                                        title={user._id === currentUser._id ? "Cannot delete self" : "Delete User"}
                                                        disabled={user._id === currentUser._id}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <svg className="h-12 w-12 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-slate-400 italic">No users found matching "{searchTerm}"</span>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UsersListPage;
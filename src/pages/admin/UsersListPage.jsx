import React, { useEffect, useState, useCallback } from "react";
// Icons Import
import {
  FaUserShield,
  FaMapMarkedAlt,
  FaUsers,
  FaSearch,
  FaTrashAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaTimes,
} from "react-icons/fa";
import {
  getAllUsers,
  deleteUser,
  toggleUserRole,
  manualVerifyUser,
} from "../../api/userAPI";
import { isLoggedIn } from "../../api/authAPI";

const UsersListPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { token, user: currentUser } = isLoggedIn();

  const fetchUsers = useCallback(() => {
    setLoading(true);
    getAllUsers(token)
      .then((data) => {
        const userData = data.success ? data.data : data;
        if (userData.error) {
          console.error(userData.error);
        } else {
          setUsers(userData);
          setFilteredUsers(userData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const results = users.filter((user) => {
      const s = searchTerm.toLowerCase();
      const roleName =
        user.role === 1
          ? "administrator admin"
          : user.role === 2
          ? "guide"
          : "client user";

      return (
        user.username?.toLowerCase().includes(s) ||
        user.email?.toLowerCase().includes(s) ||
        roleName.includes(s)
      );
    });
    setFilteredUsers(results);
  }, [searchTerm, users]);

  const stats = {
    admins: users.filter((u) => u.role === 1).length,
    guides: users.filter((u) => u.role === 2).length,
    clients: users.filter((u) => u.role === 0).length,
  };

  const handleStatClick = (filterType) => {
    setSearchTerm(filterType);
  };

  const handleRoleToggle = (id, currentRole) => {
    if (id === currentUser._id) {
      alert("Security: You cannot change your own administrative permissions.");
      return;
    }
    const nextRole = currentRole === 1 ? 0 : 1;
    toggleUserRole(id, token, nextRole)
      .then((data) => {
        if (data.success) {
          alert(data.message || "Role updated successfully");
          fetchUsers();
        } else {
          alert(data?.error || "Failed to update role.");
        }
      })
      .catch(() => alert("Server connection failed."));
  };

  const handleDelete = (id) => {
    if (id === currentUser._id) return;
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteUser(id, token).then((data) => {
        if (data.success) {
          alert("User removed successfully.");
          fetchUsers();
        }
      });
    }
  };

  const handleManualVerify = (id, username) => {
    if (
      window.confirm(`Are you sure you want to manually verify ${username}?`)
    ) {
      manualVerifyUser(id, token).then((data) => {
        if (data.success) {
          alert("User verified successfully.");
          fetchUsers();
        }
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        {/* STATS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Admin Card */}
          <div
            onClick={() => handleStatClick("admin")}
            className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
              searchTerm.toLowerCase() === "admin"
                ? "bg-indigo-600 border-indigo-600 text-white"
                : "bg-white border-indigo-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    searchTerm.toLowerCase() === "admin"
                      ? "text-indigo-100"
                      : "text-slate-400"
                  }`}
                >
                  Administrators
                </p>
                <h3 className="text-2xl font-black">{stats.admins}</h3>
              </div>
              <div
                className={`${
                  searchTerm.toLowerCase() === "admin"
                    ? "bg-indigo-500"
                    : "bg-indigo-50 text-indigo-500"
                } p-4 rounded-xl text-xl`}
              >
                <FaUserShield />
              </div>
            </div>
          </div>

          {/* Guide Card */}
          <div
            onClick={() => handleStatClick("guide")}
            className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
              searchTerm.toLowerCase() === "guide"
                ? "bg-emerald-600 border-emerald-600 text-white"
                : "bg-white border-emerald-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    searchTerm.toLowerCase() === "guide"
                      ? "text-emerald-100"
                      : "text-slate-400"
                  }`}
                >
                  Verified Guides
                </p>
                <h3 className="text-2xl font-black">{stats.guides}</h3>
              </div>
              <div
                className={`${
                  searchTerm.toLowerCase() === "guide"
                    ? "bg-emerald-500"
                    : "bg-emerald-50 text-emerald-500"
                } p-4 rounded-xl text-xl`}
              >
                <FaMapMarkedAlt />
              </div>
            </div>
          </div>

          {/* Client Card */}
          <div
            onClick={() => handleStatClick("client")}
            className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
              searchTerm.toLowerCase() === "client"
                ? "bg-slate-700 border-slate-700 text-white"
                : "bg-white border-slate-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-[10px] font-black uppercase tracking-widest ${
                    searchTerm.toLowerCase() === "client"
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  Active Clients
                </p>
                <h3 className="text-2xl font-black">{stats.clients}</h3>
              </div>
              <div
                className={`${
                  searchTerm.toLowerCase() === "client"
                    ? "bg-slate-600"
                    : "bg-slate-50 text-slate-500"
                } p-4 rounded-xl text-xl`}
              >
                <FaUsers />
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-md border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-slate-900 p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    User Management
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Viewing {filteredUsers.length} total users
                  </p>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="flex items-center gap-1 bg-rose-500 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-rose-600 transition-all"
                  >
                    Clear Filter <FaTimes />
                  </button>
                )}
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="block w-full md:w-64 pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 text-white rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-all"
                  placeholder="Search name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-20 text-center text-slate-500 font-bold animate-pulse">
                Synchronizing Database...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      S.No.
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Profile
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                      Verification
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user, i) => (
                    <tr
                      key={user._id}
                      className="hover:bg-slate-50/80 transition-all duration-200"
                    >
                      <td className="p-5 text-sm text-slate-400 font-mono">
                        {i + 1}
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase overflow-hidden border border-slate-300">
                            {user.image ? (
                              <img
                                src={`http://localhost:8000/uploads/${user.image}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user.username?.charAt(0)
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">
                              {user.username}{" "}
                              {user._id === currentUser._id && "(You)"}
                            </span>
                            <span className="text-xs text-slate-500">
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border shadow-sm ${
                            user.role === 1
                              ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                              : user.role === 2
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-slate-50 text-slate-600 border-slate-200"
                          }`}
                        >
                          {user.role === 1
                            ? "Administrator"
                            : user.role === 2
                            ? "Guide"
                            : "Client"}
                        </span>
                      </td>
                      <td className="p-5">
                        <div
                          className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                            user.isVerified
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.isVerified
                                ? "bg-emerald-500"
                                : "bg-rose-500 animate-pulse"
                            }`}
                          ></span>
                          {user.isVerified ? "Verified" : "Pending"}
                        </div>
                      </td>
                      <td className="p-5 text-center">
                        <div className="flex justify-center gap-1">
                          {!user.isVerified && (
                            <button
                              onClick={() =>
                                handleManualVerify(user._id, user.username)
                              }
                              className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-lg transition-all"
                              title="Verify User"
                            >
                              <FaCheckCircle className="text-lg" />
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleRoleToggle(user._id, user.role)
                            }
                            className={`p-2 rounded-lg transition-all ${
                              user._id === currentUser._id
                                ? "text-slate-200 cursor-not-allowed"
                                : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                            disabled={user._id === currentUser._id}
                            title="Toggle Admin Role"
                          >
                            <FaShieldAlt className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className={`p-2 rounded-lg transition-all ${
                              user._id === currentUser._id
                                ? "text-slate-200 cursor-not-allowed"
                                : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            }`}
                            disabled={user._id === currentUser._id}
                            title="Delete User"
                          >
                            <FaTrashAlt className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;

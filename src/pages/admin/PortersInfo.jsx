import React, { useEffect, useState, useCallback } from "react";
import {
  FaLuggageCart,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserAlt,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaWeightHanging,
  FaMoneyBillWave,
} from "react-icons/fa";
import { getAllUsers } from "../../api/userAPI";
import { getAllBookings } from "../../api/bookingApi";
import { isLoggedIn } from "../../api/authAPI";

const PortersInfo = () => {
  const [porters, setPorters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredPorters, setFilteredPorters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { token } = isLoggedIn();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userData, bookingData] = await Promise.all([
        getAllUsers(token),
        getAllBookings(token),
      ]);

      const allUsers = userData.success ? userData.data : userData;
      const porterUsers = allUsers.filter((u) => Number(u.role) === 3);
      const allBookings = bookingData.success ? bookingData.data : bookingData;

      setPorters(porterUsers);
      setFilteredPorters(porterUsers);
      setBookings(allBookings);
    } catch (error) {
      console.error("Error fetching porter data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const results = porters.filter((p) =>
      p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPorters(results);
  }, [searchTerm, porters]);

  const getActiveAssignment = (porterId) => {
    return bookings.find((b) => {
      const bPorterId = b.porterId?._id || b.porterId;
      return (
        bPorterId === porterId &&
        (b.status === "confirmed" || b.status === "pending")
      );
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Derive status label and style from both isAvailable and booking state
  const getStatusInfo = (porter, isBooked) => {
    if (porter.isAvailable === false) {
      return {
        label: "Marked Unavailable",
        icon: <FaExclamationCircle />,
        className: "bg-rose-50 text-rose-600",
      };
    }
    if (isBooked) {
      return {
        label: "On Duty",
        icon: <FaClock className="animate-pulse" />,
        className: "bg-amber-50 text-amber-600",
      };
    }
    return {
      label: "Available for Hire",
      icon: <FaCheckCircle />,
      className: "bg-blue-50 text-blue-600",
    };
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FaLuggageCart className="text-orange-600" /> Porter Dispatch
              Board
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Monitoring porter load distributions and active trek assignments.
            </p>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search porters..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPorters.map((porter) => {
              const assignment = getActiveAssignment(porter._id);
              const isBooked = !!assignment;
              const statusInfo = getStatusInfo(porter, isBooked);

              return (
                <div
                  key={porter._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Status Banner */}
                  <div
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest flex justify-between items-center ${statusInfo.className}`}
                  >
                    <span className="flex items-center gap-2">
                      {statusInfo.icon}
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="h-20 w-20 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                        {porter.image ? (
                          <img
                            src={`http://localhost:8000/uploads/${porter.image}`}
                            className="w-full h-full object-cover"
                            alt={porter.username}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300">
                            {porter.username?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl">
                          {porter.username}
                        </h3>
                        <p className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded-md inline-flex items-center gap-1">
                          <FaWeightHanging size={10} /> Max:{" "}
                          {porter.maxWeight || 25}kg
                        </p>
                      </div>
                    </div>

                    {/* Booking / Unavailability Details */}
                    <div
                      className={`rounded-2xl border-2 border-dashed p-5 ${
                        porter.isAvailable === false
                          ? "bg-rose-50/40 border-rose-100"
                          : isBooked
                          ? "bg-white border-orange-200"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {porter.isAvailable === false ? (
                        <div className="flex flex-col items-center justify-center py-4 gap-2 text-rose-400">
                          <FaExclamationCircle size={22} />
                          <p className="text-[10px] font-black uppercase tracking-widest text-center">
                            Marked unavailable by porter
                          </p>
                        </div>
                      ) : isBooked ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-orange-600">
                              <FaCalendarAlt />
                              <span className="text-xs font-black uppercase">
                                Trek Date
                              </span>
                            </div>
                            <span className="text-sm font-bold text-slate-700">
                              {formatDate(assignment.bookingDate)}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <FaUserAlt
                                className="mt-1 text-blue-400"
                                size={12}
                              />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  Trekker
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                  {assignment.userId?.username}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <FaMapMarkerAlt
                                className="mt-1 text-rose-400"
                                size={12}
                              />
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  Route
                                </p>
                                <p className="text-sm font-bold text-slate-800">
                                  {assignment.destinationId?.title}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-slate-300">
                          <p className="text-[10px] font-black uppercase tracking-widest">
                            Ready for load
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-6 flex justify-between items-center text-sm border-t pt-4">
                      <span className="text-slate-400 flex items-center gap-1">
                        <FaMoneyBillWave /> Rs.{porter.dailyRate}/day
                      </span>
                      <span className="text-slate-400">
                        Exp: {porter.experience || 0}yrs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortersInfo;

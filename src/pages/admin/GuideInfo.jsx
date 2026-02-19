import React, { useEffect, useState, useCallback } from "react";
import {
  FaUserTie,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserAlt,
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaMoneyBillWave,
  FaArrowRight,
} from "react-icons/fa";
import { getAllUsers } from "../../api/userAPI";
import { getAllBookings } from "../../api/bookingApi";
import { isLoggedIn } from "../../api/authAPI";

const GuidesInfo = () => {
  const [guides, setGuides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);
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
      const guideUsers = allUsers.filter((u) => Number(u.role) === 2);
      const allBookings = bookingData.success ? bookingData.data : bookingData;

      setGuides(guideUsers);
      setFilteredGuides(guideUsers);
      setBookings(allBookings);
    } catch (error) {
      console.error("Error fetching guide data:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const results = guides.filter(
      (g) =>
        g.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredGuides(results);
  }, [searchTerm, guides]);

  const getActiveAssignment = (guideId) => {
    return bookings.find((b) => {
      const bGuideId = b.guideId?._id || b.guideId;
      return (
        bGuideId === guideId &&
        (b.status === "confirmed" || b.status === "pending")
      );
    });
  };

  // format the date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <FaUserTie className="text-[#004d4d]" /> Guide Dispatch Board
            </h1>
            <p className="text-slate-500 mt-1 font-medium">
              Real-time tracking of guide schedules and trekker pairings.
            </p>
          </div>

          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search guides..."
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004d4d]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredGuides.map((guide) => {
              const assignment = getActiveAssignment(guide._id);
              const isBooked = !!assignment;

              return (
                <div
                  key={guide._id}
                  className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  {/* Top Status Banner */}
                  <div
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest flex justify-between items-center ${
                      isBooked
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {isBooked ? (
                        <FaClock className="animate-pulse" />
                      ) : (
                        <FaCheckCircle />
                      )}
                      {isBooked ? "Currently Booked" : "Available"}
                    </span>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="h-20 w-20 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
                        {guide.image ? (
                          <img
                            src={`http://localhost:8000/uploads/${guide.image}`}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl font-black text-slate-300">
                            {guide.username?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-xl">
                          {guide.username}
                        </h3>
                        <p className="text-xs font-bold text-[#004d4d] bg-[#004d4d]/5 px-2 py-1 rounded-md inline-block">
                          {guide.specialization || "Guide"}
                        </p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div
                      className={`rounded-2xl border-2 border-dashed p-5 ${
                        isBooked
                          ? "bg-white border-[#004d4d]/20"
                          : "bg-slate-50 border-slate-100"
                      }`}
                    >
                      {isBooked ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-[#004d4d]">
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
                            Ready for New Assignment
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Footer Stats */}
                    <div className="mt-6 flex justify-between items-center text-sm border-t pt-4">
                      <span className="text-slate-400 flex items-center gap-1">
                        <FaMoneyBillWave /> Rs.{guide.dailyRate}/day
                      </span>
                      <span className="text-slate-400">
                        Exp: {guide.experience || 0}yrs
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

export default GuidesInfo;

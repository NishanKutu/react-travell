import React, { useEffect, useState } from "react";
import {
  getAllBookings,
  deleteBooking,
  cancelAndRefund,
  updateBookingStatus,
} from "../../api/bookingApi";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaUserTie,
  FaTrash,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    fetchBookings();
  }, []);

  // Handle live filtering whenever search or status changes
  useEffect(() => {
    let result = bookings;

    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }

    if (searchTerm) {
      result = result.filter(
        (b) =>
          b.userId?.username
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          b.destinationId?.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredBookings(result);
  }, [searchTerm, statusFilter, bookings]);

  const fetchBookings = async () => {
    try {
      const response = await getAllBookings();
      if (response.success) {
        setBookings(response.data);
        setFilteredBookings(response.data);
      } else {
        setError(response.message);
        toast.error("Failed to fetch bookings");
      }
    } catch (err) {
      setError("Server error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await updateBookingStatus(id, newStatus);
      if (response.success) {
        toast.success(response.message);
        fetchBookings();
      } else {
        toast.error(response.message);
      }
    } catch {
      toast.error("An error occurred while updating status.");
    }
  };

  const handleDelete = async (booking) => {
    const isConfirmed = booking.status === "confirmed";
    const confirmMessage = isConfirmed
      ? "Are you sure? Your amount will be refunded after deducting 20% of the total amount."
      : "Are you sure you want to delete this booking?";

    if (window.confirm(confirmMessage)) {
      try {
        let response;
        if (isConfirmed) {
          response = await cancelAndRefund(booking._id);
        } else {
          response = await deleteBooking(booking._id);
        }

        if (response.success) {
          toast.success(response.message);
          fetchBookings();
        } else {
          toast.error(response.message);
        }
      } catch {
        toast.error("An error occurred while processing your request.");
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not Set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusColorClass = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      refunded: "bg-rose-100 text-rose-800 border-rose-200",
    };
    return styles[status] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (loading)
    return (
      <div className="p-10 text-center font-bold text-slate-500 animate-pulse">
        Loading bookings...
      </div>
    );
  if (error)
    return <div className="p-10 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-8">
      <div className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              Admin Booking Management
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Manage trekking schedules and staff assignments.
            </p>
          </div>
          <span className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 border border-slate-200">
            Showing: {filteredBookings.length} of {bookings.length}
          </span>
        </div>

        {/* SEARCH AND FILTER BAR */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="relative flex-grow max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
            <input
              type="text"
              placeholder="Search client or destination..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFilter className="text-slate-400 text-xs" />
            <select
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {(searchTerm || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
              className="text-xs font-bold text-blue-500 hover:text-blue-700 underline underline-offset-4"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow-sm rounded-3xl overflow-hidden border border-gray-100">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Client
                  </th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Destination
                  </th>
                  <th className="px-5 py-4 border-b border-gray-200 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Travelers
                  </th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Staff & Schedule
                  </th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Amount
                  </th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Status
                  </th>
                  <th className="px-5 py-4 border-b border-gray-200 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-5 border-b border-gray-100 text-sm">
                        <p className="text-slate-900 font-bold">
                          {booking.userId?.username || "Guest"}
                        </p>
                        <p className="text-slate-400 text-[10px]">
                          {booking.userId?.email}
                        </p>
                      </td>

                      <td className="px-5 py-5 border-b border-gray-100 text-sm">
                        <p className="text-slate-700 font-bold">
                          {booking.destinationId?.title || "N/A"}
                        </p>
                        <p className="text-slate-400 text-[10px] font-medium italic">
                          Booked:{" "}
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      <td className="px-5 py-5 border-b border-gray-100 text-sm text-center">
                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">
                          {booking.travelerCount}
                        </span>
                      </td>

                      <td className="px-5 py-5 border-b border-gray-100 text-sm">
                        <div className="space-y-3">
                          {booking.hasGuide && booking.guideId && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-100 bg-slate-100 shrink-0">
                                <img
                                  src={
                                    booking.guideId.image
                                      ? `${IMG_URL}${booking.guideId.image}`
                                      : "https://via.placeholder.com/50"
                                  }
                                  className="w-full h-full object-cover"
                                  alt="guide"
                                />
                              </div>
                              <div>
                                <p className="text-slate-800 font-bold text-[11px] leading-none">
                                  {booking.guideId.username}
                                </p>
                                <p className="text-emerald-500 font-black text-[8px] uppercase tracking-tighter">
                                  Verified Guide
                                </p>
                              </div>
                            </div>
                          )}

                          {booking.hasPorter && booking.porterId && (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-orange-100 bg-slate-100 shrink-0">
                                <img
                                  src={
                                    booking.porterId.image
                                      ? `${IMG_URL}${booking.porterId.image}`
                                      : "https://via.placeholder.com/50"
                                  }
                                  className="w-full h-full object-cover"
                                  alt="porter"
                                />
                              </div>
                              <div>
                                <p className="text-slate-800 font-bold text-[11px] leading-none">
                                  {booking.porterId.username}
                                </p>
                                <p className="text-orange-500 font-black text-[8px] uppercase tracking-tighter">
                                  Trekking Porter
                                </p>
                              </div>
                            </div>
                          )}

                          {!booking.hasGuide && !booking.hasPorter && (
                            <div className="flex items-center gap-2 text-slate-300 italic text-xs font-medium">
                              <FaUserTie className="opacity-20" />
                              <span>No Staff Requested</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md w-fit">
                            <FaCalendarAlt className="text-blue-500 text-[10px]" />
                            <span className="text-[10px] font-black text-blue-600 uppercase">
                              {formatDate(booking.bookingDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 border-b border-gray-100 text-sm">
                        <p className="text-slate-900 font-black">
                          NPR {booking.totalPrice?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">
                          {booking.paymentMethod || "eSewa"}
                        </p>
                      </td>

                      <td className="px-5 py-5 border-b border-gray-100 text-sm">
                        <div className="flex flex-col gap-1.5">
                          <select
                            value={booking.status}
                            disabled={booking.status === "refunded"}
                            onChange={(e) =>
                              handleStatusChange(booking._id, e.target.value)
                            }
                            className={`px-2 py-1 inline-flex text-[10px] leading-tight font-bold rounded-full border outline-none cursor-pointer transition-all ${getStatusColorClass(
                              booking.status
                            )}`}
                          >
                            <option value="pending">PENDING</option>
                            <option value="confirmed">CONFIRMED</option>
                            <option value="completed">COMPLETED</option>
                            <option value="cancelled">CANCELLED</option>
                            <option value="refunded" disabled>
                              REFUNDED
                            </option>
                          </select>

                          {booking.status === "refunded" && (
                            <div className="mt-1">
                              <p className="text-rose-600 font-black line-through opacity-50 text-[10px]">
                                NPR {booking.totalPrice?.toLocaleString()}
                              </p>
                              <p className="text-emerald-700 font-black text-[11px]">
                                REFUND: NPR{" "}
                                {booking.refundAmount?.toLocaleString() || 0}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                                20% Fee Deducted
                              </p>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-5 border-b border-gray-100 text-sm text-center">
                        <button
                          onClick={() => handleDelete(booking)}
                          className="text-rose-400 hover:text-rose-600 font-bold text-xs p-2 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 mx-auto"
                        >
                          <FaTrash size={10} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-10 text-center text-slate-400 italic font-medium"
                    >
                      No bookings found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;

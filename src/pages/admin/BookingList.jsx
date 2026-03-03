import React, { useEffect, useState } from "react";
import { getAllBookings, deleteBooking } from "../../api/bookingApi";
import { toast } from "react-toastify";
import { FaCalendarAlt, FaUserTie, FaTrash } from "react-icons/fa";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getAllBookings();
      if (response.success) {
        setBookings(response.data);
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      try {
        const response = await deleteBooking(id);
        if (response.success) {
          toast.success("Booking deleted!");
          setBookings((prev) => prev.filter((item) => item._id !== id));
        } else {
          alert(response.message || "Failed to delete");
        }
      } catch (err) {
        toast.error("Failed to delete booking");
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return (
      <span className={`px-2 py-0.5 inline-flex text-[10px] leading-5 font-bold rounded-full border ${styles[status] || "bg-gray-100"}`}>
        {status?.toUpperCase()}
      </span>
    );
  };

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 animate-pulse">Loading bookings...</div>;
  if (error) return <div className="p-10 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 sm:px-8">
      <div className="py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-slate-800 leading-tight">Admin Booking Management</h2>
            <p className="text-slate-500 text-sm font-medium">Manage trekking schedules and guide assignments.</p>
          </div>
          <span className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 border border-slate-200">
            Total Bookings: {bookings.length}
          </span>
        </div>

        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow-sm rounded-3xl overflow-hidden border border-gray-100">
            <table className="min-w-full leading-normal">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Destination</th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Travelers</th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Selected Guide & Schedule</th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Finance</th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-5 py-4 border-b border-gray-200 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                      <p className="text-slate-900 font-bold">{booking.userId?.username || "Guest"}</p>
                      <p className="text-slate-400 text-[10px]">{booking.userId?.email}</p>
                    </td>
                    
                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                      <p className="text-slate-700 font-bold">{booking.destinationId?.title || "N/A"}</p>
                      <p className="text-slate-400 text-[10px] font-medium italic">Booked on: {new Date(booking.createdAt).toLocaleDateString()}</p>
                    </td>

                    <td className="px-5 py-5 border-b border-gray-100 text-sm text-center">
                      <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-bold">{booking.travelerCount}</span>
                    </td>

                    {/* GUIDE COLUMN */}
                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                      {booking.hasGuide && booking.guideId ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-100 bg-slate-100 flex-shrink-0">
                              <img 
                                src={booking.guideId.image ? `${IMG_URL}${booking.guideId.image}` : "https://via.placeholder.com/50"} 
                                className="w-full h-full object-cover" 
                                alt="guide"
                              />
                            </div>
                            <div>
                              <p className="text-slate-800 font-bold text-xs leading-none">{booking.guideId.username}</p>
                              <p className="text-emerald-500 font-black text-[9px] uppercase tracking-tighter">Verified Guide</p>
                            </div>
                          </div>
                          
                          {/* Date Badge */}
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 border border-blue-100 rounded-md w-fit">
                            <FaCalendarAlt className="text-blue-500 text-[10px]" />
                            <span className="text-[10px] font-black text-blue-600 uppercase">
                              {formatDate(booking.bookingDate)}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-300 italic text-xs font-medium">
                          <FaUserTie className="opacity-20" />
                          <span>No Guide Requested</span>
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                      <p className="text-slate-900 font-black">NPR {booking.totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{booking.paymentMethod || "eSewa"}</p>
                    </td>

                    <td className="px-5 py-5 border-b border-gray-100 text-sm">
                      {getStatusBadge(booking.status)}
                    </td>

                    <td className="px-5 py-5 border-b border-gray-100 text-sm text-center">
                      <button
                        onClick={() => handleDelete(booking._id)}
                        className="text-rose-400 hover:text-rose-600 font-bold text-xs p-2 hover:bg-rose-50 rounded-lg transition-all flex items-center gap-1 mx-auto"
                      >
                        <FaTrash size={10} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingList;
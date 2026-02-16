import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI"; 
import {
  getAllBookings,
  deleteBooking,
  getEsewaSignature,
} from "../api/bookingApi";
import { getAllDestinations } from "../api/destinationApi";

const ProfilePage = () => {
  const [bookings, setBookings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Get logged in user info
  const { user } = isLoggedIn();
  const isGuide = Number(user?.role) === 2;

  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const bookingRes = await getAllBookings();
      if (bookingRes?.success) {
        // Filter out bookings where destination might have been deleted
        const validBookings = bookingRes.data.filter(
          (b) => b.destinationId !== null
        );
        setBookings(validBookings);
      }

      const destRes = await getAllDestinations();
      if (destRes?.success) {
        const shuffled = destRes.data.sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE LOGIC ---
  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const res = await deleteBooking(id);
      if (res.success) {
        alert("Booking cancelled successfully");
        setBookings(bookings.filter((b) => b._id !== id));
      } else {
        alert(res.message || "Failed to cancel booking");
      }
    } catch (error) {
      console.error("Cancel Error:", error);
      alert("Something went wrong while cancelling.");
    }
  };

  // --- PAYMENT LOGIC ---
  const handlePayment = async (e, booking) => {
    e.stopPropagation();
    try {
      const amount = booking.totalPrice;
      const productId = `${booking._id}-${Date.now()}`;

      const res = await getEsewaSignature({
        amount: amount,
        productId: productId,
      });

      if (res.success) {
        const eSewaPath = "https://rc-epay.esewa.com.np/api/epay/main/v2/form"; 
        
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", eSewaPath);

        const fields = {
          amount: amount,
          tax_amount: "0",
          total_amount: amount,
          transaction_uuid: res.transaction_uuid,
          product_code: res.product_code,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: "http://localhost:8000/api/bookings/verify-esewa", 
          failure_url: "http://localhost:5173/payment-failure",
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: res.signature,
        };

        for (const key in fields) {
          const hiddenField = document.createElement("input");
          hiddenField.setAttribute("type", "hidden");
          hiddenField.setAttribute("name", key);
          hiddenField.setAttribute("value", fields[key]);
          form.appendChild(hiddenField);
        }

        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto">
        
        {/* User Info Header */}
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#004d4d]/10 shadow-inner">
            {user?.image ? (
              <img
                src={`${IMG_URL}${user.image}`}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }} 
              />
            ) : (
              <div className="w-full h-full bg-[#004d4d] flex items-center justify-center text-white text-4xl font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-slate-900">{user?.username}</h1>
              {isGuide && (
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-emerald-200 w-fit mx-auto md:mx-0">
                  Verified Guide
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium mb-4">{user?.email}</p>

            {isGuide && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-50 text-left">
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Experience</span>
                  <span className="text-slate-700 font-semibold">{user?.experience || 0} Years</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl">
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Age</span>
                  <span className="text-slate-700 font-semibold">{user?.age || "N/A"}</span>
                </div>
                <div className="sm:col-span-2 bg-gray-50 p-3 rounded-2xl">
                  <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">Specialization</span>
                  <span className="text-slate-700 font-semibold">{user?.specialization || "General Guide"}</span>
                </div>
                {user?.bio && (
                  <div className="sm:col-span-2 bg-emerald-50/30 p-4 rounded-2xl italic text-slate-600 text-sm border border-emerald-100">
                    "{user.bio}"
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => navigate("/edit-profile")}
              className="mt-6 text-sm font-bold text-[#004d4d] hover:underline"
            >
              Edit Profile Details
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Suggestions */}
          <div className="flex-1 order-2 lg:order-1">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
              <span className="w-8 h-1 bg-[#004d4d] rounded-full"></span>
              Recommended for You
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {suggestions.map((dest) => (
                <div
                  key={dest._id}
                  onClick={() => navigate(`/tour/${dest._id}`)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={dest.images?.[0] ? `${IMG_URL}${dest.images[0]}` : "https://via.placeholder.com/400"}
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-xl text-slate-800 line-clamp-1">{dest.title}</h4>
                    <p className="text-[#004d4d] font-bold mt-2">Rs. {dest.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bookings Panel */}
          <div className="w-full lg:w-100 order-1 lg:order-2">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">My Bookings</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div key={booking._id} className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#004d4d] transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800">{booking.destinationId?.title}</h3>
                          <p className="text-sm text-slate-500 text-green-700 font-bold">Rs. {booking.totalPrice}</p>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-white font-bold uppercase border border-green-500 text-green-500">
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {booking.status === "pending" && (
                          <button
                            onClick={(e) => handlePayment(e, booking)}
                            className="flex-1 bg-[#004d4d] text-white text-[11px] font-bold py-2 rounded-xl hover:bg-[#003333]"
                          >
                            Pay Now
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(e, booking._id)}
                          className="flex-1 border border-rose-100 text-rose-500 text-[11px] font-bold py-2 rounded-xl hover:bg-rose-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center py-10">No bookings yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
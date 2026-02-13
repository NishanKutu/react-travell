import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  // Backend URL for images
  // const IMG_URL = "http://localhost:8000/public/uploads/";
  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Bookings
      const bookingRes = await getAllBookings();
      if (bookingRes?.success) {
        const validBookings = bookingRes.data.filter(
          (b) => b.destinationId !== null
        );
        setBookings(validBookings);
      }

      // 2. Fetch Dynamic Suggestions
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

  // --- PAYMENT LOGIC ---
  const handlePayment = async (e, booking) => {
    e.stopPropagation();
    try {
      const uniqueTransactionId = `${booking._id}-${Date.now()}`;
      const paymentData = {
        amount: booking.totalPrice,
        productId: uniqueTransactionId,
      };
      const res = await getEsewaSignature(paymentData);

      if (res.success) {
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute(
          "action",
          "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
        );

        const fields = {
          amount: booking.totalPrice,
          tax_amount: "0",
          total_amount: booking.totalPrice,
          transaction_uuid: uniqueTransactionId,
          product_code: "EPAYTEST",
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
      console.error("Payment initiation failed:", error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const res = await deleteBooking(id);
      if (res.success) {
        setBookings(bookings.filter((b) => b._id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-10">
        {/* DYNAMIC SUGGESTIONS*/}
        <div className="flex-1 order-2 lg:order-1">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Profile Overview
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Discover your next journey based on your interests.
            </p>
          </div>

          <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <span className="w-8 h-1 bg-[#004d4d] rounded-full"></span>
            Recommended for You
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {suggestions.length > 0 ? (
              suggestions.map((dest) => (
                <div
                  key={dest._id}
                  onClick={() => navigate(`/tour/${dest._id}`)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 cursor-pointer"
                >
                  <div className="h-56 bg-gray-200 overflow-hidden relative">
                    <img
                      src={
                        dest.images?.[0]
                          ? `${IMG_URL}${dest.images[0]}`
                          : "https://via.placeholder.com/400x300?text=No+Image"
                      }
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#004d4d]">
                      {dest.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-xl text-slate-800 line-clamp-1">
                        {dest.title}
                      </h4>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {dest.descriptions}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
                        {dest.location}
                      </span>
                      <p className="text-[#004d4d] font-bold">
                        Rs. {dest.price}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">
                Finding destinations for you...
              </p>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: BOOKINGS PANEL (Sticky Sidebar) */}
        <div className="w-full lg:w-100 order-1 lg:order-2">
          <div className="sticky top-24 z-10 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">
              My Bookings
            </h2>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-black transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800">
                          {booking.destinationId?.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Rs. {booking.totalPrice}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-1 rounded bg-white font-bold uppercase border border-green-500 text-green-500">
                        {booking.status}
                      </span>
                    </div>
                    {/* Action buttons go here */}
                    <div className="flex gap-2">
                      {booking.status === "pending" && (
                        <button
                          onClick={(e) => handlePayment(e, booking)}
                          className="flex-1 bg-[#004d4d] text-white text-[11px] font-bold py-2 rounded-xl 
                 hover:bg-[#003333] 
                 active:scale-95 active:opacity-90 
                 transition-all duration-150 shadow-sm cursor-pointer"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, booking._id)}
                        className="flex-1 border border-rose-100 text-rose-500 text-[11px] font-bold py-2 rounded-xl 
               hover:bg-rose-50 
               active:scale-95 active:bg-rose-100
               transition-all duration-150 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 text-center py-10">
                  No bookings yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllBookings,
  deleteBooking,
  getEsewaSignature,
} from "../api/bookingApi";

const ProfilePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const response = await getAllBookings();
      // REMOVED: console.log("My Bookings Data:", response?.data);

      if (response && response.success && response.data) {
        const validBookings = response.data.filter(
          (booking) =>
            booking.destinationId !== null &&
            booking.destinationId !== undefined
        );
        setBookings(validBookings);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
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
        // Create a hidden form to submit to eSewa
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
          success_url: "http://localhost:8000/api/bookings/verify-esewa", // backend verify route
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
    if (window.confirm("Are you sure you want to cancel?")) {
      const res = await deleteBooking(id); // Deletes from Backend
      if (res.success) {
        setBookings(bookings.filter((b) => b._id !== id));
      }
    }
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">My Bookings</h2>
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            onClick={() => {
              // Only navigate if the ID exists
              const destId = booking.destinationId?._id;
              if (destId) {
                navigate(`/tour/${destId}`);
              }
            }}
            className="bg-white p-6 rounded-xl shadow-sm cursor-pointer flex justify-between items-center border hover:border-[#004d4d] transition-all"
          >
            <div>
              <h3 className="font-bold text-xl text-[#004d4d]">
                {booking.destinationId?.title}
              </h3>
              <p className="text-sm text-gray-600">
                Total: Rs. {booking.totalPrice}
              </p>
              <span
                className={`text-xs font-bold uppercase ${
                  booking.status === "confirmed"
                    ? "text-green-600"
                    : "text-orange-500"
                }`}
              >
                {booking.status}
              </span>
            </div>

            <div className="flex gap-3">
              {booking.status === "pending" && (
                <button
                  onClick={(e) => handlePayment(e, booking)} // Triggers eSewa
                  className="bg-[#004d4d] text-white px-5 py-2 rounded-lg hover:bg-[#003333]"
                >
                  Complete Payment
                </button>
              )}
              <button
                onClick={(e) => handleDelete(e, booking._id)}
                className="border border-red-500 text-red-500 px-5 py-2 rounded-lg hover:bg-red-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePage;

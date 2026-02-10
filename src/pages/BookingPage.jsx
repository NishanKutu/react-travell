import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI";
import { getDestinationById } from "../api/destinationApi";
import { createBooking, getEsewaSignature } from "../api/bookingApi";
import PaymentModal from "./PaymentModal";

const BookingPage = () => {
  const { user } = isLoggedIn();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelerCount, setTravelerCount] = useState(1);

  // --- ADD-ON STATE ---
  const [hasGuide, setHasGuide] = useState(false);
  const [hasPorter, setHasPorter] = useState(false);
  const GUIDE_PRICE = 50; 
  const PORTER_PRICE = 30;

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await getDestinationById(id);
        if (response.success) {
          setDestination(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  if (loading) return <div className="text-center p-10 font-sans">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500 font-sans italic">{error}</div>;
  if (!destination) return <div className="text-center p-10">Destination not found.</div>;

  // --- UPDATED FINANCIAL CALCULATIONS ---
  const price = Number(destination.price) || 0;
  const discountPerPerson = Number(destination.discount) || 0;
  
  const subtotal = price * travelerCount;
  const totalDiscount = discountPerPerson * travelerCount;
  
  const guideTotal = hasGuide ? GUIDE_PRICE : 0;
  const porterTotal = hasPorter ? PORTER_PRICE : 0;
  
  const finalTotal = subtotal - totalDiscount + guideTotal + porterTotal;

  const handleTravelerChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value)) {
      setTravelerCount(""); 
    } else {
      const clampedValue = Math.min(Math.max(1, value), destination.groupSize);
      setTravelerCount(clampedValue);
    }
  };

  const handleBlur = () => {
    if (travelerCount === "" || travelerCount < 1) setTravelerCount(1);
  };

  const handlePaymentSelection = async (method) => {
    if (method === "esewa") {
      try {
        const amountToSend = Number(finalTotal).toFixed(0);
        
        // --- PASSING ADD-ONS TO BACKEND ---
        const bookingRes = await createBooking({
          destinationId: id,
          travelerCount: travelerCount,
          totalPrice: amountToSend,
          hasGuide,
          hasPorter,
          guideCost: guideTotal,
          porterCost: porterTotal
        });

        if (!bookingRes?.success) {
          throw new Error(bookingRes?.message || "Booking creation failed.");
        }

        const sigRes = await getEsewaSignature({
          amount: amountToSend,
          productId: bookingRes.data._id,
        });

        const formDetails = {
          amount: amountToSend,
          tax_amount: "0",
          total_amount: amountToSend,
          transaction_uuid: bookingRes.data._id,
          product_code: "EPAYTEST",
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: "http://localhost:8000/api/bookings/verify-esewa",
          failure_url: "http://localhost:5173/payment-failure",
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: sigRes.signature,
        };

        submitFormToEsewa(formDetails);
      } catch (err) {
        alert("eSewa Error: " + err.message);
      }
    }
  };

  const submitFormToEsewa = (formData) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    Object.entries(formData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  const isInactive = destination.status !== "active";

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg overflow-hidden font-sans border border-gray-100 my-10 rounded-xl">
      {/* Header & Info */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase tracking-tight">
          {destination.title}
        </h2>
        <div className="flex gap-4">
          <img
            src={destination.images?.[0] ? `http://localhost:8000/uploads/${destination.images[0]}` : "https://via.placeholder.com/300"}
            alt={destination.title}
            className="w-24 h-24 rounded-lg object-cover bg-gray-100"
          />
          <div className="flex flex-col justify-center space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2"><span>📍</span> <p>{destination.location}</p></div>
            <div className="flex items-center gap-2"><span>⏱️</span> <p>{destination.duration}</p></div>
          </div>
        </div>
      </div>

      {/* Traveler Selector */}
      <div className="bg-orange-50/50 p-6 space-y-4 text-sm border-y border-orange-100">
        <div className="flex justify-between items-center">
          <label className="text-gray-700 font-bold uppercase tracking-wider text-xs">Number of Travelers:</label>
          <div className="flex items-center border rounded-md bg-white overflow-hidden">
            <button
              disabled={travelerCount <= 1}
              onClick={() => setTravelerCount(prev => prev - 1)}
              className="px-3 py-1 hover:bg-gray-100 text-lg font-bold border-r disabled:opacity-30"
            > - </button>
            <input
              type="number"
              value={travelerCount}
              onChange={handleTravelerChange}
              onBlur={handleBlur}
              className="w-12 text-center focus:outline-none font-bold"
            />
            <button
              disabled={travelerCount >= destination.groupSize}
              onClick={() => setTravelerCount(prev => prev + 1)}
              className="px-3 py-1 hover:bg-gray-100 text-lg font-bold border-l disabled:opacity-30"
            > + </button>
          </div>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 italic">Max Capacity: {destination.groupSize} guests</span>
          <span className={`font-bold ${isInactive ? "text-red-600" : "text-green-600"}`}>
            {destination.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Tour Breakdown */}
      <div className="p-6 pb-2">
        <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mb-2">
          <span>Tour Breakdown</span>
          <div className="flex gap-15"><span>Qty</span><span>Subtotal</span></div>
        </div>
        
        {/* Main Fare */}
        <div className="flex justify-between items-center py-3 border-t border-gray-100">
          <span className="text-sm font-medium">Tour Fare Adult</span>
          <div className="flex gap-12 text-sm">
            <span className="w-8 text-center">{travelerCount}</span>
            <span className="font-semibold w-16 text-right">${subtotal.toLocaleString()}</span>
          </div>
        </div>

        {/* --- ADD-ONS SECTION --- */}
        <div className="space-y-3 pt-2 border-t border-gray-50">
          <div className="flex justify-between items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#004d4d]" 
                checked={hasGuide}
                onChange={(e) => setHasGuide(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Add Professional Guide</span>
            </label>
            <span className="text-sm font-semibold text-gray-800">${GUIDE_PRICE}</span>
          </div>

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="w-4 h-4 accent-[#004d4d]" 
                checked={hasPorter}
                onChange={(e) => setHasPorter(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Add Porter Service</span>
            </label>
            <span className="text-sm font-semibold text-gray-800">${PORTER_PRICE}</span>
          </div>
        </div>
      </div>

      {destination.discount > 0 && (
        <div className="bg-orange-200 p-4 px-6 mt-4 flex justify-between text-orange-900 font-medium italic">
          <span>Early booking discount:</span>
          <span>-${totalDiscount.toLocaleString()}</span>
        </div>
      )}

      {/* Total Section */}
      <div className="bg-[#004d4d] p-6 flex justify-between items-center text-white">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-3xl font-bold">${finalTotal.toLocaleString()}</span>
      </div>

      <div className="p-4 bg-gray-50">
        {!user ? (
          <button onClick={() => navigate("/login")} className="w-full bg-orange-500 text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-orange-600 transition-all">
            Login to Book
          </button>
        ) : (
          <button
            disabled={isInactive}
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-[#004d4d] text-white py-4 rounded-md font-bold uppercase tracking-widest hover:bg-black transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Confirm Booking for {travelerCount}
          </button>
        )}
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={finalTotal}
        onSelectPayment={handlePaymentSelection}
      />
    </div>
  );
};

export default BookingPage;
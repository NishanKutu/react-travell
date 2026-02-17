import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI";
import { getDestinationById } from "../api/destinationApi";
import { createBooking, getEsewaSignature } from "../api/bookingApi";
import { getAllGuides } from "../api/userApi"; 
import PaymentModal from "./PaymentModal";

const BookingPage = () => {
  const { user, token } = isLoggedIn();
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [guides, setGuides] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [expandedGuideId, setExpandedGuideId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guidesLoading, setGuidesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelerCount, setTravelerCount] = useState(1);

  const [hasGuide, setHasGuide] = useState(false);
  const [hasPorter, setHasPorter] = useState(false);

  const PORTER_PRICE = 30;

  useEffect(() => {
    const fetchData = async () => {
      setGuidesLoading(true);
      try {
        const [destRes, guideRes] = await Promise.all([
          getDestinationById(id),
          getAllGuides(),
        ]);

        if (destRes.success) setDestination(destRes.data);

        const guideData = guideRes?.data || [];
        setGuides(guideData);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load booking details.");
      } finally {
        setLoading(false);
        setGuidesLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle dynamic price calculations
  const price = Number(destination?.price) || 0;
  const discountPerPerson = Number(destination?.discount) || 0;
  const subtotal = price * travelerCount;
  const totalDiscount = discountPerPerson * travelerCount;
  const guideTotal =
    hasGuide && selectedGuide ? Number(selectedGuide.dailyRate) || 0 : 0;
  const porterTotal = hasPorter ? PORTER_PRICE : 0;

  const finalTotal = subtotal - totalDiscount + guideTotal + porterTotal;

  const handleTravelerChange = (val) => {
    const max = destination?.groupSize || 10;
    const clampedValue = Math.min(Math.max(1, val), max);
    setTravelerCount(clampedValue);
  };

  const handlePaymentSelection = async (method) => {
    if (method === "esewa") {
      try {
        const amountToSend = Number(finalTotal).toFixed(0);
        const bookingRes = await createBooking({
          destinationId: id,
          travelerCount,
          totalPrice: amountToSend,
          hasGuide,
          hasPorter,
          guideCost: guideTotal, 
          porterCost: porterTotal,
          guideId: selectedGuide?._id,
        });

        if (!bookingRes?.success)
          throw new Error(bookingRes?.message || "Booking failed.");

        const sigRes = await getEsewaSignature({
          amount: amountToSend,
          productId: bookingRes.data._id,
        });

        submitToEsewa(amountToSend, bookingRes.data._id, sigRes.signature);
      } catch (err) {
        alert("Booking/Payment Error: " + err.message);
      }
    }
  };

  const submitToEsewa = (amount, uuid, signature) => {
    const formDetails = {
      amount,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: uuid,
      product_code: "EPAYTEST",
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: "http://localhost:8000/api/bookings/verify-esewa",
      failure_url: "http://localhost:5173/payment-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: signature,
    };

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    Object.entries(formDetails).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  if (loading || !destination)
    return (
      <div className="flex items-center justify-center min-h-screen font-bold text-teal-800 animate-pulse">
        Preparing Your Adventure...
      </div>
    );
  if (error)
    return (
      <div className="text-center p-10 text-red-500 font-bold">{error}</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Hero Header */}
      <div className="relative w-full h-[40vh] bg-gray-900">
        <img
          src={
            destination.images?.[0]
              ? `http://localhost:8000/uploads/${destination.images[0]}`
              : "https://via.placeholder.com/1200x600"
          }
          className="w-full h-full object-cover opacity-60"
          alt="Destination"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
          <h1 className="text-5xl font-black uppercase text-center">
            {destination.title}
          </h1>
          <p className="text-xl opacity-90 mt-2">
            {destination.location} • {destination.duration}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Travelers Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800">
                1. Travelers
              </h3>
              <div className="flex items-center gap-6 p-5 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-800 uppercase tracking-wide">
                    Number of Guests
                  </p>
                  <p className="text-xs text-orange-600">
                    Max available: {destination.groupSize}
                  </p>
                </div>
                <div className="flex items-center bg-white rounded-lg border shadow-sm overflow-hidden scale-110">
                  <button
                    onClick={() => handleTravelerChange(travelerCount - 1)}
                    className="px-4 py-2 hover:bg-gray-100 font-bold border-r"
                  >
                    -
                  </button>
                  <span className="px-6 font-black text-lg">
                    {travelerCount}
                  </span>
                  <button
                    onClick={() => handleTravelerChange(travelerCount + 1)}
                    className="px-4 py-2 hover:bg-gray-100 font-bold border-l"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Guide & Porter Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-800">
                  2. Enhance Your Trip
                </h3>
              </div>

              {/* Guide Selector Toggle */}
              <div
                className={`p-6 flex justify-between items-center cursor-pointer transition-all ${
                  hasGuide ? "bg-teal-50" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => {
                  setHasGuide(!hasGuide);
                  if (hasGuide) setSelectedGuide(null);
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      hasGuide
                        ? "bg-teal-600 border-teal-600"
                        : "border-gray-300"
                    }`}
                  >
                    {hasGuide && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <span className="block font-bold text-gray-800 text-lg">
                      Add Professional Guide
                    </span>
                    <span className="text-xs text-gray-500">
                      Price varies by individual guide
                    </span>
                  </div>
                </div>
                {/* Visual Hint */}
                <span className="text-xs font-bold text-teal-600 uppercase">
                  {selectedGuide
                    ? `Selected: Rs ${selectedGuide.dailyRate}`
                    : "Select a guide below"}
                </span>
              </div>

              {/* GUIDE LIST */}
              <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${
                  hasGuide
                    ? "max-h-[800px] opacity-100 border-t"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-6 bg-gray-50/50">
                  {guidesLoading ? (
                    <p className="text-sm text-center text-gray-400 animate-pulse">
                      Finding experts...
                    </p>
                  ) : guides.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {guides.map((guide) => (
                        <div
                          key={guide._id}
                          className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                            selectedGuide?._id === guide._id
                              ? "border-teal-600 bg-white shadow-md"
                              : "border-transparent bg-white/60 hover:border-gray-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGuide(guide);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                guide.image
                                  ? `http://localhost:8000/uploads/${guide.image}`
                                  : "https://via.placeholder.com/100"
                              }
                              className="w-14 h-14 rounded-full object-cover bg-gray-200 shadow-sm"
                              alt="Guide"
                            />
                            <div className="flex-1">
                              <p className="font-bold text-gray-800">
                                {guide.username}
                              </p>
                              <p className="text-[10px] text-teal-700 font-bold uppercase tracking-wider">
                                Rs {guide.dailyRate || 0} / Day
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedGuideId(
                                  expandedGuideId === guide._id
                                    ? null
                                    : guide._id
                                );
                              }}
                              className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold"
                            >
                              {expandedGuideId === guide._id ? "CLOSE" : "INFO"}
                            </button>
                            {selectedGuide?._id === guide._id && (
                              <div className="bg-teal-600 text-white rounded-full p-1 ml-2">
                                <span className="text-[10px]">✓</span>
                              </div>
                            )}
                          </div>
                          {expandedGuideId === guide._id && (
                            <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                              <p className="text-xs text-gray-600 italic leading-relaxed">
                                "{guide.bio || "No bio available."}"
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-6 text-sm text-gray-500 italic">
                      No guides available.
                    </p>
                  )}
                </div>
              </div>

              {/* Porter Toggle */}
              <div
                className={`p-6 flex justify-between items-center cursor-pointer transition-all border-t ${
                  hasPorter ? "bg-teal-50/30" : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setHasPorter(!hasPorter)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      hasPorter
                        ? "bg-teal-600 border-teal-600"
                        : "border-gray-300"
                    }`}
                  >
                    {hasPorter && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <span className="font-bold text-gray-800">
                      Add Porter Service
                    </span>
                  </div>
                </div>
                <span className="font-bold text-gray-700">
                  + Rs {PORTER_PRICE}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 sticky top-8 overflow-hidden">
              <div className="bg-[#004d4d] p-8 text-white text-center">
                <p className="text-xs uppercase tracking-[0.2em] opacity-70 mb-2">
                  Grand Total
                </p>
                <h2 className="text-5xl font-black">
                  Rs {finalTotal.toLocaleString()}
                </h2>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-gray-500">
                    Trip Base Fare ({travelerCount}x)
                  </span>
                  <span className="font-bold text-gray-800">
                    Rs {subtotal.toLocaleString()}
                  </span>
                </div>
                {hasGuide && selectedGuide && (
                  <div className="flex justify-between text-sm items-center text-teal-700 font-medium">
                    <span>Guide: {selectedGuide.username}</span>
                    <span>+Rs {selectedGuide.dailyRate}</span>
                  </div>
                )}
                {hasPorter && (
                  <div className="flex justify-between text-sm items-center text-teal-700 font-medium">
                    <span>Porter Service</span>
                    <span>+Rs {PORTER_PRICE}</span>
                  </div>
                )}
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm items-center text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 italic">
                    <span>Package Discount</span>
                    <span className="font-bold">
                      -Rs {totalDiscount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="pt-8">
                  {user ? (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="w-full bg-[#004d4d] text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                    >
                      Confirm & Pay Now
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-orange-500 text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg"
                    >
                      Login to Book
                    </button>
                  )}
                  <p className="text-[10px] text-center text-gray-400 mt-4 uppercase leading-relaxed font-bold">
                    Secure Payment via eSewa
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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

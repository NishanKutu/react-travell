import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI";
import { getDestinationById } from "../api/destinationApi";
import {
  createBooking,
  getEsewaSignature,
  initiateStripePayment,
  getAvailableStaff,
} from "../api/bookingApi";
import PaymentModal from "./PaymentModal";
import { FaCalendarAlt } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

const BookingPage = () => {
  const { user } = isLoggedIn();
  const { id } = useParams();

  const [destination, setDestination] = useState(null);
  const [guides, setGuides] = useState([]);
  const [porters, setPorters] = useState([]);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedPorter, setSelectedPorter] = useState(null);
  const [expandedGuideId, setExpandedGuideId] = useState(null);
  const [expandedPorterId, setExpandedPorterId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [portersLoading, setPortersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [travelerCount, setTravelerCount] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const { openLogin, openSignup } = useOutletContext();

  const [hasGuide, setHasGuide] = useState(false);
  const [hasPorter, setHasPorter] = useState(false);
  // states for booking vs payment failures
  const [bookingError, setBookingError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    const fetchDest = async () => {
      try {
        const destRes = await getDestinationById(id);
        if (destRes.success) setDestination(destRes.data);
      } catch {
        setError("Failed to load destination details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDest();
  }, [id]);

  useEffect(() => {
    const fetchStaff = async () => {
      if (!bookingDate || !id) {
        setGuides([]);
        setPorters([]);
        return;
      }

      setGuidesLoading(true);
      setPortersLoading(true);

      try {
        const [guideRes, porterRes] = await Promise.all([
          getAvailableStaff(bookingDate, 2, id),
          getAvailableStaff(bookingDate, 3, id),
        ]);

        setGuides(guideRes.data || []);
        setPorters(porterRes.data || []);

        setSelectedGuide(null);
        setSelectedPorter(null);
      } catch (err) {
        console.error("Error fetching available staff:", err);
        setGuides([]);
        setPorters([]);
      } finally {
        setGuidesLoading(false);
        setPortersLoading(false);
      }
    };

    fetchStaff();
  }, [bookingDate, id]);

  // Price Calculation
  const basePrice = Number(destination?.price) || 0;
  const discountPercentage = Number(destination?.discount) || 0;
  const discountAmountPerPerson = basePrice * (discountPercentage / 100);
  const totalDiscount = discountAmountPerPerson * travelerCount;
  const priceAfterDiscount = basePrice - discountAmountPerPerson;
  const subtotal = priceAfterDiscount * travelerCount;
  // Staff Costs
  const guideTotal =
    hasGuide && selectedGuide ? Number(selectedGuide.dailyRate) || 0 : 0;
  const porterTotal =
    hasPorter && selectedPorter ? Number(selectedPorter.dailyRate) || 0 : 0;
  // Grand Total
  const finalTotal = subtotal + guideTotal + porterTotal;

  const handleTravelerChange = (val) => {
    const max = destination?.groupSize || 10;
    const clampedValue = Math.min(Math.max(1, val), max);
    setTravelerCount(clampedValue);
  };

  const handlePaymentSelection = async (method) => {
    // Clear any previous errors on each new attempt
    setBookingError("");
    setPaymentError("");

    try {
      if (!bookingDate) {
        setBookingError("Please select a trekking date before proceeding.");
        setIsModalOpen(false);
        return;
      }

      const amountToSend = Number(finalTotal).toFixed(0);

      // Step 1: Create the booking record
      const bookingRes = await createBooking({
        destinationId: id,
        travelerCount,
        totalPrice: amountToSend,
        hasGuide,
        hasPorter,
        guideCost: guideTotal,
        porterCost: porterTotal,
        guideId: selectedGuide?._id,
        porterId: selectedPorter?._id,
        bookingDate: bookingDate,
      });

      // If booking failed (date conflict, staff conflict, etc.)
      if (!bookingRes?.success) {
        setIsModalOpen(false);
        setBookingError(
          bookingRes?.message ||
            "Booking could not be created. Please try again."
        );
        return;
      }

      const bookingId = bookingRes.data._id;

      // Proceed to payment gateway
      if (method === "esewa") {
        const sigRes = await getEsewaSignature({
          amount: amountToSend,
          bookingId: bookingId,
        });
        if (sigRes.success) {
          submitToEsewa(
            amountToSend,
            sigRes.transaction_uuid,
            sigRes.signature
          );
        } else {
          setPaymentError("Failed to connect to eSewa. Please try again.");
        }
      } else if (method === "stripe") {
        const stripeRes = await initiateStripePayment({
          bookingId: bookingId,
          amount: amountToSend,
          destinationName: destination.title,
        });
        if (stripeRes.success && stripeRes.url) {
          window.location.href = stripeRes.url;
        } else {
          setPaymentError("Failed to connect to Stripe. Please try again.");
        }
      }
    } catch {
      setPaymentError("An unexpected error occurred. Please try again.");
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
            {/* ── Booking Error Banner ── */}
            {bookingError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl shadow-sm">
                <span className="text-lg mt-0.5">⚠️</span>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide mb-0.5">
                    Booking Failed
                  </p>
                  <p className="text-sm">{bookingError}</p>
                </div>
                <button
                  onClick={() => setBookingError("")}
                  className="ml-auto text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

            {/* ── Payment Error Banner ── */}
            {paymentError && (
              <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-orange-700 px-5 py-4 rounded-xl shadow-sm">
                <span className="text-lg mt-0.5">💳</span>
                <div>
                  <p className="font-bold text-sm uppercase tracking-wide mb-0.5">
                    Payment Error
                  </p>
                  <p className="text-sm">{paymentError}</p>
                </div>
                <button
                  onClick={() => setPaymentError("")}
                  className="ml-auto text-orange-400 hover:text-orange-600 font-bold text-lg leading-none"
                >
                  ×
                </button>
              </div>
            )}

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

            {/* 2. Date Selection Section */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                2. Select Trekking Date
              </h3>
              <div className="relative p-5 bg-teal-50 rounded-xl border border-teal-100 flex items-center gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm text-teal-600">
                  <FaCalendarAlt size={24} />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-teal-800 uppercase tracking-widest mb-1">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split("T")[0]}
                    value={bookingDate}
                    onChange={(e) => {
                      setBookingDate(e.target.value);
                      // Clear booking error when user picks a new date
                      setBookingError("");
                    }}
                    className="w-full bg-white border border-teal-200 rounded-lg px-4 py-2 font-bold text-gray-800 focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* 3. Guide & Porter Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-800">
                  3. Enhance Your Trip
                </h3>
              </div>

              {!bookingDate ? (
                <div className="p-10 text-center bg-gray-50/30 flex flex-col items-center gap-3">
                  <FaCalendarAlt
                    className="text-teal-500 opacity-20"
                    size={40}
                  />
                  <p className="text-sm text-gray-500 font-medium">
                    Please select a trekking date first to see available guides
                    and porters.
                  </p>
                </div>
              ) : (
                <>
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
                        {hasGuide && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800 text-lg">
                          Add Professional Guide
                        </span>
                        <span className="text-xs text-gray-500">
                          Showing experts available for {bookingDate}
                        </span>
                      </div>
                    </div>
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
                          Checking availability...
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
                                  {expandedGuideId === guide._id
                                    ? "CLOSE"
                                    : "INFO"}
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
                          No guides available for this date.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Porter Toggle */}
                  <div
                    className={`p-6 flex justify-between items-center cursor-pointer transition-all border-t ${
                      hasPorter
                        ? "bg-orange-50/30"
                        : "bg-white hover:bg-gray-50"
                    }`}
                    onClick={() => {
                      setHasPorter(!hasPorter);
                      if (hasPorter) setSelectedPorter(null);
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          hasPorter
                            ? "bg-orange-600 border-orange-600"
                            : "border-gray-300"
                        }`}
                      >
                        {hasPorter && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      <div>
                        <span className="block font-bold text-gray-800 text-lg">
                          Add Porter Service
                        </span>
                        <span className="text-xs text-gray-500">
                          Showing porters available for {bookingDate}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-orange-600 uppercase">
                      {selectedPorter
                        ? `Selected: Rs ${selectedPorter.dailyRate}`
                        : "Select a porter below"}
                    </span>
                  </div>

                  <div
                    className={`transition-all duration-500 ease-in-out overflow-hidden ${
                      hasPorter
                        ? "max-h-[800px] opacity-100 border-t"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-6 bg-gray-50/50">
                      {portersLoading ? (
                        <p className="text-sm text-center text-gray-400 animate-pulse">
                          Checking availability...
                        </p>
                      ) : porters.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {porters.map((porter) => (
                            <div
                              key={porter._id}
                              className={`flex flex-col p-4 rounded-xl border-2 transition-all cursor-pointer ${
                                selectedPorter?._id === porter._id
                                  ? "border-orange-600 bg-white shadow-md"
                                  : "border-transparent bg-white/60 hover:border-gray-200"
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPorter(porter);
                              }}
                            >
                              <div className="flex items-center gap-4">
                                <img
                                  src={
                                    porter.image
                                      ? `http://localhost:8000/uploads/${porter.image}`
                                      : "https://via.placeholder.com/100"
                                  }
                                  className="w-14 h-14 rounded-full object-cover bg-gray-200 shadow-sm"
                                  alt="Porter"
                                />
                                <div className="flex-1">
                                  <p className="font-bold text-gray-800">
                                    {porter.username}
                                  </p>
                                  <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wider">
                                    Rs {porter.dailyRate || 0} / Day • Max{" "}
                                    {porter.maxWeight || 0}kg
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedPorterId(
                                      expandedPorterId === porter._id
                                        ? null
                                        : porter._id
                                    );
                                  }}
                                  className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 font-bold"
                                >
                                  {expandedPorterId === porter._id
                                    ? "CLOSE"
                                    : "INFO"}
                                </button>
                              </div>
                              {expandedPorterId === porter._id && (
                                <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn text-xs text-gray-600">
                                  <p>
                                    <strong>Bio:</strong>{" "}
                                    {porter.bio || "Available for trekking."}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center py-6 text-sm text-gray-500 italic">
                          No porters available for this date.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
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
                {hasPorter && selectedPorter && (
                  <div className="flex justify-between text-sm items-center text-orange-700 font-medium">
                    <span>Porter: {selectedPorter.username}</span>
                    <span>+Rs {selectedPorter.dailyRate.toLocaleString()}</span>
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
                    <>
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full bg-[#004d4d] text-white py-5 rounded-xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                      >
                        Confirm & Pay Now
                      </button>
                      <p className="text-[10px] text-center text-gray-400 mt-4 uppercase leading-relaxed font-bold">
                        Secure Payment Gateway
                      </p>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={openLogin}
                        className="w-full bg-[#004d4d] text-white py-5 rounded-xl font-black uppercase shadow-lg hover:bg-black transition-all"
                      >
                        Login to Book
                      </button>
                      <p className="mt-4 text-center text-sm text-gray-600">
                        Don't have an account?
                        <button
                          onClick={openSignup}
                          className="text-[#004d4d] font-bold hover:underline pl-1"
                        >
                          Sign up
                        </button>
                      </p>
                    </>
                  )}
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

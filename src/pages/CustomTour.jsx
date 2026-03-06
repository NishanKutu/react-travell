import React, { useState, useEffect } from "react";
import { fetchCities } from "../api/cityApi";
import { getAllActivities } from "../api/activityApi";
import { getEsewaSignature } from "../api/bookingApi";
import { createCustomTour } from "../api/customTourApi";
import PaymentModal from "./PaymentModal"; 

const CustomTour = () => {
  const [cities, setCities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [availableGuides, setAvailableGuides] = useState([]);

  const [result, setResult] = useState("");
  const [statusColor, setStatusColor] = useState("text-gray-500");

  // --- Modal States ---
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [createdTourId, setCreatedTourId] = useState(null);

  const [formData, setFormData] = useState({
    travelerCount: 1,
    guide: null,
    itinerary: [
      {
        dayNumber: 1,
        destinationCity: "",
        bookingDate: "",
        morning: [],
        afternoon: [],
        evening: [],
      },
    ],
  });

  const [totalPrice, setTotalPrice] = useState(0);

  const getAuthToken = () => {
    const authData = localStorage.getItem("auth");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        return parsed.token;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const handleEsewaPayment = async (tourId, amount) => {
    try {
      const cleanAmount = Math.round(amount);
      const res = await getEsewaSignature({
        bookingId: tourId,
        amount: cleanAmount,
      });

      if (res.success) {
        const paymentFields = {
          amount: cleanAmount,
          tax_amount: "0",
          total_amount: cleanAmount,
          transaction_uuid: res.transaction_uuid,
          product_code: "EPAYTEST",
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: "http://localhost:8000/api/bookings/verify-esewa",
          failure_url: "http://localhost:5173/profile",
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: res.signature,
        };

        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

        Object.keys(paymentFields).forEach((key) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = paymentFields[key];
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setResult("Failed to initialize payment gateway.");
    }
  };

  // --- Payment Selection Handler for Modal ---
  const handlePaymentSelection = async (method) => {
    if (method === "esewa") {
      await handleEsewaPayment(createdTourId, totalPrice);
    } else if (method === "stripe") {
      setResult("Stripe integration is currently in progress.");
      setStatusColor("text-blue-500");
      setIsPaymentModalOpen(false);
    }
  };

  useEffect(() => {
    const getCities = async () => {
      const res = await fetchCities();
      if (res.success) setCities(res.data);
    };
    const fetchActivities = async () => {
      const res = await getAllActivities();
      if (res.success) setAvailableActivities(res.data);
    };
    getCities();
    fetchActivities();
  }, []);

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch("/api/user/getallguides");
        const result = await response.json();
        setAvailableGuides(Array.isArray(result) ? result : result.data || []);
      } catch (error) {
        console.error("Error fetching guides:", error);
      }
    };
    fetchGuides();
  }, []);

  // Price Calculation logic
  useEffect(() => {
    let activityCostTotal = 0;

    formData.itinerary.forEach((day) => {
      const dayActivities = [...day.morning, ...day.afternoon, ...day.evening];
      dayActivities.forEach((id) => {
        const found = availableActivities.find((a) => a._id === id);
        if (found) {
          activityCostTotal += Number(found.cost) * formData.travelerCount;
        }
      });
    });

    const totalDays = formData.itinerary.length;
    const guideCostTotal = formData.guide
      ? Number(formData.guide.dailyRate) * totalDays
      : 0;

    setTotalPrice(activityCostTotal + guideCostTotal);
  }, [formData, availableActivities]);

  const addDay = () => {
    const lastDay = formData.itinerary[formData.itinerary.length - 1];
    let nextDate = "";

    if (lastDay.bookingDate) {
      const dateObj = new Date(lastDay.bookingDate);
      dateObj.setDate(dateObj.getDate() + 1);
      nextDate = dateObj.toISOString().split("T")[0];
    }

    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        {
          dayNumber: formData.itinerary.length + 1,
          destinationCity: lastDay.destinationCity || "",
          bookingDate: nextDate,
          morning: [],
          afternoon: [],
          evening: [],
        },
      ],
    });
  };

  const removeDay = (index) => {
    if (formData.itinerary.length <= 1) return;
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    const updatedItinerary = newItinerary.map((day, i) => ({
      ...day,
      dayNumber: i + 1,
    }));
    setFormData({ ...formData, itinerary: updatedItinerary });
  };

  const updateItineraryField = (idx, field, value) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[idx][field] = value;

    if (field === "destinationCity") {
      newItinerary[idx].morning = [];
      newItinerary[idx].afternoon = [];
      newItinerary[idx].evening = [];
    }

    setFormData({ ...formData, itinerary: newItinerary });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const token = getAuthToken();

    if (!token) {
      setResult("Please login to continue.");
      setStatusColor("text-red-500");
      return;
    }

    if (
      !formData.itinerary[0].destinationCity ||
      !formData.itinerary[0].bookingDate
    ) {
      setResult("Please fill in the Destination and Date for Day 1.");
      setStatusColor("text-red-500");
      return;
    }

    setResult("Saving your journey details...");

    try {
      const res = await createCustomTour({
        itinerary: formData.itinerary,
        travelerCount: formData.travelerCount,
        guideId: formData.guide?._id || null,
        totalPrice,
      });

      if (res.success) {
        setCreatedTourId(res.data._id);
        setResult("Journey saved! Opening payment options...");
        setStatusColor("text-green-600");
        setIsPaymentModalOpen(true);
      } else {
        setResult(res.message || "Failed to save booking.");
        setStatusColor("text-red-500");
      }
    } catch (error) {
      console.error("Submission error:", error);
      setResult("Error connecting to server.");
      setStatusColor("text-red-500");
    }
  };

  return (
    <div className="bg-white font-sans text-gray-800 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-64 flex items-center justify-center bg-[#004d43]">
        <div className="text-center">
          <h1 className="text-white text-5xl font-serif mb-2">
            Design Your Journey
          </h1>
          <p className="text-emerald-100/60 uppercase tracking-widest text-xs">
            Curate every moment of your adventure
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Itinerary Section */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6 uppercase tracking-widest flex items-center">
              <span className="w-8 h-[2px] bg-[#c08457] mr-3"></span>
              Itinerary Details
            </h2>

            {formData.itinerary.map((day, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-6 rounded-lg mb-6 relative border border-gray-100 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-serif italic text-xl text-[#004d43]">
                    Day {day.dayNumber}
                  </h3>
                  {formData.itinerary.length > 1 && (
                    <button
                      onClick={() => removeDay(idx)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="Remove Day"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                        <path
                          fillRule="evenodd"
                          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="group">
                    <label className="text-[10px] font-bold uppercase text-[#c08457] mb-1 block">
                      Destination City
                    </label>
                    <select
                      className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-[#004d43] transition-colors"
                      value={day.destinationCity}
                      onChange={(e) =>
                        updateItineraryField(
                          idx,
                          "destinationCity",
                          e.target.value
                        )
                      }
                    >
                      <option value="">Select City</option>
                      {cities.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.cityname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#c08457] mb-1 block">
                      Date
                    </label>
                    <input
                      type="date"
                      className="w-full border-b border-gray-300 bg-transparent py-2 outline-none focus:border-[#004d43] transition-colors"
                      value={day.bookingDate}
                      onChange={(e) =>
                        updateItineraryField(idx, "bookingDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["Morning", "Afternoon", "Evening"].map((slot) => (
                    <div
                      key={slot}
                      className="bg-white p-3 rounded border border-gray-100"
                    >
                      <label className="text-[9px] font-black uppercase text-gray-400 block mb-2 tracking-tighter">
                        {slot} Activity
                      </label>
                      <select
                        disabled={!day.destinationCity}
                        className="w-full text-xs outline-none bg-transparent cursor-pointer disabled:cursor-not-allowed"
                        value={day[slot.toLowerCase()][0] || ""}
                        onChange={(e) => {
                          const val = e.target.value ? [e.target.value] : [];
                          updateItineraryField(idx, slot.toLowerCase(), val);
                        }}
                      >
                        <option value="">None</option>
                        {availableActivities
                          .filter((act) => {
                            const activityCityId =
                              act.places?._id || act.places;
                            const isCorrectCity =
                              activityCityId === day.destinationCity;
                            const matchesSlot =
                              act.preferredTime?.includes(slot) ||
                              act.preferredTime?.includes("Any");
                            return isCorrectCity && matchesSlot;
                          })
                          .map((a) => (
                            <option key={a._id} value={a._id}>
                              {a.name} (NPR {a.cost})
                            </option>
                          ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={addDay}
              className="w-full border-2 border-dashed border-[#004d43]/30 text-[#004d43] py-4 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-[#004d43] hover:text-white hover:border-[#004d43] transition-all duration-300"
            >
              + Add Another Day
            </button>
          </div>

          {/* Sidebar Summary Section */}
          <div className="lg:sticky lg:top-8 self-start">
            <div className="bg-[#fcfcfc] p-8 rounded-xl border border-gray-200 shadow-lg">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <label className="text-[10px] font-bold uppercase text-[#c08457] block mb-2">
                  Personal Guide
                </label>
                <select
                  className="w-full border border-gray-200 p-3 rounded-lg bg-white text-sm outline-none focus:ring-1 focus:ring-[#004d43]"
                  value={formData.guide?._id || ""}
                  onChange={(e) => {
                    const selectedGuide = availableGuides.find(
                      (g) => g._id === e.target.value
                    );
                    setFormData({ ...formData, guide: selectedGuide || null });
                  }}
                >
                  <option value="">No Guide Needed</option>
                  {availableGuides.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.username} (NPR {g.dailyRate}/day)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-8">
                <label className="text-[10px] font-bold uppercase text-[#c08457] block mb-2">
                  Number of Travelers
                </label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        travelerCount: Math.max(1, prev.travelerCount - 1),
                      }))
                    }
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    className="w-full text-center text-sm outline-none py-2"
                    value={formData.travelerCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        travelerCount: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <button
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        travelerCount: prev.travelerCount + 1,
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              <h2 className="text-xl font-serif mb-6 text-gray-700">
                Trip Summary
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="uppercase text-[10px] font-bold tracking-tighter">
                    Total Duration
                  </span>
                  <span className="font-bold">
                    {formData.itinerary.length} Days
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="uppercase text-[10px] font-bold tracking-tighter">
                    Group Size
                  </span>
                  <span className="font-bold">
                    {formData.travelerCount} Person(s)
                  </span>
                </div>

                <div className="pt-6 border-t mt-6 text-center">
                  <span className="block text-[10px] font-bold text-[#c08457] uppercase mb-1">
                    Total Estimated Cost
                  </span>
                  <span className="text-3xl font-serif italic text-[#004d43]">
                    NPR {totalPrice.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full bg-[#004d43] text-white py-4 rounded-lg font-bold uppercase text-xs mt-6 hover:bg-[#00362f] shadow-md hover:shadow-xl transition-all"
                >
                  Confirm & Book
                </button>

                {result && (
                  <p
                    className={`text-center text-xs mt-4 font-medium p-2 rounded ${
                      statusColor === "text-red-500"
                        ? "bg-red-50"
                        : "bg-green-50"
                    } ${statusColor}`}
                  >
                    {result}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal Component */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={totalPrice}
        onSelectPayment={handlePaymentSelection}
      />
    </div>
  );
};

export default CustomTour;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDestinations } from "../../api/destinationApi";
import { adminCreateBooking } from "../../api/bookingApi";
import { getAllUsers, getAllGuides } from "../../api/userAPI";

const AdminAddBooking = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    userId: "",
    destinationId: "",
    travelerCount: 1,
    hasGuide: false,
    hasPorter: false,
    guideId: "",
    porterCost: 2000,
    status: "confirmed", 
    bookingDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth"));
        const token = authData?.token;

        const [destRes, userRes, guideRes] = await Promise.all([
          getAllDestinations(),
          getAllUsers(token),
          getAllGuides(),
        ]);

        setDestinations(destRes.data || []);
        setUsers(Array.isArray(userRes) ? userRes : userRes.data || []);
        setGuides(guideRes.success ? guideRes.data : guideRes || []);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const isDestinationSelected = formData.destinationId !== "";
  const selectedTrip = destinations.find(
    (d) => d._id === formData.destinationId
  );

  // DYNAMIC GUIDE CALCULATION
  const selectedGuide = guides.find((g) => g._id === formData.guideId);
  const dynamicGuideRate = selectedGuide ? Number(selectedGuide.dailyRate) : 0;

  // DYNAMIC PRICE CALCULATION
  const subtotal = selectedTrip
    ? selectedTrip.price * (formData.travelerCount || 0)
    : 0;
  const currentGuideCost =
    formData.hasGuide && formData.guideId ? dynamicGuideRate : 0;
  const currentPorterCost = formData.hasPorter ? formData.porterCost : 0;
  const finalTotal = subtotal + currentGuideCost + currentPorterCost;

  const handleTravelerChange = (e) => {
    const value = parseInt(e.target.value, 10);
    const maxCapacity = selectedTrip?.groupSize || 100;
    if (isNaN(value) || value < 1) {
      setFormData({ ...formData, travelerCount: "" });
    } else if (value > maxCapacity) {
      setFormData({ ...formData, travelerCount: maxCapacity });
    } else {
      setFormData({ ...formData, travelerCount: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.destinationId)
      return alert("Select user and destination");
    if (formData.hasGuide && !formData.guideId)
      return alert("Please assign a specific guide.");

    try {
      const payload = {
        ...formData,
        totalPrice: finalTotal,
        guideCost: currentGuideCost,
        guideId: formData.hasGuide ? formData.guideId : null,
      };

      const res = await adminCreateBooking(payload);
      if (res.success) {
        alert("Booking created successfully!");
        navigate("/admin/bookings");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading Resources...</div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
        <div className="bg-slate-800 p-4 text-white font-bold text-lg">
          Manual Booking Entry
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Row 1: Customer & Trip */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Customer
              </label>
              <select
                className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.userId}
                onChange={(e) =>
                  setFormData({ ...formData, userId: e.target.value })
                }
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.username}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Destination
              </label>
              <select
                className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.destinationId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    destinationId: e.target.value,
                    travelerCount: e.target.value ? 1 : "",
                  })
                }
              >
                <option value="">-- Choose Trip --</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Travelers & Date */}
          <div
            className={`grid grid-cols-1 md:grid-cols-2 gap-4 transition-all ${
              !isDestinationSelected ? "opacity-40" : ""
            }`}
          >
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                No. of Travelers
              </label>
              <input
                type="number"
                disabled={!isDestinationSelected}
                className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.travelerCount}
                onChange={handleTravelerChange}
                placeholder="Enter count"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Booking Date
              </label>
              <input
                type="date"
                disabled={!isDestinationSelected}
                className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.bookingDate}
                onChange={(e) =>
                  setFormData({ ...formData, bookingDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Row 3 - Status Selector */}
          <div className={`${!isDestinationSelected ? "opacity-40" : ""}`}>
            <label className="block text-xs font-bold uppercase text-blue-600 mb-2">
              Booking Status
            </label>
            <select
              disabled={!isDestinationSelected}
              className="w-full border-2 border-blue-50 p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/30 font-semibold"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="pending">Pending (Awaiting Payment)</option>
              <option value="confirmed">Confirmed (Paid)</option>
              <option value="completed">Completed (Trip Done)</option>
            </select>
          </div>

          {/* Services Section */}
          <div
            className={`p-4 rounded-xl border-2 border-dashed ${
              !isDestinationSelected
                ? "opacity-30"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <h4 className="text-xs font-black text-slate-500 uppercase mb-3">
              Add-on Services
            </h4>
            <div className="space-y-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    disabled={!isDestinationSelected}
                    checked={formData.hasGuide}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasGuide: e.target.checked,
                        guideId: "",
                      })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Hire Guide
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    disabled={!isDestinationSelected}
                    checked={formData.hasPorter}
                    onChange={(e) =>
                      setFormData({ ...formData, hasPorter: e.target.checked })
                    }
                    className="w-4 h-4 accent-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Hire Porter (Rs. {formData.porterCost})
                  </span>
                </label>
              </div>

              {/* DYNAMIC GUIDE DROPDOWN */}
              {formData.hasGuide && (
                <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">
                    Assign Guide
                  </label>
                  <select
                    className="w-full border-b-2 border-slate-100 p-1 text-sm outline-none focus:border-blue-500"
                    value={formData.guideId}
                    onChange={(e) =>
                      setFormData({ ...formData, guideId: e.target.value })
                    }
                  >
                    <option value="">-- Select a Guide --</option>
                    {guides.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.username} - Rs. {g.dailyRate}/day
                      </option>
                    ))}
                  </select>
                  {selectedGuide && (
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 italic">
                        Specialization: {selectedGuide.specialization || "N/A"}
                      </span>
                      <span className="text-xs font-bold text-emerald-600">
                        + Rs. {selectedGuide.dailyRate}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Total */}
          <div className="bg-slate-900 p-5 rounded-2xl flex justify-between items-center shadow-xl">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Grand Total
              </p>
              <p className="text-3xl font-black text-white">
                Rs. {finalTotal.toLocaleString()}
              </p>
            </div>
            <button
              type="submit"
              disabled={
                !isDestinationSelected ||
                (formData.hasGuide && !formData.guideId)
              }
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-30"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddBooking;

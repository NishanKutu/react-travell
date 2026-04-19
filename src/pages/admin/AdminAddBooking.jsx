import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDestinations } from "../../api/destinationApi";
import { adminCreateBooking, getAvailableStaff } from "../../api/bookingApi";
import { getAllUsers } from "../../api/userAPI";

const AdminAddBooking = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [guides, setGuides] = useState([]);
  const [porters, setPorters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffLoading, setStaffLoading] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    destinationId: "",
    travelerCount: 1,
    hasGuide: false,
    hasPorter: false,
    guideId: "",
    porterId: "",
    status: "confirmed",
    bookingDate: new Date().toISOString().split("T")[0],
  });

  // Load destinations and users once on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authData = JSON.parse(localStorage.getItem("auth"));
        const token = authData?.token;

        const [destRes, userRes] = await Promise.all([
          getAllDestinations(),
          getAllUsers(token),
        ]);

        setDestinations(destRes.data || []);

        const fetchedUsers = Array.isArray(userRes)
          ? userRes
          : userRes.data || [];
        setUsers(fetchedUsers);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Re-fetch available staff whenever date or destination changes
  // This respects both booking conflicts AND the isAvailable flag
  useEffect(() => {
    const fetchAvailableStaff = async () => {
      if (!formData.bookingDate || !formData.destinationId) {
        setGuides([]);
        setPorters([]);
        return;
      }

      setStaffLoading(true);
      // Reset selections when date/destination changes
      setFormData((prev) => ({ ...prev, guideId: "", porterId: "" }));

      try {
        const [guideRes, porterRes] = await Promise.all([
          getAvailableStaff(formData.bookingDate, 2, formData.destinationId),
          getAvailableStaff(formData.bookingDate, 3, formData.destinationId),
        ]);

        setGuides(guideRes.data || []);
        setPorters(porterRes.data || []);
      } catch (err) {
        console.error("Failed to load available staff", err);
        setGuides([]);
        setPorters([]);
      } finally {
        setStaffLoading(false);
      }
    };

    fetchAvailableStaff();
  }, [formData.bookingDate, formData.destinationId]);

  const isDestinationSelected = formData.destinationId !== "";
  const isDateSelected = formData.bookingDate !== "";

  const selectedTrip = destinations.find(
    (d) => d._id === formData.destinationId
  );

  // Dynamic calculations
  const selectedGuide = guides.find((g) => g._id === formData.guideId);
  const dynamicGuideRate = selectedGuide ? Number(selectedGuide.dailyRate) : 0;

  const selectedPorter = porters.find((p) => p._id === formData.porterId);
  const dynamicPorterRate = selectedPorter
    ? Number(selectedPorter.dailyRate)
    : 0;

  const subtotal = selectedTrip
    ? selectedTrip.price * (formData.travelerCount || 0)
    : 0;
  const currentGuideCost =
    formData.hasGuide && formData.guideId ? dynamicGuideRate : 0;
  const currentPorterCost =
    formData.hasPorter && formData.porterId ? dynamicPorterRate : 0;
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
    if (formData.hasPorter && !formData.porterId)
      return alert("Please assign a specific porter.");

    try {
      const payload = {
        ...formData,
        totalPrice: finalTotal,
        guideCost: currentGuideCost,
        porterCost: currentPorterCost,
        guideId: formData.hasGuide ? formData.guideId : null,
        porterId: formData.hasPorter ? formData.porterId : null,
      };

      const res = await adminCreateBooking(payload);

      if (res.success) {
        alert("Booking created successfully!");
        navigate("/admin/booking-list");
      } else {
        alert(res.message || "Booking failed");
      }
    } catch (err) {
      console.error("Booking Error:", err);
      alert(err.message || "An error occurred during booking");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">Loading Resources...</div>
    );

  // Whether staff dropdowns should be shown
  const staffReady = isDestinationSelected && isDateSelected && !staffLoading;

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
                {users
                  .filter((u) => Number(u.role) === 0)
                  .map((u) => (
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
                    guideId: "",
                    porterId: "",
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
                  setFormData({
                    ...formData,
                    bookingDate: e.target.value,
                    guideId: "",
                    porterId: "",
                  })
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

            {/* Prompt to pick a date first if not done */}
            {isDestinationSelected && !isDateSelected && (
              <p className="text-xs text-amber-600 font-bold bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                ⚠ Select a booking date above to see available guides and
                porters.
              </p>
            )}

            {/* Staff loading indicator */}
            {staffLoading && (
              <p className="text-xs text-blue-500 font-bold animate-pulse mb-3">
                Checking staff availability for {formData.bookingDate}...
              </p>
            )}

            <div className="space-y-4">
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!staffReady}
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
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!staffReady}
                    checked={formData.hasPorter}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hasPorter: e.target.checked,
                        porterId: "",
                      })
                    }
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Hire Porter
                  </span>
                </label>
              </div>

              {/* Guide Dropdown */}
              {formData.hasGuide && (
                <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-blue-500 uppercase mb-2">
                    Assign Guide
                  </label>
                  {guides.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No guides available for this date.
                    </p>
                  ) : (
                    <>
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
                            {g.username} — Rs. {g.dailyRate}/day
                            {g.specialization ? ` · ${g.specialization}` : ""}
                          </option>
                        ))}
                      </select>
                      {selectedGuide && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 italic">
                            Specialization:{" "}
                            {selectedGuide.specialization || "N/A"}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            + Rs. {selectedGuide.dailyRate}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Porter Dropdown */}
              {formData.hasPorter && (
                <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[10px] font-black text-orange-500 uppercase mb-2">
                    Assign Porter
                  </label>
                  {porters.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      No porters available for this date.
                    </p>
                  ) : (
                    <>
                      <select
                        className="w-full border-b p-1 text-sm outline-none focus:border-orange-500"
                        value={formData.porterId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            porterId: e.target.value,
                          })
                        }
                      >
                        <option value="">-- Select Porter --</option>
                        {porters.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.username} (Max: {p.maxWeight || 25}kg)
                          </option>
                        ))}
                      </select>
                      {selectedPorter && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 italic">
                            Exp: {selectedPorter.experience} yrs
                          </span>
                          <span className="text-xs font-bold text-orange-600">
                            + Rs. {selectedPorter.dailyRate}
                          </span>
                        </div>
                      )}
                    </>
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
                !isDateSelected ||
                (formData.hasGuide && !formData.guideId) ||
                (formData.hasPorter && !formData.porterId)
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

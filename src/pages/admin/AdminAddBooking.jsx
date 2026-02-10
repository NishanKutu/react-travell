import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllDestinations } from "../../api/destinationApi";
import { adminCreateBooking } from "../../api/bookingApi";
import { getAllUsers } from "../../api/userAPI";

const AdminAddBooking = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    userId: "",
    destinationId: "",
    travelerCount: "",
    hasGuide: false,
    hasPorter: false,
    guideCost: 50,
    porterCost: 30,
    status: "confirmed",
  });

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
        setUsers(Array.isArray(userRes) ? userRes : userRes.data || []);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper variable to check if destination is picked
  const isDestinationSelected = formData.destinationId !== "";

  // Find selected trip
  const selectedTrip = destinations.find(
    (d) => d._id === formData.destinationId
  );

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

  const subtotal = selectedTrip
    ? selectedTrip.price * (formData.travelerCount || 0)
    : 0;
  const addons =
    (formData.hasGuide ? formData.guideCost : 0) +
    (formData.hasPorter ? formData.porterCost : 0);
  const finalTotal = subtotal + addons;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.userId || !formData.destinationId) {
      return alert("Please select a user and a destination");
    }
    if (!formData.travelerCount || formData.travelerCount < 1) {
      return alert("Please enter the number of travelers");
    }

    try {
      const payload = { ...formData, totalPrice: finalTotal };
      const res = await adminCreateBooking(payload);
      console.log("API Response:", res);
      if (res.status === 201 || res.status === 200 || res.success) {
        alert("Booking created successfully!");
        navigate("/");
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
          Create Manual Reservation
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 1. Select User */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              Select Customer
            </label>
            <select
              className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.userId}
              onChange={(e) =>
                setFormData({ ...formData, userId: e.target.value })
              }
            >
              <option value="">-- Choose a User --</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Select Trip */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
              Select Destination
            </label>
            <select
              className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.destinationId}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  destinationId: e.target.value,
                  travelerCount: e.target.value ? 1 : "", // Reset traveler count
                });
              }}
            >
              <option value="">-- Choose a Trip --</option>
              {destinations.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.title} (Max: {d.groupSize})
                </option>
              ))}
            </select>
          </div>

          <div
            className={`grid grid-cols-2 gap-4 transition-opacity ${
              !isDestinationSelected
                ? "opacity-40 cursor-not-allowed"
                : "opacity-100"
            }`}
          >
            {/* 3. Traveler Count - DISABLED until trip selected */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Number of Travelers{" "}
                {selectedTrip && (
                  <span className="text-blue-600">
                    (Max: {selectedTrip.groupSize})
                  </span>
                )}
              </label>
              <input
                type="number"
                disabled={!isDestinationSelected}
                className="w-full border p-2.5 rounded-md outline-none disabled:bg-gray-100"
                placeholder={
                  !isDestinationSelected ? "Select trip first" : "Enter count"
                }
                value={formData.travelerCount}
                onChange={handleTravelerChange}
              />
            </div>

            {/* 4. Booking Status */}
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                Status
              </label>
              <select
                disabled={!isDestinationSelected}
                className="w-full border p-2.5 rounded-md disabled:bg-gray-100"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* 5. Add-ons Section - DISABLED until trip selected */}
          <div
            className={`bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300 transition-opacity ${
              !isDestinationSelected ? "opacity-40" : "opacity-100"
            }`}
          >
            <h4 className="text-sm font-bold text-gray-700 mb-3">
              Add-ons & Services
            </h4>
            <div className="flex gap-6">
              <label
                className={`flex items-center gap-2 ${
                  !isDestinationSelected
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!isDestinationSelected}
                  checked={formData.hasGuide}
                  onChange={(e) =>
                    setFormData({ ...formData, hasGuide: e.target.checked })
                  }
                />
                <span className="text-sm">Include Guide ($50)</span>
              </label>
              <label
                className={`flex items-center gap-2 ${
                  !isDestinationSelected
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="checkbox"
                  disabled={!isDestinationSelected}
                  checked={formData.hasPorter}
                  onChange={(e) =>
                    setFormData({ ...formData, hasPorter: e.target.checked })
                  }
                />
                <span className="text-sm">Include Porter ($30)</span>
              </label>
            </div>
          </div>

          {/* 6. Financial Summary */}
          <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
            <div>
              <p className="text-xs text-blue-600 font-bold uppercase">
                Calculated Total
              </p>
              <p className="text-2xl font-black text-blue-900">${finalTotal}</p>
            </div>
            <button
              type="submit"
              disabled={!isDestinationSelected}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-bold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Confirm & Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddBooking;

import React, { useState, useEffect } from "react";
import { createActivity } from "../../api/activityApi";
import {
  fetchCities,
  addCity,
  updateCity,
  deleteCity,
} from "../../api/cityApi";

const ManageActivity = () => {
  // --- State for Cities ---
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState("");

  // --- State for Activities ---
  const [formData, setFormData] = useState({
    name: "",
    cost: "",
    places: "",
    description: "",
    category: "Sightseeing",
    preferredTime: [],
  });

  // --- UI State ---
  const [status, setStatus] = useState({ message: "", type: "" });

  // Load cities on mount
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    const res = await fetchCities();
    if (res.success) setCities(res.data);
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (!newCityName.trim()) return;
    const res = await addCity(newCityName);
    if (res.success) {
      setNewCityName("");
      loadCities();
      showStatus("City added successfully!", "success");
    } else {
      showStatus(res.message, "error");
    }
  };

  const handleActivityChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.cost ||
      !formData.places
    ) {
      showStatus(
        "Please fill in Name, Cost and City.",
        "error"
      );
      return;
    }

    const res = await createActivity({
      ...formData,
      cost: Number(formData.cost),
    });

    if (res.success) {
      showStatus(`Activity "${formData.name}" saved!`, "success");
      setFormData({
        ...formData,
        name: "",
        cost: "",
        description: "",
        specificArea: "",
        preferredTime: [],
      });
    } else {
      showStatus(res.message, "error");
    }
  };

  const handleDeleteCity = async (id) => {
    if (
      window.confirm(
        "Are you sure? This might affect activities linked to this city."
      )
    ) {
      const res = await deleteCity(id);
      if (res.success) {
        loadCities();
        showStatus("City deleted!", "success");
      } else {
        showStatus(res.message || "Failed to delete city", "error");
      }
    }
  };

  const handleEditCity = async (id, oldName) => {
    const newName = prompt("Enter new city name:", oldName);
    if (newName && newName !== oldName && newName.trim() !== "") {
      const res = await updateCity(id, newName);
      if (res.success) {
        loadCities();
        showStatus("City updated!", "success");
      } else {
        showStatus(res.message || "Failed to update city", "error");
      }
    }
  };

  const showStatus = (msg, type) => {
    setStatus({ message: msg, type });
    setTimeout(() => setStatus({ message: "", type: "" }), 4000);
  };

  const handleTimeSlotToggle = (slot) => {
    setFormData((prev) => {
      const currentSlots = prev.preferredTime;
      // Toggle logic
      if (currentSlots.includes(slot)) {
        return {
          ...prev,
          preferredTime: currentSlots.filter((s) => s !== slot),
        };
      } else {
        return {
          ...prev,
          preferredTime: [...currentSlots, slot],
        };
      }
    });
  };

  const categories = [
    "Adventure",
    "Sightseeing",
    "Cultural",
    "Relaxation",
    "Food",
    "Fun",
  ];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Any"];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-serif text-[#004d43] mb-8 border-b-2 border-[#c08457] pb-2">
          Tour Management Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit lg:sticky lg:top-6">
            <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center">
              <i className="bi bi-geo-alt-fill mr-2 text-[#c08457]"></i>
              Destinations
            </h2>

            <form onSubmit={handleAddCity} className="flex gap-2 mb-6">
              <input
                type="text"
                className="flex-grow border-b-2 border-gray-200 focus:border-[#004d43] outline-none p-2 text-sm"
                placeholder="Add city (e.g. Ilam)"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
              />
              <button className="bg-[#004d43] text-white px-4 py-2 rounded text-sm hover:bg-opacity-90">
                Add
              </button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {cities.length > 0 ? (
                cities.map((city) => (
                  <div
                    key={city._id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded text-sm hover:bg-gray-100 transition-all"
                  >
                    <span className="font-medium">{city.cityname}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCity(city._id, city.cityname)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteCity(city._id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-400 py-4 text-xs italic">
                  No cities found.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: ADD ACTIVITY */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-700 mb-6 flex items-center">
              <i className="bi bi-plus-circle-fill mr-2 text-[#c08457]"></i>
              Create New Activity
            </h2>

            <form onSubmit={handleActivitySubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Target City
                  </label>
                  <select
                    name="places"
                    value={formData.places}
                    onChange={handleActivityChange}
                    className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43] bg-transparent"
                  >
                    <option value="">Select a city</option>
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.cityname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Best Time Slots
                  </label>
                  <div className="flex flex-wrap gap-2 py-1">
                    {timeSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => handleTimeSlotToggle(slot)}
                        className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                          formData.preferredTime.includes(slot)
                            ? "bg-[#004d43] text-white border-[#004d43]"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#004d43]"
                        }`}
                      >
                        {slot}
                        {formData.preferredTime.includes(slot) && (
                          <i className="bi bi-check-lg ml-1"></i>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Activity Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleActivityChange}
                  placeholder="e.g. Paragliding adventure"
                  className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Cost (NPR)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleActivityChange}
                    placeholder="2500"
                    className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleActivityChange}
                    className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider">
                  Short Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleActivityChange}
                  rows="3"
                  className="w-full border border-gray-100 rounded-lg p-3 outline-none focus:border-[#004d43] resize-none"
                />
              </div>

              <button className="w-full bg-[#c08457] text-white py-4 rounded font-bold uppercase tracking-widest hover:bg-[#a66d43] transition-colors shadow-md">
                Add Activity to Catalog
              </button>
            </form>
          </div>
        </div>

        {/* Floating Notification */}
        {status.message && (
          <div
            className={`fixed bottom-10 right-10 px-6 py-3 rounded-lg shadow-2xl text-white font-bold z-50 transition-all ${
              status.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageActivity;

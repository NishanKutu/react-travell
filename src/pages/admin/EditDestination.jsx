import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDestinationById } from "../../api/destinationApi";

const EditDestination = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = JSON.parse(localStorage.getItem("auth"));
  const token = auth?.token;

  const [loading, setLoading] = useState(true);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    descriptions: "",
    location: "",
    price: "",
    duration: "",
    discount: 0,
    groupSize: "",
    status: "active",
    availability: [],
    isBestSeller: false,
    isNewTrip: false,
    isPromo: false,
    itinerary: [],
    inclusions: { included: [], notIncluded: [] },
  });

  // --- FIX 1: handle image delete using fetch ---
  const handleDeleteImage = async (filename) => {
    if (window.confirm("Remove this image permanently?")) {
      try {
        const response = await fetch(
          `http://localhost:8000/api/destinations/deleteimage/${id}/${filename}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok) {
          setExistingImages(existingImages.filter((img) => img !== filename));
        } else {
          throw new Error(result.message || "Failed to delete image");
        }
      } catch (error) {
        console.error("Delete Error:", error);
        alert("Error: " + error.message);
      }
    }
  };

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await getDestinationById(id);
        const data = response.data;
        setFormData({
          title: data.title || "",
          descriptions: data.descriptions || "",
          location: data.location || "",
          price: data.price || "",
          duration: data.duration || "",
          discount: data.discount || 0,
          groupSize: data.groupSize || "",
          status: data.status || "active",
          availability: data.availability || [],
          isBestSeller: data.isBestSeller || false,
          isNewTrip: data.isNewTrip || false,
          isPromo: data.isPromo || false,
          itinerary: data.itinerary || [],
          inclusions: data.inclusions || { included: [], notIncluded: [] },
        });
        setExistingImages(data.images || []);
        setLoading(false);
      } catch (error) {
        alert("Error loading destination: " + error.message);
        navigate("/admin/destinations");
      }
    };
    fetchDestination();
  }, [id, navigate]);

  const handleAvailabilityChange = (season) => {
    const current = [...formData.availability];
    if (current.includes(season)) {
      setFormData({
        ...formData,
        availability: current.filter((s) => s !== season),
      });
    } else {
      setFormData({ ...formData, availability: [...current, season] });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleItineraryChange = (index, key, value) => {
    const updated = [...formData.itinerary];
    updated[index][key] = value;
    setFormData({ ...formData, itinerary: updated });
  };

  const addItineraryDay = () => {
    setFormData({
      ...formData,
      itinerary: [
        ...formData.itinerary,
        { day: formData.itinerary.length + 1, title: "", descriptions: "" },
      ],
    });
  };

  const removeItineraryDay = (index) => {
    const updated = formData.itinerary
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, day: i + 1 }));
    setFormData({ ...formData, itinerary: updated });
  };

  const handleInclusionChange = (type, index, value) => {
    const updated = [...formData.inclusions[type]];
    updated[index] = value;
    setFormData({
      ...formData,
      inclusions: { ...formData.inclusions, [type]: updated },
    });
  };

  const addInclusion = (type) => {
    setFormData({
      ...formData,
      inclusions: {
        ...formData.inclusions,
        [type]: [...formData.inclusions[type], ""],
      },
    });
  };

  const removeInclusion = (type, index) => {
    const updated = formData.inclusions[type].filter((_, i) => i !== index);
    setFormData({
      ...formData,
      inclusions: { ...formData.inclusions, [type]: updated },
    });
  };

  // --- FIX 2: Corrected Submit URL and Header handling ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();

    // Append text fields
    const textFields = [
      "title",
      "descriptions",
      "location",
      "price",
      "duration",
      "discount",
      "groupSize",
      "isBestSeller",
      "isNewTrip",
      "isPromo",
      "status",
    ];
    textFields.forEach((field) => data.append(field, formData[field]));

    // Append JSON fields
    formData.availability.forEach((season) => {
      data.append("availability", season);
    });
    data.append("itinerary", JSON.stringify(formData.itinerary));
    data.append("inclusions", JSON.stringify(formData.inclusions));

    // Append new images
    selectedFiles.forEach((file) => data.append("images", file));

    try {
      // DIRECT FETCH CALL TO MATCH YOUR ROUTES.JS
      const response = await fetch(
        `http://localhost:8000/api/destinations/updatedestination/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            // Note: Do NOT set Content-Type header when sending FormData
          },
          body: data,
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Updated successfully!");
        navigate("/admin/destinations");
      } else {
        // This will tell us the EXACT error from your controller's catch block
        alert("Update Failed: " + (result.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network Error: Could not connect to server.");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">
        Fetching package details...
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold tracking-tight">
            Edit Travel Package
          </h2>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-slate-600 transition"
          >
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-12">
          {/* Core Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b pb-2">
              1. Core Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Trip Title
                </label>
                <input
                  name="title"
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Package Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="border p-3 rounded-md focus:ring-2 focus:ring-[#004d4d] outline-none bg-white"
                >

                  <option value="Active">Active </option>
                  <option value="Not-Active">Not-Active</option>
                </select>
              </div>

              {/* AVAILABILITY CHECKBOXES */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Availability (Seasons)
                </label>
                <div className="flex flex-wrap gap-4">
                  {["Autumn", "Spring", "Winter", "Monsoon"].map((season) => (
                    <label
                      key={season}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.availability.includes(season)}
                        onChange={() => handleAvailabilityChange(season)}
                        className="w-4 h-4 rounded border-gray-300 text-slate-800"
                      />
                      {season}
                    </label>
                  ))}
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Main Description
                </label>
                <textarea
                  name="descriptions"
                  rows="5"
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                  value={formData.descriptions}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  name="location"
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
                  Trip Badges & Promotion
                </label>
                <div className="flex flex-wrap gap-8">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="isNewTrip"
                      checked={formData.isNewTrip}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      New Trip
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Best Seller
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      name="isPromo"
                      checked={formData.isPromo}
                      onChange={handleChange}
                      className="w-4 h-4 rounded border-gray-300 text-slate-800 focus:ring-slate-500"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Promotion / Offer
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Max Group Size
                </label>
                <input
                  type="number"
                  name="groupSize"
                  className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                  value={formData.groupSize}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-3 col-span-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Duration
                  </label>
                  <input
                    name="duration"
                    className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b pb-2">
              2. Photo Gallery
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-video bg-gray-100 rounded border overflow-hidden"
                >
                  <img
                    src={`http://localhost:8000/uploads/${img}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <span className="absolute bottom-0 left-0 bg-slate-800 text-white text-[8px] px-1.5 py-0.5">
                    Live
                  </span>
                </div>
              ))}
              {previewUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative aspect-video bg-blue-50 border-blue-400 border rounded overflow-hidden"
                >
                  <img src={url} className="w-full h-full object-cover" />
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] px-1.5 py-0.5">
                    New
                  </span>
                </div>
              ))}
            </div>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
            />
          </div>

          {/* Itinerary */}
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                3. Daily Itinerary
              </h3>
              <button
                type="button"
                onClick={addItineraryDay}
                className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700"
              >
                + Add Day
              </button>
            </div>
            <div className="space-y-4">
              {formData.itinerary.map((day, i) => (
                <div
                  key={i}
                  className="group p-5 bg-gray-50 border border-gray-200 rounded-lg relative"
                >
                  <button
                    type="button"
                    onClick={() => removeItineraryDay(i)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xs font-bold"
                  >
                    ✕ Delete Day
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded">
                      DAY {day.day}
                    </span>
                    <input
                      className="flex-1 bg-transparent border-b border-gray-300 focus:border-slate-800 outline-none text-sm font-bold p-1"
                      placeholder="Activity Title"
                      value={day.title}
                      onChange={(e) =>
                        handleItineraryChange(i, "title", e.target.value)
                      }
                    />
                  </div>
                  <textarea
                    className="w-full p-3 bg-white border rounded text-sm focus:ring-2 focus:ring-slate-100 outline-none"
                    rows="3"
                    placeholder="Describe the day's events..."
                    value={day.descriptions}
                    onChange={(e) =>
                      handleItineraryChange(i, "descriptions", e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-emerald-700 tracking-tighter uppercase">
                Included
              </h4>
              {formData.inclusions.included.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 p-2 border-emerald-100 border bg-emerald-50/30 rounded text-sm outline-none focus:border-emerald-300"
                    value={item}
                    onChange={(e) =>
                      handleInclusionChange("included", i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion("included", i)}
                    className="text-emerald-300 hover:text-red-400 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addInclusion("included")}
                className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest"
              >
                + Add Item
              </button>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs font-black text-rose-700 tracking-tighter uppercase">
                Not Included
              </h4>
              {formData.inclusions.notIncluded.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    className="flex-1 p-2 border-rose-100 border bg-rose-50/30 rounded text-sm outline-none focus:border-rose-300"
                    value={item}
                    onChange={(e) =>
                      handleInclusionChange("notIncluded", i, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeInclusion("notIncluded", i)}
                    className="text-rose-300 hover:text-red-400 font-bold"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addInclusion("notIncluded")}
                className="text-[10px] font-bold text-rose-600 underline uppercase tracking-widest"
              >
                + Add Item
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-4 rounded shadow-lg hover:shadow-xl hover:translate-y-px transition-all"
          >
            SAVE ALL CHANGES
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDestination;

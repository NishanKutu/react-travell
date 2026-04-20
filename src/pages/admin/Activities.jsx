import React, { useState, useEffect, useRef } from "react";
import {
  getAllActivities,
  deleteActivity,
  updateActivity,
} from "../../api/activityApi";
import { fetchCities } from "../../api/cityApi";
import { motion, AnimatePresence } from "framer-motion";

const MotionButton = motion.button;
const MotionDiv = motion.div;
const MotionP = motion.p;

const Activities = () => {
  const [cities, setCities] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGoTop, setShowGoTop] = useState(false);
  const scrollContainerRef = useRef(null);

  const [cityPages, setCityPages] = useState({});
  const cardsPerPage = 6;

  const [status, setStatus] = useState({ message: "", type: "" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    _id: "",
    name: "",
    cost: "",
    places: "",
    description: "",
    category: "",
    preferredTime: [],
  });

  const categories = [
    "Adventure",
    "Sightseeing",
    "Cultural",
    "Relaxation",
    "Food",
  ];
  const timeSlots = ["Morning", "Afternoon", "Evening", "Any"];

  const handleEditTimeSlotToggle = (slot) => {
    setEditFormData((prev) => {
      const currentSlots = Array.isArray(prev.preferredTime)
        ? prev.preferredTime
        : [prev.preferredTime];
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

  // --- NEW SCROLL LOGIC ---
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 300) {
        setShowGoTop(true);
      } else {
        setShowGoTop(false);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cityRes, activityRes] = await Promise.all([
        fetchCities(),
        getAllActivities(),
      ]);
      if (cityRes.success) setCities(cityRes.data);
      if (activityRes.success) setActivities(activityRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.5 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const totalActivities = activities.length;
  const totalDestinations = cities.length;
  const avgCost =
    totalActivities > 0
      ? (
          activities.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0) /
          totalActivities
        ).toFixed(0)
      : 0;

  const showStatus = (msg, type) => {
    setStatus({ message: msg, type });
    setTimeout(() => setStatus({ message: "", type: "" }), 4000);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this activity?")) {
      const res = await deleteActivity(id);
      if (res.success) {
        setActivities(activities.filter((act) => act._id !== id));
        showStatus("Activity deleted successfully", "success");
      }
    }
  };

  const openEditModal = (activity) => {
    setEditFormData({
      _id: activity._id,
      name: activity.name,
      cost: activity.cost,
      places: activity.places?._id || activity.places,
      description: activity.description,
      category: activity.category,
      preferredTime: Array.isArray(activity.preferredTime)
        ? activity.preferredTime
        : [activity.preferredTime],
    });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await updateActivity(editFormData._id, {
        ...editFormData,
        cost: Number(editFormData.cost),
      });
      if (res.success) {
        setIsEditModalOpen(false);
        await loadData();
        showStatus("Activity updated successfully!", "success");
      } else {
        showStatus(res.message || "Update failed", "error");
      }
    } catch {
      showStatus("Something went wrong during update", "error");
    }
  };

  const handlePageChange = (cityId, newPage) => {
    setCityPages((prev) => ({ ...prev, [cityId]: newPage }));
  };

  if (loading) {
    return (
      <div className="p-10 text-center font-serif text-gray-500">
        Loading Catalog...
      </div>
    );
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-screen overflow-y-auto bg-gray-50 p-6 md:p-10 scroll-smooth"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-serif text-[#004d43] mb-2">
              Activity Catalog
            </h1>
            <p className="text-gray-500">
              VIew activities, categories, and areas.
            </p>
            <div className="h-1 w-20 bg-[#c08457] mt-4"></div>
          </div>
          <div className="relative w-full md:w-96">
            <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search by name, area, or category..."
              className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 focus:border-[#004d43] outline-none bg-white shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        {/* SUMMARY CARDS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl border-l-4 border-[#004d43] shadow-sm hover:shadow-md">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Total Activities
            </p>
            <h3 className="text-3xl font-bold text-gray-800">
              {totalActivities}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-[#c08457] shadow-sm hover:shadow-md">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Active Destinations
            </p>
            <h3 className="text-3xl font-bold text-gray-800">
              {totalDestinations}
            </h3>
          </div>
          <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Avg. Activity Cost
            </p>
            <h3 className="text-3xl font-bold text-gray-800">NPR {avgCost}</h3>
          </div>
        </div>

        {/* ACTIVITY GROUPS */}
        {cities.map((city) => {
          const cityActivities = activities.filter((act) => {
            const matchesCity = (act.places?._id || act.places) === city._id;
            const term = searchTerm.toLowerCase();
            return (
              matchesCity &&
              (act.name.toLowerCase().includes(term) ||
                act.category.toLowerCase().includes(term))
            );
          });
          if (cityActivities.length === 0 && searchTerm !== "") return null;
          const currentPage = cityPages[city._id] || 1;
          const totalPages = Math.ceil(cityActivities.length / cardsPerPage);
          const currentCards = cityActivities.slice(
            (currentPage - 1) * cardsPerPage,
            currentPage * cardsPerPage
          );

          return (
            <section
              key={city._id}
              className="mb-10 border-b border-gray-100 pb-4"
            >
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">
                  {city.cityname}
                </h2>
                <span className="px-3 py-1 bg-[#004d43] text-white text-xs rounded-full">
                  {cityActivities.length} Activities
                </span>
                <div className="flex-grow h-px bg-gray-200"></div>
              </div>
              <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                  {cityActivities.length > 0 ? (
                    <MotionDiv
                      key={`${city._id}-${currentPage}`}
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      exit="exit"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {currentCards.map((activity) => (
                        <MotionDiv
                          key={activity._id}
                          variants={itemVariants}
                          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-default group p-5"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-[#004d43] transition-colors">
                              {activity.name}
                            </h3>
                            <span className="text-[#c08457] font-bold">
                              NPR {activity.cost}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {activity.description || "No description provided."}
                          </p>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                            <div className="flex gap-2">
                              <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase tracking-tighter">
                                {activity.category}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 bg-[#fdf2f2] text-[#c08457] rounded uppercase flex items-center">
                                <i className="bi bi-clock-history mr-1"></i>
                                {Array.isArray(activity.preferredTime)
                                  ? activity.preferredTime.join(" & ")
                                  : activity.preferredTime || "Any"}
                              </span>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => openEditModal(activity)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button
                                onClick={() => handleDelete(activity._id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </MotionDiv>
                      ))}
                    </MotionDiv>
                  ) : (
                    <MotionP
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-gray-400 italic py-4"
                    >
                      No activities listed for {city.cityname} yet.
                    </MotionP>
                  )}
                </AnimatePresence>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(city._id, currentPage - 1)}
                    className="p-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-30 transition-all text-[#004d43]"
                  >
                    <i className="bi bi-chevron-left"></i>
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handlePageChange(city._id, index + 1)}
                      className={`w-10 h-10 rounded font-bold transition-all ${
                        currentPage === index + 1
                          ? "bg-[#004d43] text-white"
                          : "bg-white border text-gray-500 hover:border-[#004d43]"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(city._id, currentPage + 1)}
                    className="p-2 rounded border bg-white hover:bg-gray-50 disabled:opacity-30 transition-all text-[#004d43]"
                  >
                    <i className="bi bi-chevron-right"></i>
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* --- GO TO TOP BUTTON --- */}
      <AnimatePresence>
        {showGoTop && (
          <MotionButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 w-14 h-14 bg-[#004d43] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#c08457] transition-all z-[99] border-2 border-white"
          >
            <i className="bi bi-arrow-up-short text-3xl"></i>
          </MotionButton>
        )}
      </AnimatePresence>

      {/* MODAL SECTION */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 transition-all">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-700 flex items-center">
                <i className="bi bi-pencil-square mr-2 text-[#c08457]"></i> Edit
                Activity
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form
              onSubmit={handleUpdateSubmit}
              className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">
                    Target City
                  </label>
                  <select
                    name="places"
                    value={editFormData.places}
                    onChange={handleEditChange}
                    className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43]"
                  >
                    {cities.map((city) => (
                      <option key={city._id} value={city._id}>
                        {city.cityname}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">
                    Time Slot
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => handleEditTimeSlotToggle(slot)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-full border transition-all uppercase ${
                          editFormData.preferredTime.includes(slot)
                            ? "bg-[#004d43] text-white border-[#004d43]"
                            : "bg-white text-gray-500 border-gray-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-400">
                  Activity Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">
                    Cost (NPR)
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={editFormData.cost}
                    onChange={handleEditChange}
                    className="w-full border-b-2 border-gray-200 py-2 outline-none focus:border-[#004d43]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400">
                    Category
                  </label>
                  <select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
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
                <label className="block text-[10px] font-bold uppercase text-gray-400">
                  Short Description
                </label>
                <textarea
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditChange}
                  rows="3"
                  className="w-full border border-gray-100 rounded-lg p-3 outline-none focus:border-[#004d43]"
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-600 py-3 rounded font-bold uppercase hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#c08457] text-white py-3 rounded font-bold uppercase hover:bg-[#a66d43] transition-colors shadow-md"
                >
                  Update Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS TOAST */}
      {status.message && (
        <div
          className={`fixed bottom-10 right-10 px-6 py-3 rounded-lg shadow-2xl text-white font-bold z-[110] transition-all transform ${
            status.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default Activities;

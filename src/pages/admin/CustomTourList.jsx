import React, { useState, useEffect } from "react";
import { getAllCustomTours, deleteCustomTour } from "../../api/customTourApi";

const CustomTourList = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", type: "" });

  useEffect(() => {
    loadTours();
  }, []);

  const loadTours = async () => {
    try {
      const res = await getAllCustomTours();
      if (res.success) setTours(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRouteSummary = (itinerary) => {
    if (!itinerary || itinerary.length === 0) return "No Route";
    const cities = itinerary
      .map((day) => day.destinationCity?.cityname || "Unknown")
      .filter((city, index, self) => self.indexOf(city) === index); 
    return cities.join(" → ");
  };

  const getDateRange = (itinerary) => {
    if (!itinerary || itinerary.length === 0) return "N/A";
    const options = { month: "short", day: "numeric" };
    const start = new Date(itinerary[0].bookingDate).toLocaleDateString(
      undefined,
      options
    );

    if (itinerary.length === 1) return start;

    const end = new Date(
      itinerary[itinerary.length - 1].bookingDate
    ).toLocaleDateString(undefined, {
      ...options,
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this booking?")) {
      const res = await deleteCustomTour(id);
      if (res.success) {
        setTours(tours.filter((t) => t._id !== id));
        setStatus({ message: "Tour deleted successfully", type: "success" });
      } else {
        setStatus({ message: "Failed to delete", type: "error" });
      }
      setTimeout(() => setStatus({ message: "", type: "" }), 3000);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center font-serif text-gray-500">
        Loading Bookings...
      </div>
    );

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-serif text-[#004d43] mb-2">
            Custom Itineraries
          </h1>
          <p className="text-gray-500">
            Manage all user-generated custom tour bookings.
          </p>
          <div className="h-1 w-20 bg-[#c08457] mt-4"></div>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">
                  User
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">
                  Route
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">
                  Schedule
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-center">
                  Days
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">
                  Total Price
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-gray-400 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tours.map((tour) => (
                <tr
                  key={tour._id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800">
                      {tour.userId?.username || "Guest"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {tour.userId?.email}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-700">
                      {getRouteSummary(tour.itinerary)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-[#c08457] uppercase tracking-tighter">
                      {getDateRange(tour.itinerary)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">
                      {tour.itinerary.length}d
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#004d43]">
                    NPR {tour.totalPrice}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        tour.status === "booked"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {tour.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        title="View Details"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(tour._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {tours.length === 0 && (
            <div className="p-10 text-center text-gray-400 italic">
              No custom tours found.
            </div>
          )}
        </div>
      </div>

      {status.message && (
        <div
          className={`fixed bottom-10 right-10 px-6 py-3 rounded-lg shadow-2xl text-white font-bold z-50 ${
            status.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
};

export default CustomTourList;

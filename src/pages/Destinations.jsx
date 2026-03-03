import React, { useState, useEffect } from "react";
import DestinationCard from "../components/DestinationCard";
import { getAllDestinations } from "../api/destinationApi";
import { useSearchParams } from "react-router-dom";

const Destination = () => {
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams(); // Added setSearchParams to clear URL if needed
  const locationQuery = searchParams.get("location");

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await getAllDestinations();
        setTours(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching destinations:", error);
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // --- Unified Filter Logic ---
  useEffect(() => {
    let result = tours;

    // 1. Filter by Sidebar Checkboxes
    if (selectedLocations.length > 0) {
      result = result.filter((tour) =>
        selectedLocations.includes(tour.location)
      );
    }
    // 2. Filter by Search Query from Home Page (if no sidebar filters are active)
    else if (locationQuery) {
      result = result.filter(
        (tour) =>
          tour.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
          tour.title.toLowerCase().includes(locationQuery.toLowerCase())
      );
    }

    setFilteredTours(result);
    setCurrentPage(1);
  }, [selectedLocations, tours, locationQuery]); // locationQuery is now a dependency

  const uniqueLocations = [...new Set(tours.map((tour) => tour.location))];

  const handleLocationChange = (location) => {
    // If user starts using sidebar, clear the URL search param for better UX
    if (locationQuery) {
      setSearchParams({});
    }

    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const clearFilters = () => {
    setSelectedLocations([]);
    setSearchParams({}); // Clear URL query as well
  };

  // --- Pagination Logic ---
  const toursPerPage = 4;
  const indexOfLastTour = currentPage * toursPerPage;
  const indexOfFirstTour = indexOfLastTour - toursPerPage;
  const currentTours = filteredTours.slice(indexOfFirstTour, indexOfLastTour);
  const totalPages = Math.ceil(filteredTours.length / toursPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[50vh] italic text-gray-500">
        Finding your next adventure...
      </div>
    );

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col md:flex-row gap-10 font-sans text-gray-800">
        {/* --- SIDEBAR FILTER --- */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-32">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-400">
                Filter By
              </h2>
              {(selectedLocations.length > 0 || locationQuery) && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 py-6 space-y-4">
              <p className="text-xs font-bold uppercase text-gray-800 mb-2">
                Location
              </p>
              {uniqueLocations.length > 0 ? (
                uniqueLocations.map((loc) => (
                  <label
                    key={loc}
                    className="flex items-center text-sm text-gray-500 cursor-pointer hover:text-[#004d4d] group transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedLocations.includes(loc)}
                      onChange={() => handleLocationChange(loc)}
                      className="mr-3 w-4 h-4 border-gray-300 rounded accent-[#004d4d]"
                    />
                    <span
                      className={
                        selectedLocations.includes(loc)
                          ? "text-black font-bold"
                          : ""
                      }
                    >
                      {loc}
                    </span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-gray-400 italic">
                  No locations available
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="grow">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 pb-4 border-b border-gray-50">
            <h1 className="text-3xl font-serif mb-2 md:mb-0">
              {locationQuery
                ? `Results for "${locationQuery}"`
                : "All Destinations"}
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
              Showing {filteredTours.length > 0 ? indexOfFirstTour + 1 : 0}-
              {Math.min(indexOfLastTour, filteredTours.length)} of{" "}
              {filteredTours.length} Experiences
            </p>
          </div>

          {filteredTours.length === 0 ? (
            <div className="text-center py-32 bg-gray-50 rounded-sm border border-dashed border-gray-200">
              <p className="text-gray-400 font-light italic">
                We couldn't find any trips matching your criteria.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 text-[#004d4d] font-bold text-xs uppercase underline tracking-tighter"
              >
                View all packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {currentTours.map((tour) => (
                <DestinationCard
                  key={tour._id}
                  tour={{
                    ...tour,
                    image: tour.images[0],
                    bestSeller: tour.isBestSeller,
                    promo: tour.isPromo ? "PROMO" : null,
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-20 flex justify-center items-center gap-4">
              <button
                disabled={currentPage === 1}
                onClick={() => paginate(currentPage - 1)}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-20 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-[#004d4d] text-white shadow-lg"
                        : "text-gray-400 hover:text-black hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => paginate(currentPage + 1)}
                className="p-2 border border-gray-200 rounded-full disabled:opacity-20 hover:bg-gray-50 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Destination;

import React, { useState, useEffect } from 'react';
// import PopularDestination from '../components/PopularDestination';
import DestinationCard from '../components/DestinationCard';
import { getAllDestinations } from '../api/destinationApi';

const Destination = () => {
    const [tours, setTours] = useState([]);
    const [filteredTours, setFilteredTours] = useState([]); 
    const [selectedLocations, setSelectedLocations] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await getAllDestinations();
                setTours(response.data);
                setFilteredTours(response.data); // Initially show all
                setLoading(false);
            } catch (error) {
                console.error("Error fetching destinations:", error);
                setLoading(false);
            }
        };
        fetchTours();
    }, []);

    // --- Filter Logic ---
    useEffect(() => {
        if (selectedLocations.length === 0) {
            setFilteredTours(tours);
        } else {
            const filtered = tours.filter(tour => 
                selectedLocations.includes(tour.location)
            );
            setFilteredTours(filtered);
        }
        setCurrentPage(1); // Reset to page 1 when filter changes
    }, [selectedLocations, tours]);

    // Extract Unique Locations for the sidebar
    const uniqueLocations = [...new Set(tours.map(tour => tour.location))];

    const handleLocationChange = (location) => {
        setSelectedLocations(prev => 
            prev.includes(location) 
                ? prev.filter(l => l !== location) 
                : [...prev, location]
        );
    };

    const clearFilters = () => setSelectedLocations([]);

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

    if (loading) return <div className="text-center py-20 font-sans">Loading destinations...</div>;

    return (
        <>
            {/* <PopularDestination /> */}
            <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-10 font-sans text-gray-800">
                
                {/* --- SIDEBAR FILTER --- */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-xl font-bold">Filter By Location:</h2>
                        <button 
                            onClick={clearFilters}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Clear all
                        </button>
                    </div>

                    <div className="border-t border-gray-200 py-4 space-y-3">
                        {uniqueLocations.length > 0 ? (
                            uniqueLocations.map((loc) => (
                                <label key={loc} className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-black transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedLocations.includes(loc)}
                                        onChange={() => handleLocationChange(loc)}
                                        className="mr-3 w-4 h-4 rounded border-gray-300 accent-gray-800"
                                    />
                                    {loc}
                                </label>
                            ))
                        ) : (
                            <p className="text-xs text-gray-400 italic">No locations found</p>
                        )}
                    </div>
                </aside>

                {/* --- MAIN CONTENT --- */}
                <main className="grow">
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-gray-500 text-sm italic">
                            Showing {filteredTours.length > 0 ? indexOfFirstTour + 1 : 0}-{Math.min(indexOfLastTour, filteredTours.length)} of {filteredTours.length} Trips
                        </p>
                    </div>

                    {filteredTours.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="text-gray-400">No trips found for the selected location.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                            {currentTours.map((tour) => (
                                <DestinationCard 
                                    key={tour._id} 
                                    tour={{
                                        ...tour,
                                        image: tour.images[0],
                                        bestSeller: tour.isBestSeller,
                                        promo: tour.isPromo ? "PROMO" : null
                                    }} 
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination - Only show if more than 1 page */}
                    {totalPages > 1 && (
                        <div className="mt-12 flex justify-center items-center gap-2">
                            <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="px-4 py-2 border rounded disabled:opacity-30">Prev</button>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => paginate(i + 1)} className={`w-10 h-10 rounded border ${currentPage === i + 1 ? 'bg-gray-800 text-white' : ''}`}>{i + 1}</button>
                            ))}
                            <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="px-4 py-2 border rounded disabled:opacity-30">Next</button>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
};

export default Destination;
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import PopularDestination from '../components/PopularDestination';
import { tours } from '../data/toursData';
import DestinationCard from '../components/DestinationCard';


const Destination = () => {

    const [openRegion, setOpenRegion] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const toursPerPage = 4;
    const indexOfLastTour = currentPage * toursPerPage;
    const indexOfFirstTour = indexOfLastTour - toursPerPage;
    const currentTours = tours.slice(indexOfFirstTour, indexOfLastTour);
    const totalPages = Math.ceil(tours.length / toursPerPage);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo(0, 0);
    };

    const regionData = [
        {
            name: 'Asia',
            countries: ['Bali', 'China', 'Hong Kong SAR', 'India', 'Japan', 'Singapore', 'Sri Lanka', 'Taiwan', 'Thailand', 'Vietnam']
        },
        {
            name: 'Europe',
            countries: ['France', 'Italy', 'Portugal', 'Spain']
        },
        {
            name: 'South America',
            countries: ['Argentina', 'Brazil', 'Peru']
        },
        {
            name: 'Africa & Middle East',
            countries: ['Egypt', 'Jordan', 'Morocco', 'South Africa']
        }
    ];

    const toggleRegion = (regionName) => {
        setOpenRegion(openRegion === regionName ? null : regionName);
    };

    return (
        <>
            <PopularDestination />
            <div className="max-w-7xl mx-auto px-4 py-10  flex flex-col md:flex-row gap-10 font-sans text-gray-800">
                <aside className="w-full md:w-64 shrink-0">
                    <div className="flex justify-between items-end mb-6">
                        <h2 className="text-xl font-bold">Filter:</h2>
                        <button className="text-sm text-black hover:underline">Clear all</button>
                    </div>

                    {/* Regions Dropdown Sections */}
                    {regionData.map((region) => (
                        <div key={region.name} className="border-t border-gray-200">
                            <button
                                onClick={() => toggleRegion(region.name)}
                                className="w-full py-4 flex justify-between items-center text-gray-500 hover:text-black transition-colors group"
                            >
                                <span className={`font-medium ${openRegion === region.name ? 'text-black' : ''}`}>
                                    {region.name}
                                </span>
                                <span className={`text-xl transition-transform duration-200 ${openRegion === region.name ? 'rotate-90 text-black' : ''}`}>
                                    &rsaquo;
                                </span>
                            </button>
                            {openRegion === region.name && (
                                <div className="pb-4 pl-1 space-y-2">
                                    {region.countries.map((country) => (
                                        <label key={country} className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-black">
                                            <input
                                                type="checkbox"
                                                className="mr-3 w-4 h-4 rounded border-gray-300 accent-gray-800"
                                            />
                                            {country}
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="border-t border-gray-200 py-4 mt-2">
                        <div className="flex justify-between items-center text-gray-500 font-medium cursor-pointer hover:text-black">
                            Trip Types <span className="text-xl">&rsaquo;</span>
                        </div>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="grow">
                    <div className="flex justify-between items-center mb-8">
                        <p className="text-gray-500 text-sm italic">
                            Showing {indexOfFirstTour + 1}-{Math.min(indexOfLastTour, tours.length)} of {tours.length} {tours.length === 1 ? 'Trip' : 'Trips'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 grid-auto-rows-fr items-stretch">
                        {currentTours.map((tour) => (
                            <DestinationCard key={tour.id} tour={tour} />
                        ))}
                    </div>
                    <div className="mt-12 flex justify-center items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => paginate(currentPage - 1)}
                            className="px-4 py-2 border rounded disabled:opacity-30 hover:bg-gray-50"
                        >
                            Prev
                        </button>
                        {[...Array(totalPages)].map((_, index) => (
                            <button
                                key={index + 1}
                                onClick={() => paginate(index + 1)}
                                className={`w-10 h-10 rounded border ${currentPage === index + 1 ? 'bg-gray-800 text-white' : 'hover:bg-gray-50'}`}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => paginate(currentPage + 1)}
                            className="px-4 py-2 border rounded disabled:opacity-30 hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Destination;
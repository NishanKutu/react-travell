import React, { useState } from 'react';
import PopularDestination from '../components/PopularDestination';
import yangtzeImg from '../assets/img/Yangtze.webp';
import bridgeImg from '../assets/img/bridge.jpg';
import pandaImg from '../assets/img/panda.png';
import indiaImg from '../assets/img/India.webp';
import templeImg from '../assets/img/temple.jpg';
import deerImg from '../assets/img/deer.webp';
import desert from '../assets/img/Desert.jpg';


const Destination = () => {

    const [openRegion, setOpenRegion] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const toursPerPage = 4;

    const [tours] = useState([
        {
            id: 1,
            code: 'RAJ',
            title: 'Best Of Japan',
            duration: '9 Days 7 Nights',
            cities: 'Tokyo · Kyoto · Nara · Osaka',
            price: 2949,
            promo: 'SAVE $150 ON 2026 DATES',
            image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
            bestSeller: true,
        },
        {
            id: 2,
            code: 'RDY',
            title: 'Yangtze Essence',
            duration: '13 Days 11 Nights',
            cities: 'Beijing · Xian · Chongqing · Yangtze River · Yichang · Shanghai',
            price: 3250,
            promo: 'SAVE $350 ON 2026 DATES',
            image: yangtzeImg,
            bestSeller: true,
        },
        {
            id: 3,
            code: 'CDN',
            title: 'Gems of Europe',
            duration: '12 Days 10 Nights',
            cities: 'London · Paris · Lucrene · Milan · Venice · Montecatini',
            price: 2900,
            promo: 'SAVE $550 ON 2026 DATES',
            image: bridgeImg,
            bestSeller: true,
        },
        {
            id: 4,
            code: 'EBC',
            title: 'Classic China',
            duration: '12 Days 11 Nights',
            cities: 'Beijing · Xian · Chengdu · Shanghai',
            price: 3050,
            promo: 'SAVE $350 ON 2026 DATES',
            image: pandaImg,
            bestSeller: true,
        },
        {
            id: 5,
            code: 'DRD',
            title: 'Majestic India & Scenic Sri Lanka',
            duration: '15 Days 14 Nights',
            cities: 'Delhi · Varanasi · Delhi · Agra · Jaipur · Mumbai · Colombo · Negombo · Dambulla · Kanady · Nuwara eliya · Colombo',
            price: 8500,
            image: templeImg,
            bestSeller: true,
        },
        {
            id: 6,
            code: 'CNB',
            title: 'Magical Kenya Safari',
            duration: '9 Days 8 Nights',
            cities: 'Nairobi · Aberdare National Park · Shaba National Reserve · Lake Nakuru National Park · Masai Mara National Reserve · Nairobi',
            price: 3700,
            promo: 'SAVE $200 ON 2026 DATES',
            image: deerImg,
            newTrip: true,
        },
        {
            id: 7,
            code: 'CBZ',
            title: 'Egypt & Jordan',
            duration: '15 Days 14 Nights',
            cities: 'Cairo · Luxor · Nile Cruise · Esna · Edfu · Kom ombo · Aswan · Cairo · Amman · Jerash · Petra · Wadi rum · Amman',
            price: 4550,
            promo: 'SAVE $300 ON 2026 DATES',
            image: desert,
            newTrip: true,
        },
        {
            id: 8,
            code: 'RCB',
            title: 'India',
            duration: '8 Days 7 Nights',
            cities: 'Delhi · Mumbai · Jaipur · Agra · Goa · Rishikesh',
            price: 4500,
            promo: 'SAVE $150 ON 2026 DATES',
            image: indiaImg,
            bestSeller: true,
        },

    ]);

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
            <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-10 font-sans text-gray-800">

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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {currentTours.map((tour) => (
                            <TourCard key={tour.id} tour={tour} />
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

const TourCard = ({ tour }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
            <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                    src={tour.image}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {tour.bestSeller && (
                    <div className="absolute top-4 left-4 bg-white rounded-full w-14 h-14 border border-dashed border-gray-400 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[9px] font-extrabold leading-tight uppercase text-gray-700">Best<br />Seller</span>
                    </div>
                )}

                {tour.newTrip && (
                    <div className="absolute top-4 left-4 bg-white rounded-full w-14 h-14 border border-dashed border-gray-400 flex flex-col items-center justify-center text-center shadow-sm">
                        <span className="text-[9px] font-extrabold leading-tight uppercase text-gray-700">New<br />Trip</span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-xl font-bold border-b-2 border-white pb-1">View tour &rsaquo;</span>
                </div>

                {tour.promo && (
                    <div className="absolute bottom-0 w-full bg-[#1b4d4b] text-white text-[10px] font-bold py-2.5 px-4 tracking-wider uppercase ">
                        {tour.promo}
                    </div>
                )}
            </div>

            <div className="p-6">
                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase">
                    Code: {tour.code}
                </span>
                <h3 className="text-2xl sm:text-3xl mt-3 mb-1 font-serif text-gray-900 leading-tight">{tour.title}</h3>
                <p className="font-bold text-sm text-gray-800">{tour.duration}</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">{tour.cities}</p>

                <hr className="my-5 border-gray-100" />

                <div className="flex items-baseline gap-1">
                    <span className="font-bold text-lg text-gray-900">From ${tour.price}</span>
                    <span className="text-[10px] font-normal text-gray-400 uppercase">per person</span>
                </div>
            </div>
        </div>
    );
};

export default Destination;
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tours } from '../data/toursData';

const PackageDetail = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('itinerary');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Find the specific tour based on the ID in the URL
    const tour = tours.find((item) => item.id === parseInt(id));

    // Handle case where ID doesn't exist
    if (!tour) {
        return <div className="text-center py-20 text-2xl">Tour Not Found</div>;
    }

    return (
        <div className="bg-white min-h-screen font-sans">
            {/* 1. Hero Image */}
            <div className="relative h-[50vh] w-full">
                <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white">
                    <h1 className="text-5xl font-serif italic mb-2">{tour.title}</h1>
                    <p className="text-xl tracking-widest uppercase">{tour.duration}</p>
                </div>
            </div>

            {/* 2. Sticky Info Bar */}
            <div className="sticky top-0 z-40 bg-white border-b shadow-sm py-4 px-5 md:px-32 flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Price starting from</p>
                    <p className="text-2xl font-bold text-[#004d4d]">${tour.price}</p>
                </div>
                <button className="bg-[#004d4d] text-white px-10 py-3 rounded-md font-bold hover:bg-[#003333] transition-all">
                    BOOK NOW
                </button>
            </div>

            {/* 3. Navigation Tabs */}
            <div className="flex justify-center border-b bg-gray-50 sticky top-[73px] z-30">
                {['Overview', 'Itinerary', 'Inclusions'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === tab.toLowerCase()
                                ? 'border-b-2 border-[#004d4d] text-[#004d4d]'
                                : 'text-gray-400 hover:text-black'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* 4. Content Section */}
            <div className="max-w-6xl mx-auto py-12 px-6">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="grid grid-cols-2 gap-4">
                            {tour.gallery ? (
                                tour.gallery.map((img, index) => (
                                    <div key={index} className={`relative overflow-hidden rounded-lg shadow-md ${index === 0 ? 'col-span-2 h-72' : 'h-48'}`}>
                                        <img src={img} alt={`Step ${index + 1}`} className="w-full h-full object-cover hover:scale-105 transition-all" />
                                        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-[10px] px-2 py-1 rounded uppercase font-bold">
                                            Step {index + 1}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 bg-gray-100 h-96 flex items-center justify-center rounded-lg border-2 border-dashed text-gray-400">
                                    Gallery images coming soon
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-4xl font-serif">Experience {tour.title}</h2>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                {tour.fullDescription || "Embark on an unforgettable journey through breathtaking landscapes."}
                            </p>
                            <div className="grid grid-cols-2 gap-6 pt-6 border-t">
                                <div><h4 className="text-xs font-bold uppercase text-gray-400">Destinations</h4><p>{tour.cities}</p></div>
                                <div><h4 className="text-xs font-bold uppercase text-gray-400">Trip Type</h4><p>{tour.category || 'Discovery'}</p></div>
                                <div><h4 className="text-xs font-bold uppercase text-gray-400">Code</h4><p>{tour.code}</p></div>
                                <div><h4 className="text-xs font-bold uppercase text-gray-400">Group Size</h4><p>15 People</p></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ITINERARY TAB */}
                {activeTab === 'itinerary' && (
                    <div className="space-y-12">
                        <h2 className="text-4xl font-serif border-b pb-4">Itinerary at a glance</h2>
                        {tour.itinerary ? (
                            tour.itinerary.map((item) => (
                                <div key={item.day} className="flex gap-8 group">
                                    <div className="flex flex-col items-center">
                                        <div className="w-14 h-14 rounded-full border-2 border-[#004d4d] flex flex-col items-center justify-center bg-white group-hover:bg-[#004d4d] group-hover:text-white transition-colors">
                                            <span className="text-[10px] font-bold uppercase leading-none">Day</span>
                                            <span className="text-lg font-bold">{item.day}</span>
                                        </div>
                                        <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                                    </div>
                                    <div className="pb-12">
                                        <h3 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">No itinerary data available.</p>
                        )}
                    </div>
                )}

                {/* INCLUSIONS TAB */}
                {activeTab === 'inclusions' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-2xl font-serif mb-6 text-[#004d4d]">What's Included</h3>
                            <ul className="space-y-4">
                                {tour.inclusions?.map((inc, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-green-600">✓</span>
                                        <span className="text-gray-700">{inc}</span>
                                    </li>
                                )) || <li className="text-gray-400">Inclusions list coming soon.</li>}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif mb-6 text-red-800">What's Not Included</h3>
                            <ul className="space-y-4">
                                {tour.exclusions?.map((exc, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <span className="text-red-600">✕</span>
                                        <span className="text-gray-700">{exc}</span>
                                    </li>
                                )) || <li className="text-gray-400">Exclusions list coming soon.</li>}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageDetail;
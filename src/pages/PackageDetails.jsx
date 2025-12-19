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
                    <h1 className="text-5xl font-serif italic mb-2 animate-pop-up">{tour.title}</h1>
                    <p className="text-xl tracking-widest uppercase animate-pop-up">{tour.duration}</p>
                </div>
            </div>

            {/* 2. Sticky Info Bar */}
            <div className="sticky top-18 z-40 bg-white border-b shadow-sm py-4 px-5 md:px-32 flex justify-between items-center">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Price starting from</p>
                    <p className="text-2xl font-bold text-[#004d4d]">${tour.price}</p>
                </div>
                <button className="bg-[#004d4d] text-white px-10 py-3 rounded-md font-bold hover:bg-[#003333] transition-all">
                    BOOK NOW
                </button>
            </div>

            {/* 3. Navigation Tabs */}
            <div className="flex justify-center border-b bg-gray-50 sticky top-36.25 z-30">
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
            <div className="max-w-5xl mx-auto py-12 px-6">
                {activeTab === 'itinerary' && (
                    <div className="space-y-12">
                        <div className="flex justify-between items-end border-b pb-4">
                            <h2 className="text-4xl font-serif">Itinerary at a glance</h2>
                            <button className="text-[#004d4d] font-bold text-sm underline">Print Itinerary</button>
                        </div>
                        
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
                                        <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic">Itinerary details for this tour are coming soon.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PackageDetail;
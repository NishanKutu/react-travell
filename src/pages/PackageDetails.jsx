import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDestinationById } from "../api/destinationApi";
import BookingPage from './BookingPage';

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isOpen, setIsOpen] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const IMG_URL = "http://localhost:8000/uploads";

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchTour = async () => {
      try {
        const response = await getDestinationById(id);
        setTour(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching package:", error);
        setLoading(false);
      }
    };
    fetchTour();
  }, [id]);

  const openLightbox = (index) => {
    setCurrentImgIndex(index);
    setIsOpen(true);
  };

  if (loading)
    return (
      <div className="text-center py-20 italic text-gray-500">
        Loading adventure details...
      </div>
    );
  if (!tour)
    return (
      <div className="text-center py-20 text-2xl font-serif">
        Package Not Found
      </div>
    );

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* 1. Hero Image */}
      <div className="relative h-[60vh] w-full group overflow-hidden">
        <img
          src={
            tour.images?.[0]
              ? `${IMG_URL}/${tour.images[0]}`
              : "/placeholder.jpg"
          }
          alt={tour.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
          <div className="text-center px-4">
            {/* Dynamic Badges Container */}
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
              {/* Status Label */}
              {tour.status && (
                <div
                  className={`px-4 py-2 text-[10px] font-black rounded-sm uppercase tracking-widest shadow-2xl ${
                    tour.status.toLowerCase().includes("active") &&
                    !tour.status.toLowerCase().includes("not")
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  {tour.status.toLowerCase().includes("active") &&
                  !tour.status.toLowerCase().includes("not")
                    ? "● Trip Active"
                    : "● Not-Active"}
                </div>
              )}
              {tour.isBestSeller && (
                <div className="bg-white text-black text-[10px] font-black px-4 py-3 rounded-bl-full uppercase tracking-tighter shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                  Best Seller
                </div>
              )}

              {tour.isNewTrip && (
                <div className="bg-[#004d4d] text-white text-[10px] font-black px-4 py-3 rounded-bl-full uppercase tracking-tighter shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  New Trip
                </div>
              )}

              {tour.isPromo && (
                <div className="bg-rose-600 text-white text-[10px] font-black px-4 py-3 rounded-bl-full uppercase tracking-tighter shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Promo Active
                </div>
              )}
            </div>
            <h1 className="text-4xl md:text-6xl font-serif italic mb-2 drop-shadow-lg">
              {tour.title}
            </h1>
            {/* DURATION & SEASONS CONTAINER */}
            <div className="flex flex-col items-center gap-3">
              <p className="text-lg md:text-xl tracking-[0.3em] uppercase font-light opacity-90 border-b border-white/30 pb-2">
                {tour.duration}
              </p>

              {/* Dynamic Season Badges */}
              <div className="flex gap-2">
                {(() => {
                  // Logic to ensure 'seasons' is always an array
                  let seasons = [];
                  if (Array.isArray(tour.availability)) {
                    seasons = tour.availability;
                  } else if (typeof tour.availability === "string") {
                    try {
                      seasons = JSON.parse(tour.availability);
                    } catch (e) {
                      seasons = [tour.availability]; // Fallback if it's just a single string
                    }
                  }

                  return seasons.map((season) => (
                    <span
                      key={season}
                      className="text-[9px] border border-white/60 px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/10 backdrop-blur-sm"
                    >
                      {season}
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Sticky Info Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm py-4 px-5 md:px-32 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Price
          </p>
          <p className="text-2xl font-bold text-[#004d4d]">
            ${tour.price}
            {tour.discount > 0 && (
              <span className="text-sm text-rose-500 line-through ml-2 font-normal">
                ${Math.round(tour.price * (1 + tour.discount / 100))}
              </span>
            )}
          </p>
        </div>
        <button className="bg-[#004d4d] text-white px-8 md:px-12 py-3 rounded-sm font-bold hover:bg-black transition-all text-sm tracking-widest" onClick={() => navigate(`/booking/${tour._id}`)}>
          RESERVE NOW
        </button>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex justify-center border-b bg-gray-50 sticky top-18.25 z-30">
        {["Overview", "Itinerary", "Inclusions"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.toLowerCase()
                ? "border-b-2 border-[#004d4d] text-[#004d4d]"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Content Section */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Image Grid - Mapping tour.images */}
            <div className="grid grid-cols-2 gap-4">
              {tour.images?.map((img, index) => {
                if (index > 4) return null; // Only show first 5
                const isLastVisible = index === 4;
                const hasMore = tour.images.length > 5;

                return (
                  <div
                    key={index}
                    onClick={() => openLightbox(index)}
                    className={`relative overflow-hidden cursor-pointer group 
                                            ${
                                              index === 0
                                                ? "col-span-2 h-80"
                                                : "h-48"
                                            }`}
                  >
                    <img
                      src={`${IMG_URL}/${img}`}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {isLastVisible && hasMore && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-3xl font-light">
                          +{tour.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="space-y-8">
              <div className="inline-block border-l-4 border-[#004d4d] pl-4">
                <h2 className="text-4xl font-serif text-gray-800">
                  The Experience
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg font-light">
                {tour.descriptions}
              </p>
              <div className="grid grid-cols-2 gap-y-8 pt-8 border-t border-gray-100">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">
                    Location
                  </h4>
                  <p className="text-gray-800 font-medium">{tour.location}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">
                    Season:
                  </h4>
                  <p className="text-gray-800 font-medium capitalize">
                    {(() => {
                      let seasons = [];
                      // 1. Handle actual Array
                      if (Array.isArray(tour.availability)) {
                        seasons = tour.availability;
                      }
                      // 2. Handle stringified JSON array
                      else if (
                        typeof tour.availability === "string" &&
                        tour.availability.startsWith("[")
                      ) {
                        try {
                          seasons = JSON.parse(tour.availability);
                        } catch (e) {
                          seasons = [];
                        }
                      }
                      // 3. Handle single string value
                      else if (tour.availability) {
                        seasons = [tour.availability];
                      }
                      
                      return seasons.length > 0
                        ? seasons.join(" & ")
                        : "Year Round";
                    })()}
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">
                    Group Size
                  </h4>
                  <p className="text-gray-800 font-medium">
                    {tour.groupSize} Guests
                  </p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-gray-400 tracking-widest mb-1">
                    Current Status
                  </h4>
                  <p
                    className={`font-bold uppercase text-xs ${
                      tour.status?.toLowerCase().includes("active") &&
                      !tour.status?.toLowerCase().includes("not")
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {tour.status?.toLowerCase().includes("active") &&
                    !tour.status?.toLowerCase().includes("not")
                      ? "Active"
                      : "Not-Active"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === "itinerary" && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-serif mb-12 text-center">
              Your Journey
            </h2>
            <div className="space-y-2">
              {tour.itinerary?.map((item) => (
                <div key={item.day} className="flex gap-8 group">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:border-[#004d4d] transition-colors">
                      <span className="text-sm font-bold">{item.day}</span>
                    </div>
                    <div className="w-px h-full bg-gray-100 group-last:bg-transparent"></div>
                  </div>
                  <div className="pb-12 pt-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 tracking-tight uppercase">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed font-light">
                      {item.descriptions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INCLUSIONS TAB */}
        {activeTab === "inclusions" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 p-10 rounded-sm">
            <div>
              <h3 className="text-xl font-serif mb-8 text-[#004d4d] uppercase tracking-widest">
                Included Services
              </h3>
              <ul className="space-y-4">
                {tour.inclusions?.included.map((inc, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-sm text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-serif mb-8 text-rose-900 uppercase tracking-widest">
                Exclusions
              </h3>
              <ul className="space-y-4">
                {tour.inclusions?.notIncluded.map((exc, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-sm text-gray-500 italic"
                  >
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>
                    {exc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-100 bg-black flex items-center justify-center p-4">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-8 right-8 text-white text-2xl hover:scale-125 transition-transform"
          >
            &times;
          </button>
          <button
            onClick={() =>
              setCurrentImgIndex(
                (currentImgIndex + tour.images.length - 1) % tour.images.length
              )
            }
            className="absolute left-8 text-white text-3xl hover:text-emerald-400"
          >
            &#10094;
          </button>
          <div className="relative">
            <img
              src={`${IMG_URL}/${tour.images[currentImgIndex]}`}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl"
              alt="Lightbox"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/50 text-xs tracking-widest uppercase">
              {currentImgIndex + 1} / {tour.images.length}
            </div>
          </div>
          <button
            onClick={() =>
              setCurrentImgIndex((currentImgIndex + 1) % tour.images.length)
            }
            className="absolute right-8 text-white text-3xl hover:text-emerald-400"
          >
            &#10095;
          </button>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;

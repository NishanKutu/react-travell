import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDestinationById } from "../api/destinationApi";

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
        const tourData = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setTour(tourData);
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
      <div className="flex items-center justify-center min-h-screen italic text-gray-500">
        Loading adventure details...
      </div>
    );

  if (!tour)
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-serif">
        Package Not Found
      </div>
    );

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Hero Image Section */}
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
            <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
              {tour.status && (
                <div
                  className={`px-4 py-2 text-[10px] font-black rounded-sm uppercase tracking-widest shadow-2xl ${
                    tour.status.toLowerCase().includes("active") &&
                    !tour.status.toLowerCase().includes("not")
                      ? "bg-emerald-600 text-white"
                      : "bg-red-600 text-white"
                  }`}
                >
                  ●{" "}
                  {tour.status.toLowerCase().includes("active") &&
                  !tour.status.toLowerCase().includes("not")
                    ? "Trip Active"
                    : "Not-Active"}
                </div>
              )}
              {tour.isBestSeller && (
                <div className="bg-white text-black text-[10px] font-black px-4 py-3 rounded-bl-full uppercase tracking-tighter shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>{" "}
                  Best Seller
                </div>
              )}
              {tour.isNewTrip && (
                <div className="bg-[#004d4d] text-white text-[10px] font-black px-4 py-3 rounded-bl-full uppercase tracking-tighter shadow-xl flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>{" "}
                  New Trip
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-serif italic mb-2 drop-shadow-lg">
              {tour.title}
            </h1>

            <div className="flex items-center justify-center gap-2 mt-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i}>
                    {i < Math.round(tour.averageRating || 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span className="text-sm font-bold text-white">
                {tour.averageRating ? tour.averageRating.toFixed(1) : "New"}
                {tour.totalReviews > 0 && ` (${tour.totalReviews})`}
              </span>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-lg md:text-xl tracking-[0.3em] uppercase font-light opacity-90 border-b border-white/30 pb-2">
                {tour.duration}
              </p>
              <div className="flex gap-2">
                {Array.isArray(tour.availability) &&
                  tour.availability.map((season) => (
                    <span
                      key={season}
                      className="text-[9px] border border-white/60 px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/10 backdrop-blur-sm"
                    >
                      {season}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Info Bar */}
      <div className="sticky top-0 z-40 bg-white border-b shadow-sm py-4 px-5 md:px-32 flex justify-between items-center">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Price
          </p>
          <p className="text-2xl font-bold text-[#004d4d]">
            Rs {tour.price}
            {tour.discount > 0 && (
              <span className="text-sm text-rose-500 line-through ml-2 font-normal">
                Rs {Math.round(tour.price * (1 + tour.discount / 100))}
              </span>
            )}
          </p>
        </div>
        <button
          className="bg-[#004d4d] text-white px-8 md:px-12 py-3 rounded-sm font-bold hover:bg-black transition-all text-sm tracking-widest"
          onClick={() => navigate(`/booking/${tour._id}`)}
        >
          RESERVE NOW
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center border-b bg-gray-50 sticky top-[72px] z-30">
        {["Overview", "Itinerary", "Inclusions", "Reviews"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-8 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${
              activeTab === tab.toLowerCase()
                ? "border-b-2 border-[#004d4d] text-[#004d4d]"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {tab}{" "}
            {tab === "Reviews" &&
              tour.totalReviews > 0 &&
              `(${tour.totalReviews})`}
          </button>
        ))}
      </div>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto py-16 px-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* GALLERY: Hero + Thumbs Grid */}
            <div className="space-y-4">
              <div
                className="relative h-96 w-full overflow-hidden rounded-sm cursor-pointer group"
                onClick={() => openLightbox(0)}
              >
                <img
                  src={`${IMG_URL}/${tour.images[0]}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Main View"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white bg-black/40 px-4 py-2 rounded-full text-xs uppercase tracking-widest">
                    View Gallery
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {tour.images?.slice(1, 4).map((img, index) => (
                  <div
                    key={index}
                    onClick={() => openLightbox(index + 1)}
                    className="relative h-28 md:h-36 cursor-pointer group overflow-hidden rounded-sm"
                  >
                    <img
                      src={`${IMG_URL}/${img}`}
                      alt={`Gallery ${index}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {index === 2 && tour.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                        <span className="text-white text-xl font-bold">
                          +{tour.images.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="inline-block border-l-4 border-[#004d4d] pl-4">
                <h2 className="text-4xl font-serif text-gray-800">
                  The Experience
                </h2>
              </div>
              <p className="text-gray-600 leading-relaxed text-lg font-light whitespace-pre-line">
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
                    Season
                  </h4>
                  <p className="text-gray-800 font-medium capitalize">
                    {Array.isArray(tour.availability)
                      ? tour.availability.join(" & ")
                      : "Year Round"}
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
                  <div className="pb-12 pt-2 text-left">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-gray-50 p-10 rounded-sm text-left">
            <div>
              <h3 className="text-xl font-serif mb-8 text-[#004d4d] uppercase tracking-widest">
                Included
              </h3>
              <ul className="space-y-4">
                {tour.inclusions?.included.map((inc, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-sm text-gray-600"
                  >
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>{" "}
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
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full"></span>{" "}
                    {exc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {activeTab === "reviews" && (
          <div className="max-w-4xl mx-auto text-left">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-4xl font-serif">Traveler Reviews</h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#004d4d]">
                  {tour.averageRating?.toFixed(1) || "0.0"}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Average Score
                </p>
              </div>
            </div>

            {tour.reviews && tour.reviews.length > 0 ? (
              <div className="space-y-10">
                {tour.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 pb-10 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        {review.userDetails?.image ? (
                          <img
                            src={`${IMG_URL}/${review.userDetails.image}`}
                            alt={review.userDetails.username}
                            className="w-12 h-12 rounded-full object-cover border border-emerald-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${
                                review.userDetails?.username || "U"
                              }&background=d1fae5&color=065f46`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg">
                            {review.userDetails?.username
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-gray-800">
                            {review.userDetails?.username ||
                              "Verified Traveler"}
                          </h4>
                          <p className="text-xs text-gray-400 uppercase tracking-tighter">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "long", year: "numeric" }
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>{i < review.rating ? "★" : "☆"}</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-light italic">
                      "{review.comment}"
                    </p>

                    {/* Review Images logic */}
                    {review.images?.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {review.images.slice(0, 3).map((img, i) => (
                          <div key={i} className="relative w-20 h-20">
                            <img
                              src={`${IMG_URL}/${img}`}
                              className="w-full h-full object-cover rounded-md border"
                              alt="Review"
                            />
                            {i === 2 && review.images.length > 3 && (
                              <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center text-white text-xs font-bold">
                                +{review.images.length - 2}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-400">
                  No reviews yet for this adventure.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="absolute top-0 w-full p-6 flex justify-between items-center text-white z-10">
            <div>
              <h3 className="text-lg font-serif italic">{tour.title}</h3>
              <p className="text-[10px] tracking-widest uppercase opacity-60">
                Photo {currentImgIndex + 1} of {tour.images.length}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-3xl"
            >
              &times;
            </button>
          </div>

          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center px-12">
            <button
              onClick={() =>
                setCurrentImgIndex(
                  (currentImgIndex + tour.images.length - 1) %
                    tour.images.length
                )
              }
              className="absolute left-4 p-4 text-white/50 hover:text-white transition-colors"
            >
              <svg
                className="w-10 h-10"
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

            <img
              src={`${IMG_URL}/${tour.images[currentImgIndex]}`}
              className="max-w-full max-h-full object-contain shadow-2xl animate-in fade-in zoom-in duration-300"
              alt="Lightbox"
            />

            <button
              onClick={() =>
                setCurrentImgIndex((currentImgIndex + 1) % tour.images.length)
              }
              className="absolute right-4 p-4 text-white/50 hover:text-white transition-colors"
            >
              <svg
                className="w-10 h-10"
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

          <div className="mt-8 flex gap-3 overflow-x-auto p-2 max-w-full no-scrollbar">
            {tour.images.map((img, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentImgIndex(idx)}
                className={`relative w-16 h-12 flex-shrink-0 cursor-pointer rounded-sm overflow-hidden transition-all ${
                  currentImgIndex === idx
                    ? "ring-2 ring-emerald-500 scale-110 opacity-100"
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                <img
                  src={`${IMG_URL}/${img}`}
                  className="w-full h-full object-cover"
                  alt="Thumbnail"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;

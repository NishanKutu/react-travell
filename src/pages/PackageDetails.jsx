import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDestinationById } from "../api/destinationApi";
import {
  FaStar,
  FaQuoteLeft,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaCamera,
} from "react-icons/fa";

const PackageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    index: 0,
    title: "",
  });

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

  // 1. Extract values from the tour object
  const basePrice = Number(tour?.price) || 0;
  const discountPercentage = Number(tour?.discount) || 0;

  // 2. Calculate the discounted price (e.g., 5000 - (5000 * 0.08) = 4600)
  const finalPrice =
    discountPercentage > 0
      ? basePrice - basePrice * (discountPercentage / 100)
      : basePrice;

  // 3. (Optional) Calculate the amount saved to show a badge
  const amountSaved = basePrice - finalPrice;

  const openLightbox = (images, index, title) => {
    setLightbox({ isOpen: true, images, index, title: title || tour.title });
  };

  const closeLightbox = () => {
    setLightbox({ ...lightbox, isOpen: false });
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
            Rs {finalPrice.toLocaleString()}
            {tour.discount > 0 && (
              <span className="text-sm text-rose-500 line-through ml-2 font-normal">
                Rs {basePrice.toLocaleString()}
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
                className="relative h-96 w-full overflow-hidden rounded-2xl cursor-pointer group"
                onClick={() => openLightbox(tour.images, 0)}
              >
                <img
                  src={`${IMG_URL}/${tour.images[0]}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  alt="Main"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white bg-black/40 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20">
                    View Gallery
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {tour.images?.slice(1, 4).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => openLightbox(tour.images, idx + 1)}
                    className="relative h-28 cursor-pointer group overflow-hidden rounded-xl"
                  >
                    <img
                      src={`${IMG_URL}/${img}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt="Gallery"
                    />
                    {idx === 2 && tour.images.length > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px] text-white font-bold">
                        +{tour.images.length - 3}
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-16 bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                  Traveler Stories
                </h2>
                <p className="text-slate-500 mt-1 font-medium">
                  Authentic experiences from the trail.
                </p>
              </div>
              <div className="text-right">
                <p className="text-5xl font-black text-[#004d4d] leading-none">
                  {tour.averageRating?.toFixed(1) || "0.0"}
                </p>
                <div className="flex text-amber-400 justify-end mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      size={14}
                      className={
                        i < Math.round(tour.averageRating || 0)
                          ? "fill-current"
                          : "text-slate-200"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>

            {tour.reviews && tour.reviews.length > 0 ? (
              <div className="grid grid-cols-1 gap-8">
                {tour.reviews.map((review, index) => (
                  <div
                    key={index}
                    className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <FaQuoteLeft className="absolute -top-2 -left-2 text-slate-50 text-6xl" />

                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700 font-black text-xl border border-emerald-100">
                            {review.userDetails?.username
                              ?.charAt(0)
                              .toUpperCase() || "U"}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">
                              {review.userDetails?.username ||
                                "Verified Traveler"}
                            </h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-US",
                                { month: "long", year: "numeric" }
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex text-amber-400 bg-amber-50 px-3 py-1 rounded-full">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              size={12}
                              className={
                                i < review.rating
                                  ? "fill-current"
                                  : "text-slate-200"
                              }
                            />
                          ))}
                        </div>
                      </div>

                      <p className="text-slate-600 text-lg leading-relaxed italic font-light mb-8 pl-4 border-l-2 border-emerald-100">
                        "{review.comment}"
                      </p>

                      {/* Review Images logic */}
                      {review.images?.length > 0 && (
                        <div className="flex gap-3 mt-6">
                          {review.images.slice(0, 3).map((img, i) => (
                            <div
                              key={i}
                              className="relative w-20 h-20 cursor-pointer group"
                              onClick={() =>
                                openLightbox(
                                  review.images,
                                  i,
                                  `${review.userDetails?.username}'s Review`
                                )
                              }
                            >
                              <img
                                src={`${IMG_URL}/${img}`}
                                className="w-full h-full object-cover rounded-2xl border border-slate-100 group-hover:border-emerald-500 transition-all shadow-sm"
                                alt="Review"
                              />
                              {i === 2 && review.images.length > 3 && (
                                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white text-xs font-black">
                                  +{review.images.length - 3}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold">
                  No reviews yet for this adventure.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-6">
          <div className="w-full flex justify-between items-start text-white">
            <div>
              <h3 className="text-xl font-bold">{lightbox.title}</h3>
              <p className="text-[10px] tracking-widest uppercase opacity-60 font-black mt-1">
                Photo {lightbox.index + 1} of {lightbox.images.length}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="relative flex items-center justify-center w-full flex-1 max-h-[70vh]">
            {lightbox.images.length > 1 && (
              <button
                onClick={() =>
                  setLightbox((p) => ({
                    ...p,
                    index: (p.index - 1 + p.images.length) % p.images.length,
                  }))
                }
                className="absolute left-4 text-white hover:scale-125 transition-transform"
              >
                <FaChevronLeft size={40} />
              </button>
            )}
            <img
              src={`${IMG_URL}/${lightbox.images[lightbox.index]}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300"
              alt="Lightbox"
            />
            {lightbox.images.length > 1 && (
              <button
                onClick={() =>
                  setLightbox((p) => ({
                    ...p,
                    index: (p.index + 1) % p.images.length,
                  }))
                }
                className="absolute right-4 text-white hover:scale-125 transition-transform"
              >
                <FaChevronRight size={40} />
              </button>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-sm max-w-2xl w-full">
            <div className="flex justify-center gap-3 overflow-x-auto py-2 no-scrollbar">
              {lightbox.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox((p) => ({ ...p, index: i }))}
                  className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all border-2 ${
                    lightbox.index === i
                      ? "border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20"
                      : "border-transparent opacity-40"
                  }`}
                >
                  <img
                    src={`${IMG_URL}/${img}`}
                    className="w-full h-full object-cover"
                    alt="Thumb"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackageDetail;

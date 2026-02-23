import React from "react";
import { useNavigate } from "react-router-dom";

const DestinationCard = ({ tour }) => {
  const navigate = useNavigate();

  if (!tour) return null;

  const {
    _id,
    images,
    title,
    location,
    duration,
    price,
    discount,
    isBestSeller,
    isNewTrip,
    isPromo,
    groupSize,
    status,
    averageRating,
    totalReviews,
  } = tour;

  const imageUrl =
    images && images.length > 0
      ? `http://localhost:8000/uploads/${images[0]}`
      : "https://via.placeholder.com/400x300?text=No+Image";

  const hasDiscount = discount > 0;
  const safePrice = price || 0;
  const finalPrice = hasDiscount
    ? safePrice - safePrice * (discount / 100)
    : safePrice;

  return (
    <div
      onClick={() => navigate(`/tour/${_id}`)}
      className="bg-white border border-slate-100 rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col h-full min-h-[500px]"
    >
      {/* Image Container */}
      <div className="relative h-72 shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* STATUS BADGE (Top Right) - HikeHub Emerald */}
        <div
          className={`absolute top-4 right-4 z-20 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg ${
            status?.toLowerCase().includes("active") &&
            !status?.toLowerCase().includes("not")
              ? "bg-emerald-600 text-white"
              : "bg-slate-500 text-white"
          }`}
        >
          {status?.toLowerCase().includes("active") &&
          !status?.toLowerCase().includes("not")
            ? "● Active"
            : "Not-Active"}
        </div>

        {/* DYNAMIC BADGES (Top Left) - HikeHub Tan/Orange Circle */}
        {(isBestSeller || isNewTrip) && (
          <div className="absolute top-4 left-4 z-20 bg-[#b4845c] text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-center shadow-xl border-2 border-white/20 animate-pulse">
            <span className="text-[10px] font-black leading-tight uppercase tracking-tighter">
              {isBestSeller ? (
                <>
                  Best
                  <br />
                  Seller
                </>
              ) : (
                <>
                  New
                  <br />
                  Trip
                </>
              )}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-[#064e3b]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
          <span className="text-white text-sm font-black uppercase tracking-[0.3em] bg-white/20 px-6 py-2 rounded-full border border-white/30">
            View Journey
          </span>
        </div>

        {/* PROMO BADGE */}
        {isPromo && (
          <div className="absolute bottom-0 w-full bg-rose-600 text-white text-[10px] font-black py-2.5 px-4 tracking-[0.2em] uppercase text-center">
            Limited Time Offer
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col grow bg-white">
        <div className="flex justify-between items-start mb-3">
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full tracking-widest uppercase border border-emerald-100">
            {location}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-orange-400 text-sm">★</span>
            <span className="text-[11px] font-black text-slate-700">
              {averageRating > 0 ? averageRating.toFixed(1) : "New"}
            </span>
            {totalReviews > 0 && (
              <span className="text-[10px] text-slate-400 font-medium">
                ({totalReviews})
              </span>
            )}
          </div>
        </div>

        <h3 className="text-2xl font-black text-slate-800 leading-tight mb-2 group-hover:text-emerald-700 transition-colors">
          {title}
        </h3>

        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">⏳</span>
            <p className="font-bold text-xs text-slate-600 uppercase tracking-wide">
              {duration}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-lg">👥</span>
            <p className="font-bold text-xs text-slate-600 uppercase tracking-wide">
              Max {groupSize}
            </p>
          </div>
        </div>

        {/* Price Section */}
        <div className="mt-auto pt-6 border-t border-slate-50">
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-[10px] text-rose-500 line-through font-bold uppercase tracking-tighter mb-1">
                  Was Rs {Number(safePrice).toLocaleString()}
                </span>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                  From
                </span>
                <span className="font-black text-2xl text-slate-900">
                  Rs {Number(finalPrice).toLocaleString()}
                </span>
              </div>
            </div>

            {/* HikeHub Style Button */}
            <div className="bg-[#b4845c] p-2.5 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-orange-900/10">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M14 5l7 7-7 7M5 12h16"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;

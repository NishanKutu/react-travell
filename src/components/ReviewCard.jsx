import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom"; 

const ReviewCard = ({ review, isAdmin = false, onDelete, IMG_URL }) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  const wordLimit = 50;
  const comment = review.comment || "";
  const words = comment.split(/\s+/);
  const isLongerThanLimit = words.length > wordLimit;

  const displayComment =
    isExpanded || !isLongerThanLimit
      ? comment
      : words.slice(0, wordLimit).join(" ") + "...";

  const handleKeyDown = useCallback(
    (e) => {
      if (!showLightbox) return;
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % review.images.length);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex(
          (prev) => (prev - 1 + review.images.length) % review.images.length
        );
      } else if (e.key === "Escape") {
        setShowLightbox(false);
      }
    },
    [showLightbox, review.images?.length]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const openGallery = (index) => {
    setActiveIndex(index);
    setShowLightbox(true);
  };

  // --- Lightbox Portal ---
  const Lightbox = () => {
    if (!showLightbox) return null;

    return createPortal(
      <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 animate-in fade-in duration-300">
        <div className="w-full flex justify-between items-center z-[10000]">
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">
              {review.destinationDetails?.title || "Gallery"}
            </span>
            <span className="text-white/50 text-xs uppercase tracking-widest">
              Photo {activeIndex + 1} of {review.images.length}
            </span>
          </div>
          <button
            onClick={() => setShowLightbox(false)}
            className="text-white bg-white/10 p-3 rounded-full hover:bg-rose-500 transition-all shadow-xl"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="relative flex-1 flex items-center justify-center w-full max-w-6xl group/main">
          <button
            onClick={() =>
              setActiveIndex(
                (prev) =>
                  (prev - 1 + review.images.length) % review.images.length
              )
            }
            className="absolute left-4 p-4 text-white bg-black/20 hover:bg-black/50 rounded-full transition-all hidden md:block"
          >
            <svg
              className="w-8 h-8"
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
            src={`${IMG_URL}${review.images[activeIndex]}`}
            alt="Viewing"
            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
          />
          <button
            onClick={() =>
              setActiveIndex((prev) => (prev + 1) % review.images.length)
            }
            className="absolute right-4 p-4 text-white bg-black/20 hover:bg-black/50 rounded-full transition-all hidden md:block"
          >
            <svg
              className="w-8 h-8"
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

        <div className="w-full max-w-4xl mb-4">
          <div className="flex gap-3 overflow-x-auto p-4 bg-white/5 rounded-3xl border border-white/10 no-scrollbar justify-center">
            {review.images.map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative min-w-[80px] h-[60px] rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                  activeIndex === i
                    ? "ring-4 ring-emerald-500 scale-105 opacity-100"
                    : "opacity-30 hover:opacity-100"
                }`}
              >
                <img
                  src={`${IMG_URL}${img}`}
                  className="w-full h-full object-cover"
                  alt="thumb"
                />
              </div>
            ))}
          </div>
        </div>
      </div>,
      document.body 
    );
  };

  return (
    <div className="bg-transparent overflow-hidden flex flex-col transition-all duration-500 group relative text-white">
      <style>
        {`
          @keyframes subtle-wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            75% { transform: rotate(-2deg); }
          }
          .animate-wiggle {
            animation: subtle-wiggle 0.5s ease-in-out 2;
            animation-delay: 1.5s;
          }
        `}
      </style>

      {/* Render the Lightbox using Portal */}
      <Lightbox />

      <div className="p-5 flex justify-between items-center bg-transparent border-b border-white/10">
        <div className="flex items-center gap-3">
          {review.userDetails?.image ? (
            <img
              src={`${IMG_URL}${review.userDetails.image}`}
              className="w-10 h-10 rounded-full object-cover border border-emerald-400"
              alt="user"
            />
          ) : (
            <div className="w-10 h-10 bg-emerald-600/30 rounded-full flex items-center justify-center text-white font-bold border border-emerald-400 uppercase">
              {review.userDetails?.username?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-white leading-none uppercase tracking-wider">
              {review.userDetails?.username || "Anonymous"}
            </h3>
            <p className="text-[10px] text-emerald-200/60 mt-1 font-bold">
              {review.createdAt
                ? new Date(review.createdAt).toLocaleDateString()
                : "Recent"}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-xs ${
                star <= review.rating ? "" : "grayscale opacity-20"
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      <div className="p-5 flex-1">
        <div className="inline-block px-2 py-1 rounded bg-white/10 mb-4 border border-white/20">
          <p className="text-[9px] font-black uppercase text-emerald-300 tracking-widest">
            Trek: {review.destinationDetails?.title || "Trip"}
          </p>
        </div>
        <div className="relative transition-all duration-500">
          <p className="text-white text-lg italic font-serif leading-relaxed opacity-90">
            "{displayComment}"
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            {isLongerThanLimit && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="block not-italic font-black text-emerald-300 hover:text-white text-[10px] uppercase tracking-[0.2em] transition-colors"
              >
                {isExpanded ? "↑ Show Less" : "↓ Read More"}
              </button>
            )}
            {review.images?.length > 0 && (
              <button
                onClick={() => openGallery(0)}
                className="animate-wiggle flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 rounded-lg transition-all group/btn"
              >
                <svg
                  className="w-4 h-4 text-emerald-300 group-hover/btn:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                  View Photos ({review.images.length})
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={() => onDelete(review._id)}
          className="absolute top-4 right-4 z-20 p-2 bg-rose-500/20 text-rose-300 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ReviewCard;

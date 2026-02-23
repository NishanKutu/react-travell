import React, { useState, useEffect, useCallback } from "react";

const ReviewCard = ({ review, isAdmin = false, onDelete, IMG_URL }) => {
  // --- States ---
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // --- Image Gallery Logic ---
  const maxVisible = 3;
  const visibleImages = review.images?.slice(0, maxVisible) || [];
  const remainingCount = review.images?.length - maxVisible;

  // --- Word Limit Logic ---
  const wordLimit = 50;
  const comment = review.comment || "";
  const words = comment.split(/\s+/);
  const isLongerThanLimit = words.length > wordLimit;

  const displayComment =
    isExpanded || !isLongerThanLimit
      ? comment
      : words.slice(0, wordLimit).join(" ") + "...";

  // --- Keyboard Navigation ---
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

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-all duration-500 group relative">
      {/* LIGHTBOX MODAL */}
      {showLightbox && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 animate-in fade-in duration-300">
          {/* Lightbox Header */}
          <div className="w-full flex justify-between items-center z-[210]">
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

          {/* Main Photo Container */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-6xl group/main">
            <button
              onClick={() =>
                setActiveIndex(
                  (prev) =>
                    (prev - 1 + review.images.length) % review.images.length
                )
              }
              className="absolute left-4 p-4 text-white bg-black/20 hover:bg-black/50 rounded-full transition-all opacity-0 group-hover/main:opacity-100 hidden md:block"
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
              className="absolute right-4 p-4 text-white bg-black/20 hover:bg-black/50 rounded-full transition-all opacity-0 group-hover/main:opacity-100 hidden md:block"
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

          {/* Thumbnail Strip */}
          <div className="w-full max-w-4xl">
            <div className="flex gap-3 overflow-x-auto p-4 bg-white/5 rounded-3xl border border-white/10 no-scrollbar justify-center">
              {review.images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`
                    relative min-w-[80px] h-[60px] rounded-xl overflow-hidden cursor-pointer transition-all duration-200
                    ${
                      activeIndex === i
                        ? "ring-4 ring-emerald-500 scale-105 opacity-100"
                        : "opacity-30 hover:opacity-100"
                    }
                  `}
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
        </div>
      )}

      {/* CARD HEADER */}
      <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-white">
        <div className="flex items-center gap-3">
          {review.userDetails?.image ? (
            <img
              src={`${IMG_URL}${review.userDetails.image}`}
              alt={review.userDetails.username}
              className="w-10 h-10 rounded-full object-cover border border-emerald-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${
                  review.userDetails?.username || "U"
                }&background=d1fae5&color=065f46`;
              }}
            />
          ) : (
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200 uppercase">
              {review.userDetails?.username
                ? review.userDetails.username.charAt(0)
                : "U"}
            </div>
          )}
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-none">
              {review.userDetails?.username || "Anonymous"}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">
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
                star <= review.rating ? "grayscale-0" : "grayscale opacity-20"
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>

      {/* CARD CONTENT (With Read More) */}
      <div className="p-5 flex-1">
        <div className="inline-block px-2 py-1 rounded bg-emerald-50 mb-3 border border-emerald-100">
          <p className="text-[9px] font-black uppercase text-emerald-700">
            Trek: {review.destinationDetails?.title || "Trip"}
          </p>
        </div>

        <div className="relative overflow-hidden transition-all duration-500">
          <p className="text-slate-600 text-sm italic leading-relaxed">
            "{displayComment}"
          </p>

          {isLongerThanLimit && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 block not-italic font-black text-emerald-600 hover:text-emerald-800 text-[10px] uppercase tracking-widest transition-colors"
            >
              {isExpanded ? "↑ Show Less" : "↓ Read More"}
            </button>
          )}
        </div>
      </div>

      {/* IMAGE PREVIEW GRID */}
      {visibleImages.length > 0 && (
        <div className="px-5 pb-5">
          <div
            className={`grid gap-2 ${
              visibleImages.length === 1 ? "grid-cols-1" : "grid-cols-3"
            }`}
          >
            {visibleImages.map((img, index) => (
              <div
                key={index}
                onClick={() => openGallery(index)}
                className={`${
                  visibleImages.length === 1 ? "h-52" : "h-24"
                } w-full rounded-2xl overflow-hidden border border-slate-100 relative group/img cursor-pointer`}
              >
                <img
                  src={`${IMG_URL}${img}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  alt="review"
                />
                {index === maxVisible - 1 && remainingCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-white font-black text-lg">
                      +{remainingCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADMIN ACTIONS */}
      {isAdmin && (
        <button
          onClick={() => onDelete(review._id)}
          className="absolute top-4 right-4 z-20 p-2 bg-rose-50 text-rose-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
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

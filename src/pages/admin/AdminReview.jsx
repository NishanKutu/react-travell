import React, { useCallback, useEffect, useState } from "react";
import { getAllReviews, deleteReview } from "../../api/reviewApi";
import { isLoggedIn } from "../../api/authAPI";
import {
  FaStar,
  FaTrashAlt,
  FaQuoteLeft,
  FaRoute,
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = isLoggedIn();
  const IMG_URL = "http://localhost:8000/uploads/";

  // Lightbox State
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    images: [],
    index: 0,
    title: "", 
  });

  const fetchReviews = useCallback(async () => {
    try {
      const res = await getAllReviews(token);
      if (res.success) setReviews(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await deleteReview(id, token);
      if (res.success) setReviews(reviews.filter((r) => r._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Lightbox Handlers
  const openLightbox = (images, index, title) =>
    setLightbox({ isOpen: true, images, index, title });

  const closeLightbox = () =>
    setLightbox({ isOpen: false, images: [], index: 0, title: "" });

  const setIndex = (i) => setLightbox((prev) => ({ ...prev, index: i }));

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans">
      {/* --- ENHANCED LIGHTBOX MODAL --- */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-6">
          {/* Top Header */}
          <div className="w-full flex justify-between items-start">
            <div className="text-white">
              <h2 className="text-xl font-bold">{lightbox.title}</h2>
              <p className="text-xs text-white/50 font-bold uppercase tracking-widest mt-1">
                Photo {lightbox.index + 1} of {lightbox.images.length}
              </p>
            </div>
            <button
              onClick={closeLightbox}
              className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all shadow-xl"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {/* Main Image View */}
          <div className="relative flex items-center justify-center w-full flex-1 max-h-[70vh]">
            {lightbox.images.length > 1 && (
              <button
                onClick={() =>
                  setIndex(
                    (lightbox.index - 1 + lightbox.images.length) %
                      lightbox.images.length
                  )
                }
                className="absolute left-4 text-white hover:scale-125 transition-transform p-4 z-10"
              >
                <FaChevronLeft size={40} />
              </button>
            )}

            <img
              src={`${IMG_URL}${lightbox.images[lightbox.index]}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in duration-300"
              alt="Review Full view"
            />

            {lightbox.images.length > 1 && (
              <button
                onClick={() =>
                  setIndex((lightbox.index + 1) % lightbox.images.length)
                }
                className="absolute right-4 text-white hover:scale-125 transition-transform p-4 z-10"
              >
                <FaChevronRight size={40} />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-3xl backdrop-blur-sm max-w-2xl w-full">
            <div className="flex justify-center gap-3 overflow-x-auto py-2 scrollbar-hide">
              {lightbox.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                    lightbox.index === i
                      ? "border-emerald-500 scale-110 shadow-lg shadow-emerald-500/20"
                      : "border-transparent opacity-40 hover:opacity-100"
                  }`}
                >
                  <img
                    src={`${IMG_URL}${img}`}
                    className="w-full h-full object-cover"
                    alt="Thumbnail"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- PAGE CONTENT --- */}
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Reviews Management
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col relative group"
            >
              <button
                onClick={() => handleDelete(review._id)}
                className="absolute top-4 right-4 p-2 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-50 rounded-xl"
              >
                <FaTrashAlt size={14} />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-black">
                  {review.userDetails?.username?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {review.userDetails?.username || "Guest"}
                  </h3>
                  <div className="flex text-yellow-400 text-xs mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={
                          i < review.rating ? "fill-current" : "text-slate-200"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4 bg-slate-50 self-start px-3 py-1.5 rounded-lg border border-slate-100">
                <FaRoute className="text-emerald-600" size={12} />
                <span className="text-[10px] font-black uppercase text-slate-600 tracking-wider">
                  {review.destinationDetails?.title || "Trek Route"}
                </span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed italic mb-8">
                "{review.comment}"
              </p>

              {/* Grid Thumbnails with +n Logic */}
              {review.images && review.images.length > 0 && (
                <div className="mt-auto flex gap-2 pt-4 border-t border-slate-50">
                  {review.images.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative cursor-pointer group/img shrink-0"
                      onClick={() =>
                        openLightbox(
                          review.images,
                          idx,
                          review.destinationDetails?.title || "Gallery"
                        )
                      }
                    >
                      <img
                        src={`${IMG_URL}${img}`}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-transparent group-hover/img:border-emerald-500 transition-all shadow-sm"
                        alt="Preview"
                      />
                      {idx === 2 && review.images.length > 3 && (
                        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center text-white text-xs font-black ring-2 ring-inset ring-white/20">
                          +{review.images.length - 3}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReview;

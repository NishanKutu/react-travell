import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { getAllReviews } from "../api/reviewApi";
import ReviewCard from "../components/ReviewCard";
import test from "../assets/img/test.avif";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    const fetchPublicReviews = async () => {
      try {
        const res = await getAllReviews();
        if (res.success) {
          setReviews(res.data);
        }
      } catch (error) {
        console.error("Error loading testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicReviews();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={test}
            className="w-full h-full object-cover brightness-50"
            alt="Mountains"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-white"></div>
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-4">
            Traveler Stories
          </h1>
          <p className="text-emerald-50 font-medium text-lg max-w-2xl mx-auto opacity-90">
            Real experiences from the world's most beautiful trails. Hear what
            our community has to say.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
              Loading Experiences...
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-lg">
              Be the first to share your journey!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isAdmin={false}
                IMG_URL={IMG_URL}
              />
            ))}
          </div>
        )}
      </main>


      <section className="bg-[#004d4d] py-20 px-6 text-center border-t border-white/10">
        <h2 className="text-4xl font-black text-white mb-8 tracking-tight">
          Ready for your own adventure?
        </h2>
        <button 
          onClick={() => navigate("/destinations")} 
          className="bg-[#b4845c] hover:bg-[#a0734f] text-white font-bold px-12 py-4 rounded-full transition-all hover:scale-105 shadow-2xl uppercase tracking-[0.2em] text-xs"
        >
          Explore All Treks
        </button>
      </section>
    </div>
  );
};

export default Testimonials;
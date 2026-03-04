import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllReviews } from "../api/reviewApi";
import ReviewCard from "../components/ReviewCard";
import PopularDestination from "../components/PopularDestination";
import test from "../assets/img/test.avif";

const Testimonials = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasFetched, setHasFetched] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const sliderRef = useRef(null);
  const autoplayRef = useRef(null);

  const IMG_URL = "http://localhost:8000/uploads/";
  const bgColors = ["#52796f", "#2f3e46", "#354f52"];

  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);

    autoplayRef.current = setInterval(() => {
      const isLightboxOpen = !!document.body.querySelector(
        ".fixed.z-\\[9999\\]"
      );

      if (
        sliderRef.current &&
        window.swiffyslider &&
        !isLightboxOpen &&
        !isHovered
      ) {
        window.swiffyslider.slide(sliderRef.current, true);
      }
    }, 3000);
  };

  const fetchPublicReviews = async () => {
    try {
      const res = await getAllReviews();
      if (res.success) {
        setReviews(res.data);
        setTimeout(() => {
          if (window.swiffyslider) {
            window.swiffyslider.init();
            startAutoplay();
          }
        }, 150);
      }
    } catch (error) {
      console.error("Error loading testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!hasFetched) {
    setHasFetched(true);
    fetchPublicReviews();
  }

  useEffect(() => {
    if (hasFetched && !loading) {
      startAutoplay();
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, hasFetched, loading]);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden">
      <style>
        {`
          .swiffy-slider { z-index: 1; position: relative; }

          .slider-nav { 
            background-color: rgba(255, 255, 255, 0.05) !important; 
            color: white !important;
            height: 100% !important;
            width: 60px !important;
            border-radius: 0 !important;
            margin: 0 !important;
            transition: all 0.3s ease;
            z-index: 10;
          }
          .slider-nav:hover { background-color: rgba(255, 255, 255, 0.15) !important; }
          .testimonial-slide { transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1), filter 0.6s ease; }
          .testimonial-slide:hover { filter: brightness(1.1); }
          .slide-content-wrapper { transition: transform 0.6s ease; }
          .testimonial-slide:hover .slide-content-wrapper { transform: scale(1.02); }
          .slider-indicators { bottom: 30px !important; z-index: 20; }
          .slider-indicators button { background-color: rgba(255,255,255,0.3) !important; }
          .slider-indicators button.active { background-color: white !important; width: 24px !important; border-radius: 4px !important; }
        `}
      </style>

      {/* Hero Section */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={test}
            className="w-full h-full object-cover brightness-50"
            alt="Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/20 to-white"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-lg mb-4 tracking-tighter">
            Traveler Stories
          </h1>
          <p className="text-emerald-50 font-medium text-lg max-w-2xl mx-auto opacity-90">
            Real experiences from the world's most beautiful trails.
          </p>
        </div>
      </section>

      <main className="w-full py-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="w-full">
            <div className="max-w-7xl mx-auto flex items-center gap-4 mb-12 px-6">
              <h2 className="text-4xl font-black text-[#004d4d] tracking-tight">
                What People Say
              </h2>
              <div className="flex-1 h-[2px] bg-emerald-100"></div>
            </div>

            <div
              id="testimonial-slider"
              ref={sliderRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="swiffy-slider slider-item-show2 slider-nav-page slider-item-snapstart slider-item-nogap slider-nav-animation slider-nav-animation-slideup slider-indicators-round"
            >
              <ul className="slider-container" style={{ minHeight: "450px" }}>
                {reviews.map((review, index) => (
                  <li
                    key={review._id}
                    style={{
                      backgroundColor: bgColors[index % bgColors.length],
                    }}
                    className="testimonial-slide flex items-center justify-center text-white group"
                  >
                    <div className="p-10 md:p-16 w-full max-w-2xl slide-content-wrapper">
                      <ReviewCard
                        review={review}
                        isAdmin={false}
                        IMG_URL={IMG_URL}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="slider-nav"
                aria-label="Go left"
              ></button>
              <button
                type="button"
                className="slider-nav slider-nav-next"
                aria-label="Go right"
              ></button>

              <div className="slider-indicators">
                {reviews.map((_, idx) => (
                  <button
                    key={idx}
                    className={idx === 0 ? "active" : ""}
                  ></button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="bg-white">
        <PopularDestination /> 
      </div>

      <section className="bg-[#004d4d] py-20 px-6 text-center">
        <h2 className="text-4xl font-black text-white mb-8 tracking-tight">
          Ready for your own adventure?
        </h2>
        <button
          onClick={() => navigate("/destinations")}
          className="bg-[#b4845c] hover:bg-white hover:text-[#004d4d] text-white font-bold px-12 py-4 rounded-full transition-all uppercase tracking-widest text-xs shadow-xl"
        >
          Explore All Treks
        </button>
      </section>
    </div>
  );
};

export default Testimonials;

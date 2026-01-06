import React, { useState, useEffect } from "react";
import DestinationCard from "./DestinationCard";
import { getAllDestinations } from "../api/destinationApi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const PopularDestination = () => {
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const response = await getAllDestinations(); 

      const destinationsArray = response.data || [];

      // Filter logic
      const popularOnes = destinationsArray.filter(
        (item) => item.isBestSeller === true
      );

      setDestinations(popularOnes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDestinations();
  }, []);

  if (loading)
    return <div className="py-20 text-center">Loading Popular Tours...</div>;
  if (error)
    return <div className="py-20 text-center text-red-500">Error: {error}</div>;
  if (destinations.length === 0) return null;

  return (
    <section
      id="populardestinations"
      className="py-3 pb-15 md:px-32 px-5 background-blur-sm"
    >
      <div className="mb-10">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-black overflow-hidden">
          <span className="inline-block animate-slide-left">Our most</span>
          <br />
          <span className="inline-block text-[#bd8157] animate-slide-right">
            popular tour
          </span>
        </h2>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={1}
        loop={destinations.length > 3}
        grabCursor={true}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="pb-14"
      >
        {destinations.map((item) => (
          <SwiperSlide key={item._id} className="h-auto! flex">
            <DestinationCard tour={item} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default PopularDestination;

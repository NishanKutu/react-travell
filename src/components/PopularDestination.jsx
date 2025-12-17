import React from 'react';
import DestinationCard from '../layout/DestinationCard';
import india from '../assets/img/India.webp';
import japan from '../assets/img/Japan.jpg';
import balli from '../assets/img/Balli.png';
import spain from '../assets/img/Spain.webp';
import thailand from '../assets/img/Thailand.jpg';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

// Swiper Style
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PopularDestination = () => {
    const tours = [
        {
            img: india,
            title: "Classic Spain & Portugal",
            days: "12 Days 10 Nights",
            price: "$2500",
            category: "Wondrous Journeys",
            discount: "200"
        },
        {
            img: japan,
            title: "Timeless China",
            days: "15 Days 13 Nights",
            price: "$3850",
            category: "Exotic Journeys",
        },
        {
            img: balli,
            title: "Bali Explorer",
            days: "12 Days 10 Nights",
            price: "$2300",
            category: "Wondrous Journeys",
            discount: "150"
        },
        {
            img: spain,
            title: "Spain Explorer",
            days: "12 Days 10 Nights",
            price: "$2300",
            category: "Wondrous Journeys",
            discount: "150"
        },
        {
            img: thailand,
            title: "Thailand Explorer",
            days: "12 Days 10 Nights",
            price: "$2300",
            category: "Wondrous Journeys",
            discount: "150"
        },

    ];

    return (
        <section id="populardestinations" className="py-3 pb-15 md:px-32 px-5  background-blur-sm">
            <div className="mb-10">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-black">
                    Our most <br /> <span className = "text-[#bd8157]">popular </span> tours
                </h2>
            </div>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                loop={true} 
                grabCursor={true}
                navigation
                pagination={{ clickable: true }}
                breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                className="pb-14"
            >
                {tours.map((tour, index) => (
                    <SwiperSlide key={index}>
                        <DestinationCard {...tour} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

export default PopularDestination;
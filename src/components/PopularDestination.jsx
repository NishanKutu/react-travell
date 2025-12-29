import React from 'react';
import DestinationCard from './DestinationCard';
import { tours as realTours } from '../data/toursData'; 
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const PopularDestination = () => {
    const displayedTours = realTours.slice(0, 5);

    return (
        <section id="populardestinations" className="py-3 pb-15 md:px-32 px-5 background-blur-sm">
            <div className="mb-10">
                <h2 className="text-4xl md:text-6xl font-serif font-bold text-black overflow-hidden">
                    <span className = "inline-block animate-slide-left">
                        Our most 
                    </span>
                    <br/> 
                    <span className="inline-block text-[#bd8157] animate-slide-right"
                          > 
                          popular tour
                    </span>
                </h2>
            </div>
            <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={30}
                slidesPerView={1}
                autoheight = {false}
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
                {displayedTours.map((item) => (
                    <SwiperSlide key={item.id} className = "h-auto! flex">
                        <DestinationCard tour={item} />
                    </SwiperSlide>
                ))}
            </Swiper>
        </section>
    );
}

export default PopularDestination;
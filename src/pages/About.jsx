import React, { useRef, useState } from 'react';
import beach from '../assets/img/Beach.jpg';
import "../App.css";

// Swiper Imports
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css'; // Basic Swiper styles
import 'swiper/css/effect-creative';
import { EffectCreative, Autoplay } from 'swiper/modules';

const About = () => {
  return (
    <div className="font-sans text-gray-800">

      {/* --- HERO SECTION --- */}
      <div
        className="relative h-[40vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${beach})` }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <h1 className="relative z-10 text-white text-6xl md:text-8xl font-serif animate-pop-up">
          About us
        </h1>
      </div>

      {/* --- AGENCY INFO SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            We Are Very Trusted Tour And Travel Agency, Standing Up For You All
          </h2>
          <div className="flex space-x-6 mb-6">
            <span className="flex items-center text-[#004d4d] font-semibold">
              <span className="mr-2">💰</span> Affordable Prices
            </span>
            <span className="flex items-center text-[#004d4d] font-semibold">
              <span className="mr-2">🛋️</span> Prioritize Comfort
            </span>
          </div>
          <p className="text-gray-600 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.
          </p>
        </div>

        {/* --- SWIPER SLIDER --- */}
        <div className="w-full h-87.5 overflow-hidden rounded-lg shadow-xl">
          <Swiper
            grabCursor={true}
            effect={'creative'}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            creativeEffect={{
              prev: {
                shadow: true,
                translate: [0, 0, -400],
              },
              next: {
                translate: ['100%', 0, 0],
              },
            }}
            modules={[EffectCreative, Autoplay]}
            className="h-full w-full"
          >
            <SwiperSlide className="flex items-center justify-center bg-[#354f52] text-white p-10">
               <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">BENEFITS</h3>
                  <p>Quality products tailored for your travel needs.</p>
               </div>
            </SwiperSlide>
            <SwiperSlide className="flex items-center justify-center bg-[#2f3e46] text-white p-10">
               <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">WEBINAR</h3>
                  <p>Join our weekly sessions for travel tips.</p>
               </div>
            </SwiperSlide>
            <SwiperSlide className="flex items-center justify-center bg-[#004d4d] text-white p-10">
               <div className="text-center">
                  <h3 className="text-2xl font-bold mb-4">SAFETY</h3>
                  <p>Your comfort and security are our priority.</p>
               </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </div> 

      {/* --- TEAL FEATURE SECTION --- */}
      <div className="bg-[#004d4d] text-white py-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-4">🧭</div>
            <h3 className="text-2xl font-bold mb-2">Tours Guide</h3>
            <p className="text-white/90 text-sm">Expert guides for every destination.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-4">🔥</div>
            <h3 className="text-2xl font-bold mb-2">Safety Safe</h3>
            <p className="text-white/90 text-sm">Verified and secure travel plans.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl mb-4">🏔️</div>
            <h3 className="text-2xl font-bold mb-2">Clear Price</h3>
            <p className="text-white/90 text-sm">No hidden fees, ever.</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default About;
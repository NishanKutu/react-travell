import React from 'react';
import FeatureCard from '../layout/FeatureCard';
import img from '../assets/img/feature.jpg';
import png1 from '../assets/img/png1.png';
import png2 from '../assets/img/png2.png';
import png3 from '../assets/img/png3.png';

const Features = () => {
    return (
        <div className="min-h-screen flex flex-col lg:flex-row items-center md:mx-32 mx-5 gap-14 py-20 ">
            <div className="w-full lg:w-2/4">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-semibold font-serif text-center md:text-start leading-tight">
                        Get Ready to Explore, <span className="text-[#bd8157]">Experience!</span>
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Discover the Best Holiday Experiences with TravelForU! We're
                        dedicated to giving you the latest and greatest destinations.
                    </p>
                </div>
                <div className="w-full lg:w-4/5 mt-10">
                    <img 
                        className="rounded-xl shadow-[0_20px_50px_rgba(8,112,184,0.5)] transition-transform hover:scale-105 duration-500" 
                        src={img} 
                        alt="Travel Experience" 
                    />
                </div>
            </div>

            <div className="w-full lg:w-2/4 space-y-12">
                <FeatureCard 
                    icon={png1} 
                    title="Friendly Services" 
                    description="We will provide excellent and friendly service for the sake of our customers." 
                />
                <FeatureCard 
                    icon={png2} 
                    title="Unforgettable Locations" 
                    description="Explore the most beautiful and hidden gems across the globe with our expert guides." 
                />
                <FeatureCard 
                    icon={png3} 
                    title="Affordable Prices" 
                    description="Premium travel experiences designed to fit your budget without compromising quality." 
                />
            </div>
        </div>
    );
};

export default Features;
import React from 'react';

const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="flex flex-row gap-5 items-start">
            <div className="flex flex-row items-center w-24 shrink-0">
                <img src={icon} alt={title} className="w-full h-auto" />
            </div>
            <div className="space-y-3">
                <h1 className="font-semibold text-xl">{title}</h1>
                <p className="text-[#898888] leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default FeatureCard;
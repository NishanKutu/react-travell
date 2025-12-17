import React from 'react';

const DestinationCard = ({ img, title, days, price, category, discount }) => {
  return (
    <div className=" relative overflow-hidden rounded-2xl group cursor-pointer h-[450px] w-full shadow-lg ">
      
      {discount && (
        <div className="absolute top-4 right-4 z-20 bg-[#bd8157] text-white rounded-full w-16 h-16 flex flex-col items-center justify-center text-center leading-tight shadow-lg border-2 border-white/20">
          <span className="text-[10px] uppercase font-bold">Save</span>
          <span className="text-sm font-bold">${discount}</span>
          <span className="text-[8px]">per person</span>
        </div>
      )}

      <img 
        src={img} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      
      <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

      <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
        
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold opacity-80 mb-1">
            {category}
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight">
            {title}
          </h3>
          
          <div className="flex flex-col gap-1 border-t border-white/30 pt-3">
            <div className="flex justify-between items-center text-sm">
              <span className="opacity-80 font-medium">{days}</span>
              <span className="text-[#bd8157] font-bold text-lg">From {price}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
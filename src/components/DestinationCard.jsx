import React from 'react';
import { useNavigate } from 'react-router-dom';

const DestinationCard = ({ tour }) => {
  const navigate = useNavigate();

  if (!tour) return null;

  const { id, image, title, duration, price, code, bestSeller, newTrip, promo, cities, discount } = tour;

  return (
    <div 
      onClick={() => navigate(`/tour/${id}`)}
      /* 1. 'flex flex-col h-full': Standardizes height across the grid row.
         2. 'min-h-[500px]': Replaces min-h-137.5 with a standard value to ensure a base size.
      */
      className="bg-white border border-gray-200 rounded-sm overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col h-full min-h-[500px]"
    >
      <div className="relative h-64 shrink-0 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 "
        />

        {/* Dynamic Badges */}
        {(bestSeller || newTrip) && (
          <div className="absolute top-4 left-4 z-20 bg-white rounded-full w-14 h-14 border border-dashed border-gray-400 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[9px] font-extrabold leading-tight uppercase text-gray-700">
              {bestSeller ? <>Best<br />Seller</> : <>New<br />Trip</>}
            </span>
          </div>
        )}

        {discount && (
          <div className="absolute top-4 right-4 z-20 bg-[#bd8157] text-white rounded-full w-14 h-14 flex flex-col items-center justify-center text-center leading-tight shadow-lg border-2 border-white/20">
            <span className="text-[8px] uppercase font-bold">Save</span>
            <span className="text-xs font-bold">${discount}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-xl font-bold border-b-2 border-white pb-1">View tour &rsaquo;</span>
        </div>

        {promo && (
          <div className="absolute bottom-0 w-full bg-[#1b4d4b] text-white text-[10px] font-bold py-2.5 px-4 tracking-wider uppercase">
            {promo}
          </div>
        )}
      </div>

      {/* 'flex-grow': This container expands to fill available space, 
          pushing the price section (mt-auto) to the bottom.
      */}
      <div className="p-6 flex flex-col flex-grow">
        <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase w-fit">
          Code: {code}
        </span>
        
        {/* 'min-h-[4rem]': Ensures cards with 1-line titles stay the same height as 2-line titles.
            'line-clamp-2': Prevents titles from becoming 3+ lines and breaking the layout.
        */}
        <h3 className="text-xl font-serif text-gray-900 leading-tight mt-3 mb-1 min-h-[3.5rem] flex items-center">
          {title}
        </h3>
        
        <p className="font-bold text-sm text-gray-800">{duration}</p>
        
        {/* 'line-clamp-2': Standardizes the height of the cities list. */}
        <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2 min-h-[2rem]">
          {cities}
        </p>

        {/* 'mt-auto': Forces the price block to the bottom of the card. */}
        <div className="mt-auto pt-5">
          <hr className="mb-4 border-gray-100" />
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-lg text-gray-900">From ${price}</span>
            <span className="text-[10px] font-normal text-gray-400 uppercase">per person</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const DestinationCard = ({ tour }) => {
  const navigate = useNavigate();

  if (!tour) return null;

  const { _id, images, title, location, duration, price, discount, isbestSeller, isnewTrip, ispromo, cities } = tour;

  const imageUrl = images && images.length > 0
    ? `http://localhost:8000/uploads/${images[0]}`
    : 'https://via.placeholder.com/400x300?text=No+Image';

  const hasDiscount = discount > 0;
  const safePrice = price || 0;
  const finalPrice = hasDiscount ? safePrice - (safePrice * (discount / 100)) : safePrice;
  return (
    <div
      onClick={() => navigate(`/tour/${_id}`)}
      className="bg-white border border-gray-200 rounded-sm overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all flex flex-col h-full min-h-125"
    >
      <div className="relative h-64 shrink-0 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Dynamic Badges */}
        {(isbestSeller || isnewTrip) && (
          <div className="absolute top-4 left-4 z-20 bg-white rounded-full w-14 h-14 border border-dashed border-gray-400 flex flex-col items-center justify-center text-center shadow-sm">
            <span className="text-[9px] font-extrabold leading-tight uppercase text-gray-700">
              {isbestSeller ? <>Best<br />Seller</> : <>New<br />Trip</>}
            </span>
          </div>
        )}



        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="text-white text-xl font-bold border-b-2 border-white pb-1">View tour &rsaquo;</span>
        </div>

        {ispromo && (
          <div className="absolute bottom-0 w-full bg-[#1b4d4b] text-white text-[10px] font-bold py-2.5 px-4 tracking-wider uppercase">
            {ispromo}
          </div>
        )}
      </div>


      <div className="p-6 flex flex-col grow">
        {/* <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase w-fit">
          Code: {code}
        </span> */}

        <span className="bg-blue-50 text-gray-900 text-[10px] font-bold px-2 py-1 rounded tracking-widest uppercase w-fit">
          📍 {location}
        </span>


        <h3 className="text-xl font-serif text-gray-900 leading-tight mb-1 min-h-14 flex items-center">
          {title}
        </h3>

        <p className="font-bold text-sm text-gray-800">{duration}</p>

        <p className="font-bold text-sm text-gray-800">{group}</p>


        {/* <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2 min-h-8">
          {cities}
        </p> */}

        {/* Pricing Logic */}
        <div className="mt-auto pt-5">
          <hr className="mb-4 border-gray-100" />
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-red-500 line-through font-medium">
                Was ${Number(safePrice).toLocaleString()}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-xl text-gray-900">
                ${Number(finalPrice).toLocaleString()}
              </span>
              <span className="text-[10px] font-normal text-gray-400 uppercase">per person</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DestinationCard;
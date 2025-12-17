import React from 'react';
import { HiOutlineLocationMarker } from 'react-icons/hi';

const SearchBar = () => {
  return (
    <div className="relative z-20 -mt-16 md:-mt-24 flex justify-center w-full px-5">
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-2xl flex flex-col lg:flex-row items-center gap-6 w-full max-w-6xl">
        
        {/* Title Section */}
        <div className="w-full lg:w-1/5">
          <h2 className="text-3xl font-serif font-bold text-[#bd8157]">
            Search<br /> for a destination
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-4/5 items-center">
          
          {/* Destination Dropdown */}
          <div className="relative w-full border border-gray-200 rounded-md p-3 flex items-center gap-3">
            <HiOutlineLocationMarker className="text-gray-400 text-2xl" />
            <select className="w-full bg-transparent outline-none text-gray-600 appearance-none cursor-pointer">
              <option value="">Select a Country</option>
              <option value="thailand">Thailand</option>
              <option value="bali">Bali</option>
              <option value="dubai">Dubai</option>
            </select>
          </div>

          {/* Search Button */}
          <button className="bg-[#004d4d] text-white rounded-md hover:bg-[#003333]  px-10 py-4 font-bold uppercase tracking-wider w-full md:w-auto whitespace-nowrap cursor-pointer">
            Find My Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
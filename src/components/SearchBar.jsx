import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { getAllDestinations } from '../api/destinationApi';

const SearchBar = () => {
  const [allDestinations, setAllDestinations] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  // Fetch destinations on mount
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await getAllDestinations();
        if (response?.success) {
          setAllDestinations(response.data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };
    fetchDestinations();
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter logic: triggered on typing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = allDestinations.filter((dest) =>
        dest.location.toLowerCase().startsWith(value.toLowerCase()) ||
        dest.title.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const selectOption = (location) => {
    setSearchTerm(location);
    setShowDropdown(false);
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    navigate(`/tours?location=${searchTerm}`);
  };

  return (
    <div className="relative z-20 -mt-16 md:-mt-24 flex justify-center w-full px-5">
      <div className="bg-white p-6 md:p-10 rounded-lg shadow-2xl flex flex-col lg:flex-row items-center gap-6 w-full max-w-6xl">
        
        <div className="w-full lg:w-1/5">
          <h2 className="text-3xl font-serif font-bold text-[#bd8157]">
            Search<br /> for a destination
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-4/5 items-center">
          
          {/* Text Input with Auto-complete */}
          <div className="relative w-full" ref={wrapperRef}>
            <div className="border border-gray-200 rounded-md p-3 flex items-center gap-3 focus-within:border-[#004d4d] transition-colors">
              <HiOutlineLocationMarker className="text-gray-400 text-2xl" />
              <input 
                type="text"
                placeholder="Where would you like to go?"
                className="w-full bg-transparent outline-none text-gray-600 cursor-text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
              />
            </div>

            {/* Suggestions Dropdown */}
            {showDropdown && filteredOptions.length > 0 && (
              <ul className="absolute left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden custom-scrollbar">
                {filteredOptions.map((dest) => (
                  <li 
                    key={dest._id}
                    onClick={() => selectOption(dest.location)}
                    className="px-5 py-3 hover:bg-emerald-50 cursor-pointer flex flex-col border-b border-gray-50 last:border-none"
                  >
                    <span className="font-bold text-slate-800">{dest.location}</span>
                    <span className="text-xs text-slate-400">{dest.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button 
            onClick={handleSearch}
            className="bg-[#004d4d] text-white rounded-md hover:bg-[#003333] active:scale-95 transition-all px-10 py-4 font-bold uppercase tracking-wider w-full md:w-auto whitespace-nowrap cursor-pointer shadow-md"
          >
            Find My Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
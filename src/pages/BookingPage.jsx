import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDestinationById } from "../api/destinationApi"; 

const BookingPage = () => {
  const { id } = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 1. Convert travelerCount to STATE
  const [travelerCount, setTravelerCount] = useState(1);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const response = await getDestinationById(id);
        if (response.success) {
          setDestination(response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [id]);

  if (loading) return <div className="text-center p-10 font-sans">Loading...</div>;
  if (error) return <div className="text-center p-10 text-red-500 font-sans italic">{error}</div>;
  if (!destination) return <div className="text-center p-10">Destination not found.</div>;

  // 2. Financial Calculations (Now reactive to travelerCount state)
  const subtotal = destination.price * travelerCount;
  const totalDiscount = (destination.discount || 0) * travelerCount;
  const finalTotal = subtotal - totalDiscount;

  // 3. Handler for input changes
  const handleTravelerChange = (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setTravelerCount(1);
    } else if (value > destination.groupSize) {
      setTravelerCount(destination.groupSize); // Cap at max group size
    } else {
      setTravelerCount(value);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg overflow-hidden font-sans border border-gray-100 my-10">
      {/* Header & Visual */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 uppercase tracking-tight">
          {destination.title}
        </h2>
        <div className="flex gap-4">
          <img
            src={destination.images?.[0] ? `http://localhost:8000/uploads/${destination.images[0]}` : "https://via.placeholder.com/300"}
            alt={destination.title}
            className="w-24 h-24 rounded-lg object-cover"
          />
          <div className="flex flex-col justify-center space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2"><span>📍</span> <p>{destination.location}</p></div>
            <div className="flex items-start gap-2"><span>⏱️</span> <p>{destination.duration}</p></div>
          </div>
        </div>
      </div>

      {/* Traveler Input Section */}
      <div className="bg-orange-50/30 p-6 space-y-4 text-sm border-t border-b border-orange-100">
        <div className="flex justify-between items-center">
          <label htmlFor="travelers" className="text-gray-700 font-bold uppercase tracking-wider text-xs">
            Number of Travelers:
          </label>
          <div className="flex items-center border rounded-md bg-white">
            <button 
              onClick={() => setTravelerCount(Math.max(1, travelerCount - 1))}
              className="px-3 py-1 hover:bg-gray-100 text-lg font-bold border-r"
            >-</button>
            <input 
              type="number" 
              id="travelers"
              value={travelerCount}
              onChange={handleTravelerChange}
              className="w-12 text-center focus:outline-none font-bold"
              min="1"
              max={destination.groupSize}
            />
            <button 
              onClick={() => setTravelerCount(Math.min(destination.groupSize, travelerCount + 1))}
              className="px-3 py-1 hover:bg-gray-100 text-lg font-bold border-l"
            >+</button>
          </div>
        </div>
        
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 italic">Max Capacity: {destination.groupSize} guests</span>
          <span className={`font-bold ${destination.status === "active" ? "text-green-600" : "text-red-600"}`}>
            {destination.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="p-6">
        <div className="flex justify-between text-xs text-gray-400 font-bold uppercase mb-4">
          <span>Tour Breakdown</span>
          <div className="flex gap-8">
            <span>Travelers</span>
            <span>Subtotal</span>
          </div>
        </div>

        <div className="flex justify-between items-center py-2 border-t border-gray-100">
          <span className="text-sm font-medium">Tour Fare Adult</span>
          <div className="flex gap-12 text-sm">
            <span className="w-8 text-center">{travelerCount}</span>
            <span className="font-semibold w-16 text-right">${subtotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Discount Section */}
      {destination.discount > 0 && (
        <div className="bg-orange-200 p-4 px-6 flex justify-between text-orange-900 font-medium italic">
          <span>Early booking discount (adult):</span>
          <span>-${totalDiscount.toLocaleString()}</span>
        </div>
      )}

      {/* Total Section */}
      <div className="bg-teal-900 p-6 flex justify-between items-center text-white">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-3xl font-bold">${finalTotal.toLocaleString()}</span>
      </div>

      {/* Optional: Call to Action */}
      <div className="p-4 bg-gray-50">
        <button className="w-full bg-[#004d4d] text-white py-3 rounded-md font-bold hover:bg-black transition-colors">
          CONFIRM BOOKING FOR {travelerCount}
        </button>
      </div>
    </div>
  );
};

export default BookingPage;
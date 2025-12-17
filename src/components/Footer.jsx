import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram } from 'react-icons/fa'; // Install react-icons if you haven't

const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 pt-16 pb-8 px-5 md:px-32 border-t border-gray-200">
      
      {/* 1. Top Section: Call to Action (CTA) */}
      <div className="flex flex-col md:flex-row justify-between items-center pb-12 border-b border-gray-100 gap-8">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-serif font-bold text-[#a68269]">Explore our latest brochure</h2>
          <p className="text-gray-500 mt-2">The newest brochure & tour program catalog</p>
          <button className="mt-4 px-8 py-2 bg-[#004d4d] text-white rounded hover:bg-[#003333] transition-all uppercase text-sm tracking-widest">
            Explore
          </button>
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-3xl font-serif font-bold text-[#a68269]">Join our mailing list</h2>
          <p className="text-gray-500 mt-2">For all the latest news and promotions</p>
          <button className="mt-4 px-8 py-2 bg-[#004d4d] text-white rounded hover:bg-[#003333] transition-all uppercase text-sm tracking-widest">
            Subscribe
          </button>
        </div>

        <div className="text-center md:text-left">
          <h2 className="text-3xl font-serif font-bold text-[#a68269]">Let's keep in touch</h2>
          <p className="text-gray-500 mt-2">Follow us on:</p>
          <div className="flex justify-center md:justify-start gap-4 mt-4">
            <FaFacebookF className="text-xl cursor-pointer hover:text-[#a68269]" />
            <FaInstagram className="text-xl cursor-pointer hover:text-[#a68269]" />
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Multi-column Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-12">
        <div>
          <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">Destinations</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <Link to="/destinations" className="hover:text-[#a68269]">Offers</Link>
            <Link to="/destinations" className="hover:text-[#a68269]">Custom Tours</Link>
            <Link to="/destinations" className="hover:text-[#a68269]">Travel Agents</Link>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">Information</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>Visas & Passports</li>
            <li>Before your Trip</li>
            <li>Travel Protection Plan</li>
            <li>FAQ's</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">About Us</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>About Us</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Reviews</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-400">Customer Service</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>Contact</li>
            <li>My Account</li>
            <li>Online Payment</li>
          </ul>
        </div>

        {/* Logo and Branding Column */}
        <div className="col-span-2 lg:col-span-1 flex flex-col items-center lg:items-end">
             <h1 className="text-2xl font-serif font-bold italic text-gray-400">TravelForU</h1>
             <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Est. 1980</p>
        </div>
      </div>

      {/* 3. Bottom Section: Copyright */}
      <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-gray-400">All Rights Reserved © 2023 - TravelForU</p>
        <div className="flex gap-4 opacity-50 grayscale">
            {/* Replace with your payment icons/logos */}
            <span className="text-xs">VISA</span>
            <span className="text-xs">MASTERCARD</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
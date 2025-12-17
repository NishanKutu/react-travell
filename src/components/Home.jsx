import React from 'react';
import Button from '../layout/Button';
import { Link } from 'react-scroll';
import img from '../assets/img/Hero.jpg';
import SearchBar from './SearchBar';
import { HiOutlinePhone } from 'react-icons/hi';

const Home = () => {
    return (
        <div className = "bg-white">
            <section
                className="relative min-h-screen lg:min-h-[90vh] bg-cover bg-center bg-no-repeat flex items-center"
                style={{ backgroundImage: `url(${img})` }}
            >
                <div className="absolute inset-0 bg-black/50"></div>

                <div className="relative z-10 w-full max-w-7xl mx-auto px-5 md:px-32">
                    <div className="text-center mx-auto p-4 ">
                        <h1 className="font-serif text-6xl md:text-7xl text-white leading-tight">
                            Discover the Best Destinations
                        </h1>

                        <p className="mt-6 text-lg md:text-2xl text-white">
                            Experience the Dream with TravelForU the best tourist destinations
                            that we have to offer
                        </p>

                        <div className="mt-8">
                            <Link to="destination" spy={true} smooth={true} duration={500}>
                                <Button
                                    title="Destinations"
                                    variant="destination"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <SearchBar />
            <div className="flex justify-center w-full px-5 py-10">
                <div className="bg-[#004d4d] p-8 md:p-12 rounded-lg shadow-md flex flex-col md:flex-row items-center justify-between w-full max-w-6xl gap-8">

                    {/* Left Section: Text */}
                    <div className="text-white text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-2">
                            Contact <span className = "text-[#bd8157]">Us</span>
                        </h2>
                        <p className="text-lg opacity-90 font-medium">
                            Questions? Call us or your travel advisor.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

                        <div className="flex items-center gap-3 text-white">
                            <HiOutlinePhone className="text-3xl" />
                            <span className="text-2xl md:text-3xl font-bold tracking-tight">
                                977-9657836821
                            </span>
                        </div>

                        <div className="hidden md:block h-12 w-px bg-white"></div>

                        <button className="bg-white text-black px-8 py-4 rounded-md font-bold text-sm uppercase tracking-widest hover:bg-[#bd8157] transition-colors whitespace-nowrap">
                            Send an Inquiry
                        </button>
                    </div>
                </div>
            </div>
        </div>


    );
};

export default Home;
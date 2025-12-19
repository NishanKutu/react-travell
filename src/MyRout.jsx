import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Features from './components/Features';
import PopularDestination from './components/PopularDestination';
import About from './pages/About';
import Destinations from './pages/Destinations';
import ContactPage from './pages/ContactPage';
import PackageDetails from './pages/PackageDetails';

const MyRout = () => {
  return (
    <Routes>
      <Route path="/" element={
        <>
          <Home />
          <Features />
          <PopularDestination />
        </>
      } />

      
      <Route path="/features" element={<Features />} />
      <Route path="/about" element={<About />} />
      <Route path = "/destinations" element = {<Destinations/>} />
      <Route path="/contact" element={<ContactPage/>} />
      <Route path="/tour/:id" element={<PackageDetails />} />

    </Routes>
  );
};

export default MyRout;
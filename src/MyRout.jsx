import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Features from './components/Features';
import PopularDestination from './components/PopularDestination';

const MyRoute = () => {
  return (
    <Routes>
      <Route path="/" element={
        <>
          <Home />
          <Features />
          <PopularDestination />
        </>
      } />
      

      <Route path="/home" element={<Home />} />
      <Route path="/features" element={<Features />} />
      {/* <Route path="/destinations" element={<Destination />} /> */}
    </Routes>
  );
};

export default MyRoute;
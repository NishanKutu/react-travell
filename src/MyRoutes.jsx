import React from 'react';
import {BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Features from './components/Features';
import PopularDestination from './components/PopularDestination';
import About from './pages/About';
import Destinations from './pages/Destinations';
import ContactPage from './pages/ContactPage';
import PackageDetails from './pages/PackageDetails';
import FaqPage from './pages/FaqPage';
import AdminLayout from './layout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import MainLayout from './layout/MainLayout';
import VerifyEmail from './pages/VerifyEmail';
import AdminRoutes from './protectedRoutes/AdminRoutes';
import PageNotFound from './pages/PageNotFound';
import ResetPassword from './pages/ResetPassword';

const MyRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages with Navbar and Footer*/}
        <Route element={<MainLayout />}>
          <Route path="/" element={
            <>
              <Home />
              <Features />
              <PopularDestination />
            </>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/features" element={<Features />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/tour/:id" element={<PackageDetails />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path='verify/:token' element={<VerifyEmail />} />
          <Route path='/resetpassword/:token' element={<ResetPassword />} />

          <Route path='*' element = {<PageNotFound/>}/>

        </Route>

        {/*Admin Pages*/}
        <Route path='/' element={<AdminRoutes />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MyRoutes;
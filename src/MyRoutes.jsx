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
import AddDestination from './pages/admin/AddDestination';
import UsersListPage from './pages/admin/UsersListPage';
import DestinationsList from './pages/admin/DestinationsList';
import EditDestination from './pages/admin/EditDestination';
import BookingPage from './pages/BookingPage';
import PaymentSuccess from './components/PaymentSuccess';
import BookingList from './pages/admin/BookingList';
import ProfilePage from './pages/ProfilePage';
import AdminAddBooking from './pages/admin/AdminAddBooking';
import GuidesInfo from './pages/admin/GuideInfo';
import AdminReview from './pages/admin/AdminReview';
import Testimonials from './pages/Testimonials';
import AdminFaq from './pages/admin/AdminFaq';


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
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/tour/:id" element={<PackageDetails />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path='verify/:token' element={<VerifyEmail />} />
          <Route path='/resetpassword/:token' element={<ResetPassword />} />
          <Route path = "/booking/:id" element = {<BookingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path='*' element = {<PageNotFound/>}/>

        </Route>

        {/*Admin Pages*/}
        <Route path='/' element={<AdminRoutes />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path="destinations" element = {<DestinationsList />} />
            <Route path='add-destination' element = {<AddDestination />}/>
            <Route path = 'users' element = {<UsersListPage />}/>
            <Route path="edit-destination/:id" element = {<EditDestination />} />
            <Route path="booking-list" element = {<BookingList />} />
            <Route path="add-booking" element={<AdminAddBooking />} />
            <Route path="guide-info" element={<GuidesInfo />} />
            <Route path="admin-review" element = {<AdminReview />} />
            <Route path="admin-faq" element = {<AdminFaq />} />

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default MyRoutes;
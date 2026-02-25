import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/Signup";

const MainLayout = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);

  // Modal Control Functions
  const openLogin = () => {
    setIsLoginOpen(true);
    setIsSignupOpen(false);
  };

  const openSignup = () => {
    setIsSignupOpen(true);
    setIsLoginOpen(false);
  };

  const closeAll = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(false);
  };

  return (
    <>
      {/* Pass functions to Navbar so the header buttons work */}
      <Navbar openLogin={openLogin} openSignup={openSignup} />

      <main>
        {/* Pass functions to child pages (like BookingPage) via Context */}
        <Outlet context={{ openLogin, openSignup }} />
      </main>

      <Footer />

      {/* Global Modal Components rendered here */}
      <LoginPage
        isOpen={isLoginOpen}
        onClose={closeAll}
        switchToSignup={openSignup}
      />
      <SignupPage
        isOpen={isSignupOpen}
        onClose={closeAll}
        switchToLogin={openLogin}
      />
    </>
  );
};

export default MainLayout;

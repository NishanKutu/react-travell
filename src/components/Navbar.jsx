import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "../layout/Button";
import { AiOutlineMenu, AiOutlineClose } from "react-icons/ai";
import { isLoggedIn } from "../api/authAPI";

const Navbar = ({ openLogin, openSignup }) => {
  const [menu, setMenu] = useState(false);

  let auth = isLoggedIn();
  let navigate = useNavigate();

  const HikeHubLogo = () => (
    <div className="flex items-center justify-center bg-[#bd8157] p-1.5 rounded-xl shadow-lg group-hover:rotate-12 transition-transform flex-shrink-0">
      <svg
        width="30"
        height="30"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M15 80L50 20L85 80H15Z" fill="white" />
        <path
          d="M50 20L60 38L50 34L40 38L50 20Z"
          fill="#004d4d"
          fillOpacity="0.2"
        />
        <path
          d="M35 80C35 80 43 65 50 65C57 65 65 80 65 80"
          stroke="#004d4d"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  const handleSignout = () => {
    localStorage.removeItem("auth");
    setMenu(false);
    navigate("/");
    window.location.reload();
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Destinations", path: "/destinations" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Testimonials", path: "/testimonials" },
  ];

  const handleChange = () => setMenu(!menu);

  const desktopLinkBase =
    "relative pb-1 text-white transition-all cursor-pointer whitespace-nowrap after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full";
  const desktopActive = "font-bold after:w-full";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="flex flex-row justify-between items-center p-5 px-5 md:px-10 lg:px-16 xl:px-32 bg-[#004d4d] text-white shadow-md">
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center gap-2 lg:gap-3 group">
            <HikeHubLogo />
            <h1 className="text-xl lg:text-2xl font-black text-[#bd8157] tracking-tighter">
              HIKE<span className="text-[#ffffff]">HUB</span>
            </h1>
          </Link>
        </div>

        <nav className="hidden lg:flex flex-row items-center gap-4 xl:gap-8 mx-4">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `${desktopLinkBase} ${isActive ? desktopActive : "after:w-0"}`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex flex-row items-center gap-3 xl:gap-4 flex-shrink-0">
          {auth ? (
            <>
              <Link to={auth.user.role === 1 ? "/admin/dashboard" : "/profile"}>
                <Button
                  title={auth.user.role === 1 ? "Dashboard" : "Profile"}
                  variant="secondary"
                />
              </Link>
              <div onClick={handleSignout}>
                <Button title="Sign Out" variant="primary" />
              </div>
            </>
          ) : (
            <>
              <div onClick={openLogin}>
                <Button title="Login" variant="secondary" />
              </div>
              <div onClick={openSignup}>
                <Button title="Signup" variant="primary" />
              </div>
            </>
          )}
        </div>

        <div
          className="lg:hidden flex items-center p-2 cursor-pointer"
          onClick={handleChange}
        >
          {menu ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
        </div>

        {/* Mobile Sidebar */}
        <div
          className={`${
            menu ? "translate-x-0" : "-translate-x-full"
          } lg:hidden flex flex-col absolute z-50 bg-[#004d4d]/95 backdrop-blur-md text-white left-0 top-full text-2xl text-center pt-8 pb-10 gap-8 w-full h-screen transition-transform duration-300 ease-in-out`}
        >
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                isActive ? "text-amber-400 font-bold" : ""
              }
              onClick={() => setMenu(false)}
            >
              {item.name}
            </NavLink>
          ))}
          <div className="flex flex-col items-center gap-4 mt-4">
            {auth ? (
              <Button
                onClick={handleSignout}
                title="Sign Out"
                variant="primary"
              />
            ) : (
              <>
                <Button onClick={openLogin} title="Login" variant="secondary" />
                <Button onClick={openSignup} title="Signup" variant="primary" />
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

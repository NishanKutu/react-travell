import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Button from '../layout/Button';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import LoginPage from '../pages/LoginPage';
import SignupPage from '..//pages/Signup';
import { isLoggedIn } from '../api/authAPI';

const Navbar = () => {
    const [menu, setMenu] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);

    let auth = isLoggedIn()
    let navigate = useNavigate()

    const openLogin = () => {
        setIsLoginOpen(true);
        setIsSignupOpen(false);
        setMenu(false);
    };

    const openSignup = () => {
        setIsSignupOpen(true);
        setIsLoginOpen(false);
        setMenu(false);
    };

    const closeAll = () => {
        setIsLoginOpen(false);
        setIsSignupOpen(false);
    };

    const handleSignout = () => {
        localStorage.removeItem('auth')
        navigate('/')
    }

    const navItems = [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/features' },
        { name: 'Destinations', path: '/destinations' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'faq', path: '/faq' },
    ];

    const handleChange = () => setMenu(!menu);

    const desktopLinkBase = "relative pb-1 text-white transition-all cursor-pointer after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-0.5 after:bg-white after:transition-all after:duration-300 hover:after:w-full";
    const desktopActive = "font-bold after:w-full";

    return (
        <header className="sticky top-0 z-50">
            {/* Main Navbar Container */}
            <div className="flex flex-row justify-between p-5 md:px-32 px-5 bg-[#004d4d] text-white shadow-[0_3px_10px_rgb(0,0,0,0.2)]">
                <div className="flex items-center">
                    <Link to="/" className="cursor-pointer" onClick={() => setMenu(false)}>
                        <h1 className="font-semibold text-xl tracking-tight">TravelForU</h1>
                    </Link>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex flex-row items-center gap-8">
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

                {/* Desktop Buttons */}
                <div className="hidden lg:flex flex-row items-center gap-4">
                    {
                        auth ?
                            auth.user.role == 1 ?
                                <>
                                    <div >
                                        <Link to={'/admin/dashboard'}>
                                        <Button title="Dashboard" variant="secondary" />
                                        </Link>
                                    </div>
                                    <div onClick={handleSignout}>
                                        <Button title="Sign Out" isPrimary={true} />
                                    </div>
                                </>
                                :
                                <>

                                    <div >
                                        <Button title="Profile" variant="secondary" />
                                    </div>
                                    <div onClick={handleSignout}>
                                        <Button title="Sign Out" isPrimary={true} />
                                    </div></>
                            :
                            <>
                                <div onClick={openLogin}>
                                    <Button title="Login" variant="secondary" />
                                </div>
                                <div onClick={openSignup}>
                                    <Button title="Signup" isPrimary={true} />
                                </div>
                            </>
                    }
                </div>

                {/* Mobile Menu Icon */}
                <div className="lg:hidden flex items-center p-2 cursor-pointer" onClick={handleChange}>
                    {menu ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
                </div>

                {/* Mobile Sidebar Menu */}
                <div className={`
                    ${menu ? "translate-x-0" : "-translate-x-full"} 
                    lg:hidden flex flex-col absolute z-50 bg-[#004d4d]/95 backdrop-blur-md text-white left-0 top-18 text-2xl text-center pt-8 pb-10 gap-8 w-full h-fit transition-transform duration-300 ease-in-out
                `}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `transition-all duration-300 ${isActive ? 'text-amber-400 font-bold scale-110' : 'hover:text-amber-400'}`
                            }
                            onClick={() => setMenu(false)}
                        >
                            {item.name}
                        </NavLink>
                    ))}

                    {/* Mobile Login/Signup Buttons */}
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <div onClick={openLogin}>
                            <Button title="Login" variant="secondary" />
                        </div>
                        <div onClick={openSignup}>
                            <Button title="Signup" isPrimary={true} />
                        </div>
                    </div>
                </div>
            </div>

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
        </header>
    );
};

export default Navbar;
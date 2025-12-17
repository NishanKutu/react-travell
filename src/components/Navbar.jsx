import React, { useState } from 'react'
import { Link, useResolvedPath } from 'react-router-dom';
import Button from '../layout/Button'
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';



const Navbar = () => {


    const [menu, setMenu] = useState(false);

    const handleChange = () => {
        setMenu(!menu);
    }

    const path = useResolvedPath()
    console.log(path)



    return (
        <div>
            <div className=" flex flex-row justify-between p-5 md:px-32 px-5 bg-[#004d4d] text-white ">
                <div className=" flex items-center ">
                    <Link to='/' className="cursor-pointer" onClick={() => setMenu(false)} >
                        <h1 className=" font-semibold text-xl ">TravelForU</h1>
                    </Link>
                </div>
                <nav className=" hidden lg:flex flex-row items-center gap-6 ">
                    <Link
                        to='home'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/home/)&&'font-bold text-white'}`} 
                        onClick={() => setMenu(false)}

                    >
                        Home
                    </Link>
                    <Link
                        to='/features'
                        className = {`text-white transition-all cursor-pointer ${path.pathname.match(/features/) && 'font-bold text-white'}`}
                        onClick={() => setMenu(false)}
                    >
                        Features
                    </Link>
                    <Link
                        to='/destinations'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/destinations/) && 'font-bold text-white'}`}
                        onClick={() => setMenu(false)}
                    >
                        Destinations
                    </Link>
                    <Link
                        to='/about'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/about/) && 'font-bold text-white'}` }
                        onClick={() => setMenu(false)}
                    >
                        About
                    </Link>
                    <Link
                        to='/contact'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/contact/) && 'font-bold text-white'}`}
                        onClick={() => setMenu(false)}
                    >
                        Contact
                    </Link>
                </nav>
                <div className=" hidden lg:flex flex-row items-center gap-4 ">
                    <Button title="Login" variant="secondary" />
                    <Button title="Signup" isPrimary={true} />
                </div>

                <div className="lg:hidden flex item-center p-2 cursor-pointer" onClick={handleChange} >
                    {menu ? <AiOutlineClose size={25} /> : <AiOutlineMenu size={25} />}
                </div>

                <div className={`${menu ? "translate-x-0" : "-translate-x-full"} lg:hidden flex flex-col absolute z-50 bg-black/70 backdrop-blur-sm text-white left-0 top-18 text-2xl text-center pt-8 pb-4 gap-8 w-full h-fit transition-transform duration-300`}>
                    <Link
                        to='home'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/home/)&&'font-bold text-white'}`} 
                        onClick={() => setMenu(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to='features'
                        className = {`text-white transition-all cursor-pointer ${path.pathname.match(/features/) && 'font-bold text-white'}`}
                        onClick={() => setMenu(false)}
                    >
                        Features
                    </Link>
                    <Link
                        to='destinations'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/destinations/) && 'font-bold text-white'}`}
                        onClick={() => setMenu(false)}
                    >
                        Destinations
                    </Link>
                    <Link
                        to='about'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/about/) && 'font-bold text-white'}` }
                        onClick={() => setMenu(false)}
                    >
                        About
                    </Link>
                    <Link
                        to='contact'
                        className={`text-white transition-all cursor-pointer ${path.pathname.match(/contact/) && 'font-bold text-white'}`}
                        onClick={() => setMenu(false)}
                    >
                        Contact
                    </Link>

                    <div className="flex flex-col lg:hidden lg:flex-row items-center gap-4 ">
                        <Button title="Login" variant="secondary" />
                        <Button title="Signup" isPrimary={true} />
                    </div>

                </div>

            </div>
        </div>
    )
}

export default Navbar
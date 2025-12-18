import React, { useState } from 'react';

const ContactPage = () => {
    const [result, setResult] = useState("");
    const [status, setStatus] = useState("text-gray-500");

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.target;

        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            form.querySelectorAll(":invalid")[0].focus();
            return;
        }

        setResult("Please wait...");
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: json
            });

            const resJson = await response.json();
            if (response.status === 200) {
                setResult("Message sent successfully!");
                setStatus("text-green-600");
                form.reset();
                form.classList.remove("was-validated");
            } else {
                setResult(resJson.message);
                setStatus("text-red-500");
            }
        } catch (error) {
            setResult("Something went wrong!");
            setStatus("text-red-500");
        }
    };

    return (
        <div className="bg-white font-sans text-gray-800">
            {/* --- HERO SECTION --- */}
            <div 
                className="relative h-80 flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1500&q=80')` }}
            >
                <div className="absolute inset-0 bg-black/40"></div>
                <h1 className="relative olute z-10 text-white text-6xl md:text-8xl font-serif">Contact Us</h1>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    
                    {/* LEFT COLUMN: FORM */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold mb-4">Fill out the form below</h2>
                        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
                            Please note that our office is open for walk-in clients. To maintain a safe working environment we strongly encourage all clients to wear a mask when visiting our office. Thank you for your cooperation.
                        </p>

                        <form onSubmit={handleSubmit} noValidate className="space-y-4">
                            <input type="hidden" name="access_key" value="YOUR_ACCESS_KEY_HERE" />
                            
                            <div>
                                <input type="text" name="name" placeholder="Name*" required 
                                    className="w-full border border-gray-300 p-3 focus:outline-none focus:border-teal-700" />
                            </div>

                            <div>
                                <input type="text" name="phone" placeholder="Phone" 
                                    className="w-full border border-gray-300 p-3 focus:outline-none focus:border-teal-700" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input type="email" name="email" placeholder="E-mail*" required 
                                    className="w-full border border-gray-300 p-3 focus:outline-none focus:border-teal-700" />
                                <input type="email" name="confirm_email" placeholder="Confirm E-mail*" required 
                                    className="w-full border border-gray-300 p-3 focus:outline-none focus:border-teal-700" />
                            </div>


                            <div>
                                <textarea name="message" rows="6" placeholder="Message" 
                                    className="w-full border border-gray-300 p-3 focus:outline-none focus:border-teal-700"></textarea>
                            </div>

                            <button type="submit" className="bg-[#004d43] text-white px-10 py-3 font-bold hover:bg-[#003333] transition-colors tracking-widest text-sm cursor-pointer">
                                SEND
                            </button>
                            
                            <p className={`mt-4 ${status}`}>{result}</p>
                        </form>
                    </div>

                    {/* RIGHT COLUMN: CONTACT INFO */}
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-serif mb-6">Kathmandu, Nepal</h2>
                            
                            <div className="mb-6">
                                <h3 className="text-[#c08457] font-bold text-sm uppercase mb-2">Tel:</h3>
                                <p className="text-sm">01-6644551</p>
                                <p className="text-sm">01-6622332</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-[#c08457] font-bold text-sm uppercase mb-2">Opening Hours:</h3>
                                <p className="text-sm font-semibold">09:00 AM - 05:30 PM, Sun - Fri</p>
                                <p className="text-sm text-gray-500 italic">Closed on National Holidays</p>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-[#c08457] font-bold text-sm uppercase mb-2">After office hour:</h3>
                                <p className="text-xs text-gray-500 mb-1">Emergency contact only</p>
                                <p className="text-sm font-semibold">977-9988776655</p>
                            </div>

                            <div>
                                <h3 className="text-[#c08457] font-bold text-sm uppercase mb-2">Address:</h3>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    Mahalaxmisthan, Kathmandu<br/>
                                    gathaghar, Bhaktapur
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ContactPage;
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FAQ_DATA = [
  {
    sectionTitle: "Before you book",
    categories: [
      {
        name: "General - booking (8)",
        links: ["What is included in the tour package?", "How do I make a reservation?", "See all"]
      },
      {
        name: "Itinerary & Deviations (3)",
        links: ["Can I add additional nights to the beginning or end of my tour?", "Can I extend my stay in a different city...", "See all"]
      },
      {
        name: "Solo Travelers/Room Types (5)",
        links: ["What is a single supplement fee?", "My friend and I would like to share a room...", "See all"]
      },
      {
        name: "Payment (7)",
        links: ["Do you offer a payment plan?", "Can I pay using more than one card?", "See all"]
      },
      {
        name: "Cancellations/Departure Date Change (1)",
        links: ["Cancellations/Departure Date Change"]
      },
      {
        name: "Flights/Name Errors (4)",
        links: ["One of the traveler names is incorrect...", "I want to know what flight I will be on...", "See all"]
      }
    ]
  },
  {
    sectionTitle: "Before your trip",
    categories: [
      {
        name: "Flights/Travel Itinerary (5)",
        links: ["Can you send me my flight itinerary?", "When will my tickets be issued?", "See all"]
      },
      {
        name: "Visa Information (1)",
        links: ["Will I need a visa for my trip?"]
      },
      {
        name: "Safety/Medical Information (3)",
        links: ["I am concerned about the political stability...", "Will refrigerators be available for my medication?", "See all"]
      }
    ]
  },
  {
    sectionTitle: "During your trip",
    categories: [
      {
        name: "Flights & Arrival (5)",
        links: ["What should I do if I miss the beginning...", "My outbound flight has been cancelled...", "See all"]
      },
      {
        name: "Wi-Fi/Electrical Equipment (3)",
        links: ["Do I need an adapter/converter?", "Will the hotels provide free Wi-Fi?", "See all"]
      }
    ]
  }
];


const FaqPage = () => {
    const navigate = useNavigate();
  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      {/* Header Section */}
      <header className="py-16 px-4 text-center">
        <nav className="text-sm text-gray-500 mb-8">
          <span className="hover:underline cursor-pointer text-teal-700" onClick = {() => navigate('/')}>Home</span> / FAQs
        </nav>
        <h1 className="text-5xl font-serif mb-12 text-[#1a3a3a]">How can we help?</h1>
        
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto flex items-center bg-[#f2e8e3] p-8 rounded-sm">
          <label className="text-3xl font-serif mr-6 text-[#1a3a3a]">Search our FAQs</label>
          <div className="grow flex border">
            <input 
              type="text" 
              className="grow p-3 border-none focus:ring-0"
              placeholder=""
            />
            <button className="bg-[#004d4d] text-white px-8 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[#003333] cursor-pointer">
              Search
            </button>
          </div>
        </div>
      </header>

      {/* FAQ Content */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        {FAQ_DATA.map((section, idx) => (
          <div key={idx} className="mb-16 border-t border-gray-200 pt-12">
            <h2 className="text-4xl font-serif mb-10 text-[#1a3a3a]">{section.sectionTitle}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-12">
              {section.categories.map((cat, catIdx) => (
                <div key={catIdx}>
                  <h3 className="font-bold text-lg mb-4 border-b pb-2">{cat.name}</h3>
                  <ul className="space-y-3">
                    {cat.links.map((link, linkIdx) => (
                      <li key={linkIdx}>
                        <a 
                          href="#" 
                          className={`text-[15px] hover:underline ${link === 'See all' ? 'text-teal-700 font-semibold' : 'text-gray-700'}`}
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-[#f2e8e3] rounded-sm p-12 text-center mt-20">
          <h2 className="text-3xl font-serif mb-6 text-[#1a3a3a]">Can't find the information you need?</h2>
          <button className="bg-[#1a3a3a] text-white px-10 py-4 font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#bd8157] cursor-pointer"
          onClick = {() => navigate('/contact')}
          >
            Contact Us
          </button>
        </div>
      </main>
    </div>
  );
};

export default FaqPage;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const FaqPage = () => {
  const navigate = useNavigate();
  const [faqSections, setFaqSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // New state to track which FAQ is expanded
  const [activeFaq, setActiveFaq] = useState(null);

  const isAdmin = localStorage.getItem("role") === "admin";

  const fetchFaqs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/faqs/getallfaqs");
      if (res.data.success) {
        setFaqSections(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Toggle accordion function
  const toggleFaq = (id) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const authData = JSON.parse(localStorage.getItem("auth"));
      const token = authData?.token;
      const res = await axios.delete(
        `http://localhost:8000/api/faqs/deletefaq/${faqId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        fetchFaqs();
        alert("FAQ deleted successfully");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete FAQ");
    }
  };

  const filteredData = faqSections
    .map((section) => ({
      ...section,
      categories: section.categories
        .map((cat) => ({
          ...cat,
          // Filter FAQs based on the question text
          faqs: cat.faqs.filter(
            (f) =>
              f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              f.answer.toLowerCase().includes(searchQuery.toLowerCase()) 
          ),
        }))
        // Only keep categories that still have FAQs after filtering
        .filter((cat) => cat.faqs.length > 0),
    }))
    // Only keep sections that still have categories after filtering
    .filter((section) => section.categories.length > 0);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-700 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading FAQs...</p>
      </div>
    );

  return (
    <div className="bg-white min-h-screen font-sans text-[#333]">
      <header className="py-16 px-4 text-center">
        <nav className="text-sm text-gray-500 mb-8">
          <span
            className="hover:underline cursor-pointer text-teal-700"
            onClick={() => navigate("/")}
          >
            Home
          </span>{" "}
          / FAQs
        </nav>
        <h1 className="text-5xl font-serif mb-12 text-[#1a3a3a]">
          How can we help?
        </h1>
        <div className="max-w-3xl mx-auto flex items-center bg-[#f2e8e3] p-8 rounded-sm">
          <label className="text-3xl font-serif mr-6 text-[#1a3a3a]">
            Search our FAQs
          </label>
          <div className="grow flex border shadow-sm bg-white">
            <input
              type="text"
              className="grow p-4 border-none focus:ring-2 focus:ring-teal-600 outline-none"
              placeholder="e.g. Booking, Payment, Cancellation"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-20">
        {filteredData.length === 0 ? (
          <div className="text-center py-20 border-t">
            <p className="text-gray-400 italic">
              No results found for "{searchQuery}"
            </p>
          </div>
        ) : (
          filteredData.map((section, idx) => (
            <div key={idx} className="mb-16 border-t border-gray-200 pt-12">
              <h2 className="text-4xl font-serif mb-10 text-[#1a3a3a]">
                {section.sectionTitle}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-12">
                {section.categories.map((cat, catIdx) => (
                  <div key={catIdx}>
                    <h3 className="font-bold text-lg mb-4 border-b border-gray-100 pb-2">
                      {cat.name}
                    </h3>
                    <ul className="space-y-2">
                      {cat.faqs.map((faq) => (
                        <li
                          key={faq._id}
                          className="group border-b border-gray-50 last:border-none pb-2"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <button
                              className={`text-[15px] text-left transition-colors leading-snug py-2 flex-1 ${
                                activeFaq === faq._id
                                  ? "text-teal-700 font-bold"
                                  : "hover:text-teal-700"
                              }`}
                              onClick={() => toggleFaq(faq._id)}
                            >
                              {faq.question}
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(faq._id)}
                                className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* SLIDE DOWN ANSWER SECTION */}
                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              activeFaq === faq._id
                                ? "max-h-96 opacity-100 mt-2"
                                : "max-h-0 opacity-0"
                            }`}
                          >
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-sm border-l-2 border-teal-600 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        <div className="bg-[#f2e8e3] rounded-sm p-12 text-center mt-20">
          <h2 className="text-3xl font-serif mb-6 text-[#1a3a3a]">
            Can't find the information you need?
          </h2>
          <button
            className="bg-[#1a3a3a] text-white px-10 py-4 font-bold uppercase tracking-widest text-sm rounded-full hover:bg-teal-900 transition-all shadow-lg"
            onClick={() => navigate("/contact")}
          >
            Contact Us
          </button>
        </div>
      </main>
    </div>
  );
};

export default FaqPage;

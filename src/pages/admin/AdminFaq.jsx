import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const AdminFaq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    section: "Before you book",
    category: "",
    order: 0,
  });

  const sections = ["Before you book", "Before your trip", "During your trip"];

  // Helper to get token and headers
  const getAuthHeader = () => {
    const authData = localStorage.getItem("auth");

    if (!authData) {
      console.error("No auth data found in localStorage");
      return {};
    }

    try {
      const parsedAuth = JSON.parse(authData);
      const token = parsedAuth.token;

      if (!token) {
        console.error("Token missing from auth object");
        return {};
      }

      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    } catch (error) {
      console.error("Error parsing auth data:", error);
      return {};
    }
  };

  const fetchFaqs = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/faqs/getallfaqs");
      if (res.data.success) {
        setFaqs(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8000/api/faqs/createfaq",
        formData,
        getAuthHeader()
      );

      if (res.data.success) {
        alert("FAQ Created Successfully!");
        setFormData({
          question: "",
          answer: "",
          section: "Before you book",
          category: "",
          order: 0,
        });
        fetchFaqs();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Error creating FAQ";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/faqs/deletefaq/${id}`,
        getAuthHeader()
      );
      if (res.data.success) fetchFaqs();
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-serif text-[#1a3a3a]">FAQ Management</h1>
          <p className="text-gray-500">
            Add, edit, or remove frequently asked questions
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-8">
            <h2 className="text-xl font-bold mb-6 text-teal-800">
              Add New FAQ
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Section
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-500"
                >
                  {sections.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Payments"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Question
                </label>
                <input
                  type="text"
                  name="question"
                  value={formData.question}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                  Answer
                </label>
                <textarea
                  name="answer"
                  rows="4"
                  value={formData.answer}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-teal-500"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1a3a3a] text-white font-bold py-3 rounded-lg hover:bg-teal-900 transition-all disabled:opacity-50"
              >
                {loading ? "Saving..." : "Publish FAQ"}
              </button>
            </form>
          </div>

          {/* List Section */}
          <div className="lg:col-span-2 space-y-6">
            {faqs.length === 0 && (
              <div className="text-center p-10 bg-white rounded-xl">
                No FAQs found.
              </div>
            )}
            {faqs.map((section, sIdx) => (
              <div
                key={sIdx}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="bg-teal-50 px-6 py-3 border-b border-teal-100">
                  <h3 className="font-bold text-teal-900">
                    {section.sectionTitle}
                  </h3>
                </div>

                <div className="p-6 space-y-6">
                  {section.categories.map((cat, cIdx) => (
                    <div key={cIdx} className="border-l-2 border-gray-100 pl-4">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                        {cat.name}
                      </h4>
                      <div className="space-y-3">
                        {cat.faqs.map((faq) => (
                          <div
                            key={faq._id}
                            className="flex justify-between items-start group bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-all"
                          >
                            <div className="flex-1">
                              <p className="font-bold text-sm text-gray-800">
                                {faq.question}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {faq.answer}
                              </p>
                            </div>
                            <button
                              onClick={() => handleDelete(faq._id)}
                              className="text-red-400 hover:text-red-600 ml-4"
                              title="Delete Question"
                            >
                              <svg
                                className="w-5 h-5"
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
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFaq;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDestination } from "../../api/destinationApi";

const AddDestination = () => {
    const navigate = useNavigate();
    const auth = JSON.parse(localStorage.getItem("auth"));
    const token = auth ? auth.token : null;

    // Separate state for files and their preview URLs
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        descriptions: "",
        location: "",
        price: "",
        duration: "",
        discount: 0,
        groupSize: "",
        isBestSeller: false,
        isNewTrip: false,
        isPromo: false,
        itinerary: [{ day: 1, title: "", descriptions: "" }],
        inclusions: {
            included: [""],
            notIncluded: [""]
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    // --- Dynamic File Handling ---
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Append new files to existing selection
        const updatedFiles = [...selectedFiles, ...files];
        setSelectedFiles(updatedFiles);

        // Generate previews
        const urls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls([...previewUrls, ...urls]);
    };

    const removeSelectedFile = (index) => {
        const updatedFiles = selectedFiles.filter((_, i) => i !== index);
        const updatedPreviews = previewUrls.filter((_, i) => i !== index);
        
        // Revoke the URL to prevent memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        
        setSelectedFiles(updatedFiles);
        setPreviewUrls(updatedPreviews);
    };

    const handleItineraryChange = (index, key, value) => {
        const updated = [...formData.itinerary];
        updated[index][key] = value;
        setFormData({ ...formData, itinerary: updated });
    };

    const addItineraryDay = () => {
        setFormData({
            ...formData,
            itinerary: [...formData.itinerary, { day: formData.itinerary.length + 1, title: "", descriptions: "" }]
        });
    };

    const removeItineraryDay = (index) => {
        const updated = formData.itinerary.filter((_, i) => i !== index)
            .map((item, i) => ({ ...item, day: i + 1 }));
        setFormData({ ...formData, itinerary: updated });
    };

    const handleInclusionChange = (type, index, value) => {
        const updated = [...formData.inclusions[type]];
        updated[index] = value;
        setFormData({ ...formData, inclusions: { ...formData.inclusions, [type]: updated } });
    };

    const addInclusion = (type) => {
        setFormData({
            ...formData,
            inclusions: { ...formData.inclusions, [type]: [...formData.inclusions[type], ""] }
        });
    };

    const removeInclusion = (type, index) => {
        const updated = formData.inclusions[type].filter((_, i) => i !== index);
        setFormData({ ...formData, inclusions: { ...formData.inclusions, [type]: updated } });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            alert("You must be logged in as an admin.");
            return;
        }

        const data = new FormData();
        const textFields = ['title', 'descriptions', 'location', 'price', 'duration', 'discount', 'groupSize', 'isBestSeller', 'isNewTrip', 'isPromo'];
        textFields.forEach(field => data.append(field, formData[field]));

        const cleanInclusions = {
            included: formData.inclusions.included.filter(item => item.trim() !== ""),
            notIncluded: formData.inclusions.notIncluded.filter(item => item.trim() !== "")
        };
        data.append("itinerary", JSON.stringify(formData.itinerary));
        data.append("inclusions", JSON.stringify(cleanInclusions));

        selectedFiles.forEach(file => data.append("images", file));

        try {
            await createDestination(data, token);
            alert("Destination Published successfully!");
            navigate("/admin/destinations");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-slate-800 p-5 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold tracking-tight">Create New Travel Package</h2>
                    <button onClick={() => navigate(-1)} className="bg-slate-700 px-4 py-1.5 rounded text-sm font-medium hover:bg-slate-600 transition">Back</button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-12">
                    {/* Section 1: Core Details */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b pb-2">1. Core Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Trip Title</label>
                                <input name="title" className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none" value={formData.title} onChange={handleChange} required />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1">Main Description</label>
                                <textarea name="descriptions" rows="5" className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none" value={formData.descriptions} onChange={handleChange} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">Location</label>
                                <input name="location" className="w-full p-2.5 border rounded-md focus:ring-2 focus:ring-slate-200 outline-none" value={formData.location} onChange={handleChange} required />
                            </div>

                            <div className="col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <label className="block text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">Trip Badges & Promotion</label>
                                <div className="flex flex-wrap gap-8">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="isNewTrip" checked={formData.isNewTrip} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-slate-800" />
                                        <span className="text-sm font-medium text-slate-700">New Trip</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="isBestSeller" checked={formData.isBestSeller} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-slate-800" />
                                        <span className="text-sm font-medium text-slate-700">Best Seller</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input type="checkbox" name="isPromo" checked={formData.isPromo} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-slate-800" />
                                        <span className="text-sm font-medium text-slate-700">Promo Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 col-span-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
                                    <input type="number" name="price" className="w-full p-2.5 border rounded-md outline-none" value={formData.price} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                                    <input name="duration" className="w-full p-2.5 border rounded-md outline-none" value={formData.duration} onChange={handleChange} required />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Discount (%)</label>
                                    <input type="number" name="discount" className="w-full p-2.5 border rounded-md outline-none" value={formData.discount} onChange={handleChange} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Gallery with Previews and Deletion */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 border-b pb-2">2. Photo Gallery</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {previewUrls.map((url, i) => (
                                <div key={i} className="group relative aspect-video bg-blue-50 border-blue-400 border rounded overflow-hidden">
                                    <img src={url} className="w-full h-full object-cover" alt="preview" />
                                    <button
                                        type="button"
                                        onClick={() => removeSelectedFile(i)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <span className="absolute bottom-0 left-0 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 uppercase">Pending Upload</span>
                                </div>
                            ))}
                        </div>
                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="text-sm block w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                    </div>

                    {/* Section 3: Itinerary */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">3. Daily Itinerary</h3>
                            <button type="button" onClick={addItineraryDay} className="text-[10px] font-bold bg-slate-800 text-white px-3 py-1 rounded hover:bg-slate-700">+ Add Day</button>
                        </div>
                        <div className="space-y-4">
                            {formData.itinerary.map((day, i) => (
                                <div key={i} className="group p-5 bg-gray-50 border border-gray-200 rounded-lg relative">
                                    <button type="button" onClick={() => removeItineraryDay(i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xs font-bold">✕ Delete Day</button>
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="bg-slate-800 text-white text-[10px] font-black px-2 py-0.5 rounded">DAY {day.day}</span>
                                        <input className="flex-1 bg-transparent border-b border-gray-300 focus:border-slate-800 outline-none text-sm font-bold p-1" placeholder="Activity Title" value={day.title} onChange={(e) => handleItineraryChange(i, "title", e.target.value)} />
                                    </div>
                                    <textarea className="w-full p-3 bg-white border rounded text-sm outline-none" rows="3" placeholder="Describe the day's events..." value={day.descriptions} onChange={(e) => handleItineraryChange(i, "descriptions", e.target.value)} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section 4: Inclusions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest">Included</h4>
                            {formData.inclusions.included.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input className="flex-1 p-2 border-emerald-100 border bg-emerald-50/30 rounded text-sm outline-none" value={item} onChange={(e) => handleInclusionChange("included", i, e.target.value)} />
                                    <button type="button" onClick={() => removeInclusion("included", i)} className="text-emerald-300 hover:text-red-400 font-bold">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addInclusion("included")} className="text-[10px] font-bold text-emerald-600 underline uppercase tracking-widest">+ Add Item</button>
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-rose-700 uppercase tracking-widest">Not Included</h4>
                            {formData.inclusions.notIncluded.map((item, i) => (
                                <div key={i} className="flex gap-2">
                                    <input className="flex-1 p-2 border-rose-100 border bg-rose-50/30 rounded text-sm outline-none" value={item} onChange={(e) => handleInclusionChange("notIncluded", i, e.target.value)} />
                                    <button type="button" onClick={() => removeInclusion("notIncluded", i)} className="text-rose-300 hover:text-red-400 font-bold">✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addInclusion("notIncluded")} className="text-[10px] font-bold text-rose-600 underline uppercase tracking-widest">+ Add Item</button>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded shadow-lg hover:shadow-xl hover:translate-y-px transition-all">
                        PUBLISH DESTINATION
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddDestination;
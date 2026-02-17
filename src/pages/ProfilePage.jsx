import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI";
import {
  getAllBookings,
  deleteBooking,
  getEsewaSignature,
  updateBookingStatus, 
} from "../api/bookingApi";
import { getAllDestinations } from "../api/destinationApi";
import { updateProfile } from "../api/userApi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: initialUser, token } = isLoggedIn();

  // States
  const [user, setUser] = useState(initialUser);
  const [bookings, setBookings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: initialUser?.username || "",
    experience: initialUser?.experience || "",
    age: initialUser?.age || "",
    bio: initialUser?.bio || "",
    specialization: initialUser?.specialization || "",
    dailyRate: initialUser?.dailyRate || "",
  });
  const [imageFile, setImageFile] = useState(null);

  const isGuide = Number(user?.role) === 2;
  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    try {
      const bookingRes = await getAllBookings();
      if (bookingRes?.success) {
        const validBookings = bookingRes.data.filter(
          (b) => b.destinationId !== null
        );
        setBookings(validBookings);
      }
      const destRes = await getAllDestinations();
      if (destRes?.success) {
        const shuffled = destRes.data.sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- EDIT PROFILE LOGIC ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("experience", formData.experience);
      data.append("age", formData.age);
      data.append("bio", formData.bio);
      data.append("specialization", formData.specialization);
      data.append("dailyRate", formData.dailyRate);
      if (imageFile) data.append("image", imageFile);

      const res = await updateProfile(user._id, data, token);
      if (res.success) {
        alert("Profile updated successfully!");
        setUser(res.user);
        localStorage.setItem("auth", JSON.stringify({ token, user: res.user }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Update Error:", error);
      alert("Failed to update profile.");
    }
  };

  // MARK AS COMPLETED LOGIC 
  const handleStatusUpdate = async (id, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to mark this trek as ${newStatus}?`
      )
    )
      return;
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        alert(`Trek ${newStatus}!`);
        // Update local state to reflect change immediately
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Status Update Error:", err);
      alert("Failed to update status");
    }
  };

  // --- DELETE & PAYMENT LOGIC ---
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure?")) return;
    const res = await deleteBooking(id);
    if (res.success) setBookings(bookings.filter((b) => b._id !== id));
  };

  const handlePayment = async (e, booking) => {
    e.stopPropagation();
    const res = await getEsewaSignature({
      amount: booking.totalPrice,
      productId: `${booking._id}-${Date.now()}`,
    });
    if (res.success) {
      submitEsewa(
        booking.totalPrice,
        res.transaction_uuid,
        res.signature,
        res.product_code
      );
    }
  };

  const submitEsewa = (amount, uuid, sig, code) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const fields = {
      amount,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: uuid,
      product_code: code,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: "http://localhost:8000/api/bookings/verify-esewa",
      failure_url: "http://localhost:5173/payment-failure",
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature: sig,
    };
    for (const key in fields) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }
    document.body.appendChild(form);
    form.submit();
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse">
        Loading Your Workspace...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          {/* Profile Header Content */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#004d4d]/5 rounded-bl-full -mr-10 -mt-10"></div>
          <div className="flex flex-col items-center gap-3">
            <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#004d4d]/10 shadow-inner relative group">
              <img
                src={
                  imageFile
                    ? URL.createObjectURL(imageFile)
                    : user?.image
                    ? `${IMG_URL}${user.image}`
                    : "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
              {isEditing && (
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold">
                    Change Photo
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files[0])}
                  />
                </label>
              )}
            </div>
          </div>
          <div className="flex-1 text-center md:text-left z-10">
            {isEditing ? (
              <input
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="text-3xl font-extrabold text-slate-900 border-b-2 border-[#004d4d] focus:outline-none bg-transparent mb-2 w-full md:w-auto"
              />
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900">
                  {user?.username}
                </h1>
                {isGuide && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                    Verified Guide
                  </span>
                )}
              </div>
            )}
            <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
            {/* Profile Information Section */}
            <div className="flex-1 text-center md:text-left z-10 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Username"
                    className="text-2xl font-extrabold text-slate-900 border-b-2 border-[#004d4d] focus:outline-none bg-transparent mb-2 w-full md:w-auto"
                  />

                  {isGuide && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Specialization
                        </label>
                        <input
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g. Everest Region"
                          className="bg-white border p-2 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Experience (Yrs)
                        </label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="bg-white border p-2 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Daily Rate (Rs)
                        </label>
                        <input
                          type="number"
                          name="dailyRate"
                          value={formData.dailyRate}
                          onChange={handleInputChange}
                          className="bg-white border p-2 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Age
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          className="bg-white border p-2 rounded-lg text-sm"
                        />
                      </div>
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-slate-400">
                          Bio
                        </label>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          rows="2"
                          className="bg-white border p-2 rounded-lg text-sm resize-none"
                          placeholder="Tell us about yourself..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  
                  

                  {isGuide && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="bg-slate-100 px-4 py-2 rounded-xl text-center">
                        <p className="text-[9px] uppercase font-bold text-slate-400">
                          Exp
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {user?.experience || 0} Yrs
                        </p>
                      </div>
                      <div className="bg-slate-100 px-4 py-2 rounded-xl text-center">
                        <p className="text-[9px] uppercase font-bold text-slate-400">
                          Rate
                        </p>
                        <p className="text-sm font-bold text-[#004d4d]">
                          Rs.{user?.dailyRate || 0}
                        </p>
                      </div>
                      <div className="bg-slate-100 px-4 py-2 rounded-xl text-center">
                        <p className="text-[9px] uppercase font-bold text-slate-400">
                          Spec.
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {user?.specialization || "General"}
                        </p>
                      </div>
                    </div>
                  )}

                  {user?.bio && (
                    <p className="text-slate-600 text-sm italic mb-4 max-w-2xl leading-relaxed">
                      "{user.bio}"
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="mt-6 flex gap-4 justify-center md:justify-start">
              {isEditing ? (
                <>
                  <button
                    onClick={handleUpdateProfile}
                    className="bg-[#004d4d] text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all"
                  >
                    Update Profile
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-slate-400 text-sm font-bold hover:text-rose-500"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-black uppercase tracking-widest text-[#004d4d] hover:bg-[#004d4d]/5 px-4 py-2 rounded-lg transition-all"
                >
                  Edit Profile Details
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Recommended Destinations Sidebar (Left) */}
          <div className="flex-1 order-2 lg:order-1">
            {/* ... (Existing Suggestions Content) ... */}
            <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
              <span className="w-10 h-1 bg-[#004d4d] rounded-full"></span>
              Recommended
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {suggestions.map((dest) => (
                <div
                  key={dest._id}
                  onClick={() => navigate(`/tour/${dest._id}`)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={
                        dest.images?.[0]
                          ? `${IMG_URL}${dest.images[0]}`
                          : "https://via.placeholder.com/400"
                      }
                      alt={dest.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-xl text-slate-800">
                      {dest.title}
                    </h4>
                    <p className="text-[#004d4d] font-black mt-2">
                      Rs. {dest.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity/Assignments Sidebar (Right) */}
          <div className="w-full lg:w-96 order-1 lg:order-2">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {isGuide ? "Assignments" : "My Bookings"}
              </h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {bookings.length > 0 ? (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#004d4d] transition-all group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-slate-800 group-hover:text-[#004d4d] transition-colors line-clamp-1">
                            {booking.destinationId?.title}
                          </h3>
                          {isGuide ? (
                            <p className="text-xs text-slate-500">
                              Client:{" "}
                              <span className="font-bold text-[#004d4d]">
                                {booking.userId?.username}
                              </span>
                            </p>
                          ) : (
                            <p className="text-sm font-black text-emerald-600">
                              Rs. {booking.totalPrice}
                            </p>
                          )}
                        </div>
                        <span
                          className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase border ${
                            booking.status === "confirmed"
                              ? "border-emerald-500 text-emerald-500 bg-white"
                              : booking.status === "completed"
                              ? "border-blue-500 text-blue-500 bg-white"
                              : "border-orange-400 text-orange-400 bg-white"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex gap-2 text-[10px] text-slate-500">
                          <span>Travelers: {booking.travelerCount}</span>
                          <span>•</span>
                          <span>
                            {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* SHOW GUIDE PHOTO FOR CLIENTS */}
                        {!isGuide && booking.guideId && (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">
                              Guide
                            </span>
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#004d4d]/20">
                              <img
                                src={
                                  booking.guideId?.image
                                    ? `${IMG_URL}${booking.guideId.image}`
                                    : "https://via.placeholder.com/50"
                                }
                                alt="Guide"
                                className="w-full h-full object-cover"
                                title={booking.guideId?.username} // Hover shows name
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {isGuide && booking.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "completed")
                            }
                            className="w-full bg-emerald-600 text-white text-[11px] font-bold py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-md"
                          >
                            Mark as Completed
                          </button>
                        )}

                        <div className="flex gap-2">
                          {!isGuide && booking.status === "pending" && (
                            <button
                              onClick={(e) => handlePayment(e, booking)}
                              className="flex-1 bg-[#004d4d] text-white text-[11px] font-bold py-2 rounded-xl hover:bg-black transition-colors"
                            >
                              Pay Now
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(e, booking._id)}
                            className="flex-1 border border-rose-100 text-rose-400 text-[11px] font-bold py-2 rounded-xl hover:bg-rose-50 transition-colors"
                          >
                            {isGuide ? "Reject" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <p className="text-slate-300 text-sm font-bold">
                      {isGuide ? "No assignments yet" : "No bookings found"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

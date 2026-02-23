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
import { submitReview, getAllReviews, updateReview } from "../api/reviewApi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user: initialUser, token } = isLoggedIn();

  // States
  const [user, setUser] = useState(initialUser);
  const [bookings, setBookings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState([]);

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

      const reviewRes = await getAllReviews();
      if (reviewRes?.success) {
        const myReviews = reviewRes.data.filter(
          (r) => (r.user?._id || r.user) === user._id
        );
        setUserReviews(myReviews);
      }

      const destRes = await getAllDestinations();
      if (destRes?.success) {
        const shuffled = [...destRes.data].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Review Helpers
  const getExistingReview = (destId) => {
    return userReviews.find(
      (r) => (r.destination?._id || r.destination) === destId
    );
  };

  const openReviewModal = (booking) => {
    const existing = getExistingReview(booking.destinationId?._id);
    setSelectedBooking(booking);
    if (existing) {
      setRating(existing.rating);
      setComment(existing.comment);
    } else {
      setRating(5);
      setComment("");
    }
    setReviewPhotos([]);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async () => {
    if (!comment) return alert("Please write a comment!");
    const reviewData = new FormData();
    reviewData.append("rating", rating);
    reviewData.append("comment", comment);
    reviewData.append("user", user._id);
    reviewData.append("destination", selectedBooking.destinationId._id);
    reviewPhotos.forEach((file) => {
      reviewData.append("images", file);
    });

    try {
      const existing = getExistingReview(selectedBooking.destinationId._id);
      const res = existing
        ? await updateReview(existing._id, reviewData, token)
        : await submitReview(reviewData, token);

      if (res.success) {
        alert("Success!");
        setShowReviewModal(false);
        fetchMyData();
      }
    } catch (error) {
      alert("Error processing review");
    }
  };

  // Profile Helpers
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (imageFile) data.append("image", imageFile);
      const res = await updateProfile(user._id, data, token);
      if (res.success) {
        alert("Profile updated!");
        setUser(res.user);
        localStorage.setItem("auth", JSON.stringify({ token, user: res.user }));
        setIsEditing(false);
      }
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus}?`)) return;
    const res = await updateBookingStatus(id, newStatus);
    if (res.success) {
      setBookings((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Remove this booking record?")) return;
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
      <div className="p-10 text-center animate-pulse text-[#004d4d] font-bold">
        Loading Your Workspace...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans relative">
      {/* REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Share Your Experience!
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              How was your trek to {selectedBooking?.destinationId?.title}?
            </p>
            <div className="space-y-4">
              {reviewPhotos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-2">
                  {reviewPhotos.map((file, index) => (
                    <div key={index} className="relative min-w-[60px] h-[60px]">
                      <img
                        src={URL.createObjectURL(file)}
                        className="w-full h-full object-cover rounded-lg border border-slate-200"
                        alt="preview"
                      />
                      <button
                        onClick={() =>
                          setReviewPhotos((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mb-4 justify-center bg-slate-50 p-3 rounded-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-all ${
                      star <= rating
                        ? "grayscale-0 scale-110"
                        : "grayscale opacity-30 hover:opacity-50"
                    }`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none h-32 transition-colors"
                placeholder="Tell us about your trip..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold uppercase text-slate-400 ml-2">
                  Add photos (Multiple allowed)
                </label>
                <input
                  type="file"
                  multiple 
                  onChange={(e) => setReviewPhotos(Array.from(e.target.files))} // Convert FileList to Array
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  className="flex-1 py-3 font-bold bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all"
                >
                  {getExistingReview(selectedBooking?.destinationId?._id)
                    ? "Update Review"
                    : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
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

          <div className="flex-1 text-center md:text-left z-10 w-full">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
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
                  </div>
                )}
              </div>
            ) : (
              <>
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
                <p className="text-slate-400 font-medium mb-4">{user?.email}</p>
                {isGuide && (
                  <div className="flex flex-wrap gap-3 mb-4">
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
                  </div>
                )}
              </>
            )}
            <div className="mt-6 flex gap-4 justify-center md:justify-start">
              <button
                onClick={() =>
                  isEditing ? handleUpdateProfile() : setIsEditing(true)
                }
                className="bg-[#004d4d] text-white px-8 py-2 rounded-xl text-sm font-bold shadow-lg hover:bg-black transition-all"
              >
                {isEditing ? "Update Profile" : "Edit Profile Details"}
              </button>
              {isEditing && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-slate-400 text-sm font-bold hover:text-rose-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Recommended Section */}
          <div className="flex-1 order-2 lg:order-1">
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

          <div className="w-full lg:w-96 order-1 lg:order-2">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {isGuide ? "Assignments" : "My Bookings"}
              </h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#004d4d] transition-all group relative"
                  >
                    <button
                      onClick={(e) => handleDelete(e, booking._id)}
                      className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 z-20"
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
                          strokeWidth="2.5"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    <div className="flex justify-between items-start mb-3 pr-6">
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-[#004d4d] transition-colors line-clamp-1">
                          {booking.destinationId?.title}
                        </h3>
                        {/* RESTORED: CLIENT NAME FOR GUIDE VIEW */}
                        {isGuide && booking.userId && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 italic">
                            Booked by: {booking.userId.username || "Anonymous"}
                          </p>
                        )}
                        <p className="text-sm font-black text-emerald-600">
                          Rs. {booking.totalPrice}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase border bg-white ${
                          booking.status === "confirmed"
                            ? "border-emerald-500 text-emerald-500"
                            : booking.status === "completed"
                            ? "border-blue-500 text-blue-500"
                            : "border-orange-400 text-orange-400"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mb-2">
                      <div className="flex gap-2 text-[10px] text-slate-500 pb-1">
                        <span>Travelers: {booking.travelerCount}</span>
                        <span>•</span>
                        <span>
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        {/* PORTER BADGE */}
                        <div className="flex flex-col items-center">
                          <span className="text-[7px] font-black uppercase text-slate-400 leading-none mb-1">
                            Porter
                          </span>
                          <span
                            className={`text-[8px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${
                              booking.hasPorter
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-100 text-slate-400 border-slate-200"
                            }`}
                          >
                            {booking.hasPorter ? "Selected" : "No-Selected"}
                          </span>
                        </div>

                        {/* GUIDE AVATAR (Visible to Clients only) */}
                        {!isGuide && booking.guideId && (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm relative group/guide">
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-[10px] rounded-lg opacity-0 group-hover/guide:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                              {booking.guideId?.username || "Guide"}
                              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>

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
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50 mt-2">
                      {/* GUIDE SPECIFIC ACTION: COMPLETE TOUR */}
                      {isGuide && booking.status === "confirmed" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(booking._id, "completed")
                          }
                          className="w-full bg-blue-600 text-white text-[11px] font-bold py-2 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Mark as Completed
                        </button>
                      )}

                      {/* CLIENT SPECIFIC ACTIONS: REVIEW & PAYMENT */}
                      {!isGuide && booking.status === "completed" && (
                        <button
                          onClick={() => openReviewModal(booking)}
                          className={`w-full text-[11px] font-bold py-2 rounded-xl transition-all shadow-md ${
                            getExistingReview(booking.destinationId?._id)
                              ? "bg-white border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                              : "bg-emerald-600 text-white hover:bg-emerald-700"
                          }`}
                        >
                          {getExistingReview(booking.destinationId?._id)
                            ? "Edit your review"
                            : "Review your experience"}
                        </button>
                      )}
                      {!isGuide && booking.status === "pending" && (
                        <button
                          onClick={(e) => handlePayment(e, booking)}
                          className="w-full bg-[#004d4d] text-white text-[11px] font-bold py-2 rounded-xl hover:bg-black transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

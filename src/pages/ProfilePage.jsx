import React, { useEffect, useState } from "react";
import { isLoggedIn } from "../api/authAPI";
import PaymentModal from "./PaymentModal";
import DestinationCard from "../components/DestinationCard";
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
  const auth = isLoggedIn();
  const token = auth?.token;
  const initialUser = auth?.user;

  const [user, setUser] = useState(initialUser);
  const [bookings, setBookings] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewPhotos, setReviewPhotos] = useState([]);

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

  // SAFETY: Ensure bookings exists before filtering
  const completedTreksCount =
    bookings?.length > 0
      ? bookings.filter((b) => b.status === "completed").length
      : 0;

  // SAFETY: Ensure user and userReviews exist before filtering
  const guideReceivedReviews =
    user && userReviews?.length > 0
      ? userReviews.filter((review) => {
          const reviewGuideId = review.guide?._id || review.guide;
          return reviewGuideId && String(reviewGuideId) === String(user._id);
        })
      : [];

  useEffect(() => {
    fetchMyData();
  }, []);

  const fetchMyData = async () => {
    setLoading(true);
    setUserReviews([]);
    try {
      const bookingRes = await getAllBookings();
      if (bookingRes?.success) {
        const validBookings = bookingRes.data.filter(
          (b) => b.destinationId !== null
        );
        setBookings(validBookings);
      }

      const reviewRes = await getAllReviews(token);
      if (reviewRes?.success) {
        // DEBUG: This will show you exactly what the backend is sending
        console.log("RAW REVIEWS FROM BACKEND:", reviewRes.data);

        const myReviews = reviewRes.data.filter((r) => {
          const isMyReview =
            String(r.user?._id || r.user || "") === String(user?._id);
          const isReviewForMe =
            String(r.guide?._id || r.guide || "") === String(user?._id);

          return (
            isMyReview ||
            isReviewForMe ||
            r.userDetails?.username === user?.username
          );
        });
        setUserReviews(myReviews);
      }

      const destRes = await getAllDestinations();
      if (destRes?.success) {
        const shuffled = [...destRes.data].sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 6));
      }
    } catch (error) {
      console.error("Failed to fetch profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      data.append("age", formData.age);

      if (isGuide) {
        data.append("experience", formData.experience);
        data.append("specialization", formData.specialization);
        data.append("dailyRate", formData.dailyRate);
      }

      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await updateProfile(user._id, data, token);
      if (res.success) {
        alert("Profile updated successfully!");
        setUser(res.user);
        const existingAuth = JSON.parse(localStorage.getItem("auth"));
        localStorage.setItem(
          "auth",
          JSON.stringify({ ...existingAuth, user: res.user })
        );
        setIsEditing(false);
      } else {
        alert(res.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("An error occurred while updating the profile.");
    }
  };

  const getExistingReview = (destId, destTitle) => {
    if (!destId && !destTitle) return null;
    return userReviews.find(
      (r) =>
        String(r.destination?._id || r.destination || "") === String(destId) ||
        r.destinationDetails?.title === destTitle
    );
  };

  const openReviewModal = (booking) => {
    const existing = getExistingReview(
      booking.destinationId?._id,
      booking.destinationId?.title
    );
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

    if (selectedBooking.guideId) {
      const guideId = selectedBooking.guideId._id || selectedBooking.guideId;
      reviewData.append("guide", guideId);
    }

    reviewPhotos.forEach((file) => {
      reviewData.append("images", file);
    });

    try {
      const existing = getExistingReview(
        selectedBooking.destinationId?._id,
        selectedBooking.destinationId?.title
      );
      const res = existing
        ? await updateReview(existing._id, reviewData, token)
        : await submitReview(reviewData, token);

      if (res.success) {
        alert(existing ? "Your review has been updated!" : "Review submitted!");
        setShowReviewModal(false);
        fetchMyData();
      }
    } catch (error) {
      alert("Error processing review.");
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    if (!window.confirm(`Mark this trek as ${newStatus}?`)) return;
    try {
      const res = await updateBookingStatus(id, newStatus);
      if (res.success) {
        alert(`Trek marked as ${newStatus}!`);
        setBookings((prev) =>
          prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Remove this booking record?")) return;
    const res = await deleteBooking(id);
    if (res.success) setBookings(bookings.filter((b) => b._id !== id));
  };

  const handlePayment = (e, booking) => {
    e.stopPropagation();
    setPaymentBooking(booking);
    setShowPaymentModal(true);
  };

  const onSelectPayment = async (method) => {
    if (method === "esewa") {
      const res = await getEsewaSignature({
        amount: paymentBooking.totalPrice,
        productId: `${paymentBooking._id}-${Date.now()}`,
      });
      if (res.success) {
        submitEsewa(
          paymentBooking.totalPrice,
          res.transaction_uuid,
          res.signature,
          res.product_code
        );
      }
    }
    setShowPaymentModal(false);
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
      <div className="p-10 text-center animate-pulse text-[#004d4d] font-bold uppercase tracking-widest">
        Loading Your Adventure Hub...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-12 font-sans relative">
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={paymentBooking?.totalPrice || 0}
        onSelectPayment={onSelectPayment}
      />

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
                className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm focus:border-emerald-500 outline-none h-32"
                placeholder="Tell us about your trip..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />

              <div className="mt-4">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                  Add Photos
                </label>
                {reviewPhotos.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto py-2">
                    {reviewPhotos.map((file, index) => (
                      <div key={index} className="relative shrink-0">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-100 shadow-sm"
                        />
                        <button
                          onClick={() =>
                            setReviewPhotos(
                              reviewPhotos.filter((_, i) => i !== index)
                            )
                          }
                          className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600 transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="3"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setReviewPhotos([
                      ...reviewPhotos,
                      ...Array.from(e.target.files),
                    ])
                  }
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReviewSubmit}
                  className="flex-1 py-3 font-bold bg-emerald-600 text-white rounded-2xl shadow-lg hover:bg-emerald-700 transition-all active:scale-95"
                >
                  {getExistingReview(
                    selectedBooking?.destinationId?._id,
                    selectedBooking?.destinationId?.title
                  )
                    ? "Update Review"
                    : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto">
        <div className="bg-white rounded-3xl p-8 mb-10 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#004d4d]/5 rounded-bl-full -mr-10 -mt-10"></div>

          <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-[#004d4d]/10 shadow-inner relative group shrink-0">
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
                <span className="text-white text-xs font-bold uppercase tracking-tighter">
                  Update
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setImageFile(e.target.files[0])}
                />
              </label>
            )}
          </div>

          <div className="flex-1 text-center md:text-left z-10 w-full">
            {isEditing ? (
              <div className="flex flex-col gap-3 mb-4">
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Username"
                  className="text-2xl font-extrabold text-slate-900 border-b-2 border-[#004d4d] focus:outline-none bg-transparent w-full"
                />
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  className="text-slate-500 border-b border-gray-200 focus:outline-none bg-transparent text-sm py-1 resize-none"
                />

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Age
                    </label>
                    <input
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      className="border-b border-gray-200 focus:outline-none bg-transparent text-sm py-1"
                    />
                  </div>

                  {isGuide && (
                    <>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black text-[#004d4d] uppercase">
                          Daily Rate (Rs.)
                        </label>
                        <input
                          name="dailyRate"
                          type="number"
                          value={formData.dailyRate}
                          onChange={handleInputChange}
                          className="border-b border-gray-200 focus:outline-none bg-transparent text-sm py-1 font-bold"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black text-[#004d4d] uppercase">
                          Experience (Years)
                        </label>
                        <input
                          name="experience"
                          type="number"
                          value={formData.experience}
                          onChange={handleInputChange}
                          className="border-b border-gray-200 focus:outline-none bg-transparent text-sm py-1"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black text-[#004d4d] uppercase">
                          Specialization
                        </label>
                        <input
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          placeholder="e.g. Everest Region"
                          className="border-b border-gray-200 focus:outline-none bg-transparent text-sm py-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user?.username}
                </h1>
                {isGuide && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                    Verified Guide
                  </span>
                )}
              </div>
            )}
            {!isEditing && (
              <p className="text-slate-400 font-medium mb-6">{user?.email}</p>
            )}
            {!isEditing && isGuide && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Experience:
                  </span>
                  <span className="text-slate-700 text-sm font-black">
                    {user?.experience || 0} Years
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Focus:
                  </span>
                  <span className="text-slate-700 text-sm font-black">
                    {user?.specialization || "General Trekking"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Daily Rate:
                  </span>
                  <span className="text-slate-700 text-sm font-black">
                    {user?.dailyRate || "2000"}
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="text-xl">🏔️</span>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">
                    Completed
                  </p>
                  <p className="text-lg font-black text-slate-800 leading-none mt-1">
                    {completedTreksCount} Treks
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl flex items-center gap-3">
                <span className="text-xl">⭐</span>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">
                    Total Reviews
                  </p>
                  <p className="text-lg font-black text-slate-800 leading-none mt-1">
                    {isGuide ? guideReceivedReviews.length : userReviews.length}{" "}
                    Shared
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                isEditing ? handleUpdateProfile() : setIsEditing(true)
              }
              className="bg-[#004d4d] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-black hover:scale-105 transition-all active:scale-95"
            >
              {isEditing ? "Save Profile Changes" : "Edit Profile"}
            </button>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">
          <div className="flex-1 order-2 xl:order-1">
            {isGuide ? (
              <>
                <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-1 bg-[#004d4d] rounded-full"></span>
                  Traveler Feedback
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {guideReceivedReviews.length > 0 ? (
                    guideReceivedReviews.map((review) => (
                      <div
                        key={review._id}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold">
                              {review.userDetails?.username
                                ?.charAt(0)
                                .toUpperCase() || "U"}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm">
                                {review.userDetails?.username ||
                                  "Anonymous Traveler"}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase">
                                Trek:{" "}
                                {review.destinationDetails?.title ||
                                  "Unknown Destination"}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-xs">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const isYellow = star <= Number(review.rating);
                              return (
                                <span
                                  key={star}
                                  className={
                                    isYellow
                                      ? "text-yellow-400"
                                      : "text-gray-200"
                                  }
                                >
                                  {isYellow ? "★" : "☆"}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <p className="text-slate-600 text-sm italic leading-relaxed">
                          "{review.comment}"
                        </p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {review.createdAt
                              ? new Date(review.createdAt).toLocaleDateString()
                              : "N/A"}
                          </span>
                          {review.images && review.images.length > 0 && (
                            <div className="flex -space-x-2">
                              {review.images.slice(0, 3).map((img, idx) => (
                                <img
                                  key={idx}
                                  src={`${IMG_URL}${img}`}
                                  className="w-6 h-6 rounded-full border-2 border-white object-cover"
                                  alt="review"
                                />
                              ))}
                              {review.images.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                  +{review.images.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
                      <p className="text-slate-400 font-bold">
                        No reviews received yet from your journeys.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-6 text-slate-800 flex items-center gap-3">
                  <span className="w-10 h-1 bg-[#004d4d] rounded-full"></span>{" "}
                  For Your Next Journey
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map((dest) => (
                    <DestinationCard key={dest._id} tour={dest} />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-full xl:w-96 order-1 xl:order-2">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">
                {isGuide ? "Assignments" : "My Bookings"}
              </h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {bookings?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400 font-bold text-sm">
                      No adventures found.
                    </p>
                  </div>
                ) : (
                  bookings?.map((booking) => (
                    <div
                      key={booking._id}
                      className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#004d4d]/20 hover:bg-white transition-all group relative"
                    >
                      <button
                        onClick={(e) => handleDelete(e, booking._id)}
                        className="absolute top-3 right-3 text-slate-300 hover:text-rose-500 z-20 transition-colors"
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
                          <h3 className="font-bold text-slate-800 line-clamp-1">
                            {booking.destinationId?.title}
                          </h3>
                          <p className="text-sm font-black text-emerald-600 tracking-tight">
                            Rs. {booking.totalPrice?.toLocaleString() || 0}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase border bg-white shadow-sm ${
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
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-2 text-[10px] text-slate-500 font-bold">
                            <span>👥 {booking.travelerCount} Persons</span>
                            <span>•</span>
                            <span>
                              📅{" "}
                              {booking.createdAt
                                ? new Date(
                                    booking.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">
                              Porter Service:
                            </span>
                            <span
                              className={`text-[8px] font-bold px-2 py-0.5 rounded-md border shadow-sm ${
                                booking.hasPorter
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : "bg-slate-100 text-slate-400 border-slate-200"
                              }`}
                            >
                              {booking.hasPorter ? "YES" : "NO"}
                            </span>
                          </div>
                        </div>
                        {!isGuide && booking.guideId && (
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm relative group/guide">
                            <span className="text-[8px] font-bold text-slate-400 uppercase">
                              Guide
                            </span>
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#004d4d]/20">
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
                      <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/50 mt-2">
                        {isGuide && booking.status === "confirmed" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(booking._id, "completed")
                            }
                            className="w-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md active:scale-95"
                          >
                            Mark as Completed
                          </button>
                        )}
                        {!isGuide && booking.status === "completed" && (
                          <button
                            onClick={() => openReviewModal(booking)}
                            className={`w-full text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all shadow-md active:scale-95 ${
                              getExistingReview(
                                booking.destinationId?._id,
                                booking.destinationId?.title
                              )
                                ? "bg-white border border-emerald-600 text-emerald-600"
                                : "bg-emerald-600 text-white hover:bg-emerald-700"
                            }`}
                          >
                            {getExistingReview(
                              booking.destinationId?._id,
                              booking.destinationId?.title
                            )
                              ? "Edit Review"
                              : "Rate Experience"}
                          </button>
                        )}
                        {!isGuide && booking.status === "pending" && (
                          <button
                            onClick={(e) => handlePayment(e, booking)}
                            className="w-full bg-[#004d4d] text-white text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                          >
                            Pay now
                          </button>
                        )}
                      </div>
                    </div>
                  ))
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

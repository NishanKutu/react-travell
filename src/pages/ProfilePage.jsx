import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isLoggedIn } from "../api/authAPI";
import PaymentModal from "./PaymentModal";
import DestinationCard from "../components/DestinationCard";
import {
  getMyCustomTours,
  getGuideCustomAssignments,
  deleteCustomTour,
  updateCustomTourStatus,
} from "../api/customTourApi";
import {
  getAllBookings,
  deleteBooking,
  getEsewaSignature,
  updateBookingStatus,
  cancelAndRefund,
} from "../api/bookingApi";
import { getAllDestinations } from "../api/destinationApi";
import { updateProfile, toggleAvailability } from "../api/userAPI";
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
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

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
    maxWeight: initialUser?.maxWeight || "",
  });
  const [imageFile, setImageFile] = useState(null);

  const isGuide = Number(user?.role) === 2;
  const isPorter = Number(user?.role) === 3;
  const isStaff = isGuide || isPorter;
  const IMG_URL = "http://localhost:8000/uploads/";
  const chatEnabledStatuses = ["pending", "confirmed", "completed"];

  const completedTreksCount =
    bookings?.length > 0
      ? bookings.filter((b) => b.status === "completed").length
      : 0;

  const guideReceivedReviews =
    user && userReviews?.length > 0
      ? userReviews.filter((review) => {
          const reviewGuideId = review.guide?._id || review.guide;
          return reviewGuideId && String(reviewGuideId) === String(user._id);
        })
      : [];

  const fetchMyData = useCallback(async () => {
    setLoading(true);
    setUserReviews([]);

    try {
      const userRole = Number(user?.role);
      const isGuideUser = userRole === 2;
      const isPorterUser = userRole === 3;

      const bookingRes = await getAllBookings();
      let standardBookings = [];
      if (bookingRes?.success && Array.isArray(bookingRes.data)) {
        standardBookings = bookingRes.data
          .filter((b) => b.destinationId !== null)
          .map((b) => ({
            ...b,
            isCustom: false,
          }));
      }

      let customRes;
      if (isGuideUser || isPorterUser) {
        customRes = await getGuideCustomAssignments();
      } else {
        customRes = await getMyCustomTours();
      }

      let customTours = [];
      if (customRes?.success && Array.isArray(customRes.data)) {
        customTours = customRes.data.map((ct) => ({
          ...ct,
          isCustom: true,
          status: ct.status || "pending",
          createdAt: ct.createdAt || new Date().toISOString(),
        }));
      }

      const combined = [...standardBookings, ...customTours].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setBookings(combined);

      const reviewRes = await getAllReviews(token);
      if (reviewRes?.success && Array.isArray(reviewRes.data)) {
        const currentUserId = String(user?._id || initialUser?._id);
        const myReviews = reviewRes.data.filter((r) => {
          const userIdInReview = String(r.user?._id || r.user || "");
          const guideIdInReview = String(r.guide?._id || r.guide || "");
          return (
            userIdInReview === currentUserId ||
            guideIdInReview === currentUserId
          );
        });
        setUserReviews(myReviews);
      }

      const destRes = await getAllDestinations();
      if (destRes?.success && Array.isArray(destRes.data)) {
        const bookedDestIds = standardBookings.map((b) =>
          b.destinationId?._id?.toString()
        );
        const availableSuggestions = destRes.data.filter(
          (d) => !bookedDestIds.includes(d._id.toString())
        );
        setSuggestions(
          availableSuggestions.sort(() => 0.5 - Math.random()).slice(0, 6)
        );
      }
    } catch (error) {
      console.error("Critical error in fetchMyData:", error);
    } finally {
      setLoading(false);
    }
  }, [initialUser?._id, token, user?._id, user?.role]);

  useEffect(() => {
    fetchMyData();
  }, [fetchMyData]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("bio", formData.bio);
      data.append("age", formData.age);

      if (isStaff) {
        data.append("experience", formData.experience);
        data.append("dailyRate", formData.dailyRate);
      }
      if (isGuide) {
        data.append("specialization", formData.specialization);
      }
      if (isPorter) {
        data.append("maxWeight", formData.maxWeight);
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

  // Toggle availability for guides and porters
  const handleToggleAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const res = await toggleAvailability(user._id, token);
      if (res.success) {
        const updatedUser = { ...user, isAvailable: res.isAvailable };
        setUser(updatedUser);
        const existingAuth = JSON.parse(localStorage.getItem("auth"));
        localStorage.setItem(
          "auth",
          JSON.stringify({ ...existingAuth, user: updatedUser })
        );
      } else {
        alert(res.message || "Failed to update availability.");
      }
    } catch (error) {
      console.error("Availability toggle error:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setAvailabilityLoading(false);
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
    } catch {
      alert("Error processing review.");
    }
  };

  const handleStatusUpdate = async (booking, newStatus) => {
    if (!window.confirm(`Mark this trek as ${newStatus}?`)) return;
    try {
      let res;
      const isCustomTour = booking.itinerary || booking.isCustom;

      if (isCustomTour) {
        res = await updateCustomTourStatus(booking._id, newStatus);
      } else {
        res = await updateBookingStatus(booking._id, newStatus);
      }

      if (res.success) {
        alert(`Trek marked as ${newStatus}!`);
        fetchMyData();
      }
    } catch {
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (e, booking) => {
    e.stopPropagation();

    const isConfirmed = booking.status === "confirmed";
    const confirmMessage = isConfirmed
      ? "Are you sure? Your trip is confirmed. Cancelling now will refund your amount after a 20% deduction fee."
      : "Are you sure you want to remove this booking record?";

    if (window.confirm(confirmMessage)) {
      try {
        let res;
        if (booking.isCustom) {
          res = await deleteCustomTour(booking._id);
        } else {
          res =
            booking.status === "confirmed"
              ? await cancelAndRefund(booking._id)
              : await deleteBooking(booking._id);
        }

        if (res.success) {
          alert(res.message || "Action completed successfully.");
          fetchMyData();
        } else {
          alert(res.message || "Failed to process request.");
        }
      } catch (error) {
        console.error("Delete/Refund error:", error);
        alert("An error occurred. Please try again.");
      }
    }
  };

  const handlePayment = (e, booking) => {
    e.stopPropagation();
    setPaymentBooking(booking);
    setShowPaymentModal(true);
  };

  const canChatForBooking = (booking) =>
    !booking.isCustom && chatEnabledStatuses.includes(booking.status);

  const getStaffAssignmentRole = (booking) => {
    const currentUserId = String(user?._id || "");

    if (
      isGuide &&
      String(booking.guideId?._id || booking.guideId) === currentUserId
    ) {
      return "guide";
    }

    if (
      isPorter &&
      String(booking.porterId?._id || booking.porterId) === currentUserId
    ) {
      return "porter";
    }

    return "";
  };

  const onSelectPayment = async (method) => {
    if (method === "esewa") {
      const res = await getEsewaSignature({
        bookingId: paymentBooking._id,
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
                  {isStaff && (
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
                      {isGuide && (
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
                      )}
                      {isPorter && (
                        <div className="flex flex-col">
                          <label className="text-[10px] font-black text-orange-600 uppercase">
                            Max Weight (kg)
                          </label>
                          <input
                            name="maxWeight"
                            type="number"
                            value={formData.maxWeight}
                            onChange={handleInputChange}
                            placeholder="e.g. 25"
                            className="border-b border-gray-200 focus:outline-none bg-transparent text-sm py-1"
                          />
                        </div>
                      )}
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
                {isPorter && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">
                    Trekking Porter
                  </span>
                )}
              </div>
            )}
            {!isEditing && (
              <p className="text-slate-400 font-medium mb-6">{user?.email}</p>
            )}
            {!isEditing && isStaff && (
              <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                    Experience:
                  </span>
                  <span className="text-slate-700 text-sm font-black">
                    {user?.experience || 0} Years
                  </span>
                </div>
                {isGuide && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Focus:
                    </span>
                    <span className="text-slate-700 text-sm font-black">
                      {user?.specialization || "General"}
                    </span>
                  </div>
                )}
                {isPorter && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                      Max Load:
                    </span>
                    <span className="text-slate-700 text-sm font-black">
                      {user?.maxWeight || 0} kg
                    </span>
                  </div>
                )}
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
                    {isStaff ? guideReceivedReviews.length : userReviews.length}{" "}
                    Shared
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() =>
                  isEditing ? handleUpdateProfile() : setIsEditing(true)
                }
                className="bg-[#004d4d] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-black hover:scale-105 transition-all active:scale-95"
              >
                {isEditing ? "Save Profile Changes" : "Edit Profile"}
              </button>

              {!isEditing && (
                <Link
                  to="/messages"
                  className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-8 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:border-[#004d4d]/40 hover:text-[#004d4d] transition-all active:scale-95"
                >
                  <i className="bi bi-chat-dots"></i>
                  Messages
                </Link>
              )}

              {/* Availability Toggle — only shown for guides and porters */}
              {isStaff && !isEditing && (
                <button
                  onClick={handleToggleAvailability}
                  disabled={availabilityLoading}
                  className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
                    user?.isAvailable !== false
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-500 hover:bg-rose-600 text-white"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      user?.isAvailable !== false
                        ? "bg-white animate-pulse"
                        : "bg-white/60"
                    }`}
                  />
                  {availabilityLoading
                    ? "Updating..."
                    : user?.isAvailable !== false
                    ? "Available"
                    : "Unavailable"}
                </button>
              )}
            </div>

            {/* Availability hint text */}
            {isStaff && !isEditing && (
              <p className="text-[10px] text-slate-400 mt-2 font-medium">
                {user?.isAvailable !== false
                  ? "You are visible to users booking guides/porters. Click to mark yourself unavailable."
                  : "You are hidden from new bookings. Click to mark yourself available again."}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-10">
          <div className="flex-1 order-2 xl:order-1">
            {isStaff ? (
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
                {isStaff ? "Assignments" : "My Bookings"}
              </h2>
              <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
                {bookings?.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-slate-400 font-bold text-sm">
                      No adventures or assignments found.
                    </p>
                  </div>
                ) : (
                  bookings
                    ?.filter((b) => {
                      const userRole = Number(user?.role);
                      const currentUserId = String(user?._id);
                      if (userRole === 2) {
                        return (
                          String(b.guideId?._id || b.guideId) === currentUserId
                        );
                      }
                      if (userRole === 3) {
                        return (
                          String(b.porterId?._id || b.porterId) ===
                          currentUserId
                        );
                      }
                      return true;
                    })
                    ?.map((booking) => (
                      <div
                        key={booking._id}
                        className="p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-[#004d4d]/20 hover:bg-white transition-all group relative"
                      >
                        <button
                          onClick={(e) => handleDelete(e, booking)}
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
                              {booking.isCustom ? (
                                <span className="text-[#c08457]">
                                  ✨ Custom:{" "}
                                  {booking.itinerary?.[0]?.destinationCity
                                    ?.cityname || "Planned Trip"}
                                  ...
                                </span>
                              ) : (
                                booking.destinationId?.title
                              )}
                              {Number(user?.role) === 2 && (
                                <span className="text-[10px] text-slate-400 block font-normal mt-0.5">
                                  <i className="bi bi-person-badge mr-1"></i>
                                  Customer:{" "}
                                  {booking.userId?.username || "Guest User"}
                                </span>
                              )}
                            </h3>
                            <p className="text-sm font-black text-emerald-600 tracking-tight">
                              NPR {booking.totalPrice?.toLocaleString() || 0}
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

                        {booking.isCustom && booking.itinerary && (
                          <div className="mb-3 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50">
                            <p className="text-[10px] text-emerald-800 font-bold mb-1">
                              📅 {booking.itinerary.length} Day Customized Plan
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {booking.itinerary.slice(0, 2).map((day, i) => (
                                <span
                                  key={i}
                                  className="text-[8px] bg-white px-1.5 py-0.5 border rounded text-slate-500"
                                >
                                  Day {day.dayNumber}:{" "}
                                  {day.destinationCity?.cityname || "TBD"}
                                </span>
                              ))}
                              {booking.itinerary.length > 2 && (
                                <span className="text-[8px] text-slate-400 self-center ml-1">
                                  +{booking.itinerary.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

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
                            {!booking.isCustom && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-slate-400">
                                  Porter:
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
                            )}
                          </div>

                          {(booking.guideId || booking.guide) && (
                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100 shadow-sm">
                              <span className="text-[8px] font-bold text-slate-400 uppercase">
                                Guide
                              </span>
                              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#004d4d]/20 bg-slate-100 flex items-center justify-center">
                                {Number(user?.role) === 2 ? (
                                  <img
                                    src={
                                      user?.image
                                        ? `${IMG_URL}${user.image}`
                                        : "/default-avatar.png"
                                    }
                                    alt="Me"
                                    className="w-full h-full object-cover"
                                  />
                                ) : booking.guideId?.image ||
                                  booking.guide?.image ? (
                                  <img
                                    src={`${IMG_URL}${
                                      booking.guideId?.image ||
                                      booking.guide?.image
                                    }`}
                                    alt="Guide"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <i className="bi bi-person text-xs text-slate-400"></i>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 pt-3 border-t border-slate-200/50 mt-2">
                          {canChatForBooking(booking) && (
                            <>
                              {!isStaff && booking.guideId && (
                                <Link
                                  to={`/messages?bookingId=${booking._id}&role=guide`}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                                >
                                  <i className="bi bi-chat-dots"></i>
                                  Chat Guide
                                </Link>
                              )}

                              {!isStaff && booking.porterId && (
                                <Link
                                  to={`/messages?bookingId=${booking._id}&role=porter`}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-white border border-orange-200 text-orange-700 text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-orange-50 transition-all shadow-sm active:scale-95"
                                >
                                  <i className="bi bi-chat-dots"></i>
                                  Chat Porter
                                </Link>
                              )}

                              {isStaff && getStaffAssignmentRole(booking) && (
                                <Link
                                  to={`/messages?bookingId=${
                                    booking._id
                                  }&role=${getStaffAssignmentRole(booking)}`}
                                  className="w-full inline-flex items-center justify-center gap-2 bg-white border border-[#004d4d]/20 text-[#004d4d] text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-[#004d4d]/5 transition-all shadow-sm active:scale-95"
                                >
                                  <i className="bi bi-chat-dots"></i>
                                  Chat Traveler
                                </Link>
                              )}
                            </>
                          )}

                          {Number(user?.role) === 2 &&
                            booking.status === "confirmed" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(booking, "completed")
                                }
                                className="w-full bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-md active:scale-95"
                              >
                                Mark as Completed
                              </button>
                            )}

                          {!isStaff &&
                            booking.status === "completed" &&
                            !booking.isCustom && (
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

                          {!isStaff && booking.status === "pending" && (
                            <button
                              onClick={(e) => handlePayment(e, booking)}
                              className="w-full bg-[#004d4d] text-white text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-black transition-all shadow-md active:scale-95"
                            >
                              Proceed to Payment
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

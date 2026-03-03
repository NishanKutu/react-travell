import React, { useEffect, useState } from "react";
import { getAllReviews, deleteReview } from "../../api/reviewApi"; 
import { isLoggedIn } from "../../api/authAPI";
import ReviewCard from "../../components/ReviewCard";

const AdminReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = isLoggedIn();
  const IMG_URL = "http://localhost:8000/uploads/";

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await getAllReviews(token);
      if (res.success) setReviews(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      const res = await deleteReview(id, token);
      if (res.success) {
        setReviews(reviews.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-black text-slate-900">Customer Reviews</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              isAdmin={true} 
              onDelete={handleDelete} 
              IMG_URL={IMG_URL} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReview;
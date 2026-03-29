import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { verifyStripePayment } from "../api/bookingApi";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Extract all parameters from the URL first
  const paymentStatus = searchParams.get("payment");
  const sessionId = searchParams.get("session_id");
  const bookingId = searchParams.get("bookingId");

  // 2. Get user data from localStorage
  const authData = JSON.parse(localStorage.getItem("user"));
  const isAdmin = authData?.role === 1;

  useEffect(() => {
    // 3. If it's a Stripe success, call the backend to verify and confirm the booking
    // This uses the sessionId and bookingId defined above to prevent ReferenceErrors
    if (paymentStatus === "success" && sessionId && bookingId) {
      verifyStripePayment(sessionId, bookingId)
        .then((res) => {
          if (res.success) {
            toast.success("Stripe Payment Confirmed!");
          }
        })
        .catch((err) => {
          console.error("Verification error:", err);
          toast.error("Failed to verify Stripe payment.");
        });
    }

    // 4. Redirect if accessed without success param
    if (paymentStatus !== "success") {
      navigate("/");
    }
  }, [paymentStatus, sessionId, bookingId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-8">
          Thank you for choosing **HikeHub**. Your adventure is officially
          confirmed!
        </p>

        <div className="space-y-4">
          {isAdmin ? (
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="w-full flex items-center justify-center gap-2 bg-teal-800 text-white py-3 rounded-lg font-bold hover:bg-teal-900 transition-all transform hover:scale-[1.02]"
            >
              Go to Admin Dashboard <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={() => navigate("/profile")}
              className="w-full flex items-center justify-center gap-2 bg-teal-800 text-white py-3 rounded-lg font-bold hover:bg-teal-900 transition-all transform hover:scale-[1.02]"
            >
              View My Bookings <ArrowRight size={18} />
            </button>
          )}

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Home size={18} /> Return to Home
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs text-gray-400 italic">
            A confirmation email has been sent to{" "}
            <strong>{authData?.email || "your address"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Home } from "lucide-react"; 

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentStatus = searchParams.get("payment");

  const authData = JSON.parse(localStorage.getItem("user")); 
  
  const isAdmin = authData?.role === 1;

  useEffect(() => {
    // Redirect if they try to access this page without a success param
    if (paymentStatus !== "success") {
      navigate("/");
    }
  }, [paymentStatus, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full animate-bounce">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for choosing **HikeHub**. Your adventure is officially confirmed!
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
            A confirmation email has been sent to <strong>{authData?.email || "your address"}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
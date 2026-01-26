import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle } from "lucide-react"; 

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    if (paymentStatus !== "success") {
      navigate("/");
    }
  }, [paymentStatus, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-green-100">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-8">
          Thank you for booking with **HikeHub**. Your adventure is officially confirmed!
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-teal-800 text-white py-3 rounded-lg font-bold hover:bg-teal-900 transition-colors"
          >
            Go to My Dashboard
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-white text-gray-700 py-3 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Explore More Trips
          </button>
        </div>

        <p className="mt-8 text-xs text-gray-400 italic">
          A confirmation email has been sent to your registered address.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
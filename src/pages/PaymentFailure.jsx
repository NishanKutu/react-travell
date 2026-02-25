import React from "react";
import { useNavigate } from "react-router-dom";

const PaymentFailure = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10 text-center border border-gray-100">
        {/* Animated Error Icon */}
        <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-12 h-12 text-rose-500 animate-bounce"
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
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Payment Failed
        </h1>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          Oops! Your transaction could not be processed. This might be due to 
          insufficient funds, a session timeout, or a connection error with eSewa.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-[#004d4d] text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-black transition-all active:scale-95"
          >
            Try Again from Profile
          </button>
          
          <button
            onClick={() => navigate("/")}
            className="w-full bg-transparent text-slate-400 py-2 font-bold hover:text-slate-600 transition-colors"
          >
            Return to Homepage
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50">
          <p className="text-xs text-slate-400 italic">
            No money was deducted from your account. If it was, please contact our 
            support team with your transaction details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailure;
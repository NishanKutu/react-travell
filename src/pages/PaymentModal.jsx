import React from "react";

const PaymentModal = ({ isOpen, onClose, amount, onSelectPayment }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 transition-all">
      
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-800 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="pt-10 pb-6 text-center">
          <h2 className="text-3xl font-bold text-[#004d4d]">Payment</h2>
          <div className="mt-4 px-10">
            <p className="text-gray-500 text-sm uppercase tracking-widest font-semibold">Total Amount to Pay</p>
            <h3 className="text-4xl font-black text-gray-900 mt-1">
              Rs {amount.toLocaleString()}
            </h3>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-8 pb-10 space-y-4">
          <button
            onClick={() => onSelectPayment("esewa")}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#60bb46] text-white px-3 py-1 rounded text-[10px] font-bold uppercase">eSewa</div>
              <span className="font-bold text-gray-700">Pay with eSewa</span>
            </div>
            <span className="text-gray-300 group-hover:text-green-500 font-bold text-xl">→</span>
          </button>

          <button
            onClick={() => onSelectPayment("stripe")}
            className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-[#635bff] hover:bg-indigo-50 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="bg-[#635bff] text-white px-3 py-1 rounded text-[10px] font-bold uppercase">Stripe</div>
              <span className="font-bold text-gray-700">Credit / Debit Card</span>
            </div>
            <span className="text-gray-300 group-hover:text-[#635bff] font-bold text-xl">→</span>
          </button>

          <div className="pt-4 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">Secure Encrypted Payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
import React from "react";
import { useNavigate } from "react-router-dom";

const OrderPlaced = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fff9f5]">
      {/* ✅ Green check circle */}
      <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* ✅ Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h1>

      {/* ✅ Description */}
      <p className="text-gray-600 text-center max-w-md mb-6">
        Thank you for your purchase. Your order is being prepared. You can track
        your order status in the <b>“My Orders”</b> section.
      </p>

      {/* ✅ Button */}
      <button
        onClick={() => navigate("/orders")}
        className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-all"
      >
        Back to my orders
      </button>
    </div>
  );
};

export default OrderPlaced;

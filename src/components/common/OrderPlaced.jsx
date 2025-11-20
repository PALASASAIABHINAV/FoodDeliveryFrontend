import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Timer, MapPin } from "lucide-react";

const OrderPlaced = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-rose-50 flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Background decorative blobs */}
      <div className="absolute -top-20 -left-20 w-60 h-60 bg-orange-200 rounded-full opacity-40 blur-3xl"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-rose-200 rounded-full opacity-40 blur-3xl"></div>

      {/* Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-xl border border-orange-100 max-w-md w-full p-8 text-center animate-fadeUp">

        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto flex items-center justify-center bg-green-100 rounded-full shadow-inner mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Order Confirmed!
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mt-3 text-sm leading-relaxed">
          Thanks for ordering with <span className="font-bold text-emerald-600">ZentroEat</span>!  
          Your delicious food is being prepared with care.
        </p>

        {/* Status Box */}
        <div className="mt-6 bg-emerald-200/40 border border-emerald-200 rounded-xl p-4 text-left shadow-sm">
          <p className="text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <Timer className="w-4 h-4" /> Estimated Delivery
          </p>
          <p className="mt-1 text-gray-800 font-bold text-lg">30–45 minutes</p>

          <p className="mt-3 text-sm font-semibold text-emerald-600 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Tracking Available
          </p>
          <p className="text-gray-600 text-sm">
            View real-time updates in the <b>My Orders</b> section.
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => navigate("/orders")}
          className="mt-8 w-full bg-emerald-600 hover:bg-emerald-400 text-white font-semibold py-3 rounded-xl shadow-md transition-all text-sm"
        >
          Go to My Orders
        </button>
      </div>

      {/* Small floating icons */}
      <div className="absolute bottom-10 left-10 text-orange-300 animate-float">
        🍕
      </div>
      <div className="absolute top-12 right-14 text-rose-300 animate-float-delay">
        🍔
      </div>

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp .6s ease-out; }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-float-delay { animation: float 3s ease-in-out infinite .8s; }
      `}</style>
    </div>
  );
};

export default OrderPlaced;

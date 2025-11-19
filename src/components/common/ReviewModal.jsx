import React, { useState } from "react";
import { X } from "lucide-react";

const ReviewModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
        
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-black">
          <X className="w-5 h-5" />
        </button>

        {/* Item Name */}
        <h2 className="text-xl font-bold mb-2 text-gray-900 text-center">
          Rate {item?.name}
        </h2>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`cursor-pointer text-3xl ${
                rating >= star ? "text-yellow-400" : "text-gray-300"
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        {/* Comment Box */}
        <textarea
          placeholder="Write your review..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-yellow-400 outline-none"
          rows="4"
        />

        {/* Submit Button */}
        <button
          onClick={() => onSubmit(rating, comment)}
          className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition"
        >
          Submit Review
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;

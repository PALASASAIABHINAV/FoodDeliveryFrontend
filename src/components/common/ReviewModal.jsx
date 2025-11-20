import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ReviewModal = ({ isOpen, onClose, onSubmit, item }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // reset when item/modal changes
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setComment("");
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-emerald-50 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="px-5 pt-5 pb-4">
          {/* Item info */}
          <div className="flex flex-col items-center text-center gap-2 mb-3">
            {item?.image?.url && (
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                <img
                  src={item.image.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <p className="text-[11px] font-semibold tracking-wide uppercase text-emerald-500">
                Rate your dish
              </p>
              <h2 className="text-lg font-bold text-slate-900">
                {item?.name || "This item"}
              </h2>
              <p className="text-[12px] text-slate-500">
                Your feedback helps improve ZentroEat recommendations.
              </p>
            </div>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-1.5 my-4">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = rating >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <span
                    className={`text-3xl transition-transform ${
                      active
                        ? "text-amber-400 drop-shadow-sm scale-105"
                        : "text-slate-200 hover:text-amber-200"
                    }`}
                  >
                    ★
                  </span>
                </button>
              );
            })}
          </div>

          {/* Comment */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Write a short review{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="Share what you liked or what could be better…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-100 transition"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-[11px] text-slate-500">
            Ratings help other users choose better. Thanks for contributing! 🌟
          </p>
          <button
            onClick={() => onSubmit(rating, comment)}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-105 transition disabled:opacity-60"
          >
            Submit review
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;

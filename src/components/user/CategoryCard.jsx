// src/components/CategoryCard.jsx
import React from "react";
import { ChevronRight } from "lucide-react";

const CategoryCard = ({ name, image }) => {
  return (
    <div
      className="
        group cursor-pointer flex flex-col items-center 
        transition-all duration-300
        hover:scale-105
      "
    >
      {/* Image Circle */}
      <div className="
        w-24 h-24 sm:w-28 sm:h-28 rounded-full shadow-lg 
        bg-white overflow-hidden border border-slate-200 
        group-hover:shadow-xl group-hover:border-emerald-400
        transition-all duration-300
        flex items-center justify-center
      ">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Category Name */}
      <p className="
        mt-2 text-sm sm:text-[15px] font-semibold 
        text-slate-700 group-hover:text-emerald-600
        transition-colors
      ">
        {name}
      </p>

      {/* Tiny hover indicator */}
      <ChevronRight
        className="
          w-4 h-4 text-slate-400 opacity-0 
          group-hover:opacity-100 group-hover:text-emerald-500
          transition-all mt-1
        "
      />
    </div>
  );
};

export default CategoryCard;

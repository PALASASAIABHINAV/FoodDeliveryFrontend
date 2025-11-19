// src/components/CategoryCard.jsx
import React from "react";

const CategoryCard = ({ name, image }) => {
  return (
    <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
      <div className="w-24 h-24 bg-white shadow-md rounded-full flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <p className="mt-2 text-sm font-medium text-gray-700">{name}</p>
    </div>
  );
};

export default CategoryCard;

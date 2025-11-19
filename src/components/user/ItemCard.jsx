import React, { useState } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import {  useNavigate } from 'react-router-dom';

const ItemCard = ({ item }) => {
  if (!item) return null;
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading, openCart } = useCartStore();

  const avgRating = item.rating?.average || 0;
  const ratingCount = item.rating?.count || 0;

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= Math.round(avgRating)
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // ✅ Handle add to cart
  const handleAddToCart = async () => {
    try {
      await addToCart(item._id, quantity);
     // Open cart sidebar after adding
      setQuantity(1); // Reset quantity
      navigate("/cart");
    } catch (error) {
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden">
      {/* Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={item.image?.url || "/images/placeholder-food.jpg"}
          alt={item.name}
          className="h-full w-full object-cover hover:scale-105 transition-transform"
        />
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-sm font-semibold px-2 py-1 rounded">
          ₹{item.price}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{item.name}</h3>

        {/* Food Type */}
        <div className="flex items-center space-x-2 mt-1">
          <span
            className={`inline-block w-3 h-3 rounded-full ${
              item.foodType === "Veg" ? "bg-green-600" : "bg-red-600"
            }`}
          ></span>
          <p className="text-sm text-gray-500">{item.foodType}</p>
        </div>

        {/* Category */}
        <p className="text-gray-600 text-sm mt-1">{item.category}</p>

        {/* Description */}
        {item.description && (
          <p className="text-gray-500 text-sm mt-2 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* Rating Section */}
        <div className="flex items-center mt-3 space-x-2">
          {renderStars()}
          <span className="text-sm text-gray-700 font-medium">
            {avgRating.toFixed(1)} ({ratingCount})
          </span>
        </div>

        {/* Quantity Selector + Add to Cart */}
        <div className="flex items-center mt-4 space-x-3">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={decreaseQuantity}
              className="px-3 py-1 bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition"
            >
              -
            </button>
            <span className="px-4">{quantity}</span>
            <button
              onClick={increaseQuantity}
              className="px-3 py-1 bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition"
            >
              +
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {loading ? "Adding..." : "Add to Cart"}
          </button>
        </div>

        {/* Shop Name */}
        {item.shop && (
          <p className="mt-3 text-sm text-gray-700 font-medium">
            From:{" "}
            <span className="text-black font-semibold">
              {item.shop.name || "Unknown Shop"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ItemCard;
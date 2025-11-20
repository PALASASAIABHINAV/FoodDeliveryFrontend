import React, { useState } from "react";
import { Star, ShoppingCart } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";

const ItemCard = ({ item }) => {
  if (!item) return null;

  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { addToCart, loading } = useCartStore();

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
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    try {
      await addToCart(item._id, quantity);
      setQuantity(1);
      navigate("/cart");
    } catch (error) {
      alert("Failed to add to cart");
    }
  };

  return (
    <div className="
      bg-white rounded-2xl shadow-lg hover:shadow-2xl 
      transition-all duration-300 overflow-hidden
      border border-gray-200 hover:border-emerald-400
    ">
      {/* IMAGE */}
      <div className="relative h-48 w-full overflow-hidden group">
        <img
          src={item.image?.url || "/images/placeholder-food.jpg"}
          alt={item.name}
          className="
            h-full w-full object-cover 
            group-hover:scale-110 transition-transform duration-500
          "
        />

        {/* PRICE TAG */}
        <div className="
          absolute bottom-3 left-3 
          bg-black/70 backdrop-blur-md 
          text-white text-sm font-semibold 
          px-3 py-1 rounded-full shadow-md
        ">
          ₹{item.price}
        </div>

        {/* FOOD TYPE TAG */}
        <div className="
          absolute top-3 right-3 
          px-2 py-1 rounded-full text-xs font-semibold 
          shadow-md 
          text-white
          backdrop-blur-md
          bg-opacity-80
          ${item.foodType === 'Veg' ? 'bg-green-600' : 'bg-red-600'}
        ">
          {item.foodType}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        {/* NAME */}
        <h3 className="font-bold text-lg text-gray-900 truncate">
          {item.name}
        </h3>

        {/* CATEGORY */}
        <p className="text-sm text-gray-500">{item.category}</p>

        {/* DESCRIPTION */}
        {item.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* RATING */}
        <div className="flex items-center mt-2 gap-2">
          <div className="flex">{renderStars()}</div>
          <span className="text-sm text-gray-700 font-medium">
            {avgRating.toFixed(1)} ({ratingCount})
          </span>
        </div>

        {/* QUANTITY + ADD */}
        <div className="flex items-center justify-between mt-3">
          {/* QUANTITY */}
          <div className="flex items-center border rounded-xl overflow-hidden">
            <button
              onClick={decreaseQuantity}
              className="
                px-3 py-1 bg-gray-100 text-gray-700 
                hover:bg-gray-200 font-bold transition
              "
            >
              -
            </button>

            <span className="px-4 font-semibold">{quantity}</span>

            <button
              onClick={increaseQuantity}
              className="
                px-3 py-1 bg-gray-100 text-gray-700 
                hover:bg-gray-200 font-bold transition
              "
            >
              +
            </button>
          </div>

          {/* ADD TO CART */}
          <button
            onClick={handleAddToCart}
            disabled={loading}
            className="
              flex items-center gap-2 
              bg-emerald-600 hover:bg-emerald-700 
              text-white px-4 py-2 rounded-xl 
              shadow-md hover:shadow-lg 
              transition disabled:opacity-50
            "
          >
            <ShoppingCart className="w-4 h-4" />
            {loading ? "Adding..." : "Add"}
          </button>
        </div>

        {/* SHOP NAME */}
        {item.shop && (
          <p className="mt-3 text-sm font-medium text-gray-700">
            From:{" "}
            <span className="font-semibold text-gray-900">
              {item.shop.name || "Unknown Shop"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ItemCard;

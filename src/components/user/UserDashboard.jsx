import React, { useEffect, useRef } from "react";
import CategoryCard from "./CategoryCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "../common/Navbar";
import { useUserStore } from "../../store/useAuthStore";
import { useShopsData } from "../../store/shopsData";
import ShopDisplayCard from "./ShopDisplayCard";
import { useItemsData } from "../../store/itemsData";
import ItemCard from "./ItemCard";

const categories = [
  { name: "Snacks", image: "/images/snacks.jpg" },
  { name: "Main Course", image: "/images/maincourse.jpg" },
  { name: "Dessert", image: "/images/dessert.jpg" },
  { name: "Pizza", image: "/images/pizza.jpg" },
  { name: "Sandwich", image: "/images/sandwich.jpg" },
  { name: "South Indian", image: "/images/southindian.jpg" },
  { name: "North Indian", image: "/images/northindian.jpg" },
  { name: "Chinese", image: "/images/chinese.jpg" },
  { name: "Fast Food", image: "/images/fastfood.jpg" },
  { name: "Others", image: "/images/others.jpg" },
];

const UserDashboard = () => {
  const scrollRef = useRef(null);
  const { getCurrentCity, selectedCity } = useUserStore();
  const { shops, loading: shopsLoading, fetchShopsByCity } = useShopsData();
  const { items, loading: itemsLoading, fetchItemsByCity } = useItemsData();

  const scroll = (direction) => {
    const container = scrollRef.current;
    const scrollAmount = 400;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const city = getCurrentCity();
    if (city) {
      console.log("📍 Fetching data for city:", city);
      fetchShopsByCity(city);
      fetchItemsByCity(city);
    }
  }, [selectedCity, getCurrentCity]);

  const currentCity = getCurrentCity();

  return (
    <div>
      <Navbar />
      

      {!currentCity && (
        <div className="max-w-7xl mx-auto px-6 py-10 text-center">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <p className="text-lg font-semibold text-yellow-800 mb-2">
              📍 Please select your city
            </p>
            <p className="text-gray-600">
              Click on "Select City" in the navbar to choose your delivery location
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Order our best food options
        </h2>

        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div
          ref={scrollRef}
          className="flex space-x-6 overflow-x-auto scrollbar-hide scroll-smooth px-10"
        >
          {categories.map((cat, index) => (
            <CategoryCard key={index} name={cat.name} image={cat.image} />
          ))}
        </div>
      </div>

      {/* Shops Section */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Best Shops in {currentCity || "your city"}
        </h2>

        {shopsLoading && <p className="text-center text-gray-500">Loading shops...</p>}
        {!shopsLoading && shops.length === 0 && (
          <p className="text-center text-gray-500">No shops found.</p>
        )}

        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
          {shops.map((shop) => (
            <ShopDisplayCard key={shop._id} shop={shop} />
          ))}
        </div>
      </div>

      {/* Items Section (Updated Grid Layout) */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-center mb-8">
          Best Food Deals in {currentCity || "your city"}
        </h2>

        {itemsLoading && <p className="text-center text-gray-500">Loading items...</p>}
        {!itemsLoading && items.length === 0 && (
          <p className="text-center text-gray-500">No items found.</p>
        )}

        {/* ✅ Responsive Grid Instead of Scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

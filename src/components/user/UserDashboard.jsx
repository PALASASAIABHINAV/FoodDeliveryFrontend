import React, { useEffect, useRef, useState, useMemo } from "react";
import CategoryCard from "./CategoryCard";
import { ChevronLeft, ChevronRight, MapPin, Filter, Sparkles } from "lucide-react";
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
  const { getCurrentCity, selectedCity, user } = useUserStore();
  const { shops, loading: shopsLoading, fetchShopsByCity } = useShopsData();
  const { items, loading: itemsLoading, fetchItemsByCity } = useItemsData();

  const [filterFoodType, setFilterFoodType] = useState("ALL"); // ALL | Veg | Non-Veg
  const [sortBy, setSortBy] = useState("RELEVANCE"); // RELEVANCE | PRICE_LOW_HIGH | PRICE_HIGH_LOW | RATING_HIGH

  const [canScrollLeft, setCanScrollLeft] = useState(false);
const [canScrollRight, setCanScrollRight] = useState(false);

const updateScrollButtons = () => {
  const el = scrollRef.current;
  if (!el) return;
  const { scrollLeft, scrollWidth, clientWidth } = el;

  // small tolerance of 8px
  setCanScrollLeft(scrollLeft > 8);
  setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
};

useEffect(() => {
  // Run once after mount and whenever layout may change
  updateScrollButtons();
  const el = scrollRef.current;
  if (!el) return;

  el.addEventListener("scroll", updateScrollButtons);
  window.addEventListener("resize", updateScrollButtons);

  return () => {
    el.removeEventListener("scroll", updateScrollButtons);
    window.removeEventListener("resize", updateScrollButtons);
  };
}, []);


 const scroll = (direction) => {
  const container = scrollRef.current;
  if (!container) return;
  const scrollAmount = 400;

  container.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });

  // update after scroll animation
  setTimeout(updateScrollButtons, 350);
};


  useEffect(() => {
    const city = getCurrentCity();
    if (city) {
      console.log("📍 Fetching data for city:", city);
      fetchShopsByCity(city);
      fetchItemsByCity(city);
    }
  }, [selectedCity, getCurrentCity, fetchShopsByCity, fetchItemsByCity]);

  const currentCity = getCurrentCity();

  // ✅ Client-side search + filter + sort for items
  const filteredItems = useMemo(() => {
    let data = [...items];

    if (filterFoodType !== "ALL") {
      data = data.filter((item) => item.foodType === filterFoodType);
    }

    if (sortBy === "PRICE_LOW_HIGH") {
      data.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "PRICE_HIGH_LOW") {
      data.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "RATING_HIGH") {
      data.sort(
        (a, b) =>
          (b.rating?.average || 0) - (a.rating?.average || 0)
      );
    }

    return data;
  }, [items, filterFoodType, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero / Greeting */}
      <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 md:py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-100 mb-1">
              Welcome back
            </p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {user?.fullName ? `Hi, ${user.fullName.split(" ")[0]} 👋` : "Hi, foodie 👋"}
            </h1>
            <p className="text-sm md:text-base text-emerald-50 mt-1 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Delivering to{" "}
              <span className="font-semibold ml-1">
                {currentCity || "your city"}
              </span>
            </p>
            <p className="text-xs md:text-sm text-emerald-100 mt-2">
              Explore top-rated restaurants, trending categories and best deals near you.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 text-xs md:text-sm">
            <div className="bg-white/15 border border-emerald-200/40 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <Sparkles className="w-4 h-4" />
              <div>
                <p className="font-semibold leading-tight">
                  {shops.length || 0}+ restaurants
                </p>
                <p className="text-[11px] text-emerald-100">
                  in {currentCity || "your area"}
                </p>
              </div>
            </div>

            <div className="bg-white/15 border border-emerald-200/40 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
              <Filter className="w-4 h-4" />
              <div>
                <p className="font-semibold leading-tight">
                  {items.length || 0} dishes
                </p>
                <p className="text-[11px] text-emerald-100">
                  curated for quick delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Show city warning if not selected */}
      {!currentCity && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="text-sm font-semibold text-amber-800 mb-1">
                Please select your city
              </p>
              <p className="text-xs text-amber-700">
                Click on <strong>&quot;Select City&quot;</strong> in the navbar to choose your delivery location.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <section className="relative max-w-7xl mx-auto px-6 py-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-xl md:text-2xl font-bold text-slate-900">
      Browse by category
    </h2>
    <p className="text-xs text-slate-500 hidden sm:block">
      Tap a category to quickly explore dishes
    </p>
  </div>

  <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-5">
    {/* LEFT ARROW – only show when canScrollLeft is true */}
    {canScrollLeft && (
      <button
        onClick={() => scroll("left")}
        className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 bg-white shadow-md border border-slate-100 rounded-full p-1 hover:bg-slate-50 z-10"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>
    )}

    {/* RIGHT ARROW – only show when canScrollRight is true */}
    {canScrollRight && (
      <button
        onClick={() => scroll("right")}
        className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 bg-white shadow-md border border-slate-100 rounded-full p-1 hover:bg-slate-50 z-10"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    )}

    <div
      ref={scrollRef}
      className="flex space-x-5 overflow-x-auto scrollbar-hide scroll-smooth"
      onLoad={updateScrollButtons}
    >
      {categories.map((cat, index) => (
        <CategoryCard key={index} name={cat.name} image={cat.image} />
      ))}
    </div>
  </div>
</section>


      {/* Shops Section */}
      <section className="max-w-7xl mx-auto px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 text-center md:text-left w-full">
            Best restaurants in{" "}
            <span className="text-emerald-600">
              {currentCity || "your city"}
            </span>
          </h2>
        </div>

        {shopsLoading && (
          <p className="text-center text-slate-500 text-sm">
            Loading restaurants...
          </p>
        )}
        {!shopsLoading && shops.length === 0 && (
          <p className="text-center text-slate-500 text-sm">
            No restaurants found in this area yet.
          </p>
        )}

        <div className="flex space-x-6 overflow-x-auto pb-3 scrollbar-hide">
          {shops.map((shop) => (
            <ShopDisplayCard key={shop._id} shop={shop} />
          ))}
        </div>
      </section>

      {/* Items Section */}
      <section className="max-w-7xl mx-auto px-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              Best food deals in{" "}
              <span className="text-emerald-600">
                {currentCity || "your city"}
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Choose from popular dishes, filtered and sorted just for you.
            </p>
          </div>

          {/* Filters / Search / Sort */}
          <div className="flex flex-col md:flex-row gap-2 md:items-center text-xs">
            {/* Search */}
           

            {/* Food type filter */}
            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setFilterFoodType("ALL")}
                className={`px-3 py-1.5 ${
                  filterFoodType === "ALL"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600"
                } text-[11px] font-medium`}
              >
                All
              </button>
              <button
                onClick={() => setFilterFoodType("Veg")}
                className={`px-3 py-1.5 border-l border-slate-200 ${
                  filterFoodType === "Veg"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600"
                } text-[11px] font-medium`}
              >
                Veg
              </button>
              <button
                onClick={() => setFilterFoodType("Non-Veg")}
                className={`px-3 py-1.5 border-l border-slate-200 ${
                  filterFoodType === "Non-Veg"
                    ? "bg-emerald-500 text-white"
                    : "text-slate-600"
                } text-[11px] font-medium`}
              >
                Non-veg
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl px-2 py-1.5 shadow-sm">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent outline-none text-[11px] md:text-xs text-slate-700"
              >
                <option value="RELEVANCE">Sort: Relevance</option>
                <option value="PRICE_LOW_HIGH">Price: Low to High</option>
                <option value="PRICE_HIGH_LOW">Price: High to Low</option>
                <option value="RATING_HIGH">Rating: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {itemsLoading && (
          <p className="text-center text-slate-500 text-sm">
            Loading dishes...
          </p>
        )}

        {!itemsLoading && filteredItems.length === 0 && (
          <p className="text-center text-slate-500 text-sm">
            No items match your filters/search.
          </p>
        )}

        {/* Items grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;

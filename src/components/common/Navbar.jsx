import React, { useState, useEffect, useMemo } from "react";
import { useUserStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import CitySelector from "./CitySelector";
import { useItemsData } from "../../store/itemsData";
import { useShopsData } from "../../store/shopsData";

const Navbar = () => {
  const { detectedLocation, fetchUserLocation, user, logout } = useUserStore();
  const { getCartCount, openCart, fetchCart, getCartTotal } = useCartStore();
  const { items } = useItemsData();
  const { shops } = useShopsData();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // ✅ Fetch location and cart on mount
  useEffect(() => {
    fetchUserLocation();
    fetchCart();
  }, [fetchUserLocation, fetchCart]);

  const handleLocationChange = (e) => {
    setManualLocation(e.target.value);
    setIsManual(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const isOwner = user?.role === "owner";
  const isDeliveryBoy = user?.role === "deliveryBoy";
  const isUser = user?.role === "user";
  const cartCount = getCartCount();

  // 🔍 Client-side search over shops + items
  const trimmedSearch = search.trim().toLowerCase();

  const { matchedShops, matchedItems } = useMemo(() => {
    if (!trimmedSearch) {
      return { matchedShops: [], matchedItems: [] };
    }

    const ms = shops
      .filter((shop) => {
        const nameMatch = shop.name?.toLowerCase().includes(trimmedSearch);
        const cityMatch = shop.city?.toLowerCase().includes(trimmedSearch);
        return nameMatch || cityMatch;
      })
      .slice(0, 4); // limit to 4 shops

    const mi = items
      .filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(trimmedSearch);
        const catMatch = item.category?.toLowerCase().includes(trimmedSearch);
        const shopMatch = item.shop?.name?.toLowerCase().includes(trimmedSearch);
        return nameMatch || catMatch || shopMatch;
      })
      .slice(0, 6); // limit to 6 items

    return { matchedShops: ms, matchedItems: mi };
  }, [shops, items, trimmedSearch]);

  const hasResults = matchedShops.length > 0 || matchedItems.length > 0;

  const handleResultClick = () => {
    // For now just close dropdown on click.
    // Later you can add navigation to shop / item details if routes exist.
    setShowSearchResults(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Left: Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src="/zentroeat-removebg.png"
              alt="ZentroEat Logo"
              className="h-36 w-auto object-contain drop-shadow-md select-none"
            />
          </div>

          {/* Middle: Location + Search */}
          <div className="flex-1 hidden md:flex items-center justify-center gap-4">
            {/* City selector (for all roles) */}
            <CitySelector />

            {/* Search – only for normal users */}
            {isUser && (
              <div className="relative w-full max-w-md">
                <div className="flex items-center bg-slate-50 border border-slate-200 hover:border-emerald-400 px-3 py-2 rounded-xl transition-all shadow-inner">
                  <span className="mr-2 text-slate-400 text-sm">🔍</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onFocus={() => setShowSearchResults(true)}
                    placeholder="Search for dishes or restaurants..."
                    className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder-slate-400"
                  />
                </div>

                {/* Search dropdown */}
                {showSearchResults && trimmedSearch.length > 1 && (
                  <div
                    className="absolute mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-3 text-sm z-50"
                    onMouseDown={(e) => e.preventDefault()} // keep input focus when clicking
                  >
                    {!hasResults && (
                      <p className="text-xs text-slate-500">
                        No results for <span className="font-semibold">“{search}”</span>
                      </p>
                    )}

                    {matchedShops.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[11px] font-semibold text-slate-500 mb-1">
                          Restaurants
                        </p>
                        <ul className="space-y-1">
                          {matchedShops.map((shop) => (
                            <li key={shop._id}>
                              <button
                                type="button"
                                onClick={handleResultClick}
                                className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-50 flex flex-col"
                              >
                                <span className="text-xs font-semibold text-slate-800 truncate">
                                  {shop.name}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate">
                                  {shop.city}, {shop.state}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {matchedItems.length > 0 && (
                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-1">
                          Dishes
                        </p>
                        <ul className="space-y-1 max-h-40 overflow-y-auto">
                          {matchedItems.map((item) => (
                            <li key={item._id}>
                              <button
                                type="button"
                                onClick={handleResultClick}
                                className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-50 flex flex-col"
                              >
                                <span className="text-xs font-semibold text-slate-800 truncate">
                                  {item.name}
                                </span>
                                <span className="text-[11px] text-slate-500 truncate">
                                  {item.shop?.name || "Restaurant"} • ₹
                                  {item.price ?? "-"}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Cart + mini summary – only for users */}
            {isUser && (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => setShowMiniCart(true)}
                onMouseLeave={() => setShowMiniCart(false)}
              >
                <button
                  onClick={() => navigate("/cart")}
                  className="relative p-2 rounded-full hover:bg-slate-100 transition"
                >
                  <ShoppingCart className="w-5 h-5 text-slate-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm">
                      {cartCount}
                    </span>
                  )}
                </button>

                {showMiniCart && cartCount > 0 && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 border border-slate-100 rounded-2xl shadow-xl p-3 z-50">
                    <p className="text-xs font-semibold text-slate-700 mb-1">
                      {cartCount} item{cartCount > 1 ? "s" : ""} in cart
                    </p>
                    <p className="text-lg font-bold text-emerald-600">
                      ₹{getCartTotal()}
                    </p>
                    <button
                      onClick={() => navigate("/cart")}
                      className="w-full mt-2 bg-emerald-500 text-white py-1.5 rounded-xl text-xs font-semibold hover:bg-emerald-600 transition"
                    >
                      View cart & checkout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* My Orders – only for normal users */}
            {(isUser || isOwner) && (
              <button
                onClick={() => navigate("/orders")}
                className="hidden md:inline-flex bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-slate-800 transition shadow-md"
              >
                My Orders
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
              >
                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white/95 border border-slate-100 rounded-2xl shadow-xl py-1 text-sm text-slate-700 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 text-xs">
                    <p className="font-semibold truncate">
                      {user?.fullName || "Guest"}
                    </p>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {user?.role || "user"}
                    </p>
                  </div>

                  {isUser && (
                    <button
                      onClick={() => {
                        navigate("/orders");
                        setProfileOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 hover:bg-slate-50"
                    >
                      My Orders
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 hover:bg-slate-50 text-red-600 text-xs font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: City + search row */}
        <div className="md:hidden pb-2 flex items-center gap-3">
          <CitySelector />
          {isUser && (
            <div className="relative flex-1">
              <div className="flex items-center bg-slate-50 border border-slate-200 px-2 py-1.5 rounded-xl">
                <span className="mr-1 text-slate-400 text-xs">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  placeholder="Search..."
                  className="bg-transparent outline-none w-full text-xs text-slate-700 placeholder-slate-400"
                />
              </div>

              {/* Mobile dropdown (reuse same results) */}
              {showSearchResults && trimmedSearch.length > 1 && (
                <div
                  className="absolute mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl p-3 text-xs z-50"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {!hasResults && (
                    <p className="text-[11px] text-slate-500">
                      No results for <span className="font-semibold">“{search}”</span>
                    </p>
                  )}

                  {matchedShops.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-semibold text-slate-500 mb-1">
                        Restaurants
                      </p>
                      <ul className="space-y-1">
                        {matchedShops.map((shop) => (
                          <li key={shop._id}>
                            <button
                              type="button"
                              onClick={handleResultClick}
                              className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-50 flex flex-col"
                            >
                              <span className="text-[11px] font-semibold text-slate-800 truncate">
                                {shop.name}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">
                                {shop.city}, {shop.state}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {matchedItems.length > 0 && (
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 mb-1">
                        Dishes
                      </p>
                      <ul className="space-y-1 max-h-36 overflow-y-auto">
                        {matchedItems.map((item) => (
                          <li key={item._id}>
                            <button
                              type="button"
                              onClick={handleResultClick}
                              className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-50 flex flex-col"
                            >
                              <span className="text-[11px] font-semibold text-slate-800 truncate">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">
                                {item.shop?.name || "Restaurant"} • ₹
                                {item.price ?? "-"}
                              </span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

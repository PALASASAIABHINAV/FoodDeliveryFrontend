import React, { useState, useEffect } from "react";
import { useUserStore } from "../../store/useAuthStore";
import { useCartStore } from "../../store/useCartStore"; // ✅ Add this
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react"; // ✅ Add this
import CitySelector from "./CitySelector";

const Navbar = () => {
  const { detectedLocation, fetchUserLocation, user, logout } = useUserStore();
  const { getCartCount, openCart, fetchCart, getCartTotal } = useCartStore(); // ✅ Add this
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [manualLocation, setManualLocation] = useState("");
  const [isManual, setIsManual] = useState(false);
  const [showMiniCart, setShowMiniCart] = useState(false);

  // ✅ Fetch location and cart on mount
  useEffect(() => {
    fetchUserLocation();
    fetchCart(); // ✅ Add this
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
  const cartCount = getCartCount(); // ✅ Add this

  console.log(detectedLocation)

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <img className="w-10 h-auto" src="/zentroeat.png" alt="Logo" />

      <div
        className="text-2xl font-bold text-green-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        ZentroEat
      </div>

      {/* Middle: Location + Search */}
      <div className="flex-1 mx-6 flex items-center justify-center gap-4">
        {/* ✅ City Selector Component */}
        <CitySelector />

        {/* Search (only for users, not owners) */}
        {!isOwner && (
          <div className="flex items-center bg-gray-50 border-2 border-gray-200 hover:border-blue-400 px-4 py-2 rounded-lg transition-all w-full max-w-md">
            <span className="mr-2 text-gray-400">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for food, restaurants..."
              className="bg-transparent outline-none w-full text-gray-700 placeholder-gray-400"
            />
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* ✅ Cart Icon (only for users, not owners) */}
        <div
          className="relative"
          onMouseEnter={() => setShowMiniCart(true)}
          onMouseLeave={() => setShowMiniCart(false)}
        >
          {!isOwner && (
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          )}
          {showMiniCart && cartCount > 0 && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-xl p-3 z-50">
              <p className="text-sm font-semibold mb-2">
                {cartCount} items in cart
              </p>
              <p className="text-lg font-bold text-blue-600">
                ₹{getCartTotal()}
              </p>
              <button
                onClick={() => navigate("/cart")}
                className="w-full mt-2 bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700"
              >
                View Cart
              </button>
            </div>
          )}
        </div>

        {/* My Orders */}
        <button
          onClick={() => navigate("/orders")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          My Orders
        </button>

        {/* Add Item (owner only) */}
        {isOwner && (
          <button
            onClick={() => navigate("/add-item")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            + Add Item
          </button>
        )}

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-semibold"
          >
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg">
              <ul className="text-gray-700">
                <li>
                  <button
                    onClick={() => navigate("/orders")}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    My Orders
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

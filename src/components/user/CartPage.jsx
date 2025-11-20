import React, { useEffect, useMemo } from "react";
import { Trash2, Plus, Minus, ShoppingBag, MapPin } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import Navbar from "../common/Navbar";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useAuthStore";
import { useItemsData } from "../../store/itemsData";

const CartPage = () => {
  const {
    cart,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartCount,
    loading,
  } = useCartStore();

  const { getCurrentCity } = useUserStore();
  const { items: allItems } = useItemsData();

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateQuantity(itemId, newQuantity);
  };

  const handleRemove = async (itemId) => {
    if (window.confirm("Remove this item from cart?")) {
      await removeFromCart(itemId);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm("Clear all items from cart?")) {
      await clearCart();
    }
  };

  const total = getCartTotal();
  const itemCount = getCartCount();
  const currentCity = getCurrentCity();
  const deliveryFee = total >= 500 ? 0 : 40;

  // Group cart items by shop (for cleaner layout)
  const groupedByShop = useMemo(() => {
    const groups = {};
    cart?.items?.forEach((cartItem) => {
      const shopId = cartItem.item?.shop?._id || "unknown";
      if (!groups[shopId]) {
        groups[shopId] = {
          shop: cartItem.item?.shop,
          items: [],
        };
      }
      groups[shopId].items.push(cartItem);
    });
    return Object.values(groups);
  }, [cart]);

  // Simple "recommended items" (not already in cart)
  const recommendedItems = useMemo(() => {
    if (!allItems?.length || !cart?.items?.length) return [];
    const inCartIds = new Set(cart.items.map((ci) => ci.item?._id));
    return allItems.filter((it) => !inCartIds.has(it._id)).slice(0, 8);
  }, [allItems, cart]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* page content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 md:pb-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              Your Cart
            </h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-medium">
                {itemCount} item{itemCount !== 1 ? "s" : ""} in cart
              </span>
              {currentCity && (
                <>
                  <span className="w-px h-4 bg-slate-200" />
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="text-xs">
                    Delivering to{" "}
                    <span className="font-semibold">{currentCity}</span>
                  </span>
                </>
              )}
            </p>
          </div>

          {itemCount > 0 && (
            <button
              onClick={handleClearCart}
              className="self-start md:self-auto mt-2 md:mt-0 inline-flex items-center gap-2 px-3 py-2 rounded-full border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              Clear cart
            </button>
          )}
        </header>

        {/* Loading state */}
        {loading && (
          <p className="text-center text-slate-500 text-sm mt-10">
            Loading your cart...
          </p>
        )}

        {/* Empty state */}
        {!loading && (!cart?.items || cart.items.length === 0) && (
          <div className="flex flex-col items-center justify-center mt-16 text-slate-400">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-4 shadow-inner">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <p className="text-lg font-semibold text-slate-700">
              Your cart is empty
            </p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add some delicious food to start your order.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 shadow-md"
            >
              Browse restaurants
            </button>
          </div>
        )}

        {/* Cart content */}
        {!loading && cart?.items && cart.items.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left side: items */}
            <section className="flex-1 space-y-4">
              {/* Delivery info card */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">Estimated delivery</p>
                  <p className="text-sm font-semibold text-slate-800">
                    30–45 mins
                  </p>
                  {currentCity && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      From restaurants near{" "}
                      <span className="font-medium">{currentCity}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-600 font-semibold">
                    Free delivery on orders above ₹499
                  </p>
                </div>
              </div>

              {/* Grouped by shop */}
              {groupedByShop.map(({ shop, items: shopItems }) => (
                <div
                  key={shop?._id || "unknown"}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                        {shop?.name || "Restaurant"}
                      </p>
                      {shop?.city && (
                        <p className="text-[11px] text-slate-500">
                          {shop.city}
                          {shop.area ? ` • ${shop.area}` : ""}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {shopItems.map((cartItem) => (
                      <div
                        key={cartItem._id}
                        className="flex gap-3 sm:gap-4 items-start"
                      >
                        {/* Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img
                            src={
                              cartItem.item?.image?.url || "/placeholder.jpg"
                            }
                            alt={cartItem.item?.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-slate-900 truncate">
                                {cartItem.item?.name}
                              </h3>
                              {cartItem.item?.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-2">
                                  {cartItem.item.description}
                                </p>
                              )}
                              <p className="mt-1 text-xs text-slate-500">
                                ₹{cartItem.price} each
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                ₹{cartItem.price * cartItem.quantity}
                              </p>
                            </div>
                          </div>

                          {/* Quantity & remove */}
                          <div className="mt-2 flex items-center justify-between">
                            <div className="inline-flex items-center bg-slate-50 rounded-full border border-slate-200">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    cartItem.item._id,
                                    cartItem.quantity - 1
                                  )
                                }
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-l-full"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 text-xs font-semibold text-slate-800">
                                {cartItem.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    cartItem.item._id,
                                    cartItem.quantity + 1
                                  )
                                }
                                className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-r-full"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              onClick={() => handleRemove(cartItem.item._id)}
                              className="text-xs text-slate-400 hover:text-red-500 inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recommended items */}
              {recommendedItems.length > 0 && (
                <div className="mt-4">
                  <h2 className="text-sm font-semibold text-slate-900 mb-2">
                    You may also like
                  </h2>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {recommendedItems.map((item) => (
                      <div
                        key={item._id}
                        className="min-w-[160px] bg-white rounded-2xl shadow-sm border border-slate-100 p-3"
                      >
                        <div className="w-full h-24 rounded-xl overflow-hidden bg-slate-100 mb-2">
                          <img
                            src={item.image?.url || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        {item.shop?.name && (
                          <p className="text-[10px] text-slate-500 truncate">
                            {item.shop.name}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-slate-800 mt-1">
                          ₹{item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Right side: summary (desktop / tablet) */}
            <aside className="w-full lg:w-80">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Bill details
                </h2>

                <div className="flex justify-between text-xs text-slate-600">
                  <span>Item total</span>
                  <span>₹{total}</span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 pb-2 border-b border-slate-100">
                  <span>Delivery fee</span>

                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-semibold">Free</span>
                  ) : (
                    <span className="text-slate-700 font-semibold">
                      ₹{deliveryFee}
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-semibold text-slate-900">
                    To pay
                  </span>
                  <span className="text-xl font-bold text-emerald-600">
                    ₹{total + deliveryFee}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/check-out")}
                  className="w-full mt-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:brightness-105 shadow-md"
                >
                  Proceed to checkout
                </button>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Sticky bottom bar for mobile */}
      {itemCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 border-t border-slate-200 px-4 py-2 flex items-center justify-between z-40">
          <div>
            <p className="text-xs text-slate-500">
              {itemCount} item{itemCount !== 1 ? "s" : ""} • Total
            </p>
            <p className="text-sm font-semibold text-emerald-600">
              ₹{total + deliveryFee}
            </p>
          </div>
          <button
            onClick={() => navigate("/check-out")}
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
          >
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;

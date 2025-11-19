import React, { useEffect } from "react";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import Navbar from "../common/Navbar";
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  console.log("cart page render", cart);

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12 lg:px-20">
      <Navbar />
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
        My Cart ({getCartCount()} items)
      </h1>

      {loading && <p className="text-center text-gray-500">Loading...</p>}

      {!loading && cart?.items?.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-400">
          <ShoppingBag className="w-24 h-24 mb-4" />
          <p className="text-xl font-medium">Your cart is empty</p>
          <p className="text-sm">Add some delicious items to get started!</p>
        </div>
      )}

      {!loading && cart?.items?.length > 0 && (
        <>
          <div className="space-y-4 mb-10">
            {cart.items.map((cartItem) => (
              <div
                key={cartItem._id}
                className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-md"
              >
                {/* Image */}
                <img
                  src={cartItem.item?.image?.url || "/placeholder.jpg"}
                  alt={cartItem.item?.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />

                {/* Details */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cartItem.item?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {cartItem.item?.shop?.name}
                  </p>

                  <p className="mt-2 text-blue-600 font-semibold">
                    ₹{cartItem.price} × {cartItem.quantity} = ₹
                    {cartItem.price * cartItem.quantity}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          cartItem.item._id,
                          cartItem.quantity - 1
                        )
                      }
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-medium">
                      {cartItem.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          cartItem.item._id,
                          cartItem.quantity + 1
                        )
                      }
                      className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(cartItem.item._id)}
                  className="text-red-500 hover:text-red-700 self-start sm:self-center"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 max-w-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-bold">Total:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{getCartTotal()}
              </span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleClearCart}
                className="flex-1 border border-red-600 text-red-600 py-2 rounded-lg hover:bg-red-50 transition"
              >
                Clear Cart
              </button>
              <button onClick={()=>navigate("/check-out")} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;

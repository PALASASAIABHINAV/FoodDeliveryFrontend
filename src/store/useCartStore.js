import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";

export const useCartStore = create((set, get) => ({
  cart: null,
  loading: false,
  error: null,
  isCartOpen: false,

  // ✅ Toggle cart sidebar
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  // ✅ Fetch cart
  fetchCart: async () => {
  console.log("🟡 fetchCart called");
  try {
    const res = await axios.get(`${serverUrl}/api/cart`, { withCredentials: true });
    console.log("🟢 Cart fetched:", res.data);
    set({ cart: res.data });
  } catch (err) {
    console.error("🔴 fetchCart error:", err);
  }
},


  // ✅ Add to cart
  addToCart: async (itemId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${serverUrl}/api/cart/add`,
        { itemId, quantity },
        { withCredentials: true }
      );
      set({ cart: res.data.cart, loading: false });
      return res.data;
    } catch (error) {
      console.error("Add to cart error:", error);
      set({ error: error.response?.data?.message || "Failed to add to cart", loading: false });
      throw error;
    }
  },

  // ✅ Update quantity
  updateQuantity: async (itemId, quantity) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(
        `${serverUrl}/api/cart/update`,
        { itemId, quantity },
        { withCredentials: true }
      );
      set({ cart: res.data.cart, loading: false });
    } catch (error) {
      console.error("Update cart error:", error);
      set({ error: error.response?.data?.message || "Failed to update cart", loading: false });
    }
  },

  // ✅ Remove from cart
  removeFromCart: async (itemId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${serverUrl}/api/cart/remove/${itemId}`, {
        withCredentials: true,
      });
      set({ cart: res.data.cart, loading: false });
    } catch (error) {
      console.error("Remove from cart error:", error);
      set({ error: error.response?.data?.message || "Failed to remove from cart", loading: false });
    }
  },

  // ✅ Clear cart
  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.delete(`${serverUrl}/api/cart/clear`, {
        withCredentials: true,
      });
      set({ cart: res.data.cart, loading: false });
    } catch (error) {
      console.error("Clear cart error:", error);
      set({ error: error.response?.data?.message || "Failed to clear cart", loading: false });
    }
  },

  // ✅ Get cart count
  getCartCount: () => {
    const { cart } = get();
    return cart?.totalItems || 0;
  },

  // ✅ Get cart total
  getCartTotal: () => {
    const { cart } = get();
    return cart?.totalAmount || 0;
  },
}));
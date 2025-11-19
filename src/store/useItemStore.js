// src/store/useItemStore.js
import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";

export const useItemStore = create((set) => ({
  items: [],
  loading: false,
  error: null,

  addItem: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post(`${serverUrl}/api/item/create-item`, formData, {
        withCredentials: true,
      });
      set((state) => ({
        items: [...state.items, res.data],
        loading: false,
        error: null,
      }));
      return res.data;
    } catch (err) {
      console.error("❌ Add Item Error:", err);
      set({ loading: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  editItem: async (itemId, formData) => {
    set({ loading: true });
    try {
      const res = await axios.put(`${serverUrl}/api/item/edit-item/${itemId}`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      set((state) => ({
        items: state.items.map((item) =>
          item._id === itemId ? res.data.item : item
        ),
        loading: false,
        error: null,
      }));
      return res.data;
    } catch (err) {
      console.error("❌ Edit Item Error:", err);
      set({ loading: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },

  fetchItemsByShop: async (shopId) => {
    set({ loading: true });
    try {
      const res = await axios.get(`${serverUrl}/api/item/shop/${shopId}`, {
        withCredentials: true,
      });
      set({ items: res.data.items, loading: false, error: null });
      return res.data.items;
    } catch (err) {
      console.error("❌ Fetch Items Error:", err);
      set({ items: [], loading: false, error: err.response?.data?.message || err.message });
    }
  },

  

    // 🔹 Delete an item
  deleteItem: async (itemId, shopId) => {
    try {
      await axios.delete(`${serverUrl}/api/item/${itemId}`, {
        withCredentials: true,
      });
      set((state) => ({
        items: state.items.filter((i) => i._id !== itemId),
      }));
      alert("Item deleted successfully!");
    } catch (err) {
      console.error("❌ Delete Item Error:", err);
      alert(err.response?.data?.message || "Failed to delete item");
    }
  },

  // ⭐ NEW: Add or update review for an item
  addReview: async (itemId, rating, comment) => {
    try {
      const res = await axios.post(
        `${serverUrl}/api/item/${itemId}/reviews`,
        { rating, comment },
        { withCredentials: true }
      );

      // Optional: update local items array if this item is loaded in store
      const updatedItem = res.data.item;
      set((state) => ({
        items: state.items.map((it) =>
          it._id === updatedItem._id ? updatedItem : it
        ),
      }));

      return res.data;
    } catch (err) {
      console.error("❌ Add Review Error:", err);
      throw err;
    }
  },


}));

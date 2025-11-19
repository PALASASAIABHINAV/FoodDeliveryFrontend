import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App"; // make sure this is correct

export const useItemsData = create((set) => ({
  items: [],
  loading: false,
  error: null,

  // ✅ Fetch items by city
  fetchItemsByCity: async (city) => {
    if (!city) return;

    set({ loading: true, error: null });
    try {
      const res = await axios.get(
        `${serverUrl}/api/item/get-items-by-city/${city}`,
        { withCredentials: true }
      );

      set({ items: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching items by city:", err);
      set({
        error: err.response?.data?.message || "Failed to load items",
        loading: false,
      });
    }
  },

  // ✅ Clear all items (optional)
  clearItems: () => set({ items: [] }),
}));

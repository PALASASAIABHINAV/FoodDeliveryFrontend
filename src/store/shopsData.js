import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App"; // adjust if your serverUrl is in another path

export const useShopsData = create((set) => ({
  shops: [],
  
  loading: false,
  error: null,

  // ✅ Fetch all shops by city (case-insensitive handled in backend)
  fetchShopsByCity: async (city) => {
    if (!city) return;

    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${serverUrl}/api/shop/get-shop-by-city/${city}`,{ withCredentials: true });
      set({ shops: res.data, loading: false });
    } catch (err) {
      console.error("Error fetching shops:", err);
      set({
        shops: [],
        error: err.response?.data?.message || "Failed to load shops",
        loading: false,
      });
    }
  },

  // ✅ Clear shop data (optional helper)
  clearShops: () => set({ shops: [] }),
}));

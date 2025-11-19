import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";

export const useShopStore = create((set) => ({
  shop: null,
  loading: false,
  error: null,

  // 🔹 Fetch current owner's shop
  fetchMyShop: async () => {
    set({ loading: true });
    try {
      const res = await axios.get(`${serverUrl}/api/shop/my-shop`, {
        withCredentials: true,
      });
      set({ shop: res.data, loading: false, error: null });
    } catch (err) {
      set({ shop: null, loading: false, error: err.response?.data?.message || err.message });
    }
  },

  // 🔹 Create or Update Shop
  createOrUpdateShop: async (formData) => {
    set({ loading: true });
    try {
      const res = await axios.post(
        `${serverUrl}/api/shop/create-edit`,
        formData,
        { withCredentials: true,headers: { "Content-Type": "application/json" }, }
      );
      set({ shop: res.data.shop, loading: false, error: null });
      return res.data;
    } catch (err) {
      console.error("❌ Create/Update shop error:", err);
      set({ loading: false, error: err.response?.data?.message || err.message });
      throw err;
    }
  },
}));

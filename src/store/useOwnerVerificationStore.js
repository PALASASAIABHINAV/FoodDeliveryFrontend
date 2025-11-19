import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";

export const useOwnerVerificationStore = create((set) => ({
  loading: false,
  error: null,
  myRequest: null,

  submitRequest: async (form) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${serverUrl}/api/owner-verification/request`,
        form,
        { withCredentials: true }
      );
      set({ loading: false, myRequest: res.data.request });
      return res.data.request;
    } catch (err) {
      set({
        loading: false,
        error: err.response?.data?.message || err.message,
      });
      throw err;
    }
  },
}));

import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";

export const useDeliveryStore = create((set) => ({
  deliveryBoys: [],
  assignments: [],
  stats: [],
  earnings: null,
  loading: false,
  error: null,


  getStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(`${serverUrl}/api/delivery/stats`, {
        withCredentials: true,
      });
      set({ stats: res.data.stats, loading: false });
      return res.data.stats;
    } catch (error) {
      console.error("Get stats error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch stats",
      });
    }
  },

  // ✅ Get nearby delivery boys
  getNearbyDeliveryBoys: async (orderId, shopId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(
        `${serverUrl}/api/delivery/nearby-delivery-boys`,
        {
          params: { orderId, shopId },
          withCredentials: true
        }
      );

      set({ deliveryBoys: res.data.deliveryBoys, loading: false });
      return res.data.deliveryBoys;
    } catch (error) {
      console.error("Get nearby delivery boys error:", error);
      set({
        error: error.response?.data?.message || "Failed to get delivery boys",
        loading: false
      });
      throw error;
    }
  },

  // ✅ Broadcast assignment to delivery boys
  // CHANGE signature - deliveryBoyIds is optional now:
broadcastAssignment: async (orderId, shopId, deliveryBoyIds = []) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(
      `${serverUrl}/api/delivery/broadcast`,
      { orderId, shopId, deliveryBoyIds }, // ✅ Can be empty array
      { withCredentials: true }
    );

    set({ loading: false });
    return res.data;
  } catch (error) {
    console.error("Broadcast assignment error:", error);
    set({
      error: error.response?.data?.message || "Failed to broadcast assignment",
      loading: false
    });
    throw error;
  }
},

  // ✅ Get delivery boy's assignments
  getMyAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(
        `${serverUrl}/api/delivery/my-assignments`,
        { withCredentials: true }
      );

      set({ assignments: res.data.assignments, loading: false });
      return res.data.assignments;
    } catch (error) {
      console.error("Get assignments error:", error);
      set({
        error: error.response?.data?.message || "Failed to get assignments",
        loading: false
      });
    }
  },

  // ✅ Accept assignment
  acceptAssignment: async (assignmentId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${serverUrl}/api/delivery/accept`,
        { assignmentId },
        { withCredentials: true }
      );

      // Update local state
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a._id === assignmentId ? res.data.assignment : a
        ),
        loading: false
      }));

      return res.data;
    } catch (error) {
      console.error("Accept assignment error:", error);
      set({
        error: error.response?.data?.message || "Failed to accept assignment",
        loading: false
      });
      throw error;
    }
  },

  // ✅ ADD: Get live location of delivery boy
getLiveLocation: async (assignmentId) => {
  try {
    const res = await axios.get(
      `${serverUrl}/api/delivery/live-location`,
      {
        params: { assignmentId },
        withCredentials: true
      }
    );
    
    return res.data.deliveryBoy;
  } catch (error) {
    console.error("Get live location error:", error);
    throw error;
  }
},

  // ✅ Complete assignment
  completeAssignment: async (assignmentId) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${serverUrl}/api/delivery/complete`,
        { assignmentId },
        { withCredentials: true }
      );

      // Update local state
      set((state) => ({
        assignments: state.assignments.map((a) =>
          a._id === assignmentId ? res.data.assignment : a
        ),
        loading: false
      }));

      return res.data;
    } catch (error) {
      console.error("Complete assignment error:", error);
      set({
        error: error.response?.data?.message || "Failed to complete assignment",
        loading: false
      });
      throw error;
    }
  },
  
    // 💰 Get my earnings
  getMyEarnings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await axios.get(
        `${serverUrl}/api/delivery/my-earnings`,
        { withCredentials: true }
      );
      set({ earnings: res.data, loading: false });
      return res.data;
    } catch (error) {
      console.error("Get earnings error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to get earnings",
      });
    }
  },

  // 💸 Withdraw (dummy)
  withdraw: async (amount) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${serverUrl}/api/delivery/withdraw`,
        { amount },
        { withCredentials: true }
      );
      // update local wallet
      set((state) => ({
        earnings: state.earnings
          ? { ...state.earnings, walletBalance: res.data.walletBalance }
          : state.earnings,
        loading: false,
      }));
      return res.data;
    } catch (error) {
      console.error("Withdraw error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to withdraw",
      });
      throw error;
    }
  },

  // Clear delivery boys list
  clearDeliveryBoys: () => set({ deliveryBoys: [] })
}));
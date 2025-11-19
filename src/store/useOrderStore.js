import { create } from "zustand";
import axios from "axios";
import { serverUrl } from "../App";
import { useCartStore } from "./useCartStore";

export const useOrderStore = create((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  // Place an order
  placeOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.post(
        `${serverUrl}/api/order/place-order`,
        orderData,
        {
          withCredentials: true,
        }
      );

      // Clear the cart after order success
      const { clearCart } = useCartStore.getState();
      await clearCart();

      set((state) => ({
        orders: [res.data.order, ...state.orders],
        loading: false,
      }));

      return res.data;
    } catch (error) {
      console.error("Place order error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to place order",
      });
      throw error;
    }
  },

  // Fetch user's or owner's orders
  fetchOrders: async (role) => {
    set({ loading: true, error: null });
    try {
      const endpoint =
        role === "owner"
          ? `${serverUrl}/api/order/owner`
          : `${serverUrl}/api/order`;

      const res = await axios.get(endpoint, { withCredentials: true });

      set({ orders: res.data.orders || [], loading: false });
    } catch (error) {
      console.error("Fetch orders error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to fetch orders",
      });
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, shopId, status) => {
    set({ loading: true, error: null });
    try {
      const res = await axios.put(
        `${serverUrl}/api/order/update-status`,
        { orderId, shopId, status },
        { withCredentials: true }
      );

      const updatedOrder = res.data.order;

      // Update local state immediately
      set((state) => ({
        orders: state.orders.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order
        ),
        loading: false,
      }));

      return updatedOrder;
    } catch (error) {
      console.error("Update status error:", error);
      set({
        loading: false,
        error: error.response?.data?.message || "Failed to update status",
      });
      throw error;
    }
  },

  // ✅ ADD: Update status by delivery boy
updateStatusByDeliveryBoy: async (orderId, shopOrderId, status) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.put(
      `${serverUrl}/api/order/delivery/update-status`,
      { orderId, shopOrderId, status },
      { withCredentials: true }
    );
    
    set({ loading: false }); // ✅ ADD THIS
    console.log("Update response:", res.data); // ✅ DEBUG
    return res.data; // This should include the OTP
  } catch (error) {
    console.error("Update error:", error); // ✅ DEBUG
    set({ loading: false, error: error.response?.data?.message });
    throw error;
  }
},

// ✅ ADD: Verify delivery OTP
verifyDeliveryOtp: async (orderId, shopOrderId, otp) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(
      `${serverUrl}/api/order/delivery/verify-otp`,
      { orderId, shopOrderId, otp },
      { withCredentials: true }
    );
    
    set({ loading: false });
    return res.data;
  } catch (error) {
    set({ loading: false, error: error.response?.data?.message });
    throw error;
  }
},
}));
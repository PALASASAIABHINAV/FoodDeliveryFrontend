import React, { useEffect } from "react";
import { RefreshCw } from "lucide-react"; // ✅ Add this import

import { useOrderStore } from "../../store/useOrderStore";
import { useUserStore } from "../../store/useAuthStore";
import OwnerOrders from "../owenr/OwnerOrders";
import UserOrders from "../user/UserOrders";
import Navbar from './Navbar';

const MyOrders = () => {
  const { user } = useUserStore();
  const { fetchOrders, loading, orders } = useOrderStore();

  // Initial fetch
  useEffect(() => {
    if (user?.role) {
      fetchOrders(user.role);
    }
  }, [user?.role, fetchOrders]);

  // ✅ Manual refresh function
  const handleRefresh = () => {
    if (user?.role) {
      fetchOrders(user.role);
    }
  };

  if (loading && !orders.length) {
    return (
      <div>
        <Navbar />
        <div className="p-6 text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div>
        <Navbar />
        <div className="p-6 text-center">
          <p className="text-lg text-gray-600">No orders found yet.</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      
      {/* ✅ Header with Refresh Button */}
      <div className="bg-gray-50 border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {user?.role === "owner" ? (
        <OwnerOrders orders={orders} user={user} />
      ) : (
        <UserOrders orders={orders} user={user} />
      )}
    </div>
  );
};

export default MyOrders;
import React, { useState } from "react";
import { useOrderStore } from './../../store/useOrderStore';
import { useUserStore } from "../../store/useAuthStore";
import { useDeliveryStore } from "../../store/useDeliveryStore";

const OwnerOrders = ({ orders }) => {
  const { updateOrderStatus, loading, fetchOrders } = useOrderStore();
  const { broadcastAssignment } = useDeliveryStore();
  
  const { user } = useUserStore();
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  
  const handleStatusChange = async (orderId, shopId, newStatus, shopOrder) => {
  // ✅ If selecting OUT_FOR_DELIVERY, auto-broadcast
  if (newStatus === "OUT_FOR_DELIVERY") {
    if (shopOrder.assignment) {
      alert("Delivery boy already assigned to this order");
      return;
    }
    
    // ✅ CHANGE: Auto-broadcast without showing modal
    setUpdatingOrderId(orderId);
    try {
      await broadcastAssignment(orderId, shopId, []); // Empty array, backend will auto-select
      alert("Order broadcasted to nearby delivery boys!");
      if (user?.role) {
        await fetchOrders(user.role);
      }
    } catch (error) {
      console.error("❌ Failed to broadcast:", error);
      alert(error.response?.data?.message || "No delivery boys available nearby");
    } finally {
      setUpdatingOrderId(null);
    }
    return;
  }

  // Normal status update (rest remains same)
  setUpdatingOrderId(orderId);
  try {
    await updateOrderStatus(orderId, shopId, newStatus);
    if (user?.role) {
      await fetchOrders(user.role);
    }
  } catch (error) {
    console.error("❌ Failed to update status:", error);
    alert("Failed to update order status");
  } finally {
    setUpdatingOrderId(null);
  }
};

 

  return (
    <div className="p-6 max-w-5xl mx-auto">
      

      {orders.map((order) => {
        const ownerShopOrders = (order.shopOrder || []).filter(
          (s) => s.shop && s.shop._id
        );

        if (!ownerShopOrders.length) return null;

        const ownerSubTotal = ownerShopOrders.reduce(
          (acc, s) => acc + (s.subTotal || 0),
          0
        );

        return (
          <div
            key={order._id}
            className="border rounded-lg p-5 mb-6 shadow-sm bg-white hover:shadow-md transition"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="font-semibold text-lg">
                  Order #{order._id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Customer: <strong>{order.user?.fullName || "N/A"}</strong>
                </p>
              </div>
              <p className="text-sm">
                <strong>Payment:</strong> {order.paymentMethod}
              </p>
            </div>

            {/* Shop Orders */}
            <div className="space-y-4">
              {ownerShopOrders.map((shopOrder) => (
                <div
                  key={shopOrder.shop._id}
                  className="border-t pt-3 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-blue-600">
                      {shopOrder.shop.name}
                    </h4>

                    {/* Status Selector */}
                    <div className="flex flex-col items-end gap-1">
                      <select
                        className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        value={shopOrder.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            shopOrder.shop._id,
                            e.target.value,
                            shopOrder // ✅ Pass shopOrder to check assignment
                          )
                        }
                        disabled={updatingOrderId === order._id}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="OUT_FOR_DELIVERY">
                          Out for Delivery
                        </option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                      {updatingOrderId === order._id && (
                        <span className="text-xs text-blue-600">
                          Updating...
                        </span>
                      )}
                      
                      {/* ✅ Show if delivery assigned */}
                      {shopOrder.assignment && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Delivery Assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Subtotal */}
                  <p className="text-sm text-gray-600">
                    Shop subtotal: ₹{shopOrder.subTotal}
                  </p>

                  {/* Items List */}
                  <div className="mt-2 space-y-1">
                    {shopOrder.shopOrderItems?.map((item, idx) => (
                      <div
                        key={item.item?._id || idx}
                        className="flex justify-between text-gray-700 bg-gray-50 p-2 rounded"
                      >
                        <div>
                          <div className="font-medium">{item.item?.name}</div>
                          <div className="text-xs text-gray-500">
                            Qty: {item.quantity} × ₹{item.price}
                          </div>
                        </div>
                        <div className="font-medium">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Owner Total */}
            <div className="mt-4 flex justify-between items-center border-t pt-3">
              <div className="text-sm text-gray-700">
                Your total for this order:
              </div>
              <div className="text-lg font-semibold text-green-600">
                ₹{ownerSubTotal}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OwnerOrders;
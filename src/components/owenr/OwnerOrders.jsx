import React, { useState } from "react";
import { useOrderStore } from "./../../store/useOrderStore";
import { useUserStore } from "../../store/useAuthStore";
import { useDeliveryStore } from "../../store/useDeliveryStore";
import { Truck, Store, IndianRupee } from "lucide-react";

const STATUS_COLORS = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PREPARING: "bg-purple-50 text-purple-700 border-purple-200",
  OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const OwnerOrders = ({ orders }) => {
  const { updateOrderStatus, loading, fetchOrders } = useOrderStore();
  const { broadcastAssignment } = useDeliveryStore();
  const { user } = useUserStore();

  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const handleStatusChange = async (orderId, shopId, newStatus, shopOrder) => {
    // If selecting OUT_FOR_DELIVERY, auto-broadcast
    if (newStatus === "OUT_FOR_DELIVERY") {
      if (shopOrder.assignment) {
        alert("Delivery boy already assigned to this order");
        return;
      }

      setUpdatingOrderId(orderId);
      try {
        await broadcastAssignment(orderId, shopId, []); // backend auto-selects
        alert("Order broadcasted to nearby delivery boys!");
        if (user?.role) {
          await fetchOrders(user.role);
        }
      } catch (error) {
        console.error("❌ Failed to broadcast:", error);
        alert(
          error.response?.data?.message ||
            "No delivery boys available nearby"
        );
      } finally {
        setUpdatingOrderId(null);
      }
      return;
    }

    // Normal status update
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
    <div className="space-y-5 mt-2">
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
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition"
          >
            {/* Order header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Order #{order._id.slice(-8)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  Customer:{" "}
                  <span className="font-semibold text-slate-800">
                    {order.user?.fullName || "N/A"}
                  </span>
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs text-slate-500">Payment method</p>
                <p className="text-sm font-semibold text-slate-800">
                  {order.paymentMethod}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 text-[11px]">
                  <IndianRupee className="w-3 h-3" />
                  Owner earnings:{" "}
                  <span className="font-semibold">₹{ownerSubTotal}</span>
                </p>
              </div>
            </div>

            {/* Shop sections */}
            <div className="px-5 py-4 space-y-4">
              {ownerShopOrders.map((shopOrder) => (
                <div
                  key={shopOrder.shop._id}
                  className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      {/* Shop image */}
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                        <img
                          src={
                            shopOrder.shop?.image?.url ||
                            "/placeholder-shop.jpg"
                          }
                          alt={shopOrder.shop?.name || "Shop"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                          <Store className="w-3.5 h-3.5 text-emerald-500" />
                          {shopOrder.shop.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Shop subtotal: ₹{shopOrder.subTotal}
                        </p>
                      </div>
                    </div>

                    {/* Status selector & assignment info */}
                    <div className="flex flex-col items-end gap-1">
                      <select
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none bg-white disabled:opacity-60"
                        value={shopOrder.status}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            shopOrder.shop._id,
                            e.target.value,
                            shopOrder
                          )
                        }
                        disabled={updatingOrderId === order._id || loading}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PREPARING">Preparing</option>
                        <option value="OUT_FOR_DELIVERY">
                          Out for delivery
                        </option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>

                      {updatingOrderId === order._id && (
                        <span className="text-[11px] text-emerald-600">
                          Updating…
                        </span>
                      )}

                      {shopOrder.assignment && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
                          <Truck className="w-3 h-3" />
                          Delivery assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="mt-2 grid gap-2">
                    {shopOrder.shopOrderItems?.map((item, idx) => (
                      <div
                        key={item.item?._id || idx}
                        className="flex items-center justify-between bg-white rounded-lg px-2 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            <img
                              src={
                                item.item?.image?.url ||
                                "/placeholder-item.jpg"
                              }
                              alt={item.item?.name || "Item"}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-900">
                              {item.item?.name}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              Qty {item.quantity} × ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-slate-900">
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OwnerOrders;

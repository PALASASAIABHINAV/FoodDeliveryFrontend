import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Navigation,
  MapPin,
  Store,
  IndianRupee,
  Package,
} from "lucide-react";
import { useItemStore } from "../../store/useItemStore";
import ReviewModal from "../common/ReviewModal";

const STATUS_COLORS = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PREPARING: "bg-purple-50 text-purple-700 border-purple-200",
  OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const UserOrders = ({ orders }) => {
  const navigate = useNavigate();
  const { addReview } = useItemStore();

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState(null);

  const openReviewModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const submitReview = async (rating, comment) => {
    if (!rating) return alert("Please select a rating.");
    try {
      await addReview(selectedItem._id, rating, comment);
      alert("Thanks for your review!");
      setIsModalOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <div className="space-y-5 mt-3">
      {orders.map((order) => (
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
              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(order.createdAt).toLocaleString()}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Payment:{" "}
                <span className="font-semibold text-slate-800">
                  {order.paymentMethod}
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500">Order total</p>
              <p className="text-lg font-extrabold text-slate-900 flex items-center justify-end gap-1">
                <IndianRupee className="w-4 h-4" />
                {order.totalAmount}
              </p>
            </div>
          </div>

          {/* Shops in the order */}
          <div className="px-5 py-4 space-y-4">
            {order.shopOrder?.map((shopOrder) => (
              <div
                key={shopOrder.shop?._id || Math.random()}
                className="rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4"
              >
                {/* Shop row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    {/* Shop image */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 flex-shrink-0">
                      <img
                        src={
                          shopOrder.shop?.image?.url || "/placeholder-shop.jpg"
                        }
                        alt={shopOrder.shop?.name || "Shop"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-emerald-500" />
                        {shopOrder.shop?.name || "Restaurant"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Shop subtotal: ₹{shopOrder.subTotal}
                      </p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${
                        STATUS_COLORS[shopOrder.status] ||
                        "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      {STATUS_LABELS[shopOrder.status] || shopOrder.status}
                    </span>

                    {/* Delivery assignment status */}
                    {shopOrder.status === "OUT_FOR_DELIVERY" && (
                      <div className="text-xs">
                        {!shopOrder.assignment ? (
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Clock className="w-3.5 h-3.5 animate-pulse" />
                            Searching for a delivery partner…
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Navigation className="w-3.5 h-3.5" />
                            Delivery partner is on the way
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery OTP – show only while not delivered */}
                {shopOrder.deliveryOtp &&
                  shopOrder.status !== "DELIVERED" && (
                    <div className="mt-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                      <p className="font-semibold">
                        Delivery code (share only with the delivery partner):{" "}
                        <span className="font-mono tracking-[0.25em] text-base">
                          {shopOrder.deliveryOtp}
                        </span>
                      </p>
                    </div>
                  )}

                {/* Track order button */}
                {shopOrder.assignment &&
                  shopOrder.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() =>
                        navigate(`/track-order/${order._id}/${shopOrder._id}`)
                      }
                      className="mt-3 w-full bg-slate-900 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Track order live
                    </button>
                  )}

                {/* Items */}
                <div className="mt-3 grid gap-2">
                  {shopOrder.shopOrderItems?.map((item, idx) => (
                    <div
                      key={item.item?._id || idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg px-2 py-2 shadow-[0_1px_3px_rgba(15,23,42,0.06)]"
                    >
                      <div className="flex items-center gap-3">
                        {/* Item image */}
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

                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <div className="text-xs font-semibold text-slate-900">
                          ₹{item.price * item.quantity}
                        </div>

                        {/* Review button only when delivered */}
                        {shopOrder.status === "DELIVERED" &&
                          item.item?._id && (
                            <button
                              onClick={() => openReviewModal(item.item)}
                              className="text-[11px] px-3 py-1.5 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600"
                            >
                              Rate this item
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* If there are literally no orders, show a friendly empty state here too */}
      {!orders.length && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800">
            You haven&apos;t ordered anything yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Explore restaurants and add something tasty to your cart.
          </p>
        </div>
      )}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={submitReview}
        item={selectedItem}
      />
    </div>
  );
};

export default UserOrders;

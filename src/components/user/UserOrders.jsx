import { Clock, Navigation } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { useItemStore } from "../../store/useItemStore";
import ReviewModal from "../common/ReviewModal";

const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const STATUS_LABELS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
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
    <div className="p-6 max-w-4xl mx-auto">
      {orders.map((order) => (
        <div
          key={order._id}
          className="border rounded-lg p-4 mb-4 shadow-sm bg-white hover:shadow-md transition"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-lg">
              Order #{order._id.slice(-8)}
            </h3>
            <span className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-2">
            Payment: <strong>{order.paymentMethod}</strong> • Total:{" "}
            <strong>₹{order.totalAmount}</strong>
          </p>

          <div className="mt-3 space-y-3">
            {order.shopOrder?.map((shopOrder) => (
              <div
                key={shopOrder.shop?._id || Math.random()}
                className="border-t pt-3"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-blue-600">
                    {shopOrder.shop?.name || "Shop"}
                  </h4>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      STATUS_COLORS[shopOrder.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {STATUS_LABELS[shopOrder.status] || shopOrder.status}
                  </span>
                </div>

                {/* 🎯 ADD THIS — Delivery assignment status messages */}
                {shopOrder.status === "OUT_FOR_DELIVERY" && (
                  <div className="mt-2">
                    {!shopOrder.assignment ? (
                      <div className="text-sm text-yellow-600 flex items-center gap-2">
                        <Clock className="w-4 h-4 animate-pulse" />
                        <span>Searching for a delivery partner...</span>
                      </div>
                    ) : (
                      <div className="text-sm text-blue-600 flex items-center gap-2">
                        <Navigation className="w-4 h-4" />
                        <span>Delivery partner is on the way!</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 🔐 Delivery Code – show to customer */}
                {shopOrder.deliveryOtp && shopOrder.status !== "DELIVERED" && (
                  <div className="mt-3 text-sm text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                    <p className="font-semibold">
                      Delivery Code (share with delivery boy):{" "}
                      <span className="font-mono tracking-widest text-lg">
                        {shopOrder.deliveryOtp}
                      </span>
                    </p>
                  </div>
                )}

                {shopOrder.assignment &&
                  shopOrder.status === "OUT_FOR_DELIVERY" && (
                    <button
                      onClick={() =>
                        navigate(`/track-order/${order._id}/${shopOrder._id}`)
                      }
                      className="mt-2 w-full bg-blue-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                    >
                      <MapPin className="w-4 h-4" />
                      Track Order Live
                    </button>
                  )}

                <p className="text-sm text-gray-600">
                  Shop subtotal: ₹{shopOrder.subTotal}
                </p>

                <div className="mt-2 space-y-1">
                  {shopOrder.shopOrderItems?.map((item, idx) => (
                    <div
                      key={item.item?._id || idx}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-gray-700 bg-gray-50 p-2 rounded"
                    >
                      <div>
                        <div className="font-medium">{item.item?.name}</div>
                        <div className="text-xs text-gray-500">
                          Qty: {item.quantity} × ₹{item.price}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-2 sm:mt-0">
                        <div className="font-medium">
                          ₹{item.price * item.quantity}
                        </div>

                        {/* ⭐ Review button – only when this shopOrder is delivered */}
                        {shopOrder.status === "DELIVERED" && item.item?._id && (
                          <button
                            onClick={() => openReviewModal(item.item)}
                            className="text-xs px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
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

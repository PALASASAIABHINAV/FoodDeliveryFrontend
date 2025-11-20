import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  Phone,
  Navigation,
  Clock,
  Package,
  MapPin,
  User,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";
import { serverUrl } from "../../App";
import "leaflet/dist/leaflet.css";

// Helper to change map view dynamically
function ChangeMapView({ coords, zoom = 13 }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, zoom);
    }
  }, [coords, zoom, map]);
  return null;
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2); // Distance in km
};

// Calculate ETA (simple estimation: 30 km/h average speed)
const calculateETA = (distance) => {
  const speedKmPerHour = 30;
  const hours = distance / speedKmPerHour;
  const minutes = Math.round(hours * 60);
  return minutes;
};

const LiveTracking = () => {
  const { orderId, shopOrderId } = useParams();
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignmentId, setAssignmentId] = useState(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const res = await axios.get(`${serverUrl}/api/order`, {
          withCredentials: true,
        });

        const order = res.data.orders.find((o) => o._id === orderId);
        if (!order) {
          setError("Order not found");
          setLoading(false);
          return;
        }

        const shopOrder = order.shopOrder.find(
          (so) => so._id.toString() === shopOrderId
        );
        if (!shopOrder) {
          setError("Shop order not found");
          setLoading(false);
          return;
        }

        setOrderData({ order, shopOrder });
        setAssignmentId(shopOrder.assignment);

        // Set customer location
        if (order.deliveryAddress?.latitude && order.deliveryAddress?.longitude) {
          setCustomerLocation({
            lat: order.deliveryAddress.latitude,
            lon: order.deliveryAddress.longitude,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, shopOrderId]);

  // Fetch delivery boy's live location every 5 seconds
  useEffect(() => {
    if (!assignmentId) return;

    const fetchLiveLocation = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/delivery/live-location`,
          {
            params: { assignmentId },
            withCredentials: true,
          }
        );

        const { deliveryBoy } = res.data;
        setDeliveryBoyLocation({
          lat: deliveryBoy.latitude,
          lon: deliveryBoy.longitude,
          name: deliveryBoy.name,
          mobile: deliveryBoy.mobile,
          lastUpdate: deliveryBoy.lastUpdate,
        });

        // Calculate distance and ETA
        if (customerLocation) {
          const dist = calculateDistance(
            deliveryBoy.latitude,
            deliveryBoy.longitude,
            customerLocation.lat,
            customerLocation.lon
          );
          setDistance(dist);
          setEta(calculateETA(dist));
        }
      } catch (err) {
        console.error("Error fetching live location:", err);
      }
    };

    // Initial fetch
    fetchLiveLocation();

    // Update every 5 seconds
    const interval = setInterval(fetchLiveLocation, 5000);

    return () => clearInterval(interval);
  }, [assignmentId, customerLocation]);

  // Custom icons
  const deliveryBoyIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const customerIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // ---------------- UI helpers (no backend change) ----------------
  const formatTime = (ts) => {
    try {
      return new Date(ts).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const STATUS_STEPS = [
    { key: "CONFIRMED", label: "Confirmed" },
    { key: "PREPARING", label: "Preparing" },
    { key: "OUT_FOR_DELIVERY", label: "On the way" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">
            Fetching live tracking…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-2xl shadow-xl px-6 py-8 max-w-sm w-full text-center border border-rose-100">
          <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-base font-semibold text-slate-800 mb-1">
            Something went wrong
          </p>
          <p className="text-sm text-slate-500 mb-5">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
          >
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  const { order, shopOrder } = orderData;
  const activeStatus = shopOrder.status;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 text-white">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100 font-semibold">
              Live tracking
            </p>
            <h1 className="text-lg sm:text-xl font-bold">
              Order #{order._id.slice(-8)}
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-50">
              We’re tracking your delivery in real time
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold">
              {shopOrder.shop?.name || "Restaurant"}
            </span>
            <span className="text-emerald-50">
              {order.deliveryAddress?.text || "Delivery address"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Top summary + status timeline */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.6fr_minmax(0,1.4fr)] gap-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Distance */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Distance
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {distance ? `${distance} km` : "Calculating…"}
                </p>
              </div>
            </div>

            {/* ETA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  ETA
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {eta ? `${eta} mins` : "Calculating…"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center">
                <Package className="w-5 h-5 text-sky-500" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Status
                </p>
                <p className="text-sm font-semibold text-sky-600">
                  {activeStatus === "OUT_FOR_DELIVERY"
                    ? "On the way"
                    : activeStatus}
                </p>
                {deliveryBoyLocation?.lastUpdate && (
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Last update at{" "}
                    <span className="font-medium">
                      {formatTime(deliveryBoyLocation.lastUpdate)}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status stepper */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-3">
              Delivery progress
            </p>
            <div className="flex items-center justify-between gap-2">
              {STATUS_STEPS.map((step, index) => {
                const currentIndex = STATUS_STEPS.findIndex(
                  (s) => s.key === activeStatus
                );
                const isDone = currentIndex >= index;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center">
                    <div className="relative flex items-center justify-center w-full">
                      {index > 0 && (
                        <div
                          className={`absolute left-0 right-0 h-0.5 ${
                            currentIndex >= index
                              ? "bg-emerald-500"
                              : "bg-slate-200"
                          }`}
                        />
                      )}
                      <div
                        className={`relative z-10 flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold ${
                          isDone
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <p
                      className={`mt-2 text-[11px] text-center ${
                        isDone ? "text-slate-900 font-semibold" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Map + side cards */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)] gap-5">
          {/* Map */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Live map
                </p>
                <p className="text-[11px] text-slate-500">
                  Track your delivery in real time
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>Delivery partner</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Your location</span>
                </div>
              </div>
            </div>

            <div style={{ height: "430px" }}>
              {customerLocation && (
                <MapContainer
                  center={[customerLocation.lat, customerLocation.lon]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  />

                  {deliveryBoyLocation && (
                    <ChangeMapView
                      coords={[
                        (deliveryBoyLocation.lat + customerLocation.lat) / 2,
                        (deliveryBoyLocation.lon + customerLocation.lon) / 2,
                      ]}
                      zoom={13}
                    />
                  )}

                  {/* Delivery Boy Marker */}
                  {deliveryBoyLocation && (
                    <Marker
                      position={[
                        deliveryBoyLocation.lat,
                        deliveryBoyLocation.lon,
                      ]}
                      icon={deliveryBoyIcon}
                    >
                      <Popup>
                        <div className="text-center">
                          <strong className="text-sky-600">
                            Delivery Partner
                          </strong>
                          <br />
                          <span className="font-semibold">
                            {deliveryBoyLocation.name}
                          </span>
                          <br />
                          <span className="text-[11px] text-slate-500">
                            Last updated:{" "}
                            {formatTime(deliveryBoyLocation.lastUpdate)}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Customer Marker */}
                  <Marker
                    position={[customerLocation.lat, customerLocation.lon]}
                    icon={customerIcon}
                  >
                    <Popup>
                      <div className="text-center">
                        <strong className="text-rose-600">
                          Your location
                        </strong>
                        <br />
                        <span className="text-xs">
                          {order.deliveryAddress.text}
                        </span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Route Line */}
                  {deliveryBoyLocation && (
                    <Polyline
                      positions={[
                        [deliveryBoyLocation.lat, deliveryBoyLocation.lon],
                        [customerLocation.lat, customerLocation.lon],
                      ]}
                      color="dodgerblue"
                      weight={4}
                      opacity={0.7}
                      dashArray="10, 10"
                    />
                  )}
                </MapContainer>
              )}
            </div>
          </div>

          {/* Right side: delivery partner + order details */}
          <div className="space-y-4">
            {/* Delivery partner */}
            {deliveryBoyLocation && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Delivery partner
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Assigned to your order
                    </p>
                  </div>
                  {deliveryBoyLocation.lastUpdate && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-600">
                      <Clock className="w-3 h-3" />
                      Live
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-lg font-semibold shadow-md">
                    {deliveryBoyLocation.name
                      ?.charAt(0)
                      .toUpperCase() || <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-900">
                      {deliveryBoyLocation.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Delivery partner
                    </p>
                    {distance && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        About{" "}
                        <span className="font-semibold">{distance} km</span>{" "}
                        away from you
                      </p>
                    )}
                  </div>
                  <a
                    href={`tel:${deliveryBoyLocation.mobile}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call
                  </a>
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Order details
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Deliver to
                  </span>
                  <span className="max-w-[220px] text-right truncate">
                    {order.deliveryAddress?.text}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  From
                </p>
                <p className="text-sm font-semibold text-slate-900">
                  {shopOrder.shop?.name}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                {shopOrder.shopOrderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 rounded-lg"
                  >
                    <span className="text-slate-700">
                      {item.item?.name}{" "}
                      <span className="text-slate-400">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-900">
                  Total amount
                </span>
                <span className="text-lg font-bold text-emerald-600">
                  ₹{order.totalAmount}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LiveTracking;

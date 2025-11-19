import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import { Phone, Navigation, Clock, Package, MapPin, User, ArrowLeft } from "lucide-react";
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
        const res = await axios.get(`${serverUrl}/api/delivery/live-location`, {
          params: { assignmentId },
          withCredentials: true,
        });

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
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const customerIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading tracking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <p className="text-lg font-semibold text-gray-700 mb-2">{error}</p>
          <button
            onClick={() => navigate("/orders")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const { order, shopOrder } = orderData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/orders")}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Live Tracking</h1>
            <p className="text-sm text-blue-100">Order #{order._id.slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Distance Card */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Navigation className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Distance</p>
            <p className="text-2xl font-bold text-gray-800">
              {distance ? `${distance} km` : "Calculating..."}
            </p>
          </div>
        </div>

        {/* ETA Card */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimated Time</p>
            <p className="text-2xl font-bold text-gray-800">
              {eta ? `${eta} mins` : "Calculating..."}
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-bold text-purple-600">
              {shopOrder.status === "OUT_FOR_DELIVERY" ? "On the Way" : shopOrder.status}
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: "500px" }}>
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
                  position={[deliveryBoyLocation.lat, deliveryBoyLocation.lon]}
                  icon={deliveryBoyIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="text-blue-600">Delivery Partner</strong>
                      <br />
                      <span className="font-semibold">{deliveryBoyLocation.name}</span>
                      <br />
                      <span className="text-xs text-gray-500">
                        Last updated: {new Date(deliveryBoyLocation.lastUpdate).toLocaleTimeString()}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Customer Marker */}
              <Marker position={[customerLocation.lat, customerLocation.lon]} icon={customerIcon}>
                <Popup>
                  <div className="text-center">
                    <strong className="text-red-600">Your Location</strong>
                    <br />
                    <span className="text-sm">{order.deliveryAddress.text}</span>
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
                  color="blue"
                  weight={4}
                  opacity={0.7}
                  dashArray="10, 10"
                />
              )}
            </MapContainer>
          )}
        </div>
      </div>

      {/* Delivery Boy Info */}
      {deliveryBoyLocation && (
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Delivery Partner Details</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                {deliveryBoyLocation.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-lg">{deliveryBoyLocation.name}</p>
                <p className="text-sm text-gray-600">Delivery Partner</p>
              </div>
              <a
                href={`tel:${deliveryBoyLocation.mobile}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="max-w-7xl mx-auto p-4 mb-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Order Details</h2>
          
          {/* Restaurant Info */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">From</p>
            <p className="font-semibold">{shopOrder.shop?.name}</p>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {shopOrder.shopOrderItems?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.item?.name} × {item.quantity}</span>
                <span className="font-medium">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between font-bold">
            <span>Total Amount</span>
            <span className="text-green-600">₹{order.totalAmount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
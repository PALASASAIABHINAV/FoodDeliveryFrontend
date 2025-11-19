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
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import axios from "axios";
import { serverUrl } from "../../App";
import { useUserStore } from "../../store/useAuthStore";
import { useOrderStore } from "../../store/useOrderStore";
import { useDeliveryStore } from "../../store/useDeliveryStore";
import "leaflet/dist/leaflet.css";

// Helper to change map view
function ChangeMapView({ coords, zoom = 14 }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, zoom);
    }
  }, [coords, zoom, map]);
  return null;
}

// Calculate distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const DeliveryNavigation = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { verifyDeliveryOtp } = useOrderStore();

  const [assignmentData, setAssignmentData] = useState(null);
  const [myLocation, setMyLocation] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  // Fetch assignment details
  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/delivery/my-assignments`,
          {
            withCredentials: true,
          }
        );

        const assignment = res.data.assignments.find(
          (a) => a._id === assignmentId
        );
        if (!assignment) {
          alert("Assignment not found");
          navigate("/");
          return;
        }

        setAssignmentData(assignment);

        // Set customer location
        if (assignment.order?.deliveryAddress) {
          setCustomerLocation({
            lat: assignment.order.deliveryAddress.latitude,
            lon: assignment.order.deliveryAddress.longitude,
            address: assignment.order.deliveryAddress.text,
          });
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching assignment:", err);
        alert("Failed to load assignment");
        navigate("/");
      }
    };

    fetchAssignment();
  }, [assignmentId, navigate]);

  // Track delivery boy's live location
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setMyLocation({ lat, lon });

        // Update location in backend
        axios.post(
          `${serverUrl}/api/user/update-location`,
          { lat, lon },
          { withCredentials: true }
        );

        // Calculate distance to customer
        if (customerLocation) {
          const dist = calculateDistance(
            lat,
            lon,
            customerLocation.lat,
            customerLocation.lon
          );
          setDistance(dist);
        }
      },
      (error) => console.error("Location error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [customerLocation]);

  // Handle mark as delivered (generate OTP)
  const handleMarkDelivered = () => {
    setShowOtpModal(true);
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 4) {
      alert("Please enter 4-digit OTP");
      return;
    }

    try {
      setOtpLoading(true);
      await verifyDeliveryOtp(
        assignmentData.order._id,
        assignmentData.shopOrderId,
        otp
      );
      alert("✅ Delivery completed successfully!");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // Custom icons
  const deliveryBoyIcon = new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">
            Loading navigation...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Delivery Navigation</h1>
            <p className="text-sm text-green-100">
              Order #{assignmentData.order._id.slice(-8)}
            </p>
          </div>
        </div>
      </div>

      {/* Distance Info */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Navigation className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Distance to Customer</p>
              <p className="text-2xl font-bold text-gray-800">
                {distance ? `${distance} km` : "Calculating..."}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (customerLocation) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lon}`,
                  "_blank"
                );
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Open in Google Maps
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="max-w-7xl mx-auto p-4">
        <div
          className="bg-white rounded-xl shadow-lg overflow-hidden"
          style={{ height: "500px" }}
        >
          {myLocation && customerLocation && (
            <MapContainer
              center={[myLocation.lat, myLocation.lon]}
              zoom={14}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              />

              <ChangeMapView
                coords={[
                  (myLocation.lat + customerLocation.lat) / 2,
                  (myLocation.lon + customerLocation.lon) / 2,
                ]}
              />

              {/* My Location */}
              <Marker
                position={[myLocation.lat, myLocation.lon]}
                icon={deliveryBoyIcon}
              >
                <Popup>
                  <div className="text-center">
                    <strong className="text-green-600">You are here</strong>
                    <br />
                    <span className="text-sm">{user?.fullName}</span>
                  </div>
                </Popup>
              </Marker>

              {/* Customer Location */}
              <Marker
                position={[customerLocation.lat, customerLocation.lon]}
                icon={customerIcon}
              >
                <Popup>
                  <div className="text-center">
                    <strong className="text-red-600">Customer Location</strong>
                    <br />
                    <span className="text-sm">{customerLocation.address}</span>
                  </div>
                </Popup>
              </Marker>

              {/* Route Line */}
              <Polyline
                positions={[
                  [myLocation.lat, myLocation.lon],
                  [customerLocation.lat, customerLocation.lon],
                ]}
                color="green"
                weight={4}
                opacity={0.7}
              />
            </MapContainer>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Customer Details</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-semibold">
                  {assignmentData.order.user?.fullName}
                </p>
              </div>
              <a
                href={`tel:${assignmentData.order.user?.mobile}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                Call Customer
              </a>
            </div>
            <div>
              <p className="text-sm text-gray-500">Delivery Address</p>
              <p className="font-semibold">{customerLocation?.address}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-semibold">
                {assignmentData.order.paymentMethod}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-bold text-lg text-green-600">
                ₹{assignmentData.order.totalAmount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="max-w-7xl mx-auto p-4 mb-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-2">
            {assignmentData.order.shopOrder
              ?.filter(
                (so) =>
                  so._id.toString() === assignmentData.shopOrderId.toString()
              )
              .map((so) =>
                so.shopOrderItems?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-2 border-b last:border-b-0"
                  >
                    <div>
                      <p className="font-semibold">{item.item?.name}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                  </div>
                ))
              )}
          </div>
        </div>
      </div>

      {/* Mark as Delivered Button */}
      <div className="max-w-7xl mx-auto p-4 pb-8">
        <button
          onClick={handleMarkDelivered}
          disabled={otpLoading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          <CheckCircle className="w-6 h-6" />
          {otpLoading ? "Opening..." : "Verify Delivery Code"}
        </button>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-center">
              Verify Delivery
            </h2>

            {/* Show OTP to delivery boy */}
            {/* Instructions – customer tells code to delivery boy */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                Ask the customer for the{" "}
                <span className="font-semibold">delivery code</span> shown in
                their app and enter it below to complete the delivery.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP from Customer
                </label>
                <input
                  type="text"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 4-digit OTP"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl tracking-widest font-bold focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp("");
                    setGeneratedOtp(null);
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 4 || otpLoading}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Verifying..." : "Verify & Complete"}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Customer must confirm the OTP to complete delivery
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNavigation;

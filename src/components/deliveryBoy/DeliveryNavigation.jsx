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
  useDeliveryStore(); // kept so import isn't "unused" in your project structure

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

  // Handle mark as delivered (open OTP modal)
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-semibold text-slate-700">
            Loading delivery navigation…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4 text-white">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-100 font-semibold">
              Delivery navigation
            </p>
            <h1 className="text-lg sm:text-xl font-bold">
              Order #{assignmentData.order._id.slice(-8)}
            </h1>
            <p className="text-[11px] sm:text-xs text-emerald-50">
              Follow the route and complete delivery using the customer code
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="font-semibold">
              {assignmentData.order.user?.fullName}
            </span>
            <span className="text-emerald-50">
              {customerLocation?.address || "Customer address"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Top summary card */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                  Distance to customer
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {distance ? `${distance} km` : "Calculating…"}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Keep location ON for accurate tracking
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
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </button>
          </div>

          {/* Small info card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-900">Delivery tips</p>
              <ul className="mt-1 text-slate-500 space-y-1">
                <li>• Call the customer if you cannot find the address.</li>
                <li>• Always verify the 4-digit code before handing over.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Map + details */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)] gap-5">
          {/* Map */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Live route
                </p>
                <p className="text-[11px] text-slate-500">
                  Your location and customer location in real time
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>You</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Customer</span>
                </div>
              </div>
            </div>

            <div style={{ height: "420px" }}>
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
                        <strong className="text-emerald-600">
                          You are here
                        </strong>
                        <br />
                        <span className="text-xs">{user?.fullName}</span>
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
                        <strong className="text-rose-600">
                          Customer location
                        </strong>
                        <br />
                        <span className="text-xs">
                          {customerLocation.address}
                        </span>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Route Line */}
                  <Polyline
                    positions={[
                      [myLocation.lat, myLocation.lon],
                      [customerLocation.lat, customerLocation.lon],
                    ]}
                    color="mediumseagreen"
                    weight={4}
                    opacity={0.8}
                    dashArray="8, 10"
                  />
                </MapContainer>
              )}
            </div>
          </div>

          {/* Right column: customer + items + action */}
          <div className="space-y-4">
            {/* Customer info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Customer details
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Contact and address for this delivery
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-600">
                  <Clock className="w-3 h-3" />
                  Live task
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">Customer</p>
                    <p className="font-semibold text-slate-900">
                      {assignmentData.order.user?.fullName}
                    </p>
                  </div>
                  <a
                    href={`tel:${assignmentData.order.user?.mobile}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call customer
                  </a>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500">
                    Delivery address
                  </p>
                  <p className="font-medium text-slate-900">
                    {customerLocation?.address}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] text-slate-500">
                      Payment method
                    </p>
                    <p className="font-medium text-slate-900">
                      {assignmentData.order.paymentMethod}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">Total amount</p>
                    <p className="text-lg font-bold text-emerald-600">
                      ₹{assignmentData.order.totalAmount}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order items */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-semibold text-slate-900 mb-2">
                Order items
              </p>
              <div className="space-y-2 text-sm">
                {assignmentData.order.shopOrder
                  ?.filter(
                    (so) =>
                      so._id.toString() ===
                      assignmentData.shopOrderId.toString()
                  )
                  .map((so) =>
                    so.shopOrderItems?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.item?.name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          ₹{item.price * item.quantity}
                        </p>
                      </div>
                    ))
                  )}
              </div>
            </div>

            {/* Mark as delivered */}
            <div className="pt-1">
              <button
                onClick={handleMarkDelivered}
                disabled={otpLoading}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                {otpLoading ? "Opening…" : "Verify delivery code"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* OTP Verification Modal */}
      {showOtpModal && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-center mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-1 text-center text-slate-900">
              Verify delivery code
            </h2>
            <p className="text-xs text-slate-500 text-center mb-4">
              Ask the customer for the{" "}
              <span className="font-semibold">4-digit code</span> shown in their
              app and enter it below to complete delivery.
            </p>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-3 mb-4">
              <p className="text-[11px] text-sky-700 text-center">
                Do not hand over the order until the customer confirms the
                correct code.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Enter OTP from customer
                </label>
                <input
                  type="text"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="____"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-center text-2xl tracking-[0.4em] font-bold text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowOtpModal(false);
                    setOtp("");
                    setGeneratedOtp(null);
                  }}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyOtp}
                  disabled={otp.length !== 4 || otpLoading}
                  className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl text-xs font-semibold hover:bg-emerald-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {otpLoading ? "Verifying…" : "Verify & complete"}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center mt-3">
              This step protects you and the customer from wrong deliveries.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryNavigation;

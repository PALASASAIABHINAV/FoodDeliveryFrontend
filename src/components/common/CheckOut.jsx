import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useAuthStore";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useCartStore } from "../../store/useCartStore";
import { useOrderStore } from "../../store/useOrderStore";
import { MapPin, ArrowLeft, CreditCard, Wallet, Clock } from "lucide-react";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Small helper to change map center dynamically
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords, map]);
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const { detectedLocation } = useUserStore();
  const { placeOrder, loading } = useOrderStore();
  const { cart } = useCartStore();

  const [orderLocation, setOrderLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // default COD
  const markerRef = useRef(null);
  const [tip, setTip] = useState(0);
const tipOptions = [15, 13, 12, 11, 10, 8, 6, 5, 4];


  // Initialize with detected location or fallback
  useEffect(() => {
    if (detectedLocation) {
      setOrderLocation({
        latitude: detectedLocation.latitude,
        longitude: detectedLocation.longitude,
        address: detectedLocation.address,
      });
    } else {
      // If user blocks location or it fails, set a default place
      setOrderLocation({
        latitude: 17.385044, // Default: Hyderabad coordinates
        longitude: 78.486671,
        address: "Hyderabad, Telangana, India",
      });
    }
  }, [detectedLocation]);

  // Forward geocode (address → lat/lon)
  const geocodeAddress = async (address) => {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          address
        )}&format=json&apiKey=${GEOAPIFY_KEY}`
      );
      const data = await res.json();
      const loc = data.results?.[0];
      if (loc) {
        return {
          latitude: loc.lat,
          longitude: loc.lon,
          address: loc.formatted,
        };
      }
    } catch (err) {
      console.error("Geocoding error:", err);
    }
    return null;
  };

  // Reverse geocode (lat/lon → address)
  const reverseGeocode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${GEOAPIFY_KEY}`
      );
      const data = await res.json();
      const loc = data.results?.[0];
      if (loc) return loc.formatted;
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    }
    return "Unknown location";
  };

  // Handle Search Button
  const handleSearch = async () => {
    if (!orderLocation?.address) return;
    const loc = await geocodeAddress(orderLocation.address);
    if (loc) setOrderLocation(loc);
  };

  // Handle Marker Drag End
  const handleMarkerDragEnd = async () => {
    const marker = markerRef.current;
    if (marker) {
      const position = marker.getLatLng();
      const newAddress = await reverseGeocode(position.lat, position.lng);
      setOrderLocation({
        latitude: position.lat,
        longitude: position.lng,
        address: newAddress,
      });
    }
  };

  // Cart calculations (same logic)
  const subtotal = cart?.totalAmount || 0;
const deliveryFee = subtotal > 500 ? 0 : 40;
const platformFee = 2;
const total = subtotal + deliveryFee + platformFee + tip;


  // Still render page even if detectedLocation is null
  if (!orderLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-100">
        Loading map...
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!cart?.items?.length) {
      toast.error("Your cart is empty!");
      return;
    }

    try {
      const orderData = {
        paymentMethod,
        deliveryAddress: {
          text: orderLocation.address,
          latitude: orderLocation.latitude,
          longitude: orderLocation.longitude,
        },
      };

      const res = await placeOrder(orderData);
      console.log("✅ Order created:", res.order);
      navigate("/order-placed");
    } catch (err) {
      console.log("Failed to place order", err);
      toast.error("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Top bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-1 flex items-center justify-between">
        <button
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-slate-300 hover:text-white transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <img
            src="/zentroeat-removebg.png"
            alt="ZentroEat"
            className="h-7 w-auto object-contain drop-shadow-md"
          />
          <span className="text-sm font-semibold tracking-wide text-emerald-400">
            Secure Checkout
          </span>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 pt-2">
        <div className="mb-5">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Complete your order
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" />
            Estimated delivery in{" "}
            <span className="font-semibold text-emerald-400">30–45 mins</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6">
          {/* LEFT COLUMN – Location + Payment */}
          <div className="space-y-5">
            {/* Delivery location card */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                      1
                    </span>
                    Delivery location
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                    Drag the pin or edit the address to fine-tune your drop
                    location.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-[10px] text-slate-300 border border-slate-700">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  Live map powered by Geoapify
                </span>
              </div>

              {/* Address input + buttons */}
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="flex-1">
                  <label className="text-[11px] text-slate-400 mb-1 block">
                    Delivery address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={orderLocation.address || ""}
                      onChange={(e) =>
                        setOrderLocation({
                          ...orderLocation,
                          address: e.target.value,
                        })
                      }
                      placeholder="Enter your delivery address"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-emerald-500/70 transition"
                    />
                    <MapPin className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 sm:w-40">
                  <button
                    onClick={handleSearch}
                    className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] sm:text-xs font-semibold px-3 py-2 transition"
                  >
                    Search address
                  </button>
                  <button
                    onClick={() =>
                      setOrderLocation(
                        detectedLocation
                          ? {
                              latitude: detectedLocation.latitude,
                              longitude: detectedLocation.longitude,
                              address: detectedLocation.address,
                            }
                          : {
                              latitude: 17.385044,
                              longitude: 78.486671,
                              address: "Hyderabad, Telangana, India",
                            }
                      )
                    }
                    className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-[11px] sm:text-xs font-semibold px-3 py-2 transition border border-slate-700"
                  >
                    Use current location
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="mt-4 h-64 sm:h-72 rounded-2xl overflow-hidden border border-slate-800">
                <MapContainer
                  center={[orderLocation.latitude, orderLocation.longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  />

                  <ChangeMapView
                    coords={[orderLocation.latitude, orderLocation.longitude]}
                  />

                  <Marker
                    draggable={true}
                    position={[
                      orderLocation.latitude,
                      orderLocation.longitude,
                    ]}
                    eventHandlers={{ dragend: handleMarkerDragEnd }}
                    ref={markerRef}
                    icon={L.icon({
                      iconUrl:
                        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                      shadowUrl:
                        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                    })}
                  >
                    <Popup>
                      <div>
                        <strong>Selected Location</strong>
                        <br />
                        {orderLocation.address}
                        <br />
                        <span className="text-[11px] text-slate-500">
                          Lat: {orderLocation.latitude.toFixed(5)}, Lon:{" "}
                          {orderLocation.longitude.toFixed(5)}
                        </span>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="mt-3 text-[11px] sm:text-xs text-slate-400">
                <p>
                  <span className="font-semibold text-slate-300">
                    Selected address:
                  </span>{" "}
                  {orderLocation.address}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-slate-300">
                    Coordinates:
                  </span>{" "}
                  {orderLocation.latitude.toFixed(4)},{" "}
                  {orderLocation.longitude.toFixed(4)}
                </p>
              </div>
            </section>

            {/* Payment methods card */}
            <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.55)] backdrop-blur">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    2
                  </span>
                  Payment method
                </h2>
                <p className="text-[11px] text-slate-400">
                  All payments are encrypted & secure.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("COD")}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    paymentMethod === "COD"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900/60 hover:bg-slate-800"
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center text-lg">
                    💵
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-100">
                      Cash on delivery
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Pay with cash or UPI after delivery.
                    </p>
                  </div>
                </button>

                {/* Online */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    paymentMethod === "ONLINE"
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-slate-700 bg-slate-900/60 hover:bg-slate-800"
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-slate-900 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-100">
                      Online payment
                    </p>
                    <p className="text-[11px] text-slate-400">
                      UPI, cards & net banking supported.
                    </p>
                  </div>
                </button>
              </div>

              <p className="mt-3 text-[11px] text-slate-300 flex items-center gap-2">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                Selected:{" "}
                <span className="font-semibold text-emerald-400 uppercase">
                  {paymentMethod === "COD" ? "Cash on delivery" : "Online"}
                </span>
              </p>
            </section>
            {/* TIP SECTION */}
<section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur mt-5">
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm sm:text-base font-semibold text-white flex items-center gap-2">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
        3
      </span>
      Tip your delivery partner
    </h2>

    {/* Tooltip info */}
    <div className="group relative">
      <span className="text-slate-400 cursor-pointer text-xs">ℹ️</span>
      <div className="absolute right-0 top-6 w-44 bg-slate-800 text-[11px] text-slate-300 p-2 rounded-lg shadow-lg border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition">
        100% of your tip is sent directly to the delivery partner.
      </div>
    </div>
  </div>

  {/* Tip values */}
  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
    {tipOptions.map((amount) => (
      <button
        key={amount}
        onClick={() => setTip(amount)}
        className={`px-3 py-2 rounded-xl text-xs font-semibold border transition 
          ${
            tip === amount
              ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
              : "border-slate-700 bg-slate-900/40 text-slate-300 hover:bg-slate-800"
          }`}
      >
        ₹{amount}
      </button>
    ))}
  </div>

  {/* Custom tip */}
  <button
    onClick={() => setTip(0)}
    className={`mt-3 w-full text-center text-xs font-semibold py-2 rounded-xl transition
      ${
        tip === 0
          ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 border"
          : "border border-slate-700 bg-slate-900/40 text-slate-400 hover:bg-slate-800"
      }`}
  >
    No tip
  </button>
</section>

          </div>

          {/* RIGHT COLUMN – Order summary */}
          <aside className="space-y-4">
            <section className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-[0_18px_45px_rgba(0,0,0,0.6)] backdrop-blur">
              <h2 className="text-sm sm:text-base font-semibold text-white mb-3">
                Order summary
              </h2>

              <div className="max-h-52 overflow-y-auto pr-1 space-y-2">
                {cart?.items?.map((item) => (
                  <div
                    key={item._id}
                    className="flex justify-between items-start text-xs text-slate-200 border-b border-slate-800/70 pb-2 last:border-0"
                  >
                    <span className="flex-1 mr-2">
                      {item?.item?.name}{" "}
                      <span className="text-slate-400">
                        × {item.quantity}
                      </span>
                    </span>
                    <span className="font-semibold text-slate-100">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
                {!cart?.items?.length && (
                  <p className="text-xs text-slate-500">
                    No items in cart. Go back and add some delicious food.
                  </p>
                )}
              </div>

              <div className="mt-4 space-y-1 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400 text-xs">
  <span className="flex items-center gap-1">
    Delivery fee
    <div className="group relative">
      <span className="text-[10px] cursor-pointer">ℹ️</span>
      <div className="absolute left-0 top-5 w-40 bg-slate-800 text-[10px] text-slate-300 p-2 rounded-lg shadow border border-slate-700 opacity-0 group-hover:opacity-100 transition">
        Delivery is free for orders above ₹500.
      </div>
    </div>
  </span>

  <span>
    {deliveryFee === 0 ? (
      <span className="text-emerald-400 font-semibold">Free</span>
    ) : (
      `₹${deliveryFee}`
    )}
  </span>
</div>
{subtotal < 500 && subtotal > 0 && (
  <div className="mt-2 w-full">
    <div className="relative h-2 w-full rounded-full bg-slate-800 overflow-hidden">
      <div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all"
        style={{ width: `${(subtotal / 500) * 100}%` }}
      ></div>
    </div>

    <p className="text-[11px] text-amber-300 mt-1">
      Add ₹{500 - subtotal} more for free delivery
    </p>
  </div>
)}


                <div className="flex justify-between text-slate-400">
                  <span>Platform fee</span>
                  <span>₹{platformFee}</span>
                </div>

                <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-800">
                  <span className="text-[13px] font-semibold text-slate-100">
                    Total to pay
                  </span>
                  <span className="text-lg font-bold text-emerald-400">
                    ₹{total}
                  </span>
                </div>
              </div>

              {deliveryFee === 0 && subtotal > 0 && (
                <p className="mt-2 text-[11px] text-emerald-400">
                  🎉 You got free delivery on this order!
                </p>
              )}
              {deliveryFee > 0 && subtotal > 0 && subtotal < 500 && (
                <p className="mt-2 text-[11px] text-amber-300">
                  Add items worth ₹{500 - subtotal} more to unlock{" "}
                  <span className="font-semibold">free delivery</span>.
                </p>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={loading || !cart?.items?.length}
                className="w-full mt-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 rounded-xl shadow-lg transition-all"
              >
                {loading
                  ? "Placing your order..."
                  : paymentMethod === "COD"
                  ? "Place order"
                  : "Pay & place order"}
              </button>

              <p className="mt-2 text-[10px] text-slate-500 text-center">
                By placing this order, you agree to ZentroEat&apos;s Terms of
                Use and Refund Policy.
              </p>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default CheckOut;

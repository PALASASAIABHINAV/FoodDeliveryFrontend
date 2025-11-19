import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useAuthStore";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useCartStore } from "../../store/useCartStore";
import { useOrderStore } from "../../store/useOrderStore";

const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Small helper to change map center dynamically
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, 13);
  }, [coords]);
  return null;
}

const CheckOut = () => {
  const navigate = useNavigate();
  const { detectedLocation } = useUserStore();
  const { placeOrder, loading } = useOrderStore();

  const [orderLocation, setOrderLocation] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD"); // 🟢 Default COD
  const markerRef = useRef(null);

  // 🟢 Initialize with detected location or fallback
  useEffect(() => {
    if (detectedLocation) {
      setOrderLocation({
        latitude: detectedLocation.latitude,
        longitude: detectedLocation.longitude,
        address: detectedLocation.address,
      });
    } else {
      // 🟡 If user blocks location or it fails, set a default place
      setOrderLocation({
        latitude: 17.385044, // Default: Hyderabad coordinates
        longitude: 78.486671,
        address: "Hyderabad, Telangana, India",
      });
    }
  }, [detectedLocation]);

  // 🟡 Forward geocode (address → lat/lon)
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

  // 🟢 Reverse geocode (lat/lon → address)
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

  // 🟢 Handle Search Button
  const handleSearch = async () => {
    if (!orderLocation?.address) return;
    const loc = await geocodeAddress(orderLocation.address);
    if (loc) setOrderLocation(loc);
  };

  // 🟢 Handle Marker Drag End
  const handleMarkerDragEnd = async (e) => {
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

  const { cart } = useCartStore();

  const subtotal = cart?.totalAmount || 0;
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const platformFee = 2;
  const total = subtotal + deliveryFee + platformFee;

  // 🟢 Still render page even if detectedLocation is null
  if (!orderLocation) return <div>Loading map...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div
        className="cursor-pointer text-blue-600 mb-3"
        onClick={() => navigate(-1)}
      >
        ← Back
      </div>

      <h2 className="text-2xl font-semibold mb-4">CheckOut Page</h2>

      {/* -------------------- Delivery Location -------------------- */}
      <section>
        <h2 className="font-semibold mb-2">Delivery Location</h2>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={orderLocation.address || ""}
            onChange={(e) =>
              setOrderLocation({ ...orderLocation, address: e.target.value })
            }
            placeholder="Enter address..."
            className="border p-2 flex-1 rounded"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-3 py-2 rounded"
          >
            Search
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
            className="bg-green-500 text-white px-3 py-2 rounded"
          >
            Current Location
          </button>
        </div>

        <div className="h-96 w-full mt-4 rounded overflow-hidden shadow">
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
              position={[orderLocation.latitude, orderLocation.longitude]}
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
                  <span className="text-xs text-gray-500">
                    Lat: {orderLocation.latitude.toFixed(5)}, Lon:{" "}
                    {orderLocation.longitude.toFixed(5)}
                  </span>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="mt-4 text-sm text-gray-700">
          <p>
            <strong>Selected Address:</strong> {orderLocation.address}
          </p>
          <p>
            <strong>Latitude:</strong> {orderLocation.latitude.toFixed(6)} |{" "}
            <strong>Longitude:</strong> {orderLocation.longitude.toFixed(6)}
          </p>
        </div>
      </section>

      {/* -------------------- Payment Methods -------------------- */}
      <section className="mt-6">
        <h2 className="font-semibold mb-3 text-lg">Payment Method</h2>

        <div className="flex gap-4">
          {/* COD Option */}
          <div
            onClick={() => setPaymentMethod("COD")}
            className={`flex-1 p-4 border rounded cursor-pointer text-center font-medium ${
              paymentMethod === "COD"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300"
            }`}
          >
            💵 Cash on Delivery
          </div>

          {/* Online Option */}
          <div
            onClick={() => setPaymentMethod("ONLINE")}
            className={`flex-1 p-4 border rounded cursor-pointer text-center font-medium ${
              paymentMethod === "ONLINE"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300"
            }`}
          >
            💳 Online Payment
          </div>
        </div>

        <p className="mt-3 text-gray-700">
          <strong>Selected Payment:</strong> {paymentMethod}
        </p>
      </section>

      {/* -------------------- Order Summary -------------------- */}
      <section className="mt-6 border rounded-lg shadow-sm p-4">
        <h2 className="font-semibold mb-3 text-lg">Order Summary</h2>

        {cart?.items?.map((item) => (
          <div
            key={item._id}
            className="flex justify-between border-b py-2 text-gray-700"
          >
            <span>
              {item?.item?.name} × {item.quantity}
            </span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}

        <div className="flex justify-between mt-2">
          <span className="font-medium">Subtotal</span>
          <span>₹{subtotal}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Delivery Fee</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Platform Fee</span>
          <span>₹{platformFee}</span>
        </div>

        <div className="flex justify-between mt-2 text-lg font-semibold text-red-600">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {/* 🟢 Place Order Button */}
        <button
          onClick={async () => {
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
              navigate("/order-placed"); // optional redirect to order
            } catch (err) {
              console.log("Failed to place order", err);
            }
          }}
          className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all"
        >
          {paymentMethod === "COD" ? "Place Order" : "Pay & Place Order"}
        </button>
      </section>
    </div>
  );
};

export default CheckOut;

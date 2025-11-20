// App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import { useUserStore } from "./store/useAuthStore";
import AddItem from "./components/owenr/AddItem";
import CreateShop from "./components/owenr/CreateShop";
import EditShop from "./components/owenr/EditShop";
import EditItem from "./components/owenr/EditItem";
import CartPage from "./components/user/CartPage";
import CheckOut from "./components/common/CheckOut";
import OrderPlaced from "./components/common/OrderPlaced";
import MyOrders from "./components/common/MyOrders";
import LiveTracking from "./components/common/LiveTracking";
import DeliveryNavigation from "./components/deliveryBoy/DeliveryNavigation";
import PenaltyHistory from "./components/deliveryBoy/PenaltyHistory";
import DeliveryHistory from "./components/deliveryBoy/DeliveryHistory";
import DeliveryEarnings from "./components/deliveryBoy/DeliveryEarnings";
import AdminOwnerRequests from "./pages/AdminOwnerRequests";
import AdminDashboard from "./admin/AdminDashboard";
import AdminLayout from "./admin/AdminLayout";

export const serverUrl =
  import.meta.env.VITE_SERVER_URL || "http://localhost:7272";

// Nice full-screen loader for initial user fetch
const FullScreenLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-text-slate-100 text-slate-900">
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <img
          src="/zentroeat-removebg.png"
          alt="ZentroEat"
          className="h-12 w-auto drop-shadow-lg"
        />
        <span className="text-sm font-semibold tracking-[0.2em] text-emerald-400 uppercase">
          Loading
        </span>
      </div>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-400/30 border-t-emerald-400 animate-spin" />
      </div>
      <p className="text-xs text-slate-400">
        Personalizing your ZentroEat experience…
      </p>
    </div>
  </div>
);

function App() {
  const { fetchCurrentUser, user, loading, location, initializeLocation, updateUserLocation } =
    useUserStore();

  // 🔄 Live geolocation → backend
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        updateUserLocation(lat, lon); // keep logic as is
      },
      (err) => console.log("Watch error:", err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updateUserLocation]);

  // Initialize (city, detectedLocation etc.)
  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  console.log("location:", location);
  console.log("USER:", user);

  if (loading) {
    // 🔥 Professional full-screen loader
    return <FullScreenLoader />;
  }

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";
  const isDeliveryBoy = user?.role === "deliveryBoy";
  const isOwner = user?.role === "owner";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Routes>
        {/* ADMIN AREA */}
        <Route
          path="/admin"
          element={
            isAdmin ? (
              <AdminLayout />
            ) : loading ? (
              <FullScreenLoader />
            ) : (
              <Navigate to="/" replace />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="owner-requests" element={<AdminOwnerRequests />} />
        </Route>

        {/* PUBLIC AUTH ROUTES */}
        <Route
          path="/signin"
          element={!isLoggedIn ? <SignIn /> : <Navigate to="/" replace />}
        />
        <Route
          path="/signup"
          element={!isLoggedIn ? <SignUp /> : <Navigate to="/" replace />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* MAIN USER / HOME */}
        <Route
          path="/"
          element={isLoggedIn ? <Home /> : <Navigate to="/signin" replace />}
        />

        {/* CART + CHECKOUT FLOW */}
        <Route
          path="/cart"
          element={isLoggedIn ? <CartPage /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/check-out"
          element={isLoggedIn ? <CheckOut /> : <Navigate to="/signin" replace />}
        />
        <Route
          path="/order-placed"
          element={
            isLoggedIn ? <OrderPlaced /> : <Navigate to="/signin" replace />
          }
        />
        <Route
          path="/orders"
          element={isLoggedIn ? <MyOrders /> : <Navigate to="/signin" replace />}
        />

        {/* USER LIVE TRACKING */}
        <Route
          path="/track-order/:orderId/:shopOrderId"
          element={isLoggedIn ? <LiveTracking /> : <Navigate to="/signin" replace />}
        />

        {/* DELIVERY BOY ROUTES */}
        <Route
          path="/delivery-navigation/:assignmentId"
          element={
            isLoggedIn && isDeliveryBoy ? (
              <DeliveryNavigation />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/delivery/earnings"
          element={
            isLoggedIn && isDeliveryBoy ? (
              <DeliveryEarnings />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/delivery/history"
          element={
            isLoggedIn && isDeliveryBoy ? (
              <DeliveryHistory />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/delivery/penalties"
          element={
            isLoggedIn && isDeliveryBoy ? (
              <PenaltyHistory />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* OWNER ROUTES */}
        <Route
          path="/add-item"
          element={
            isLoggedIn ? (
              isOwner ? <AddItem /> : <Navigate to="/" replace />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

       

        <Route
  path="/create-shop"
  element={
    user ? (
      user.role === "owner" && user.isVerifiedOwner ? (
        <CreateShop />
      ) : user.role === "owner" ? (
        // Owner but not verified → send to waiting page
        <Navigate to="/" replace />
      ) : (
        <Navigate to="/" replace />
      )
    ) : (
      <Navigate to="/signin" replace />
    )
  }
/>


        <Route
          path="/edit-shop"
          element={
            isLoggedIn ? (
              isOwner ? <EditShop /> : <Navigate to="/" replace />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />

        <Route
          path="/edit-item/:itemId"
          element={
            isLoggedIn ? (
              isOwner ? <EditItem /> : <Navigate to="/" replace />
            ) : (
              <Navigate to="/signin" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

export default App;

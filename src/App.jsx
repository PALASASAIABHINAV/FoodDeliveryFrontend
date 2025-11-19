import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home"; // <-- make sure you have this or any protected page
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

// App.jsx
export const serverUrl =
  import.meta.env.VITE_SERVER_URL || "http://localhost:7272";


function App() {
  const { fetchCurrentUser, user, loading } = useUserStore();

  const { location, fetchUserLocation, initializeLocation, updateUserLocation  } = useUserStore();

  useEffect(() => {
  const watchId = navigator.geolocation.watchPosition(
    async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      updateUserLocation(lat, lon); // 🔥 Real-time DB update
    },
    (err) => console.log("Watch error:", err),
    { enableHighAccuracy: true }
  );

  return () => navigator.geolocation.clearWatch(watchId);
}, []);


  useEffect(() => {
    initializeLocation();
  }, [initializeLocation]);
  console.log(location);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  if (loading) {
  return <div>Loading user...</div>;
}

console.log("USER:", user);



  return (
    <Routes>

      <Route
  path="/admin"
  element={
    user && user.role === "admin" ? (
      <AdminLayout />
    ) : loading ? (
      <div>Loading...</div>
    ) : (
      <Navigate to="/" replace />
    )
  }
>
  <Route index element={<AdminDashboard />} />
  <Route path="owner-requests" element={<AdminOwnerRequests />} />
</Route>


      {/* Public routes */}
      <Route
        path="/signin"
        element={!user ? <SignIn /> : <Navigate to="/" replace />}
      />
      <Route
        path="/signup"
        element={!user ? <SignUp /> : <Navigate to="/" replace />}
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected route */}
      <Route
        path="/"
        element={user ? <Home /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/cart"
        element={user ? <CartPage /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/check-out"
        element={user ? <CheckOut /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/order-placed"
        element={user ? <OrderPlaced /> : <Navigate to="/signin" replace />}
      />
      <Route
        path="/orders"
        element={user ? <MyOrders /> : <Navigate to="/signin" replace />}
      />


      {/* Live Tracking for Users */}
<Route
  path="/track-order/:orderId/:shopOrderId"
  element={user ? <LiveTracking /> : <Navigate to="/signin" replace />}
/>

{/* Navigation for Delivery Boy */}
<Route
  path="/delivery-navigation/:assignmentId"
  element={
    user && user.role === "deliveryBoy" ? (
      <DeliveryNavigation />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>  
     
     {/* Delivery Boy Earnings */}
<Route
  path="/delivery/earnings"
  element={
    user && user.role === "deliveryBoy" ? (
      <DeliveryEarnings />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

{/* Delivery Boy History */}
<Route
  path="/delivery/history"
  element={
    user && user.role === "deliveryBoy" ? (
      <DeliveryHistory />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

{/* Delivery Boy Penalties */}
<Route
  path="/delivery/penalties"
  element={
    user && user.role === "deliveryBoy" ? (
      <PenaltyHistory />
    ) : (
      <Navigate to="/" replace />
    )
  }
/>


      {/* Owner routes */}
      <Route
        path="/add-item"
        element={
          user ? (
            user.role === "owner" ? (
              <AddItem />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/create-shop"
        element={
          user ? (
            user.role === "owner" ? (
              <CreateShop />
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
          user ? (
            user.role === "owner" ? (
              <EditShop />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />
      <Route
        path="/edit-item/:itemId"
        element={
          user ? (
            user.role === "owner" ? (
              <EditItem />
            ) : (
              <Navigate to="/" replace />
            )
          ) : (
            <Navigate to="/signin" replace />
          )
        }
      />

     




    </Routes>
  );
}

export default App;

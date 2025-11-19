import React, { useEffect } from "react";
import { MapPin, Package, Clock, Phone, Navigation } from "lucide-react";
import Navbar from "../common/Navbar";
import { useDeliveryStore } from "../../store/useDeliveryStore";
import { useUserStore } from "../../store/useAuthStore";
import {  useNavigate } from 'react-router-dom';
import DeliverySidebar from "./DeliverySidebar";

const STATUS_COLORS = {
  boardCasted: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Assigned: "bg-blue-100 text-blue-800 border-blue-300",
  Completed: "bg-green-100 text-green-800 border-green-300",
};

const STATUS_LABELS = {
  boardCasted: "Available",
  Assigned: "In Progress",
  Completed: "Completed",
};

const DeliveryBoyDashboard = () => {
  const navigate=useNavigate();
  const { user } = useUserStore();
  


  const {
    assignments,
    getMyAssignments,
    acceptAssignment,
    completeAssignment,
    loading,
    stats,         
  getStats,
  } = useDeliveryStore();
  // Track earlier boardCasted IDs
const prevBoardcastedRef = React.useRef(new Set());
const buzzer = new Audio("/buzzer.mp3");
buzzer.volume = 1;

useEffect(() => {
  const enableAudio = () => {
    buzzer.play().catch(() => {});
    buzzer.pause();
  };

  window.addEventListener("click", enableAudio);

  return () => {
    window.removeEventListener("click", enableAudio);
  };
}, []);


useEffect(() => {
  const fetchAssignments = async () => {
    await getMyAssignments();

    // GET current boardCasted assignments
    const current = new Set(
      (assignments || [])
        .filter(a => a.status === "boardCasted")
        .map(a => a._id)
    );

    // old values
    const old = prevBoardcastedRef.current;

    // detect NEW ones only
    let hasNew = false;
    current.forEach(id => {
      if (!old.has(id)) hasNew = true;
    });

    if (hasNew) {
      console.log("NEW ORDER RECEIVED — BUZZER");
      buzzer.play().catch(err => console.log("Audio error:", err));
    }

    // update old set
    prevBoardcastedRef.current = current;
  };

  fetchAssignments();
  getStats();

  // Poll every 5 seconds
  const interval = setInterval(fetchAssignments, 5000);

  return () => clearInterval(interval);
}, []); // VERY IMPORTANT → empty dependency




    // Helper: check if date is today (for completed section)
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

  // ----------------------------
  // 🔥 FILTERING LOGIC ADDED
  // ----------------------------


  // ----------------------------
  // 🔥 FILTERING LOGIC ADDED
  // ----------------------------

  const availableAssignments = assignments.filter(
    (a) => a.status === "boardCasted"
  );

  const myActiveAssignments = assignments.filter(
    (a) => a.status === "Assigned" && a.assignedTo === user?._id
  );

    const myCompletedAssignments = assignments.filter(
  (a) =>
    ["Completed", "completed", "DELIVERED"].includes(a.status) &&
    a.assignedTo === user?._id &&
    isToday(a.completedAt || a.updatedAt)
);



  // ----------------------------

  const handleAccept = async (assignmentId) => {
    try {
      await acceptAssignment(assignmentId);
      alert("Assignment accepted successfully!");
      await getMyAssignments();
    } catch (error) {
      alert("Failed to accept assignment");
    }
  };

  const handleComplete = async (assignmentId) => {
    if (window.confirm("Mark this delivery as completed?")) {
      try {
        await completeAssignment(assignmentId);
        alert("Delivery completed successfully!");
        await getMyAssignments();
      } catch (error) {
        alert("Failed to complete delivery");
      }
    }
  };

  const AssignmentCard = (assignment) => (
    <div
      key={assignment._id}
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-2 border-gray-100 ${
        assignment.status === "Completed" ? "opacity-60 pointer-events-none" : ""
      }`}
    >
      {/* Status Badge */}
      <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
        <span className="font-semibold text-gray-700">
          Order #{assignment.order?._id?.slice(-8)}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${
            STATUS_COLORS[assignment.status]
          }`}
        >
          {STATUS_LABELS[assignment.status]}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Shop Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Pickup From
            </p>
            <p className="font-semibold text-gray-800">
              {assignment.shop?.name}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {assignment.shop?.address}, {assignment.shop?.city}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Deliver To
            </p>
            <p className="font-semibold text-gray-800">
              {assignment.order?.user?.fullName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {assignment.order?.deliveryAddress?.text}
            </p>
          </div>
        </div>

        {/* Customer Phone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Customer Phone
            </p>
            <a
              href={`tel:${assignment.order?.user?.mobile}`}
              className="font-semibold text-blue-600 hover:underline"
            >
              {assignment.order?.user?.mobile}
            </a>
          </div>
        </div>

        {/* Distance Display */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            Distance: ~{assignment.distance ? assignment.distance.toFixed(1) : "N/A"} km
          </span>
        </div>

        {/* Payment Details */}
        <div className="bg-gray-50 rounded-lg p-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium">
              Payment Method
            </p>
            <p className="font-semibold text-gray-800">
              {assignment.order?.paymentMethod}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase font-medium">
              Amount
            </p>
            <p className="font-bold text-lg text-green-600">
              ₹{assignment.order?.totalAmount}
            </p>
          </div>
        </div>

        {assignment.accpectedAt && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>
              Accepted at: {new Date(assignment.accpectedAt).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="px-6 pb-6">
        {assignment.status === "boardCasted" && (
          <button
            onClick={() => handleAccept(assignment._id)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            Accept Delivery
          </button>
        )}

        {assignment.status === "Assigned" && (
          <div className="space-y-3">
            <button
  onClick={() => {
    console.log("Navigating to:", assignment._id); // Debug log
    if (!assignment._id) {
      alert("Assignment ID not found");
      return;
    }
    navigate(`/delivery-navigation/${assignment._id}`);
  }}
  className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
>
  <Navigation className="w-5 h-5" />
  Start Navigation
</button>

            
          </div>
        )}

        {assignment.status === "Completed" && (
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 text-center">
            <p className="text-green-700 font-semibold">
              ✓ Delivery Completed
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* ✅ Stats summary */}

  

   <DeliverySidebar />



      <div className="max-w-6xl mx-auto p-6">

        {/* Available */}
        <h2 className="text-xl font-bold mb-4">Available Deliveries</h2>
        {availableAssignments.length === 0 ? (
          <p className="text-gray-500 mb-8">No new assignments</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {availableAssignments.map(AssignmentCard)}
          </div>
        )}

        {/* Active */}
        <h2 className="text-xl font-bold mb-4">Active Deliveries</h2>
        {myActiveAssignments.length === 0 ? (
          <p className="text-gray-500 mb-8">No active deliveries</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {myActiveAssignments.map(AssignmentCard)}
          </div>
        )}

        {/* Completed */}
        <h2 className="text-xl font-bold mb-4">Completed Deliveries</h2>
        {myCompletedAssignments.length === 0 ? (
          <p className="text-gray-500">No completed deliveries</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myCompletedAssignments.map(AssignmentCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;

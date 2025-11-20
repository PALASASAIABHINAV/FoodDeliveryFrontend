import React, { useEffect } from "react";
import { MapPin, Package, Clock, Phone, Navigation } from "lucide-react";
import Navbar from "../common/Navbar";
import { useDeliveryStore } from "../../store/useDeliveryStore";
import { useUserStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import DeliverySidebar from "./DeliverySidebar";

const STATUS_COLORS = {
  boardCasted: "bg-amber-50 text-amber-700 border-amber-300",
  Assigned: "bg-sky-50 text-sky-700 border-sky-300",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-300",
};

const STATUS_LABELS = {
  boardCasted: "Available",
  Assigned: "In Progress",
  Completed: "Completed",
};

const DeliveryBoyDashboard = () => {
  const navigate = useNavigate();
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

  // 🔔 buzzer setup
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchAssignments = async () => {
      await getMyAssignments();

      const current = new Set(
        (assignments || [])
          .filter((a) => a.status === "boardCasted")
          .map((a) => a._id)
      );

      const old = prevBoardcastedRef.current;

      let hasNew = false;
      current.forEach((id) => {
        if (!old.has(id)) hasNew = true;
      });

      if (hasNew) {
        console.log("NEW ORDER RECEIVED — BUZZER");
        buzzer.play().catch((err) => console.log("Audio error:", err));
      }

      prevBoardcastedRef.current = current;
    };

    fetchAssignments();
    getStats();

    const interval = setInterval(fetchAssignments, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Filters
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

  // Simple stats derived from assignments (no fake backend data)
  const availableCount = availableAssignments.length;
  const activeCount = myActiveAssignments.length;
  const completedTodayCount = myCompletedAssignments.length;

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

  // Card renderer
  const AssignmentCard = (assignment) => (
    <div
      key={assignment._id}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden border border-slate-100 ${
        assignment.status === "Completed"
          ? "opacity-60 pointer-events-none"
          : ""
      }`}
    >
      {/* Top strip */}
      <div className="bg-slate-50/80 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
        <span className="font-semibold text-slate-800 text-sm">
          Order #{assignment.order?._id?.slice(-8)}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[assignment.status]}`}
        >
          {STATUS_LABELS[assignment.status]}
        </span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Shop */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
              Pickup from
            </p>
            <p className="font-semibold text-slate-900 truncate">
              {assignment.shop?.name}
            </p>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {assignment.shop?.address}, {assignment.shop?.city}
            </p>
          </div>
        </div>

        {/* Customer */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-sky-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
              Deliver to
            </p>
            <p className="font-semibold text-slate-900 truncate">
              {assignment.order?.user?.fullName}
            </p>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {assignment.order?.deliveryAddress?.text}
            </p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-violet-500" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
              Customer phone
            </p>
            <a
              href={`tel:${assignment.order?.user?.mobile}`}
              className="font-semibold text-sky-600 hover:text-sky-700 text-sm"
            >
              {assignment.order?.user?.mobile}
            </a>
          </div>
        </div>

        {/* Distance */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            Distance:{" "}
            <span className="font-semibold text-slate-800">
              ~
              {assignment.distance
                ? assignment.distance.toFixed(1)
                : "N/A"}{" "}
              km
            </span>
          </span>
        </div>

        {/* Payment */}
        <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center">
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
              Payment method
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {assignment.order?.paymentMethod}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-500 uppercase tracking-wide font-semibold">
              Amount to collect
            </p>
            <p className="text-lg font-bold text-emerald-600">
              ₹{assignment.order?.totalAmount}
            </p>
          </div>
        </div>

        {/* Accepted time */}
        {assignment.accpectedAt && (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>
              Accepted at:{" "}
              <span className="font-medium text-slate-700">
                {new Date(assignment.accpectedAt).toLocaleString()}
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 pb-5">
        {assignment.status === "boardCasted" && (
          <button
            onClick={() => handleAccept(assignment._id)}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Accept delivery
          </button>
        )}

        {assignment.status === "Assigned" && (
          <div className="space-y-3">
            <button
              onClick={() => {
                console.log("Navigating to:", assignment._id);
                if (!assignment._id) {
                  alert("Assignment ID not found");
                  return;
                }
                navigate(`/delivery-navigation/${assignment._id}`);
              }}
              className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              Start navigation
            </button>
          </div>
        )}

        {assignment.status === "Completed" && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
            <p className="text-emerald-700 text-sm font-semibold">
              ✓ Delivery completed
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 flex flex-col lg:flex-row gap-6">
        {/* Sidebar – always visible, responsive */}
        <aside className="w-full lg:w-64 lg:flex-shrink-0">
          <DeliverySidebar />
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-6">
          {/* Greeting + summary */}
          <section className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl px-5 sm:px-7 py-5 shadow-md text-white">
            <p className="text-xs uppercase tracking-[0.18em] text-emerald-100 font-semibold mb-1">
              Delivery partner dashboard
            </p>
            <h1 className="text-xl sm:text-2xl font-bold">
              Hi, {user?.fullName || "Partner"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-50 mt-1">
              Stay online to grab new orders as soon as they appear.
            </p>
          </section>

          {/* Stats row (derived from real data) */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">
                  New assignments
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {availableCount}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">
                  Active deliveries
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {activeCount}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-sky-500" />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">
                  Completed today
                </p>
                <p className="text-xl font-bold text-slate-900">
                  {completedTodayCount}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
            </div>
          </section>

          {/* Available */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900">
                Available deliveries
              </h2>
              {loading && (
                <span className="text-[11px] text-slate-500">
                  Updating…
                </span>
              )}
            </div>
            {availableAssignments.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200 px-4 py-3">
                No new assignments right now. Stay online to receive new
                requests.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {availableAssignments.map(AssignmentCard)}
              </div>
            )}
          </section>

          {/* Active */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Active deliveries
            </h2>
            {myActiveAssignments.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200 px-4 py-3">
                You don&apos;t have any active deliveries at the moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myActiveAssignments.map(AssignmentCard)}
              </div>
            )}
          </section>

          {/* Completed today */}
          <section className="space-y-3">
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Completed today
            </h2>
            {myCompletedAssignments.length === 0 ? (
              <p className="text-xs sm:text-sm text-slate-500 bg-white rounded-xl border border-dashed border-slate-200 px-4 py-3">
                No deliveries completed today yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {myCompletedAssignments.map(AssignmentCard)}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default DeliveryBoyDashboard;

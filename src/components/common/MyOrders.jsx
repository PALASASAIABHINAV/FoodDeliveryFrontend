import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Package, Clock } from "lucide-react";

import { useOrderStore } from "../../store/useOrderStore";
import { useUserStore } from "../../store/useAuthStore";

import OwnerOrders from "../owenr/OwnerOrders";
import UserOrders from "../user/UserOrders";
import Navbar from "./Navbar";

const MyOrders = () => {
  const { user } = useUserStore();
  const { fetchOrders, loading, orders } = useOrderStore();

  const [filter, setFilter] = useState("all"); // all | ongoing | completed

  // Fetch on mount / role change
  useEffect(() => {
    if (user?.role) {
      fetchOrders(user.role);
    }
  }, [user?.role, fetchOrders]);

  const handleRefresh = () => {
    if (user?.role) {
      fetchOrders(user.role);
    }
  };

  // Filter only for display, does not touch backend data
  const filteredOrders = useMemo(() => {
    if (!orders || !orders.length) return [];

    if (filter === "all") return orders;

    const isCompletedStatus = (status) =>
      status === "DELIVERED" || status === "CANCELLED";

    if (filter === "completed") {
      return orders.filter((o) =>
        (o.shopOrder || []).every((s) => isCompletedStatus(s.status))
      );
    }

    // ongoing
    return orders.filter((o) =>
      (o.shopOrder || []).some((s) => !isCompletedStatus(s.status))
    );
  }, [orders, filter]);

  const isOwner = user?.role === "owner";

  const renderContent = () => {
    if (loading && !orders.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mb-4" />
          <p className="text-sm text-slate-500">Fetching your orders…</p>
        </div>
      );
    }

    if (!orders || !orders.length) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-base font-semibold text-slate-800">
            No orders found yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Place an order and you&apos;ll see it here.
          </p>
          <button
            onClick={handleRefresh}
            className="mt-5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      );
    }

    // Pass filtered list to child
    return isOwner ? (
      <OwnerOrders orders={filteredOrders} />
    ) : (
      <UserOrders orders={filteredOrders} />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Gradient header, aligned with home pattern */}
      <header className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 pt-20 pb-4 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.2em] font-semibold text-emerald-50 uppercase">
              ZentroEat
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              My Orders
              <Clock className="w-5 h-5 text-emerald-100" />
            </h1>
            <p className="text-[12px] sm:text-sm text-emerald-50 mt-1">
              View your {isOwner ? "restaurant" : "food"} orders, statuses and
              details in one place.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            {/* Filter pills – for users only */}
            {!isOwner && (
              <div className="inline-flex bg-emerald-50/20 rounded-full p-1 border border-emerald-200/40 backdrop-blur-sm">
                {[
                  { id: "all", label: "All" },
                  { id: "ongoing", label: "Ongoing" },
                  { id: "completed", label: "Completed" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFilter(opt.id)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-full transition ${
                      filter === opt.id
                        ? "bg-white text-emerald-600 shadow-sm"
                        : "text-emerald-50/80 hover:bg-emerald-50/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/90 text-slate-800 text-xs font-semibold shadow-md hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  loading ? "animate-spin" : ""
                } text-emerald-500`}
              />
              {loading ? "Refreshing…" : "Refresh Orders"}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-10 pt-4">
        {renderContent()}
      </main>
    </div>
  );
};

export default MyOrders;

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import Navbar from "../common/Navbar";
import DeliverySidebar from "./DeliverySidebar";
import { Truck, MapPin, Wallet, ArrowUpDown } from "lucide-react";

const DeliveryHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest"); // latest | distance | earnings

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/delivery/my-earnings`, {
        withCredentials: true,
      });

      const deliveries = res.data.todayDeliveries || [];
      setHistory(deliveries);
    } catch (err) {
      console.error("History load failed", err);
    } finally {
      setLoading(false);
    }
  };

  // Derived totals (frontend only, same backend data)
  const totals = useMemo(() => {
    const totalTrips = history.length;
    const totalEarnings = history.reduce(
      (sum, d) => sum + (d.deliveryFee || 0),
      0
    );
    const totalDistance = history.reduce(
      (sum, d) => sum + (d.distanceKm || 0),
      0
    );
    return { totalTrips, totalEarnings, totalDistance };
  }, [history]);

  // Sorted view (does not change original order)
  const sortedHistory = useMemo(() => {
    if (sortBy === "latest") return history;

    const clone = [...history];
    if (sortBy === "distance") {
      clone.sort((a, b) => (b.distanceKm || 0) - (a.distanceKm || 0));
    } else if (sortBy === "earnings") {
      clone.sort((a, b) => (b.deliveryFee || 0) - (a.deliveryFee || 0));
    }
    return clone;
  }, [history, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex gap-6">
        {/* Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <DeliverySidebar />
        </div>

        {/* Main content */}
        <main className="flex-1">
          {/* Header */}
          <header className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500 font-semibold">
              History
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Delivery history (today)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              See a breakdown of all deliveries you&apos;ve completed today.
            </p>
          </header>

          {/* Loading state */}
          {loading && (
            <div className="mt-6 text-sm text-slate-500">
              Loading delivery history…
            </div>
          )}

          {!loading && (
            <>
              {/* Summary cards */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Truck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Trips completed</p>
                    <p className="text-xl font-bold text-slate-900">
                      {totals.totalTrips}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total distance</p>
                    <p className="text-xl font-bold text-slate-900">
                      {totals.totalDistance.toFixed(1)} km
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Earnings today</p>
                    <p className="text-xl font-bold text-slate-900">
                      ₹{totals.totalEarnings}
                    </p>
                  </div>
                </div>
              </section>

              {/* Controls + list */}
              <section>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Trip details
                  </h3>

                  {history.length > 0 && (
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-sm">
                      <ArrowUpDown className="w-4 h-4 text-slate-500" />
                      <button
                        className={`text-xs px-2 py-1 rounded-full ${
                          sortBy === "latest"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        onClick={() => setSortBy("latest")}
                      >
                        Latest
                      </button>
                      <button
                        className={`text-xs px-2 py-1 rounded-full ${
                          sortBy === "distance"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        onClick={() => setSortBy("distance")}
                      >
                        Distance
                      </button>
                      <button
                        className={`text-xs px-2 py-1 rounded-full ${
                          sortBy === "earnings"
                            ? "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                        onClick={() => setSortBy("earnings")}
                      >
                        Earnings
                      </button>
                    </div>
                  )}
                </div>

                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No history available yet for today.
                  </p>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                    {sortedHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            Trip #{idx + 1}
                          </span>
                          <span className="text-xs text-slate-500">
                            Distance: {item.distanceKm} km
                          </span>
                        </div>
                        <span className="font-semibold text-emerald-600">
                          +₹{item.deliveryFee}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DeliveryHistory;

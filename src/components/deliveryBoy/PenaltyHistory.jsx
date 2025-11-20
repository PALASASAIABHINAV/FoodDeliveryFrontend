import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { serverUrl } from "../../App";
import Navbar from "../common/Navbar";
import DeliverySidebar from "./DeliverySidebar";
import {
  AlertTriangle,
  ShieldX,
  TrendingDown,
  CalendarClock,
} from "lucide-react";

const PenaltyHistory = () => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPenalties();
  }, []);

  const loadPenalties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${serverUrl}/api/delivery/my-penalties`, {
        withCredentials: true,
      });
      setPenalties(res.data.penalties || []);
    } catch (err) {
      console.error("Penalty load error", err);
    } finally {
      setLoading(false);
    }
  };

  // Derived totals (frontend only, from same backend data)
  const stats = useMemo(() => {
    const count = penalties.length;
    const totalAmount = penalties.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    // newest penalty date (if createdAt exists)
    const lastDate = penalties.length
      ? penalties
          .map((p) => p.createdAt)
          .filter(Boolean)
          .sort((a, b) => new Date(b) - new Date(a))[0]
      : null;

    return { count, totalAmount, lastDate };
  }, [penalties]);

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
            <p className="text-[11px] uppercase tracking-[0.18em] text-rose-500 font-semibold">
              Safety & Performance
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Penalty overview
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track any penalties applied to your account. Drive safe to keep
              this list empty.
            </p>
          </header>

          {/* Loading state */}
          {loading && (
            <div className="mt-6 text-sm text-slate-500">
              Loading penalty history…
            </div>
          )}

          {!loading && (
            <>
              {/* Summary cards */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total penalties</p>
                    <p className="text-xl font-bold text-slate-900">
                      {stats.count}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Total deducted</p>
                    <p className="text-xl font-bold text-rose-600">
                      -₹{stats.totalAmount}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <ShieldX className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Last penalty</p>
                    <p className="text-xs font-medium text-slate-800">
                      {stats.lastDate
                        ? new Date(stats.lastDate).toLocaleString()
                        : "No penalties yet"}
                    </p>
                  </div>
                </div>
              </section>

              {/* List */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Penalty details
                  </h3>
                  {penalties.length === 0 ? null : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                      <CalendarClock className="w-3.5 h-3.5" />
                      Most recent at top
                    </span>
                  )}
                </div>

                {penalties.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 text-center">
                    <p className="text-sm font-semibold text-emerald-600">
                      No penalties so far 
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Keep following traffic and platform rules to maintain a
                      clean record.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                    {[...penalties]
                      .sort((a, b) => {
                        if (!a.createdAt || !b.createdAt) return 0;
                        return new Date(b.createdAt) - new Date(a.createdAt);
                      })
                      .map((p, i) => (
                        <div
                          key={i}
                          className="px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {p.reason || "Penalty applied"}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {p.createdAt
                                ? new Date(p.createdAt).toLocaleString()
                                : "Date not available"}
                            </p>
                          </div>
                          <p className="font-semibold text-rose-600 text-right">
                            -₹{p.amount}
                          </p>
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

export default PenaltyHistory;

import React, { useEffect } from "react";
import { Wallet, PiggyBank, Truck, AlertCircle } from "lucide-react";
import { useDeliveryStore } from "../../store/useDeliveryStore";
import Navbar from "../common/Navbar";
import DeliverySidebar from "./DeliverySidebar";

const DeliveryEarnings = () => {
  const { earnings, getMyEarnings, withdraw, loading } = useDeliveryStore();

  useEffect(() => {
    getMyEarnings();
  }, [getMyEarnings]);

  if (!earnings) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <p className="text-sm text-slate-500">Loading earnings…</p>
        </div>
      </div>
    );
  }

  // keep handler for future, but button is disabled for now
  const handleWithdraw = async () => {
    if (earnings.walletBalance <= 0) {
      alert("No money available to withdraw");
      return;
    }
    try {
      await withdraw(earnings.walletBalance);
      alert("Withdrawal request completed (dummy)");
    } catch (err) {
      alert("Withdraw failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 flex gap-6">
        {/* Sidebar (desktop) */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <DeliverySidebar />
        </div>

        {/* Main content */}
        <main className="flex-1">
          {/* Header */}
          <header className="mb-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500 font-semibold">
              Earnings
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              My delivery earnings
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track your wallet balance, today&apos;s income and completed trips.
            </p>
          </header>

          {/* Summary cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Wallet balance</p>
                <p className="text-xl font-bold text-slate-900">
                  ₹{earnings.walletBalance}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                <Truck className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Today&apos;s earnings</p>
                <p className="text-xl font-bold text-slate-900">
                  ₹{earnings.todayEarnings}
                </p>
                <p className="text-[11px] text-slate-400">
                  From {earnings.todayDeliveries.length} deliveries today
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Lifetime earnings</p>
                <p className="text-xl font-bold text-slate-900">
                  ₹{earnings.totalEarnings}
                </p>
              </div>
            </div>
          </section>

          {/* Withdraw notice + button (disabled for now) */}
          <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Withdrawals are not enabled yet
                  </p>
                  <p className="text-xs text-slate-500">
                    You can see your earnings and wallet balance, but withdrawing
                    money is currently disabled while we finish the payout
                    setup.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleWithdraw}
                disabled={true} // 🔒 always disabled for now
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-slate-200 text-slate-500 text-xs font-semibold cursor-not-allowed opacity-80"
              >
                Withdraw coming soon
              </button>
            </div>
          </section>

          {/* Today deliveries list */}
          <section>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              Today&apos;s delivery details
            </h3>

            {earnings.todayDeliveries.length === 0 ? (
              <p className="text-sm text-slate-500">
                No deliveries completed today.
              </p>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-100">
                {earnings.todayDeliveries.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between px-4 py-3 text-sm"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-800">
                        Trip #{i + 1}
                      </span>
                      <span className="text-xs text-slate-500">
                        Distance: {d.distanceKm} km
                      </span>
                    </div>
                    <span className="font-semibold text-emerald-600">
                      +₹{d.deliveryFee}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default DeliveryEarnings;

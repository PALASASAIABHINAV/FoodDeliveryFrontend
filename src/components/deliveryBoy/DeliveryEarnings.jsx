import { useEffect } from "react";
import { useDeliveryStore } from "../../store/useDeliveryStore";

const DeliveryEarnings = () => {
  const { earnings, getMyEarnings, withdraw, loading } = useDeliveryStore();

  useEffect(() => {
    getMyEarnings();
  }, []);

  if (!earnings) return <div className="p-6">Loading earnings…</div>;

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
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">My Earnings</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500 text-sm">Wallet Balance</p>
          <p className="text-2xl font-semibold">₹{earnings.walletBalance}</p>
        </div>

        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500 text-sm">Today Earnings</p>
          <p className="text-2xl font-semibold">₹{earnings.todayEarnings}</p>
        </div>

        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500 text-sm">Total Earnings</p>
          <p className="text-2xl font-semibold">₹{earnings.totalEarnings}</p>
        </div>
      </div>

      {/* Withdraw Button */}
      <button
        onClick={handleWithdraw}
        disabled={loading || earnings.walletBalance <= 0}
        className="px-5 py-2 bg-indigo-600 text-white rounded-lg shadow disabled:bg-gray-400"
      >
        Withdraw Wallet Balance
      </button>

      {/* Today's Deliveries */}
      <div className="mt-6">
        <h3 className="text-xl font-bold">Today’s Delivery Details</h3>

        {earnings.todayDeliveries.length === 0 ? (
          <p className="text-gray-500 mt-3">No deliveries completed today.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {earnings.todayDeliveries.map((d, i) => (
              <li
                key={i}
                className="bg-white p-4 rounded-lg shadow flex justify-between"
              >
                <span>{d.distanceKm} km</span>
                <span className="font-semibold text-green-700">
                  +₹{d.deliveryFee}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeliveryEarnings;

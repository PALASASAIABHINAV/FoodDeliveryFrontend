import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";

const DeliveryHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/delivery/my-earnings`, {
        withCredentials: true,
      });

      const deliveries = res.data.todayDeliveries || [];
      setHistory(deliveries);
    } catch (err) {
      console.error("History load failed", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Delivery History</h2>

      {history.length === 0 ? (
        <p className="text-gray-600">No history available yet.</p>
      ) : (
        <ul className="space-y-4">
          {history.map((item, idx) => (
            <li
              key={idx}
              className="bg-white p-4 shadow rounded-lg flex justify-between"
            >
              <span>{item.distanceKm} km</span>
              <span className="font-bold text-green-700">
                ₹{item.deliveryFee}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeliveryHistory;

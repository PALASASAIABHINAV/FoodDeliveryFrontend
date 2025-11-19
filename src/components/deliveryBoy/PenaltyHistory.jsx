import { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../../App";

const PenaltyHistory = () => {
  const [penalties, setPenalties] = useState([]);

  useEffect(() => {
    loadPenalties();
  }, []);

  const loadPenalties = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/delivery/my-penalties`, {
        withCredentials: true,
      });

      setPenalties(res.data.penalties || []);
    } catch (err) {
      console.error("Penalty load error", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-5">Penalty History</h2>

      {penalties.length === 0 ? (
        <p className="text-gray-500">No penalties so far 💪</p>
      ) : (
        <ul className="space-y-3">
          {penalties.map((p, i) => (
            <li
              key={i}
              className="bg-white p-4 rounded-lg shadow flex justify-between"
            >
              <span>{p.reason}</span>
              <span className="text-red-600 font-bold">-₹{p.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PenaltyHistory;

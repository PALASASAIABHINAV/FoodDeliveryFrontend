import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/common/Navbar";
import { serverUrl } from "../App";

const AdminOwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${serverUrl}/api/owner-verification/admin/requests?status=pending`,
        { withCredentials: true }
      );
      setRequests(res.data.requests || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this owner?")) return;
    try {
      await axios.put(
        `${serverUrl}/api/owner-verification/admin/requests/${id}/approve`,
        {},
        { withCredentials: true }
      );
      alert("Owner approved");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):") || "";
    const deleteUser = window.confirm(
      "Delete this owner user account from DB as well?"
    );
    try {
      await axios.put(
        `${serverUrl}/api/owner-verification/admin/requests/${id}/reject`,
        { reason, deleteUser },
        { withCredentials: true }
      );
      alert("Owner rejected");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4">Owner Verification Requests</h2>

        {loading ? (
          <p>Loading...</p>
        ) : requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {req.shopName}{" "}
                      <span className="text-sm text-gray-500">
                        ({req.city}, {req.state})
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600">
                      Owner: {req.owner?.fullName} ({req.owner?.email}) •{" "}
                      {req.phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      Address: {req.shopAddress}
                    </p>
                    {req.licenseNumber && (
                      <p className="text-sm text-gray-600">
                        License: {req.licenseNumber}
                      </p>
                    )}
                    {req.description && (
                      <p className="text-sm text-gray-700 mt-1">
                        Notes: {req.description}
                      </p>
                    )}
                  </div>

                  {req.licenseDoc?.url && (
                    <a
                      href={req.licenseDoc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      View Document
                    </a>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(req._id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(req._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOwnerRequests;

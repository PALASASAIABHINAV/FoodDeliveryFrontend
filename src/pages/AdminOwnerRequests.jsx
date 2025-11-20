// src/pages/AdminOwnerRequests.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { serverUrl } from "../App";
import {
  ShieldCheck,
  MapPin,
  Phone,
  FileText,
  Loader2,
  RefreshCcw,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";

const AdminOwnerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

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
      setActionLoadingId(id);
      await axios.put(
        `${serverUrl}/api/owner-verification/admin/requests/${id}/approve`,
        {},
        { withCredentials: true }
      );
      alert("Owner approved");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Reason for rejection (optional):") || "";
    const deleteUser = window.confirm(
      "Delete this owner user account from DB as well?"
    );
    try {
      setActionLoadingId(id);
      await axios.put(
        `${serverUrl}/api/owner-verification/admin/requests/${id}/reject`,
        { reason, deleteUser },
        { withCredentials: true }
      );
      alert("Owner rejected");
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + refresh */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-semibold">
            Owner verification
          </p>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            Pending owner requests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review restaurant details and approve only genuine ZentroEat
            partners.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCcw className="w-4 h-4" />
          )}
          <span>{loading ? "Refreshing…" : "Refresh list"}</span>
        </button>
      </header>

      {/* Info banner */}
      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 flex gap-3 items-start">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-amber-900">
          This section is for internal admin use only. Approvals grant owners
          access to create restaurants and list items on ZentroEat. Double-check
          license and contact details before approving.
        </p>
      </div>

      {/* Content */}
      {loading && !requests.length ? (
        <div className="flex items-center justify-center py-10">
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-500">Loading requests…</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center">
          <p className="text-sm font-semibold text-slate-800">
            No pending owner requests
          </p>
          <p className="text-xs text-slate-500 mt-1">
            New owner verification submissions will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 flex flex-col gap-3"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base sm:text-lg text-slate-900">
                        {req.shopName}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-600">
                        <MapPin className="w-3 h-3 text-emerald-500" />
                        {req.city}, {req.state}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1">
                      Submitted at:{" "}
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleString()
                        : "N/A"}
                    </p>

                    <p className="text-xs text-slate-600 mt-2">
                      {req.shopAddress}
                    </p>
                  </div>
                </div>

                {req.licenseDoc?.url && (
                  <a
                    href={req.licenseDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    <FileText className="w-4 h-4" />
                    View document
                  </a>
                )}
              </div>

              {/* Owner & contact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Owner</p>
                    <p className="text-slate-600">
                      {req.owner?.fullName || "Unknown"}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      {req.owner?.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Contact</p>
                    <p className="text-slate-600">
                      {req.phone || "Not provided"}
                    </p>
                    {req.licenseNumber && (
                      <p className="text-slate-500 text-[11px] mt-1">
                        License:{" "}
                        <span className="font-mono">
                          {req.licenseNumber}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">Notes</p>
                    <p className="text-slate-600 text-[11px]">
                      {req.description || "No additional notes from owner."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-1">
                <button
                  onClick={() => handleReject(req._id)}
                  disabled={actionLoadingId === req._id}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-rose-200 bg-rose-50 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                >
                  {actionLoadingId === req._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Reject
                </button>

                <button
                  onClick={() => handleApprove(req._id)}
                  disabled={actionLoadingId === req._id}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-xs font-semibold text-white hover:bg-emerald-600 shadow-sm disabled:opacity-60"
                >
                  {actionLoadingId === req._id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  Approve & activate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOwnerRequests;

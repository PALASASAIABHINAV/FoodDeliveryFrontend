// src/admin/AdminDashboard.jsx
import React from "react";
import {
  ShieldCheck,
  Users,
  AlertCircle,
  Wrench,
  Clock,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-500 font-semibold">
            Admin panel
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            ZentroEat Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage restaurant owners, approvals and internal controls.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5">
          <Wrench className="w-4 h-4 text-amber-600" />
          <span className="text-[11px] font-medium text-amber-800">
            Admin tools are under active development
          </span>
        </div>
      </header>

      {/* Summary cards – static for now (no extra backend calls) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Owner onboarding</p>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            Verification centre
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Use <span className="font-semibold">Owner Requests</span> page to
            approve or reject restaurant partners.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Users</p>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            Internal access only
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            More user management dashboards will be added here in a future
            update.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-500">Status</p>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-bold text-slate-900 mt-1">
            Online & monitoring
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            All admin endpoints are live. Some advanced analytics are still{" "}
            <span className="font-semibold">under construction</span>.
          </p>
        </div>
      </section>

      {/* Info panel */}
      <section className="bg-slate-900 rounded-2xl text-slate-50 p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -left-16 bottom-0 w-40 h-40 bg-emerald-400/15 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">Internal use only</p>
              <p className="text-[11px] text-slate-300 mt-1">
                The ZentroEat admin console is designed for internal
                administrators. Do not share access or approve unknown owners.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-800/80 border border-slate-700 px-4 py-3 text-[11px]">
            <p className="font-semibold text-emerald-300 mb-1">
              Quick tip for approvals
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300">
              <li>Verify license details match the restaurant name.</li>
              <li>Check contact number before approving.</li>
              <li>Use &ldquo;Reject&rdquo; with reason for unclear cases.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

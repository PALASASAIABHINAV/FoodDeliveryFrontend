// src/admin/AdminSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, ShieldCheck } from "lucide-react";

export default function AdminSidebar({ onLinkClick }) {
  const { pathname } = useLocation();

  const linkBase =
    "flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition font-medium";

  const linkClass = (path) =>
    pathname === path
      ? `${linkBase} bg-slate-900 text-slate-50 shadow-sm`
      : `${linkBase} text-slate-600 hover:bg-slate-100`;

  const handleClick = () => {
    if (onLinkClick) onLinkClick();
  };

  return (
    <aside className="h-[calc(100vh-4rem)] w-64 bg-white border-r border-slate-100 shadow-sm px-4 py-5 sticky top-16 z-20">
      {/* Brand / Title */}
      <div className="mb-5">
        <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-500 font-semibold">
          ZentroEat
        </p>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Admin Console
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          Internal tools – under active development.
        </p>
      </div>

      {/* Nav */}
      <nav className="space-y-1">
        <Link to="/admin" className={linkClass("/admin")} onClick={handleClick}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/admin/owner-requests"
          className={linkClass("/admin/owner-requests")}
          onClick={handleClick}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Owner Requests</span>
        </Link>

        {/* You can add more admin sections later using same pattern */}
      </nav>
    </aside>
  );
}

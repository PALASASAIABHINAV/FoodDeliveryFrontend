// src/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import AdminSidebar from "./AdminSidebar";
import { Menu } from "lucide-react";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar (same as rest of app) */}
      <Navbar />

      {/* Admin Shell */}
      <div className="flex flex-1 pt-16">
        {/* Sidebar – desktop */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Sidebar toggle – mobile */}
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="lg:hidden fixed top-20 left-3 z-40 inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 text-slate-50 shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Sidebar – mobile slide-in */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/40 z-30">
            <div className="absolute left-0 top-16 h-[calc(100%-4rem)] w-64">
              <AdminSidebar onLinkClick={() => setSidebarOpen(false)} />
            </div>
            <div
              className="w-full h-full"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 py-6 lg:ml-0">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

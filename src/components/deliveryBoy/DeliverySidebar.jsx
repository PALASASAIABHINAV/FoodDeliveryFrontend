import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Clock3,
  AlertTriangle,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Earnings", path: "/delivery/earnings", icon: Wallet },
  { label: "Delivery History", path: "/delivery/history", icon: Clock3 },
  { label: "Penalties", path: "/delivery/penalties", icon: AlertTriangle },
];

const DeliverySidebar = () => {
  const location = useLocation();

  const linkClass = (active) =>
    [
      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
      active
        ? "bg-emerald-500 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-50",
    ].join(" ");

  return (
    <aside className="bg-white/90 border border-slate-100 rounded-2xl shadow-sm p-4 sm:p-5 sticky top-24">
      {/* Header */}
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-500 font-semibold">
          Partner Panel
        </p>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
          Delivery Center
        </h2>
        <p className="text-[11px] text-slate-500 mt-1">
          Manage your trips, earnings and performance.
        </p>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1.5">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link key={path} to={path} className={linkClass(active)}>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50">
                <Icon
                  className={`w-4 h-4 ${
                    active ? "text-white" : "text-emerald-500"
                  }`}
                />
              </span>
              <span className="truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default DeliverySidebar;

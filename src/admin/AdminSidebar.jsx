import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const { pathname } = useLocation();

  const active = (path) =>
    pathname === path
      ? "bg-indigo-600 text-white"
      : "text-gray-700 hover:bg-gray-200";

  return (
    <aside className="w-64 bg-white h-screen shadow-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold">Admin Panel</h2>

      <nav className="flex flex-col gap-3">
        <Link to="/admin" className={active("/admin")}>
          Dashboard
        </Link>

        <Link to="/admin/owner-requests" className={active("/admin/owner-requests")}>
          Owner Requests
        </Link>

        {/* Add more routes later */}
      </nav>
    </aside>
  );
}

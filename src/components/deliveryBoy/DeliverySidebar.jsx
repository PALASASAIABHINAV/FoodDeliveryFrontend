import { Link, useLocation } from "react-router-dom";

const DeliverySidebar = () => {
  const location = useLocation();

  const linkClass = (path) =>
    location.pathname === path
      ? "bg-indigo-600 text-white px-4 py-2 rounded-lg"
      : "px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg";

  return (
    <aside className="w-60 bg-white h-screen shadow-lg p-6 space-y-4">
      <h2 className="text-xl font-bold">Delivery Panel</h2>

      <nav className="flex flex-col gap-2">
        <Link to="/" className={linkClass("/")}>
          Dashboard
        </Link>
        <Link to="/delivery/earnings" className={linkClass("/delivery/earnings")}>
          Earnings
        </Link>
        <Link to="/delivery/history" className={linkClass("/delivery/history")}>
          Delivery History
        </Link>
        <Link to="/delivery/penalties" className={linkClass("/delivery/penalties")}>
          Penalties
        </Link>
      </nav>
    </aside>
  );
};

export default DeliverySidebar;

import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();

  console.log("SIDEBAR USER:", user);

  const isAdmin =
    user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen p-4">
      <h1 className="text-xl font-bold text-accent mb-6">
        SecureGov
      </h1>

      <nav className="space-y-2">
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg text-sm ${
              isActive
                ? "bg-accent text-black font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Dashboard
        </NavLink>

        {/* Files */}
        <NavLink
          to="/files"
          className={({ isActive }) =>
            `block px-4 py-2 rounded-lg text-sm ${
              isActive
                ? "bg-accent text-black font-semibold"
                : "text-slate-300 hover:bg-slate-800"
            }`
          }
        >
          Files
        </NavLink>

        {/* 🔐 AUDIT LOGS — ADMIN & SUPER_ADMIN ONLY */}
        {isAdmin && (
          <NavLink
            to="/audit"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm ${
                isActive
                  ? "bg-accent text-black font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            Audit Logs
          </NavLink>
        )}

        {/* 🔐 USER MANAGEMENT — ADMIN & SUPER_ADMIN ONLY */}
        {isAdmin && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-lg text-sm ${
                isActive
                  ? "bg-accent text-black font-semibold"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            User Management
          </NavLink>
        )}
      </nav>
    </aside>
  );
}

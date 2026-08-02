import { useAuth } from "../context/AuthContext";



export default function Topbar() {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6">
      <span className="text-sm text-slate-400">
        Secure File Sharing System
      </span>

      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400">
          Role: {user?.role ?? "UNKNOWN"}
        </span>

        <button
          onClick={logout}
          className="text-xs px-3 py-1 bg-red-600 rounded-md"
        >
          Logout
        </button>
      </div>
    </header>
  );
}


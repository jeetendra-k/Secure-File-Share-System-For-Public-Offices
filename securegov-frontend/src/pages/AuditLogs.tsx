// src/pages/AuditLogs.tsx
import { useEffect, useState } from "react";
import { auditService, type AuditLog } from "../services/audit.service";
import { useAuth } from "../context/AuthContext";
import AuditRow from "../components/AuditRow";

const AuditLogs = () => {
  const { token, user } = useAuth();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    // ✅ CORRECT METHOD NAME + DATA HANDLING
    auditService
      .getLogs(token, limit)
      .then((data) => {
        setLogs(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Audit log fetch failed:", err);
        setError("Failed to load audit logs");
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [token, limit]);

  /* -------------------- STATES -------------------- */

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading audit logs…
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-400">
        {error}
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-2">
        Immutable Audit Trail
      </h1>

      <p className="text-gray-400 mb-6">
        Compliance-grade record of all secure operations.
      </p>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-4">
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="bg-black border border-gray-600 p-2 rounded text-white"
        >
          <option value={25}>Last 25</option>
          <option value={50}>Last 50</option>
          <option value={100}>Last 100</option>
        </select>

        <span className="text-sm text-gray-500">
          Logged in as: {user?.role}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-700 rounded">
        <table className="w-full">
          <thead className="bg-[#0b1220] border-b border-gray-700">
            <tr>
              <th className="p-3 text-left">Action</th>
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Resource</th>
              <th className="p-3 text-left">IP Address</th>
              <th className="p-3 text-left">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center text-gray-500"
                >
                  No audit records found
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;

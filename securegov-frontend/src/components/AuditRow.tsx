// src/components/AuditRow.tsx
import type { AuditLog } from "../services/audit.service";

const badge = (action: string) => {
  if (action.includes("DENIED")) return "bg-red-600";
  if (action.includes("DOWNLOAD")) return "bg-blue-600";
  if (action.includes("LOGIN")) return "bg-green-600";
  return "bg-gray-600";
};

const AuditRow = ({ log }: { log: AuditLog }) => {
  return (
    <tr className="border-t border-gray-700 text-sm">
      <td className="p-3">
        <span className={`px-2 py-1 rounded text-xs ${badge(log.action)}`}>
          {log.action}
        </span>
      </td>

      <td className="p-3">{log.user_id}</td>

      <td className="p-3 text-gray-400">{log.resource}</td>

      <td className="p-3 text-gray-400">{log.ip_address}</td>

      <td className="p-3 text-gray-400">
        {new Date(log.created_at).toLocaleString()}
      </td>
    </tr>
  );
};

export default AuditRow;

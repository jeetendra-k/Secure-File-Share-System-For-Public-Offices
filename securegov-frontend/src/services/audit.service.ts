// src/services/audit.service.ts
import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export interface AuditLog {
  id: number;
  user_id: number;
  action: string;
  resource: string;
  ip_address: string | null;
  created_at: string;
}

export const auditService = {
  async getLogs(token: string, limit: number = 25): Promise<AuditLog[]> {
    const res = await axios.get(
      `${API_BASE}/audit/logs?limit=${limit}`, // ✅ FIXED
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  },
};

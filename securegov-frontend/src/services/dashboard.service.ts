import axios from "axios";

/**
 * Base API URL
 * Backend must be running on this
 */
const API_BASE = "http://127.0.0.1:8000";

/**
 * Dashboard Service
 * Fetches metrics for Executive Dashboard
 */
export const dashboardService = {
  async getMetrics(token: string) {
    if (!token) {
      throw new Error("Missing auth token");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      /**
       * Fetch files + audit logs in parallel
       */
      const [filesRes, auditRes] = await Promise.all([
        axios.get(`${API_BASE}/files/`, { headers }),
        axios.get(`${API_BASE}/audit/logs?limit=25`, { headers }),
      ]);

      /**
       * Normalize responses
       */
      const files = Array.isArray(filesRes.data)
        ? filesRes.data
        : [];

      const audits = Array.isArray(auditRes.data)
        ? auditRes.data
        : [];

      return {
        totalFiles: files.length,
        recentAudits: audits.length,
      };
    } catch (error) {
      console.error("Dashboard metrics error:", error);

      /**
       * Fail-safe values
       */
      return {
        totalFiles: 0,
        recentAudits: 0,
      };
    }
  },
};


import { useEffect, useState } from "react";
import { dashboardService } from "../services/dashboard.service";
import { fileService } from "../services/file.service";
import { useAuth } from "../context/AuthContext";

/* =========================================================
   CONSTANTS (MATCH BACKEND EXACTLY)
========================================================= */
const TIERS = [
  "Public",
  "Internal",
  "Restricted",
  "Highly Confidential",
  "Secret",
  "Top Secret",
];

const COLORS: Record<string, string> = {
  Public: "bg-gray-500",
  Internal: "bg-slate-500",
  Restricted: "bg-blue-500",
  "Highly Confidential": "bg-purple-500",
  Secret: "bg-orange-500",
  "Top Secret": "bg-red-600",
};

/* =========================================================
   DASHBOARD
========================================================= */
const Dashboard = () => {
  const { token, user } = useAuth();

  const [metrics, setMetrics] = useState({
    totalFiles: 0,
    recentAudits: 0,
  });

  const [tierCounts, setTierCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        // 1️⃣ Metrics
        const metricsRes = await dashboardService.getMetrics(token);
        setMetrics(metricsRes);

        // 2️⃣ Files → Tier counts
        const filesRes = await fileService.getFiles(token);

        const counts: Record<string, number> = {};
        TIERS.forEach((tier) => (counts[tier] = 0));

        filesRes.data.forEach((file: any) => {
          if (counts[file.classification] !== undefined) {
            counts[file.classification]++;
          }
        });

        setTierCounts(counts);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 text-gray-400">
        Loading intelligence…
      </div>
    );
  }

  const maxValue = Math.max(...Object.values(tierCounts), 1);

  return (
    <div className="p-6 text-white">
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Executive Oversight</h1>
        <p className="text-gray-400">
          Clearance Level:{" "}
          <span className="font-semibold text-blue-400">
            {user?.role}
          </span>
        </p>
      </div>

      {/* ================= METRICS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="TOTAL RECORDS" value={metrics.totalFiles} />
        <MetricCard title="RECENT AUDIT EVENTS" value={metrics.recentAudits} />
        <MetricCard title="SECURITY STATUS" value="ACTIVE" highlight />
      </div>

      {/* ================= BAR CHART ================= */}
      <div className="mt-10 bg-[#0b1220] p-6 rounded-lg border border-gray-700">
        <h2 className="text-lg font-semibold mb-6">
          Record Distribution by Tier
        </h2>

        <div className="flex items-end gap-8 h-52">
          {TIERS.map((tier) => (
            <Bar
              key={tier}
              label={tier}
              value={tierCounts[tier]}
              max={maxValue}
              color={COLORS[tier]}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

const MetricCard = ({
  title,
  value,
  highlight,
}: {
  title: string;
  value: number | string;
  highlight?: boolean;
}) => (
  <div
    className={`p-6 rounded-lg border ${
      highlight
        ? "border-green-500 bg-green-900/20"
        : "border-gray-700 bg-[#0b1220]"
    }`}
  >
    <p className="text-sm text-gray-400">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const Bar = ({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) => {
  const height = (value / max) * 160;

  return (
    <div className="flex flex-col items-center group relative">
      {/* Tooltip */}
      <div className="absolute -top-8 hidden group-hover:block
                      bg-black text-white text-xs px-2 py-1 rounded">
        {value} file{value !== 1 ? "s" : ""}
      </div>

      {/* Bar */}
      <div
        className={`w-12 rounded transition-all duration-300 ${color}`}
        style={{ height }}
      />

      {/* Label */}
      <span className="text-xs mt-3 text-gray-400 text-center">
        {label}
      </span>
    </div>
  );
};

export default Dashboard;

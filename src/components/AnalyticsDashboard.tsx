import { useState } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ScanRecord {
  id: string;
  input_text: string;
  risk_score: number;
  risk_level: "safe" | "caution" | "danger";
  detected_indicators: { type: string; label: string; description: string; severity: string; match?: string; badge?: string }[];
  summary: string;
  created_at: string;
}

interface AnalyticsDashboardProps {
  history: ScanRecord[];
}

const COLORS = {
  danger: "#EF4444",
  caution: "#F59E0B",
  safe: "#22C55E",
  background: "#1e293b",
  card: "#334155",
  text: "#94A3B8",
};

export default function AnalyticsDashboard({ history }: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "all">("all");

  // Compute stats
  const stats = (() => {
    if (history.length === 0) {
      return { total: 0, danger: 0, caution: 0, safe: 0, avgRiskScore: 0 };
    }
    const filtered = selectedPeriod === "7d"
      ? history.filter((r) => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date > weekAgo;
        })
      : selectedPeriod === "30d"
        ? history.filter((r) => {
            const date = new Date(r.created_at);
            const now = new Date();
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return date > monthAgo;
          })
        : history;

    const danger = filtered.filter((r) => r.risk_level === "danger").length;
    const caution = filtered.filter((r) => r.risk_level === "caution").length;
    const safe = filtered.filter((r) => r.risk_level === "safe").length;
    const avgRiskScore = filtered.reduce((acc, r) => acc + r.risk_score, 0) / filtered.length;

    return {
      total: filtered.length,
      danger,
      caution,
      safe,
      avgRiskScore: Math.round(avgRiskScore * 10) / 10,
    };
  })();

  // Prepare data for line chart (scans over time)
  const lineChartData = (() => {
    if (history.length === 0) return [];
    const filtered = selectedPeriod === "7d"
      ? history.filter((r) => {
          const date = new Date(r.created_at);
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return date > weekAgo;
        })
      : selectedPeriod === "30d"
        ? history.filter((r) => {
            const date = new Date(r.created_at);
            const now = new Date();
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return date > monthAgo;
          })
        : history;

    const sorted = [...filtered].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    // Group by day
    const dailyMap = new Map<string, number>();
    sorted.forEach((r) => {
      const date = new Date(r.created_at);
      const key = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
    });

    return Array.from(dailyMap.entries()).map(([label, count]) => ({ label, count }));
  })();

  // Prepare data for doughnut chart (risk level breakdown)
  const doughnutData = [
    { name: "Danger", value: stats.danger, color: COLORS.danger },
    { name: "Caution", value: stats.caution, color: COLORS.caution },
    { name: "Safe", value: stats.safe, color: COLORS.safe },
  ];

  // Prepare data for bar chart (top categories)
  const barChartData = (() => {
    const categoryMap = new Map<string, number>();
    history.forEach((r) => {
      r.detected_indicators.forEach((ind) => {
        const cat = ind.type || "unknown";
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    });
    return Array.from(categoryMap.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  })();

  const dangerPercentage = stats.total > 0 ? (stats.danger / stats.total) * 100 : 0;
  const cautionPercentage = stats.total > 0 ? (stats.caution / stats.total) * 100 : 0;
  const safePercentage = stats.total > 0 ? (stats.safe / stats.total) * 100 : 0;

  return (
    <div className="glass rounded-2xl p-5 backdrop-blur-sm border border-slate-800/50">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-sm font-semibold text-white">Analytics Dashboard</h3>
        </div>
        <div className="flex gap-2">
          {(["7d", "30d", "all"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                selectedPeriod === period
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
              }`}
            >
              {period === "7d" ? "Last 7 days" : period === "30d" ? "Last 30 days" : "All time"}
            </button>
          ))}
        </div>
      </div>

      {stats.total === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <svg className="h-12 w-12 text-slate-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-sm text-slate-500">No scans yet. Start scanning to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="stat-card rounded-xl bg-slate-900/40 p-4">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-slate-500">Total Scans</p>
          </div>
          <div className="stat-card rounded-xl bg-red-500/10 p-4">
            <p className="text-2xl font-bold text-red-400">{stats.danger}</p>
            <p className="text-xs text-slate-500">Danger</p>
            <p className="text-xs text-red-400/70">{dangerPercentage.toFixed(1)}%</p>
          </div>
          <div className="stat-card rounded-xl bg-yellow-500/10 p-4">
            <p className="text-2xl font-bold text-yellow-400">{stats.caution}</p>
            <p className="text-xs text-slate-500">Caution</p>
            <p className="text-xs text-yellow-400/70">{cautionPercentage.toFixed(1)}%</p>
          </div>
          <div className="stat-card rounded-xl bg-green-500/10 p-4">
            <p className="text-2xl font-bold text-green-400">{stats.safe}</p>
            <p className="text-xs text-slate-500">Safe</p>
            <p className="text-xs text-green-400/70">{safePercentage.toFixed(1)}%</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Scans over time */}
        <div className="rounded-xl bg-slate-900/40 p-4">
          <h4 className="mb-3 text-xs font-semibold text-slate-400">Scans Over Time</h4>
          {lineChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineChartData}>
                <Line type="monotone" dataKey="count" stroke="#818CF8" strokeWidth={2} dot={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} />
                <Tooltip content={({ active, payload }) =>
                  active && payload && (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
                      <p className="font-semibold">{payload[0].value} scan{payload[0].value !== 1 ? "s" : ""}</p>
                      <p className="text-slate-500">{payload[0].name}</p>
                    </div>
                  )} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No data in this period.</p>
          )}
        </div>

        {/* Doughnut Chart - Risk breakdown */}
        <div className="rounded-xl bg-slate-900/40 p-4">
          <h4 className="mb-3 text-xs font-semibold text-slate-400">Risk Level Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={doughnutData}
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {doughnutData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={({ active, payload }) =>
                active && payload && (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
                    <p className="font-semibold">{payload[0].name}: {payload[0].value}</p>
                    <p className="text-slate-500">{payload[0].value !== undefined && stats.total > 0 ? ((payload[0].value as number) / stats.total * 100).toFixed(1) : 0}%</p>
                  </div>
                )} />
              <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: 10, fill: "#6B7280" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Top categories */}
        <div className="rounded-xl bg-slate-900/40 p-4 lg:col-span-2">
          <h4 className="mb-3 text-xs font-semibold text-slate-400">Top Scam Categories</h4>
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barChartData}>
                <Bar dataKey="value" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} />
                <Tooltip content={({ active, payload }) =>
                  active && payload && (
                    <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200">
                      <p className="font-semibold">{payload[0].value} detection{payload[0].value !== 1 ? "s" : ""}</p>
                      <p className="text-slate-500">{payload[0].name}</p>
                    </div>
                  )} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500">No category data.</p>
          )}
        </div>
      </div>
    </div>
  );
}

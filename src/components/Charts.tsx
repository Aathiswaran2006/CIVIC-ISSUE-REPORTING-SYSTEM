import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface ChartData {
  name: string;
  value: number;
}

interface MonthlyData {
  name: string;
  count: number;
  resolved: number;
}

interface AnalyticsChartsProps {
  byCategory: ChartData[];
  byDistrict: ChartData[];
  monthlyTrends: MonthlyData[];
  byPinCode: ChartData[];
  byPriority: ChartData[];
  dark?: boolean;
}

const COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#14b8a6", // teal
  "#f43f5e", // rose
];

export default function AnalyticsCharts({ 
  byCategory, 
  byDistrict, 
  monthlyTrends, 
  byPinCode, 
  byPriority, 
  dark = false 
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="analytics-charts-grid">
      {/* Category Distribution (Pie Chart) */}
      <div className={`p-4 rounded-xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`} id="chart-category-card">
        <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}>
          Complaints Distribution by Category
        </h3>
        <div className="h-64" id="chart-category-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byCategory.length > 0 ? byCategory : [{ name: "No Data", value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {byCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? "#1e293b" : "#ffffff",
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Volume (Bar Chart) */}
      <div className={`p-4 rounded-xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`} id="chart-district-card">
        <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}>
          Complaint Load by District
        </h3>
        <div className="h-64" id="chart-district-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDistrict} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="name" stroke={dark ? "#94a3b8" : "#64748b"} fontSize={10} />
              <YAxis stroke={dark ? "#94a3b8" : "#64748b"} fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? "#1e293b" : "#ffffff",
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                {byDistrict.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PIN Code Volume (Bar Chart) */}
      <div className={`p-4 rounded-xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`} id="chart-pincode-card">
        <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}>
          Complaint Load by PIN Code
        </h3>
        <div className="h-64" id="chart-pincode-container">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPinCode} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="name" stroke={dark ? "#94a3b8" : "#64748b"} fontSize={10} />
              <YAxis stroke={dark ? "#94a3b8" : "#64748b"} fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? "#1e293b" : "#ffffff",
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {byPinCode.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[(index + 4) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Severity (Pie Chart) */}
      <div className={`p-4 rounded-xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`} id="chart-priority-card">
        <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}>
          Grievance Severity Breakdown (Priority)
        </h3>
        <div className="h-64" id="chart-priority-container">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={byPriority.length > 0 ? byPriority : [{ name: "No Data", value: 1 }]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {byPriority.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.name === "Critical" ? "#ef4444" : 
                      entry.name === "High" ? "#f59e0b" : 
                      entry.name === "Medium" ? "#3b82f6" : 
                      "#10b981"
                    } 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? "#1e293b" : "#ffffff",
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
              <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Progress trends (Line Chart) */}
      <div className={`lg:col-span-2 p-4 rounded-xl border ${dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`} id="chart-monthly-card">
        <h3 className={`text-sm font-semibold mb-4 ${dark ? "text-slate-200" : "text-slate-700"}`}>
          Monthly Submission vs. Resolution Progress Rate
        </h3>
        <div className="h-72" id="chart-monthly-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrends} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? "#334155" : "#e2e8f0"} />
              <XAxis dataKey="name" stroke={dark ? "#94a3b8" : "#64748b"} />
              <YAxis stroke={dark ? "#94a3b8" : "#64748b"} />
              <Tooltip
                contentStyle={{
                  backgroundColor: dark ? "#1e293b" : "#ffffff",
                  borderColor: dark ? "#334155" : "#e2e8f0",
                  color: dark ? "#f8fafc" : "#0f172a",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" name="Issues Reported" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="resolved" name="Issues Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

import useSWR from "swr";
import Image from "next/image";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";

const fetcher = (url) => fetch(url).then((res) => res.json());

// Semester slug → display label mapping
const semesterLabels = {
  first: "1st", second: "2nd", third: "3rd", fourth: "4th",
  fifth: "5th", sixth: "6th", seventh: "7th", eighth: "8th",
};

// Color palette for charts
const COLORS = ["#14b8a6", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];

// Custom tooltip styling
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 shadow-xl">
        <p className="text-gray-300 text-xs font-semibold mb-1">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsTab() {
  const { data, error } = useSWR("/api/admin/analytics", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  });

  if (error) return <div className="text-red-400">Failed to load analytics.</div>;
  if (!data) return <div className="text-gray-400 animate-pulse flex justify-center items-center h-64">Loading advanced analytics...</div>;

  const {
    totalUsers, totalNotes, totalPending, totalViews,
    topViewedNotes, topContributors,
    notesPerSemester, dailyUploads, voteDistribution
  } = data.data;

  // Transform notesPerSemester for the bar chart
  const semesterChartData = (notesPerSemester || []).map((s) => ({
    name: semesterLabels[s._id] || s._id,
    notes: s.count,
    views: s.views
  }));

  // Pie chart data from semester distribution
  const pieData = (notesPerSemester || []).map((s) => ({
    name: semesterLabels[s._id] || s._id,
    value: s.count
  }));

  const StatCard = ({ title, value, icon, colorClass, trend }) => (
    <div className="p-5 rounded-2xl shadow-lg border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-between group hover:border-gray-600 transition-all duration-300">
      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-extrabold mt-1.5 text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
        {trend && <p className="text-xs text-teal-400 mt-1 font-medium">{trend}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorClass} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon="👥" colorClass="bg-blue-500/20 text-blue-400" />
        <StatCard title="Approved Notes" value={totalNotes} icon="📚" colorClass="bg-teal-500/20 text-teal-400" />
        <StatCard title="Total Views" value={totalViews} icon="👁️" colorClass="bg-purple-500/20 text-purple-400" />
        <StatCard title="Pending" value={totalPending} icon="⏳" colorClass="bg-yellow-500/20 text-yellow-400" />
      </div>

      {/* Charts Row 1: Upload Trend + Notes Per Semester */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Uploads Area Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <span className="text-teal-400">📈</span> Upload Trend (Last 7 Days)
          </h2>
          {dailyUploads && dailyUploads.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyUploads} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="uploadGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#4b5563" }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#4b5563" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Uploads" stroke="#14b8a6" strokeWidth={2.5} fillOpacity={1} fill="url(#uploadGradient)" dot={{ r: 4, fill: "#14b8a6", strokeWidth: 2, stroke: "#0f172a" }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No upload data available.</p>
          )}
        </div>

        {/* Notes Per Semester Bar Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <span className="text-indigo-400">📊</span> Notes by Semester
          </h2>
          {semesterChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={semesterChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#4b5563" }} />
                <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#4b5563" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="notes" name="Notes" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {semesterChartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No semester data available.</p>
          )}
        </div>
      </div>

      {/* Charts Row 2: Pie Chart + Vote Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Semester Distribution Pie Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <span className="text-amber-400">🍩</span> Semester Distribution
          </h2>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-gray-300 text-xs ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No data available.</p>
          )}
        </div>

        {/* Vote Distribution Bar Chart */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-xl p-5">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <span className="text-rose-400">👍</span> Votes on Top Notes
          </h2>
          {voteDistribution && voteDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={voteDistribution} layout="vertical" margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "#4b5563" }} allowDecimals={false} />
                <YAxis type="category" dataKey="title" tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} axisLine={{ stroke: "#4b5563" }} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="upvotes" name="Upvotes" fill="#14b8a6" radius={[0, 4, 4, 0]} maxBarSize={18} />
                <Bar dataKey="downvotes" name="Downvotes" fill="#ef4444" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-sm text-center py-12">No vote data available.</p>
          )}
        </div>
      </div>

      {/* Tables Row: Top Notes + Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Notes */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-gray-700/50">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🔥</span> Top 5 Most Viewed Notes
            </h2>
          </div>
          <div className="overflow-x-auto">
            {topViewedNotes.length === 0 ? (
              <p className="p-6 text-gray-400 text-center">No notes available yet.</p>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-gray-900/50 text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium hidden sm:table-cell">Subject</th>
                    <th className="px-5 py-3 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {topViewedNotes.map((note, idx) => (
                    <tr key={note._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 text-gray-500 font-mono text-xs">{idx + 1}</td>
                      <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate" title={note.title}>
                        {note.title}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell max-w-[150px] truncate" title={note.subject}>
                        {note.subject}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-teal-400">
                        {(note.views || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-gray-700/50">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>🏆</span> Top 5 Contributors
            </h2>
          </div>
          <div className="overflow-x-auto">
            {topContributors.length === 0 ? (
              <p className="p-6 text-gray-400 text-center">No contributors yet.</p>
            ) : (
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-gray-900/50 text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">User</th>
                    <th className="px-5 py-3 font-medium text-right">Notes Uploaded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {topContributors.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 flex items-center gap-3">
                        {user.image ? (
                          <Image src={user.image} alt={user.name} width={32} height={32} className="rounded-full ring-2 ring-gray-600 object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-white truncate max-w-[150px] sm:max-w-[200px]" title={user.name}>{user.name}</span>
                          <span className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[200px]" title={user.email}>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-teal-400">
                        {user.noteCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

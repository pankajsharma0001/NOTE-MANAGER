import useSWR from "swr";
import Image from "next/image";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AnalyticsTab() {
  const { data, error } = useSWR("/api/admin/analytics", fetcher, {
    revalidateOnFocus: false,
    refreshInterval: 60000, // Refresh every minute
  });

  if (error) return <div className="text-red-400">Failed to load analytics.</div>;
  if (!data) return <div className="text-gray-400 animate-pulse flex justify-center items-center h-64">Loading advanced analytics...</div>;

  const { totalUsers, totalNotes, totalPending, totalViews, topViewedNotes, topContributors } = data.data;

  const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`p-6 rounded-xl shadow-lg border border-gray-700 bg-gray-800 flex items-center justify-between`}>
      <div>
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-bold mt-2 text-white">{value}</p>
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${colorClass}`}>
        {icon}
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={totalUsers} icon="👥" colorClass="bg-blue-500/20 text-blue-400" />
        <StatCard title="Approved Notes" value={totalNotes} icon="📚" colorClass="bg-teal-500/20 text-teal-400" />
        <StatCard title="Total Views" value={totalViews} icon="👁️" colorClass="bg-purple-500/20 text-purple-400" />
        <StatCard title="Pending Approvals" value={totalPending} icon="⏳" colorClass="bg-yellow-500/20 text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Viewed Notes */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-gray-700 bg-gray-800/80">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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
                    <th className="px-5 py-3 font-medium">Title</th>
                    <th className="px-5 py-3 font-medium hidden sm:table-cell">Subject</th>
                    <th className="px-5 py-3 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {topViewedNotes.map((note) => (
                    <tr key={note._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 font-medium text-white max-w-[200px] truncate" title={note.title}>
                        {note.title}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell max-w-[150px] truncate" title={note.subject}>
                        {note.subject}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-teal-400">
                        {note.views}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
          <div className="p-5 border-b border-gray-700 bg-gray-800/80">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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

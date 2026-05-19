import { useState } from "react";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AdminsTab() {
  const { data, error, mutate } = useSWR("/api/admin/admins", fetcher);
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(null); // stores email of admin being deleted

  const admins = data?.data || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newEmail) return;

    setAdding(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      const d = await res.json();
      
      if (d.success) {
        setNewEmail("");
        mutate();
        alert("Admin added successfully!");
      } else {
        alert(d.message || "Failed to add admin");
      }
    } catch (err) {
      alert("An error occurred");
    }
    setAdding(false);
  };

  const handleDelete = async (email) => {
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) return;
    
    setDeleting(email);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const d = await res.json();
      
      if (d.success) {
        mutate();
      } else {
        alert(d.message || "Failed to remove admin");
      }
    } catch (err) {
      alert("An error occurred");
    }
    setDeleting(null);
  };

  if (error) return <div className="text-red-400">Failed to load admins.</div>;
  if (!data) return <div className="text-gray-400 animate-pulse">Loading admins...</div>;

  return (
    <div className="space-y-8">
      {/* Add Admin Form */}
      <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
          <span>➕</span> Add New Admin
        </h2>
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Enter admin's email address..."
            className="flex-1 bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="bg-teal-500 hover:bg-teal-400 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/20 whitespace-nowrap"
          >
            {adding ? "Adding..." : "Add Admin"}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-3">
          Users added here will have full administrative privileges on the platform, excluding the ability to manage other admins.
        </p>
      </div>

      {/* Admin List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>👥</span> Current Admins
          </h2>
        </div>
        
        {admins.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No dynamic admins have been added yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="text-xs uppercase bg-gray-900/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium hidden sm:table-cell">Added By</th>
                  <th className="px-6 py-4 font-medium hidden md:table-cell">Date Added</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {admin.email}
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      {admin.addedBy || "Unknown"}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-gray-400">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(admin.email)}
                        disabled={deleting === admin.email}
                        className="text-red-400 hover:text-red-300 font-medium transition-colors disabled:opacity-50"
                      >
                        {deleting === admin.email ? "Removing..." : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

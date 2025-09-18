import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function Approvals() {
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);

  useEffect(() => {
    fetch("/api/share/pending")
      .then(res => res.json())
      .then(data => {
        if (data.success) setPendingNotes(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleApprove = async (noteId) => {
    const res = await fetch(`/api/share/approve/${noteId}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      alert("Note approved successfully!");
      setPendingNotes(prev => prev.filter(note => note._id !== noteId));
      setSelectedNote(null);
    } else {
      alert("Failed to approve note.");
    }
  };

  const handleReject = async (noteId) => {
    const res = await fetch(`/api/share/reject/${noteId}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      alert("Note rejected successfully!");
      setPendingNotes(prev => prev.filter(note => note._id !== noteId));
      setSelectedNote(null);
    } else {
      alert("Failed to reject note.");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Pending Notes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : pendingNotes.length === 0 ? (
        <p>No pending notes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingNotes.map(note => (
            <div
              key={note._id}
              className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition"
              onClick={() => setSelectedNote(note)}
            >
              <h2 className="text-lg font-semibold">{note.title}</h2>
              <p className="text-gray-400 text-sm">{note.subject}</p>
              <p className="text-gray-500 text-xs">
                Uploaded by: {note.uploadedBy?.name || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Selected Note Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setSelectedNote(null)}
            >
              ✖
            </button>

            <h2 className="text-2xl font-bold mb-2">{selectedNote.title}</h2>
            <p className="text-gray-400 mb-2">Subject: {selectedNote.subject}</p>
            <p className="text-gray-400 mb-4">Semester: {selectedNote.semester}</p>
            <p className="text-gray-300 mb-4">{selectedNote.description}</p>
            {selectedNote.fileUrl && (
              <a
                href={selectedNote.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-400 underline mb-4 block"
              >
                View File
              </a>
            )}

            <div className="flex justify-between">
              <button
                onClick={() => handleApprove(selectedNote._id)}
                className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(selectedNote._id)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

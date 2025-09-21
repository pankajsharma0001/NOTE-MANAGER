import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Image from "next/image";

export default function Approvals() {
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  // Fetch pending notes
  useEffect(() => {
    fetch("/api/share/pending")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPendingNotes(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Approve note
  const handleApprove = async (noteId) => {
    const res = await fetch(`/api/share/approve/${noteId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert("Note approved successfully!");
      setPendingNotes((prev) => prev.filter((n) => n._id !== noteId));
      setSelectedNote(null);
    } else alert("Failed to approve note.");
  };

  // Reject note
  const handleReject = async (noteId) => {
    const res = await fetch(`/api/share/reject/${noteId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert("Note rejected successfully!");
      setPendingNotes((prev) => prev.filter((n) => n._id !== noteId));
      setSelectedNote(null);
    } else alert("Failed to reject note.");
  };

  // ESC closes profile popup
  const escHandler = useCallback((e) => {
    if (e.key === "Escape") setProfileModal(null);
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, [escHandler]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Pending Notes</h1>

      {loading ? (
        <p>Loading...</p>
      ) : pendingNotes.length === 0 ? (
        <p>No pending notes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingNotes.map((note) => (
            <div
              key={note._id}
              className="p-4 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700 transition"
            >
              {/* PROFILE (clickable only on name/email area) */}
              <div
                className="flex items-center mb-2 cursor-pointer hover:underline"
                onClick={() => setProfileModal(note.uploadedBy)}
              >
                <Image
                  src={note.uploadedBy?.image || "/default-avatar.png"}
                  alt={note.uploadedBy?.name || "User"}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover mr-3"
                />
                <div>
                  <p className="font-semibold">{note.uploadedBy?.name || "Unknown"}</p>
                  <p className="text-sm text-gray-400">
                    {note.uploadedBy?.email || "No email"}
                  </p>
                </div>
              </div>

              {/* NOTE DETAILS (click outside profile area) */}
              <div
                className="cursor-pointer"
                onClick={() => setSelectedNote(note)}
              >
                <h2 className="text-lg font-semibold">{note.title}</h2>
                <p className="text-gray-400 text-sm">Subject: {note.subject}</p>
                {note.semester && (
                  <p className="text-gray-400 text-sm">Semester: {note.semester}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NOTE DETAILS MODAL */}
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
            <p className="text-gray-400 mb-2">Semester: {selectedNote.semester}</p>
            <p className="text-gray-300 mb-4">{selectedNote.content}</p>
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

      {/* PROFILE POPUP */}
      {profileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div
            className="bg-gray-900 rounded-xl p-6 w-96 relative cursor-move"
            style={{
              position: "absolute",
              left: `calc(50% + ${dragOffset.x}px)`,
              top: `calc(50% + ${dragOffset.y}px)`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseDown={(e) => {
              setDragging(true);
              setDragOffset({
                x: e.clientX - window.innerWidth / 2 + dragOffset.x,
                y: e.clientY - window.innerHeight / 2 + dragOffset.y,
              });
            }}
            onMouseUp={() => setDragging(false)}
            onMouseMove={(e) => {
              if (!dragging) return;
              setDragOffset({
                x: e.clientX - window.innerWidth / 2,
                y: e.clientY - window.innerHeight / 2,
              });
            }}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => setProfileModal(null)}
            >
              ✖
            </button>

            <div className="flex flex-col items-center">
              <Image
                src={profileModal.image || "/default-avatar.png"}
                alt={profileModal.name || "User"}
                width={100}
                height={100}
                className="w-24 h-24 rounded-full object-cover mb-4"
              />
              <h2 className="text-2xl font-bold mb-2">{profileModal.name}</h2>
              <p className="text-gray-400 mb-2">{profileModal.email}</p>
              {profileModal.college && (
                <p className="text-gray-300">College: {profileModal.college}</p>
              )}
              {profileModal.semester && (
                <p className="text-gray-300">Semester: {profileModal.semester}</p>
              )}
              {profileModal.address && (
                <p className="text-gray-300">Address: {profileModal.address}</p>
              )}
              {profileModal.phone && (
                <p className="text-gray-300">Phone: {profileModal.phone}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

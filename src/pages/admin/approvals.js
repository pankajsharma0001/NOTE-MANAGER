import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import Image from "next/image";

export default function Approvals() {
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedNote, setEditedNote] = useState(null);
  const [profileModal, setProfileModal] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false); // Loading state for saving/editing

  const subjectsBySemester = {
    first: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"],
    second: ["Algebra & Geometry", "Applied Mechanics", "Basic Electrical and Electronics Engineering", "Civil Engineering Materials", "Civil Engineering Workshop", "Engineering Geology", "Introduction to Energy Engineering"],
    third: ["Building Technology", "Calculus II", "Fluid Mechanics", "Numerical Methods", "Strength of Materials", "Surveying I"],
    fourth: ["Engineering Economics", "Hydraulics", "Probability and Statistics", "Soil Mechanics", "Structural Analysis I", "Surveying II"],
    fifth: ["Engineering Hydrology", "Design of Steel and Timber Structure", "Foundation Engineering", "Structural Analysis II", "Transportation Engineering I", "Water Supply Engineering"],
    sixth: ["Civil Engineering Project I", "Concrete Technology & Masonry Structure", "Estimation and Valuation", "Elective I", "Irrigation and Dranage Engineering", "Sanitary Engineering", "Survey Field Project", "Transportation Engineering II"],
    seventh: ["Civil Engineering Project II", "Construction Project Management", "Design of R.C.C. Structure", "Elective II", "Engineering Professional Practice", "Hydropower Engineering"],
    eighth: ["Elective III", "Internship"],
  };

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

  const handleApprove = async (noteId) => {
    const res = await fetch(`/api/share/approve/${noteId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert("Note approved successfully!");
      setPendingNotes((prev) => prev.filter((n) => n._id !== noteId));
      setSelectedNote(null);
      setEditMode(false);
    } else alert("Failed to approve note.");
  };

  const handleReject = async (noteId) => {
    const res = await fetch(`/api/share/reject/${noteId}`, { method: "POST" });
    const data = await res.json();
    if (data.success) {
      alert("Note rejected successfully!");
      setPendingNotes((prev) => prev.filter((n) => n._id !== noteId));
      setSelectedNote(null);
      setEditMode(false);
    } else alert("Failed to reject note.");
  };

  const handleSaveEdit = async () => {
    setUploading(true);
    const formData = new FormData();
    formData.append("title", editedNote.title);
    formData.append("subject", editedNote.subject);
    formData.append("semester", editedNote.semester);
    formData.append("content", editedNote.content);
    if (editedNote.newFile) formData.append("file", editedNote.newFile);

    try {
      const res = await fetch(`/api/share/edit/${selectedNote._id}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("Note updated successfully!");
        setPendingNotes((prev) =>
          prev.map((n) => (n._id === selectedNote._id ? data.data : n))
        );
        setSelectedNote(data.data);
        setEditMode(false);
      } else alert("Failed to update note.");
    } catch (err) {
      alert("Error updating note.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const escHandler = useCallback((e) => {
    if (e.key === "Escape") {
      setProfileModal(null);
      setSelectedNote(null);
      setEditMode(false);
    }
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
                  <p className="text-sm text-gray-400">{note.uploadedBy?.email || "No email"}</p>
                </div>
              </div>

              <div className="cursor-pointer" onClick={() => setSelectedNote(note)}>
                <h2 className="text-lg font-semibold">{note.title}</h2>
                <p className="text-gray-400 text-sm">Subject: {note.subject}</p>
                {note.semester && <p className="text-gray-400 text-sm">Semester: {note.semester}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {profileModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div
          className="bg-gray-900 rounded-xl p-6 w-96 relative cursor-move"
          style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
          onMouseDown={(e) => {
            setDragging(true);
            setDragStart({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
          }}
          onMouseUp={() => setDragging(false)}
          onMouseMove={(e) => {
            if (!dragging) return;
            setDragOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
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
            {profileModal.college && <p className="text-gray-300">College: {profileModal.college}</p>}
            {profileModal.semester && <p className="text-gray-300">Semester: {profileModal.semester}</p>}
            {profileModal.address && <p className="text-gray-300">Address: {profileModal.address}</p>}
            {profileModal.phone && <p className="text-gray-300">Phone: {profileModal.phone}</p>}
          </div>
        </div>
      </div>
    )}

      {selectedNote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={() => { setSelectedNote(null); setEditMode(false); }}
            >✖</button>

            {editMode ? (
              <div className="flex flex-col space-y-4">
                <label className="text-gray-300 font-semibold">Title</label>
                <input
                  type="text"
                  value={editedNote.title}
                  onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />

                <label className="text-gray-300 font-semibold">Semester</label>
                <select
                  value={editedNote.semester || ""}
                  onChange={(e) => setEditedNote({ ...editedNote, semester: e.target.value, subject: "" })}
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select Semester</option>
                  {Object.keys(subjectsBySemester).map((sem) => (
                    <option key={sem} value={sem}>{sem.charAt(0).toUpperCase() + sem.slice(1)}</option>
                  ))}
                </select>

                <label className="text-gray-300 font-semibold">Subject</label>
                <select
                  value={editedNote.subject || ""}
                  onChange={(e) => setEditedNote({ ...editedNote, subject: e.target.value })}
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!editedNote.semester}
                >
                  <option value="">Select Subject</option>
                  {editedNote.semester &&
                    subjectsBySemester[editedNote.semester].map((subj) => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                </select>

                <label className="text-gray-300 font-semibold">Content</label>
                <textarea
                  value={editedNote.content}
                  onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
                  className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={4}
                />

                <label className="text-gray-300 font-semibold">Replace File (optional)</label>
                <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded inline-block text-white">
                  {editedNote.newFile ? editedNote.newFile.name : "Choose File"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setEditedNote({ ...editedNote, newFile: e.target.files[0] })}
                  />
                </label>

                {selectedNote.fileUrl && (
                  <a
                    href={selectedNote.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-400 underline mt-1"
                  >
                    View Current File
                  </a>
                )}

                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setEditMode(false)}
                    className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded transition flex items-center"
                    disabled={uploading}
                  >
                    {uploading && <span className="loader mr-2"></span>}
                    {uploading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                  <button onClick={() => handleApprove(selectedNote._id)} className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded">
                    Approve
                  </button>
                  <button onClick={() => handleReject(selectedNote._id)} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
                    Reject
                  </button>
                  <button onClick={() => { setEditedNote(selectedNote); setEditMode(true); }} className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded">
                    Modify
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Profile modal (draggable) remains unchanged */}

      <style jsx>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #4ade80;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </DashboardLayout>
  );
}

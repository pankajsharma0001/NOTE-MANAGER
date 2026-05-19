import { useEffect, useState } from "react";

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

export default function ManageNotesTab() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [editNote, setEditNote] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "", show: false });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type, show: true });
    setTimeout(() => setToast(p => ({ ...p, show: false })), 3500);
  };

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (semester) params.append("semester", semester);
        if (subject) params.append("subject", subject);
        const res = await fetch(`/api/admin/all-notes?${params}`);
        const data = await res.json();
        if (data.success) setNotes(data.data);
        else setNotes([]);
      } catch { setNotes([]); }
      setLoading(false);
    };

    fetchNotes();
  }, [semester, subject]);

  const openEdit = (note) => {
    setEditNote(note);
    setEditForm({ title: note.title, subject: note.subject, semester: note.semester, content: note.content || "", fileUrl: note.fileUrl || "" });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${editNote._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Note updated!");
        setNotes(prev => prev.map(n => n._id === editNote._id ? data.data : n));
        setEditNote(null);
        sessionStorage.removeItem("noteCountsCache");
      } else showToast(data.message || "Update failed", "error");
    } catch { showToast("Error updating note", "error"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${deleteId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("Note deleted!");
        setNotes(prev => prev.filter(n => n._id !== deleteId));
        setDeleteId(null);
        sessionStorage.removeItem("noteCountsCache");
      } else showToast("Delete failed", "error");
    } catch { showToast("Error deleting note", "error"); }
    setDeleting(false);
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select value={semester} onChange={e => { setSemester(e.target.value); setSubject(""); }}
          className="p-2 rounded bg-gray-700 text-white w-full sm:w-48">
          <option value="">All Semesters</option>
          {Object.keys(subjectsBySemester).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={subject} onChange={e => setSubject(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full sm:w-64" disabled={!semester}>
          <option value="">{semester ? "All Subjects" : "Select semester first"}</option>
          {semester && subjectsBySemester[semester]?.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-gray-400 self-center text-sm">{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Notes List */}
      {loading ? <p className="text-center text-gray-400">Loading...</p> : notes.length === 0 ? (
        <p className="text-center text-gray-400">No notes found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map(note => (
            <div key={note._id} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-750 transition group">
              <h3 className="font-semibold text-teal-400 truncate mb-1">{note.title}</h3>
              <p className="text-gray-400 text-sm truncate">Subject: {note.subject}</p>
              <p className="text-gray-400 text-sm">Semester: {note.semester}</p>
              {note.uploadedBy && <p className="text-gray-500 text-xs mt-1">By: {note.uploadedBy.name || note.uploadedBy.email}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => openEdit(note)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-3 py-1.5 rounded text-sm font-medium transition">Edit</button>
                <button onClick={() => setDeleteId(note._id)} className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded text-sm font-medium transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editNote && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md relative overflow-auto max-h-[90vh]">
            <button className="absolute top-2 right-3 text-gray-400 hover:text-white text-xl" onClick={() => setEditNote(null)}>✖</button>
            <h2 className="text-xl font-bold mb-4 text-teal-400">Edit Note</h2>
            <div className="flex flex-col gap-3">
              <label className="text-gray-300 text-sm font-semibold">Title</label>
              <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full" />
              <label className="text-gray-300 text-sm font-semibold">Semester</label>
              <select value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: e.target.value, subject: "" })}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full">
                <option value="">Select Semester</option>
                {Object.keys(subjectsBySemester).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
              <label className="text-gray-300 text-sm font-semibold">Subject</label>
              <select value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full" disabled={!editForm.semester}>
                <option value="">Select Subject</option>
                {editForm.semester && subjectsBySemester[editForm.semester]?.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label className="text-gray-300 text-sm font-semibold">Content</label>
              <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full" rows={3} />
              <label className="text-gray-300 text-sm font-semibold">File URL</label>
              <input type="text" value={editForm.fileUrl} onChange={e => setEditForm({ ...editForm, fileUrl: e.target.value })}
                className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full" />
              <div className="flex gap-2 mt-2 justify-end">
                <button onClick={() => setEditNote(null)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded font-medium disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm text-center">
            <p className="text-lg font-semibold mb-2">Delete this note?</p>
            <p className="text-gray-400 text-sm mb-4">This action cannot be undone. The note will also be removed from all users&apos; favorites.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white transition-all duration-500 z-50 ${toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"} ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
        {toast.msg}
      </div>
    </div>
  );
}

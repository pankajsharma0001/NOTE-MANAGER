import { useRouter } from "next/router";
import useSWR from "swr";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const fetcher = (url) => fetch(url).then((res) => res.json());

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

export default function NoteDetail() {
  const router = useRouter();
  const { semester, noteId } = router.query;
  const { data: session } = useSession();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const isAdmin = session?.user?.role === "admin";

  // Admin state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch note data
  const { data, error, mutate } = useSWR(noteId ? `/api/notes/${noteId}` : null, fetcher);
  const note = data?.data;

  // Mark note as read
  useEffect(() => {
    if (note && session) {
      fetch("/api/notes/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note._id, progress: 100 }),
      })
        .then(res => res.json())
        .then(data => { if (data.success) window.dispatchEvent(new Event("noteRead")); })
        .catch(err => console.error("Failed to mark note as read:", err));
    }
  }, [note, session]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (iframeRef.current?.requestFullscreen) { iframeRef.current.requestFullscreen(); setIsFullscreen(true); }
    } else {
      if (document.fullscreenElement) { document.exitFullscreen(); setIsFullscreen(false); }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleVote = async (action) => {
    if (!session?.user) {
      alert("Please login to vote");
      return;
    }
    
    try {
      const res = await fetch("/api/notes/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: note._id, action }),
      });
      const d = await res.json();
      if (d.success) {
        // Update local SWR cache
        const newUpvotes = d.hasUpvoted 
          ? [...(note.upvotes || []).filter(id => id !== session.user.id), session.user.id]
          : (note.upvotes || []).filter(id => id !== session.user.id);
        
        const newDownvotes = d.hasDownvoted 
          ? [...(note.downvotes || []).filter(id => id !== session.user.id), session.user.id]
          : (note.downvotes || []).filter(id => id !== session.user.id);

        mutate({ ...data, data: { ...note, upvotes: newUpvotes, downvotes: newDownvotes } }, false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin handlers
  const startEdit = () => {
    setEditForm({ title: note.title, subject: note.subject, semester: note.semester, content: note.content || "", fileUrl: note.fileUrl || "" });
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const d = await res.json();
      if (d.success) { mutate(); setEditing(false); alert("Note updated!"); }
      else alert(d.message || "Update failed");
    } catch { alert("Error updating note"); }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        sessionStorage.removeItem("noteCountsCache");
        alert("Note deleted!");
        router.push(`/notes/${semester}`);
      } else alert("Delete failed");
    } catch { alert("Error deleting note"); }
    setDeleting(false);
  };

  if (error) return <div>Failed to load</div>;
  if (!data || !session) return <div>Loading...</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white">
      {/* PDF viewer */}
      {note.fileUrl && (
        <div className="w-full lg:w-3/4 lg:h-screen flex-shrink-0 relative">
          <iframe ref={iframeRef} src={note.fileUrl} className="w-full h-full min-h-screen lg:min-h-0" style={{ border: "none" }}></iframe>
        </div>
      )}

      {/* Details panel */}
      <div className="w-full lg:w-1/4 bg-gray-800 p-4 lg:overflow-y-auto lg:h-screen flex-1">
        <div className="flex gap-2">
          <button onClick={() => router.back()}
            className="flex-1 lg:flex-none px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:from-teal-400 hover:to-blue-400 hover:scale-105 transition-all flex items-center gap-2 justify-center">
            <span className="text-lg">←</span><span className="font-medium">Back</span>
          </button>
          <button onClick={toggleFullscreen}
            className="hidden lg:flex px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-full shadow-lg hover:from-teal-400 hover:to-blue-400 hover:scale-105 transition-all items-center gap-2 justify-center"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {isFullscreen ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V15a2 2 0 01-2 2h-2.28a1 1 0 01-.956-.692l-1.498-4.493a1 1 0 01.502-1.21l2.257-1.13a11.04 11.04 0 00-5.516-5.516l-1.13 2.257a1 1 0 01-1.21.502l-4.493-1.498A1 1 0 014 9.72V4z"/></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M3 4a1 1 0 011-1h4a1 1 0 010 2H5.414l4.293 4.293a1 1 0 01-1.414 1.414L4 6.414V8a1 1 0 01-2 0V4zm12 0a1 1 0 01-1-1h-4a1 1 0 110-2h4a1 1 0 011 1v4a1 1 0 11-2 0V4zM4 16a1 1 0 011-1h4a1 1 0 110 2H5.414l4.293 4.293a1 1 0 11-1.414 1.414L4 17.414V16zm12 0a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z"/></svg>
            )}
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4 mt-4 text-teal-400">Note Details</h2>

        {/* Admin Edit Mode */}
        {editing ? (
          <div className="flex flex-col gap-3">
            <label className="text-gray-300 text-sm font-semibold">Title</label>
            <input type="text" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full" />
            <label className="text-gray-300 text-sm font-semibold">Semester</label>
            <select value={editForm.semester} onChange={e => setEditForm({ ...editForm, semester: e.target.value, subject: "" })}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full">
              <option value="">Select Semester</option>
              {Object.keys(subjectsBySemester).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
            <label className="text-gray-300 text-sm font-semibold">Subject</label>
            <select value={editForm.subject} onChange={e => setEditForm({ ...editForm, subject: e.target.value })}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full" disabled={!editForm.semester}>
              <option value="">Select Subject</option>
              {editForm.semester && subjectsBySemester[editForm.semester]?.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="text-gray-300 text-sm font-semibold">Content</label>
            <textarea value={editForm.content} onChange={e => setEditForm({ ...editForm, content: e.target.value })}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-teal-500 focus:outline-none w-full" rows={3} />
            <div className="flex gap-2 mt-2">
              <button onClick={() => setEditing(false)} className="flex-1 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-teal-500 hover:bg-teal-600 px-4 py-2 rounded font-medium transition disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {note.title && <p className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold min-w-[100px]">Title:</span><span className="ml-0 sm:ml-2">{note.title}</span></p>}
              {note.subject && <p className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold min-w-[100px]">Subject:</span><span className="ml-0 sm:ml-2">{note.subject}</span></p>}
              {note.semester && <p className="flex flex-col sm:flex-row sm:items-center"><span className="font-semibold min-w-[100px]">Semester:</span><span className="ml-0 sm:ml-2">{note.semester}</span></p>}
            </div>
            {note.content && <p className="mt-4 text-gray-300 break-words">{note.content}</p>}

            {/* Views & Votes */}
            <div className="flex items-center gap-6 mt-6 border-t border-gray-700 pt-4 text-gray-400">
              <div className="flex items-center" title="Views">
                <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                <span className="font-medium text-lg">{note.views || 0}</span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleVote("upvote")} 
                  className={`flex items-center hover:text-teal-400 transition-colors ${note.upvotes?.includes(session?.user?.id) ? 'text-teal-400' : ''}`}
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M2 20h4v-9H2v9zm20-8.5c0-1.1-.9-2-2-2h-6.3l.9-4.2.1-.3c0-.4-.2-.8-.4-1.1L13.2 3l-6.6 6.6c-.4.4-.6.9-.6 1.4v7c0 1.1.9 2 2 2h8.5c.8 0 1.5-.5 1.8-1.2l2.9-6.8c.1-.2.1-.5.1-.7v-1.5z"/></svg>
                  <span className="font-medium text-lg">{note.upvotes?.length || 0}</span>
                </button>
                <button 
                  onClick={() => handleVote("downvote")} 
                  className={`flex items-center hover:text-red-400 transition-colors ${note.downvotes?.includes(session?.user?.id) ? 'text-red-400' : ''}`}
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M22 4h-4v9h4V4zM2 12.5c0 1.1.9 2 2 2h6.3l-.9 4.2-.1.3c0 .4.2.8.4 1.1L10.8 21l6.6-6.6c.4-.4.6-.9.6-1.4v-7c0-1.1-.9-2-2-2H7.5c-.8 0-1.5.5-1.8 1.2l-2.9 6.8c-.1.2-.1.5-.1.7v1.5z"/></svg>
                  <span className="font-medium text-lg">{note.downvotes?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="flex gap-2 mt-4 border-t border-gray-700 pt-4">
                <button onClick={startEdit} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded font-medium transition">Edit</button>
                <button onClick={() => setShowDeleteConfirm(true)} className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium transition">Delete</button>
              </div>
            )}

            {/* Uploaded by */}
            {note.uploadedBy && (
              <div className="flex items-center mt-4 border-t border-gray-700 pt-4">
                <Image src={note.uploadedBy.image || "/default-avatar.png"} alt={note.uploadedBy.name || "User"} width={40} height={40} className="rounded-full mr-2 object-cover" />
                <div className="overflow-hidden">
                  <p className="text-gray-400 text-sm truncate">Uploaded by {note.uploadedBy.name || "Unknown"}</p>
                  {note.uploadedBy.email && <p className="text-gray-500 text-xs truncate">{note.uploadedBy.email}</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm text-center">
            <p className="text-lg font-semibold mb-2">Delete this note?</p>
            <p className="text-gray-400 text-sm mb-4">This cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-medium disabled:opacity-50">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

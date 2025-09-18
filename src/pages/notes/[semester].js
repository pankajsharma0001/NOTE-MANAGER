import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

export default function Semester() {
  const router = useRouter();
  const { semester } = router.query; // for example: "first"

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!semester) return;

    fetch(`/api/notes?semester=${semester}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotes(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [semester]);

  return (
    <DashboardLayout>
      <button
        onClick={() => router.back()}
        className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
      >
        ⬅ Back
      </button>

      <h1 className="text-3xl font-bold mb-6 capitalize">
        {semester?.toLowerCase()} Semester Notes
      </h1>

      {loading ? (
        <p>Loading notes...</p>
      ) : notes.length === 0 ? (
        <p>No notes found for this semester.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition"
              onClick={() => router.push(`/notes/${semester}/${note._id}`)}
            >
              <h2 className="text-lg font-semibold text-white">{note.title}</h2>
              {note.subject && <p className="text-gray-400 text-sm">{note.subject}</p>}
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

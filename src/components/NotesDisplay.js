import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";

// Placeholder for subjects by semester
const subjectsBySemester = {
  1: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"],
  2: ["Algebra & Geometry", "Applied Mechanics", "Basic Electrical and Electronics Engineering", "Civil Engineering Materials", "Civil Engineering Workshop", "Engineering Geology", "Introduction to Energy Engineering"],
  3: ["Building Technology", "Calculus II", "Fluid Mechanics", "Numerical Methods", "Strength of Materials", "Surveying I"],
  4: ["Engineering Economics", "Hydraulics", "Probability and Statistics", "Soil Mechanics", "Structural Analysis I", "Surveying II"],
  5: ["Engineering Hydrology", "Design of Steel and Timber Structure", "Foundation Engineering", "Structural Analysis II", "Transportation Engineering I", "Water Supply Engineering"],
  6: ["Civil Engineering Project I", "Concrete Technology & Masonry Structure", "Estimation and Valuation", "Elective I", "Irrigation and Dranage Engineering", "Sanitary Engineering", "Survey Field Project", "Transportation Engineering II"],
  7: ["Civil Engineering Project II", "Construction Project Management", "Design of R.C.C. Structure", "Elective II", "Engineering Professional Practice", "Hydropower Engineering"],
  8: ["Elective III", "Internship"],
};
  
export default function NotesDisplay({ semester }) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [notes, setNotes] = useState([]);

  // Select first subject by default when semester changes
  useEffect(() => {
    if (semester && subjectsBySemester[semester]?.length > 0) {
      setSelectedSubject(subjectsBySemester[semester][0]);
    } else {
      setSelectedSubject("");
    }
  }, [semester]);

  // Fetch notes based on semester and subject
  useEffect(() => {
    if (!semester || !selectedSubject) return;

    async function fetchNotes() {
      try {
        const res = await fetch(
          `/api/notes?semester=${semester}&subject=${encodeURIComponent(
            selectedSubject
          )}`
        );
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (err) {
        console.error(err);
        setNotes([]);
      }
    }

    fetchNotes();
  }, [semester, selectedSubject]);

  if (!semester) return <p className="text-center mt-4">Select a semester first</p>;

  return (
    <div className="flex space-x-4">
      {/* Sidebar: Subjects */}
      <div className="w-48 bg-gray-900 p-4 rounded-lg flex flex-col space-y-2">
        {subjectsBySemester[semester].map((subject) => (
          <button
            key={subject}
            className={`px-4 py-2 rounded text-left ${
              selectedSubject === subject
                ? "bg-teal-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => setSelectedSubject(subject)}
          >
            {subject}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.length > 0 ? (
          notes.map((note) => (
            <div
              key={note._id}
              className="bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-lg">{note.title}</h2>
              <p className="text-gray-300">{note.description}</p>
              <a
                href={note.fileUrl}
                target="_blank"
                className="text-teal-400 mt-2 inline-block"
              >
                View / Download
              </a>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full mt-4">
            No notes available for this subject
          </p>
        )}
      </div>
    </div>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

// Subjects by semester
const subjectsBySemester = {
  first: ["Applied Chemistry", "Applied Physics", "Calculus I", "Communication Techniques", "Computer Programming", "Engineering Drawing"],
  second: ["Algebra & Geometry", "Applied Mechanics", "Basic Electrical and Electronics Engineering", "Civil Engineering Materials", "Civil Engineering Workshop", "Engineering Geology", "Introduction to Energy Engineering"],
  third: ["Building Technology", "Calculus II", "Fluid Mechanics", "Numerical Methods", "Strength of Materials", "Surveying I"],
  fourth: ["Engineering Economics", "Hydraulics", "Probability and Statistics", "", "Soil Mechanics", "Structural Analysis I", "Surveying II"],
  fifth: ["Engineering Hydrology", "Design of Steel and Timber Structure", "Foundation Engineering", "Structural Analysis II", "Transportation Engineering I", "Water Supply Engineering"],
  sixth: ["Civil Engineering Project I", "Concrete Technology & Masonry Structure", "Estimation and Valuation", "Elective I", "Irrigation and Dranage Engineering", "Sanitary Engineering", "Survery Field Project", "Transportation Engineering II"],
  seventh: ["Civil Engineering Project II", "Construction Project Management", "Design of R.C.C. Structure", "Elective II", "Engineering Professional Practice", "Hydropower Engineering"],
  eighth: ["Elective III", "Internship"],
};

export default function Semester() {
  const router = useRouter();
  const { semester } = router.query;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");

  // Select first subject by default
  useEffect(() => {
    if (semester && subjectsBySemester[semester]?.length > 0) {
      setSelectedSubject(subjectsBySemester[semester][0]);
    }
  }, [semester]);

  // Fetch notes for selected subject
  useEffect(() => {
    if (!semester || !selectedSubject) return;

    setLoading(true);
    fetch(`/api/notes?semester=${semester}&subject=${encodeURIComponent(selectedSubject)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNotes(data.data);
        else setNotes([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [semester, selectedSubject]);

  if (!semester) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <button
        onClick={() => router.back()}
        className="mb-4 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
      >
        ⬅ Back
      </button>

      <h1 className="text-3xl font-bold mb-6 capitalize">{semester} Semester Notes</h1>

      <div className="flex space-x-4">
        {/* Sidebar: Subjects */}
        <div className="w-48 bg-gray-900 p-4 rounded-lg flex flex-col space-y-2 overflow-y-auto max-h-[80vh] sticky top-20">
          {subjectsBySemester[semester]?.map((subject) => (
            <button
              key={subject}
              className={`px-4 py-2 rounded text-left transition-all duration-300 transform ${
                selectedSubject === subject
                  ? "bg-teal-500 text-white shadow-lg scale-105"
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
          {loading ? (
            <p>Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="col-span-full">No notes found for this subject.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                className="p-4 bg-gray-800 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition"
                onClick={() => router.push(`/notes/${semester}/${note._id}`)}
              >
                <h2 className="text-lg font-semibold text-white">{note.title}</h2>
                {note.subject && <p className="text-gray-400 text-sm">{note.subject}</p>}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

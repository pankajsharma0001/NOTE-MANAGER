import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

// Subjects by semester
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

export default function Semester() {
  const router = useRouter();
  const { semester } = router.query;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [userFavorites, setUserFavorites] = useState([]); // array of noteIds

  // Fetch user favorites
  useEffect(() => {
    fetch("/api/favorites/get")
      .then(res => res.json())
      .then(data => {
        if (data.success) setUserFavorites(data.favorites.map(f => f.noteId));
      });
  }, []);

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
      .then(res => res.json())
      .then(data => {
        if (data.success) setNotes(data.data);
        else setNotes([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [semester, selectedSubject]);

  const toggleFavorite = async (noteId) => {
    const res = await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, semester }),
    });
    const data = await res.json();
    if (data.success) {
      if (userFavorites.includes(noteId)) {
        setUserFavorites(userFavorites.filter(id => id !== noteId));
      } else {
        setUserFavorites([...userFavorites, noteId]);
      }
    }
  };

  if (!semester) return <p>Loading...</p>;

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-160px)]">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gray-900 p-4 flex items-center space-x-4 shadow-md">
          <button
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg"
          >
            ⬅ Back
          </button>
          <h1 className="text-2xl font-bold capitalize">{semester} Semester Notes</h1>
        </div>

        <div className="flex flex-1 space-x-4 overflow-hidden mt-4">
          {/* Sidebar */}
          <div className="w-48 bg-gray-900 p-4 rounded-lg flex flex-col space-y-2 overflow-y-auto">
            {subjectsBySemester[semester]?.map(subject => (
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

          {/* Notes Section */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900 p-2">
            {loading ? (
              <p>Loading notes...</p>
            ) : notes.length === 0 ? (
              <p>No notes found for this subject.</p>
            ) : (
              notes.map(note => {
                const isFav = userFavorites.includes(note._id);
                return (
                  <div
                    key={note._id}
                    className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-4 rounded-xl shadow-lg hover:scale-105 transition cursor-pointer"
                    onClick={() => router.push(`/notes/${semester}/${note._id}`)}
                  >
                    {/* Favorite toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(note._id);
                      }}
                      className={`absolute top-2 right-2 text-2xl z-10 ${
                        isFav ? "text-yellow-400" : "text-gray-400 hover:text-yellow-300"
                      }`}
                    >
                      {isFav ? "★" : "☆"}
                    </button>

                    {/* Only Title and Content */}
                    <h2 className="text-lg font-semibold mb-1 text-teal-400 truncate line-clamp-1">
                      {note.title || "Untitled Note"}
                    </h2>
                    <p className="text-gray-300 text-sm line-clamp-3">
                      {note.content || note.description || "No content available"}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

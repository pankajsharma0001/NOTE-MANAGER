import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";

export default function SemesterNotes() {
  const router = useRouter();
  const { semester } = router.query;

  const semesterNames = {
    first: "First Semester",
    second: "Second Semester",
    third: "Third Semester",
    fourth: "Fourth Semester",
    fifth: "Fifth Semester",
    sixth: "Sixth Semester",
    seventh: "Seventh Semester",
    eighth: "Eighth Semester",
  };

  const semesterName = semesterNames[semester] || "Semester";

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/notes")}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-teal-400 hover:text-gray-900 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold ml-4">{semesterName}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2 text-teal-400">{semesterName} Notes</h2>
          <p className="text-gray-400">All notes for {semesterName} will appear here. You can replace this with real content.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

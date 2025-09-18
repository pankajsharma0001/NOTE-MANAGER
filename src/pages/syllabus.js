import DashboardLayout from "../components/DashboardLayout";
import { useRouter } from "next/router";

export default function Syllabus() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-teal-400 hover:text-gray-900 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold ml-4">Syllabus</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2 text-teal-400">Your Syllabus</h2>
          <p className="text-gray-400">View your syllabus for all semesters here.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

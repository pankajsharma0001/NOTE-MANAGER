import DashboardLayout from "../components/DashboardLayout";
import { useRouter } from "next/router";

export default function Syllabus() {
  const router = useRouter();

  return (
    <DashboardLayout>
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold ml-4">Syllabus</h1>
      </div>
      <p className="text-gray-400">View your syllabus for all semesters here.</p>
    </DashboardLayout>
  );
}

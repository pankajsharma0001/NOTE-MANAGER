import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Syllabus() {
  const { data: session } = useSession();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [greeting, setGreeting] = useState("");

  // 🌅 Dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon ☕");
    else setGreeting("Good Evening 🌙");
  }, []);

  const thirdSemesterSubjects = [
    {
      code: "ARC 150",
      name: "Building Technology",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details:
        "Covers building materials, foundations, walls, floors, and structural systems used in construction engineering.",
      pages: [1, 4],
    },
    {
      code: "MTH 210",
      name: "Calculus II",
      examType: "Theory",
      theory: 100,
      practical: 0,
      total: 100,
      details:
        "Advanced calculus applications including integration techniques, differential equations, and vector calculus.",
      pages: [5, 8],
    },
    {
      code: "WRE 212",
      name: "Fluid Mechanics",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details:
        "Covers fluid properties, pressure, flow measurement, and fluid statics/dynamics fundamental to hydraulic systems.",
      pages: [9, 13],
    },
    {
      code: "MTH 252",
      name: "Numerical Methods",
      examType: "Theory",
      theory: 100,
      practical: 0,
      total: 100,
      details:
        "Techniques for solving engineering problems using iterative and computational numerical methods.",
      pages: [14, 18],
    },
    {
      code: "STR 210",
      name: "Materials",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details:
        "Studies the physical and mechanical properties of civil engineering materials such as concrete, steel, and timber.",
      pages: [19, 23],
    },
    {
      code: "CVL 216",
      name: "Surveying I",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details:
        "Principles and techniques of land surveying, including levelling, traversing, and distance measurement.",
      pages: [24, 28],
    },
  ];

  const pdfUrl = "/Civil_3rd_Sem_Syllabus_New.pdf";

  const semesters = [
    "First Semester",
    "Second Semester",
    "Third Semester",
    "Fourth Semester",
    "Fifth Semester",
    "Sixth Semester",
    "Seventh Semester",
    "Eighth Semester",
  ];

  const router = useRouter();

  const sidebarItems = [
    { icon: "🏠", label: "Home", path: "/dashboard" },
    { icon: "📁", label: "Notes", path: "/notes" },
    { icon: "⭐", label: "Favorites", path: "/favorites" },
    { icon: "📖", label: "Syllabus", path: "/syllabus" },
    { icon: "🔗", label: "Share", path: "/share" },
  ];

  return (
    <div className="flex bg-gray-900 text-gray-100">
      {/* ✅ Fixed Sidebar */}
      <aside className="w-20 bg-gray-950 text-white flex flex-col items-center py-6 space-y-6 fixed h-full">
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative w-full flex flex-col items-center">
            <button
              className="p-3 rounded-lg hover:bg-gray-800 transition relative z-10"
              onClick={() => router.push(item.path)}
            >
              <span role="img" aria-label={item.label}>
                {item.icon}
              </span>
            </button>
            <span className="text-xs mt-1">{item.label}</span>
          </div>
        ))}
      </aside>

      {/* ✅ Scrollable Content */}
      <main className="flex-1 ml-20 overflow-y-auto h-screen p-6">
        <div className="max-w-6xl mx-auto">
          {/* Greeting */}
          <div className="mb-8">
            <h2 className="text-gray-400 text-lg">{greeting}</h2>
            <h1 className="text-3xl font-bold text-white">
              Welcome,{" "}
              <span className="text-teal-400">
                {session?.user?.name?.toUpperCase() || "Student"}
              </span>
            </h1>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-6 text-white">
            Course Structure for Bachelor’s Degree in Civil Engineering
          </h1>

          {semesters.map((semester, index) => (
            <div key={index} className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-300">
                {semester}
              </h2>

              {semester === "Third Semester" ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-gray-700 text-left">
                        <th className="px-4 py-3">SUBJECT CODE</th>
                        <th className="px-4 py-3">SUBJECT NAME</th>
                        <th className="px-4 py-3">EXAM TYPE</th>
                        <th className="px-4 py-3">THEORY</th>
                        <th className="px-4 py-3">PRACTICAL</th>
                        <th className="px-4 py-3">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {thirdSemesterSubjects.map((subj, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition"
                          onClick={() => setSelectedSubject(subj)}
                        >
                          <td className="px-4 py-3">{subj.code}</td>
                          <td className="px-4 py-3 text-teal-400 hover:underline">
                            {subj.name}
                          </td>
                          <td className="px-4 py-3">{subj.examType}</td>
                          <td className="px-4 py-3">{subj.theory}</td>
                          <td className="px-4 py-3">{subj.practical}</td>
                          <td className="px-4 py-3">{subj.total}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-700">
                        <td className="px-4 py-3" colSpan="5">
                          Total Marks
                        </td>
                        <td className="px-4 py-3">
                          {thirdSemesterSubjects.reduce(
                            (sum, subj) => sum + subj.total,
                            0
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-3 text-sm">
                    <a
                      href={pdfUrl}
                      download
                      className="text-teal-400 hover:underline"
                    >
                      📥 Download Full Syllabus (PDF)
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">Syllabus coming soon...</p>
              )}
            </div>
          ))}

          {/* ✅ Subject Modal (Details Only, No PDF Preview) */}
          {selectedSubject && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full relative shadow-lg">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                  onClick={() => setSelectedSubject(null)}
                >
                  ✕
                </button>

                <h2 className="text-2xl font-bold text-teal-400 mb-3">
                  {selectedSubject.name}
                </h2>
                <p className="text-gray-300 mb-2">
                  <strong>Code:</strong> {selectedSubject.code}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Exam Type:</strong> {selectedSubject.examType}
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Theory:</strong> {selectedSubject.theory} Marks
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Practical:</strong> {selectedSubject.practical} Marks
                </p>
                <p className="text-gray-300 mb-2">
                  <strong>Total:</strong> {selectedSubject.total} Marks
                </p>
                <p className="text-gray-400 mt-3">
                  {selectedSubject.details}
                </p>
                <p className="text-gray-500 mt-2 text-sm">
                  (Refer pages {selectedSubject.pages[0]}–{selectedSubject.pages[1]} in PDF)
                </p>

                <a
                  href={pdfUrl}
                  download
                  className="mt-4 block text-center px-4 py-2 bg-teal-400 text-gray-900 font-semibold rounded-lg hover:bg-teal-500 transition"
                >
                  📥 Download Full PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

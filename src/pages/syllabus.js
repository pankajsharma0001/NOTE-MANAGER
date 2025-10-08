import { useState } from "react";

export default function Syllabus() {
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Sample 3rd semester data (you can update with exact subjects from your PDF)
  const thirdSemesterSubjects = [
    {
      code: "ARC 150",
      name: " Building Technology",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details: "Advanced mathematics topics applied to civil engineering problems.",
    },
    {
      code: "MTH 210",
      name: " Calculus II",
      examType: "Theory",
      theory: 100,
      practical: 0,
      total: 100,
      details: "Study of geological structures, materials, and their applications in engineering.",
    },
    {
      code: "WRE 212",
      name: "Fluid Mechanics",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details: "Introduction to fluid properties, pressure, flow, and hydraulics fundamentals.",
    },
    {
      code: "MTH 252",
      name: "Numerical methods",
      examType: "Theory",
      theory: 100,
      practical: 0,
      total: 100,
      details: "Covers stress, strain, torsion, and bending in engineering materials.",
    },
    {
      code: "STR 210",
      name: "Materials",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details: "Principles and techniques of land surveying, levelling, and mapping.",
    },
    {
      code: "CVL 216",
      name: "Surveying I ",
      examType: "Both",
      theory: 80,
      practical: 20,
      total: 100,
      details: "Principles and techniques of land surveying, levelling, and mapping.",
    },
  ];

  const pdfUrl = "/Civil 3rd Sem Syllabus New.pdf"; // place your file in the `public/` folder

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

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-white">
          Course Structure For Bachelor’s Degree In Civil Engineering
        </h1>

        {semesters.map((semester, index) => (
          <div key={index} className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">
              {semester}
            </h2>

            {/* Show only 3rd semester table */}
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
                    Civil_3rd_Sem_Syllabus.pdf
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                Syllabus coming soon...
              </p>
            )}
          </div>
        ))}

        {/* Modal for subject details */}
        {selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full relative">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                onClick={() => setSelectedSubject(null)}
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-teal-400 mb-3">
                {selectedSubject.name}
              </h2>
              <p className="text-gray-300 mb-3">
                <strong>Code:</strong> {selectedSubject.code}
              </p>
              <p className="text-gray-300 mb-3">
                <strong>Exam Type:</strong> {selectedSubject.examType}
              </p>
              <p className="text-gray-400 mb-4">{selectedSubject.details}</p>
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center px-4 py-2 bg-teal-400 text-gray-900 font-semibold rounded-lg hover:bg-teal-500 transition"
              >
                📥 Download PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

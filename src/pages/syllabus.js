import { useState } from "react";
import { syllabusData } from "../syllabus";
import DashboardLayout from "../components/DashboardLayout";

export default function Syllabus() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const semesters = Object.keys(syllabusData);

  return (
    <DashboardLayout>
      <div className="w-full overflow-x-auto p-4">
        <div className="max-w-[2000px] mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-white">
            Course Structure for Bachelor&apos;s Degree in Civil Engineering
          </h1>

          {semesters.map((semester, index) => {
            const semData = syllabusData[semester];

            return (
              <div key={index} className="mb-10">
                <h2 className="text-xl font-semibold mb-4 text-gray-300">{semester}</h2>

                {semData ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full bg-gray-800 rounded-lg overflow-hidden">
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
                        {semData.subjects.map((subj, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition"
                            onClick={() => setSelectedSubject(subj)}
                          >
                            <td className="px-4 py-3">{subj.code}</td>
                            <td className="px-4 py-3 text-teal-400 hover:underline">{subj.name}</td>
                            <td className="px-4 py-3">{subj.examType}</td>
                            <td className="px-4 py-3">{subj.theory}</td>
                            <td className="px-4 py-3">{subj.practical}</td>
                            <td className="px-4 py-3">{subj.total}</td>
                          </tr>
                        ))}
                        <tr className="font-semibold bg-gray-700">
                          <td colSpan="5" className="px-4 py-3">Total Marks</td>
                          <td className="px-4 py-3">
                            {semData.subjects.reduce((sum, subj) => sum + subj.total, 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="mt-3 text-sm">
                      <a href={semData.pdfUrl} download className="text-teal-400 hover:underline">
                        📥 Download Full Syllabus (PDF)
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Syllabus coming soon...</p>
                )}
              </div>
            );
          })}

          {/* Subject Modal */}
          {selectedSubject && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full relative shadow-lg">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-white text-xl"
                  onClick={() => setSelectedSubject(null)}
                >
                  ✕
                </button>
                <h2 className="text-2xl font-bold text-teal-400 mb-3">{selectedSubject.name}</h2>
                <p className="text-gray-300 mb-2"><strong>Code:</strong> {selectedSubject.code}</p>
                <p className="text-gray-300 mb-2"><strong>Exam Type:</strong> {selectedSubject.examType}</p>
                <p className="text-gray-300 mb-2"><strong>Theory:</strong> {selectedSubject.theory} Marks</p>
                <p className="text-gray-300 mb-2"><strong>Practical:</strong> {selectedSubject.practical} Marks</p>
                <p className="text-gray-300 mb-2"><strong>Total:</strong> {selectedSubject.total} Marks</p>
                <p className="text-gray-400 mt-3">{selectedSubject.details}</p>
                <p className="text-gray-500 mt-2 text-sm">
                  (Refer pages {selectedSubject.pages[0]}–{selectedSubject.pages[1]} in PDF)
                </p>
                <a
                  href={syllabusData[
                    Object.keys(syllabusData).find((s) =>
                      syllabusData[s].subjects.includes(selectedSubject)
                    )
                  ]?.pdfUrl}
                  download
                  className="mt-4 block text-center px-4 py-2 bg-teal-400 text-gray-900 font-semibold rounded-lg hover:bg-teal-500 transition"
                >
                  📥 Download Full PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

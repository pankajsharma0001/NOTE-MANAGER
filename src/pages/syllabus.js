import { useState } from "react";
import { syllabusData } from "../syllabus";
import DashboardLayout from "../components/DashboardLayout";

export default function Syllabus() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const semesters = Object.keys(syllabusData);

  return (
    <DashboardLayout>
      <div className="w-full p-4 sm:p-6">
        {semesters.map((semester, index) => {
          const semData = syllabusData[semester];

          return (
            <div key={index} className="mb-12">
              <h2 className="text-2xl font-semibold mb-5 text-gray-300">
                {semester}
              </h2>

              {semData ? (
                <div className="bg-gray-800 rounded-xl w-full overflow-hidden">
                  {/* ✅ Responsive Table Container */}
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-center text-sm md:text-base">
                      <thead className="bg-gray-700 text-sm md:text-base">
                        <tr>
                          <th className="px-3 py-2 md:px-4 md:py-3">SUBJECT CODE</th>
                          <th className="px-3 py-2 md:px-4 md:py-3">SUBJECT NAME</th>
                          <th className="px-3 py-2 md:px-4 md:py-3">EXAM TYPE</th>
                          <th className="px-3 py-2 md:px-4 md:py-3">THEORY</th>
                          <th className="px-3 py-2 md:px-4 md:py-3">PRACTICAL</th>
                          <th className="px-3 py-2 md:px-4 md:py-3">TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {semData.subjects.map((subj, i) => (
                          <tr
                            key={i}
                            className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition"
                            onClick={() => setSelectedSubject(subj)}
                          >
                            <td className="px-3 py-2 md:px-4 md:py-3">{subj.code}</td>
                            <td className="px-3 py-2 md:px-4 md:py-3 text-teal-400 hover:underline">
                              {subj.name}
                            </td>
                            <td className="px-3 py-2 md:px-4 md:py-3">{subj.examType}</td>
                            <td className="px-3 py-2 md:px-4 md:py-3">{subj.theory}</td>
                            <td className="px-3 py-2 md:px-4 md:py-3">{subj.practical}</td>
                            <td className="px-3 py-2 md:px-4 md:py-3">{subj.total}</td>
                          </tr>
                        ))}
                        <tr className="font-semibold bg-gray-700 text-base">
                          <td colSpan="5" className="px-3 py-2 md:px-4 md:py-3">
                            Total Marks
                          </td>
                          <td className="px-3 py-2 md:px-4 md:py-3">
                            {semData.subjects.reduce(
                              (sum, subj) => sum + subj.total,
                              0
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-base px-6 py-3">
                    <a
                      href={semData.pdfUrl}
                      download
                      className="text-teal-400 hover:underline"
                    >
                      📥 Download Full Syllabus (PDF)
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic text-lg">
                  Syllabus coming soon...
                </p>
              )}
            </div>
          );
        })}

        {/* Subject Modal */}
        {selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-6">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full relative shadow-lg">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                onClick={() => setSelectedSubject(null)}
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold text-teal-400 mb-4">
                {selectedSubject.name}
              </h2>
              <p className="text-gray-300 mb-3 text-lg">
                <strong>Code:</strong> {selectedSubject.code}
              </p>
              <p className="text-gray-300 mb-3 text-lg">
                <strong>Exam Type:</strong> {selectedSubject.examType}
              </p>
              <p className="text-gray-300 mb-3 text-lg">
                <strong>Theory:</strong> {selectedSubject.theory} Marks
              </p>
              <p className="text-gray-300 mb-3 text-lg">
                <strong>Practical:</strong> {selectedSubject.practical} Marks
              </p>
              <p className="text-gray-300 mb-3 text-lg">
                <strong>Total:</strong> {selectedSubject.total} Marks
              </p>
              <p className="text-gray-400 mt-4 text-base">
                {selectedSubject.details}
              </p>
              <p className="text-gray-500 mt-3 text-sm">
                (Refer pages {selectedSubject.pages[0]}–{selectedSubject.pages[1]} in PDF)
              </p>
              <a
                href={
                  syllabusData[
                    Object.keys(syllabusData).find((s) =>
                      syllabusData[s].subjects.includes(selectedSubject)
                    )
                  ]?.pdfUrl
                }
                download
                className="mt-6 block text-center px-6 py-3 bg-teal-400 text-gray-900 font-semibold rounded-lg hover:bg-teal-500 transition text-lg"
              >
                📥 Download Full PDF
              </a>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

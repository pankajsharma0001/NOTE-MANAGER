import { useState } from "react";
import { syllabusData } from "../syllabus";
import DashboardLayout from "../components/DashboardLayout";

export default function Syllabus() {
  const [selectedSubject, setSelectedSubject] = useState(null);
  const semesters = Object.keys(syllabusData);

  return (
    <DashboardLayout>
      <div className="w-full p-6"> {/* increased padding */}
        {semesters.map((semester, index) => {
          const semData = syllabusData[semester];

          return (
            <div key={index} className="mb-12"> {/* more spacing between semesters */}
              <h2 className="text-2xl font-semibold mb-5 text-gray-300">{semester}</h2> {/* bigger title */}

              {semData ? (
                <div className="overflow-x-auto bg-gray-800 rounded-xl w-full">
                  <table className="min-w-[600px] w-full table-auto text-center text-lg"> {/* bigger table font */}
                    <thead className="bg-gray-700 text-base"> {/* slightly bigger header */}
                      <tr>
                        <th className="px-6 py-4">SUBJECT CODE</th>
                        <th className="px-6 py-4">SUBJECT NAME</th>
                        <th className="px-6 py-4">EXAM TYPE</th>
                        <th className="px-6 py-4">THEORY</th>
                        <th className="px-6 py-4">PRACTICAL</th>
                        <th className="px-6 py-4">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {semData.subjects.map((subj, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition"
                          onClick={() => setSelectedSubject(subj)}
                        >
                          <td className="px-6 py-4">{subj.code}</td>
                          <td className="px-6 py-4 text-teal-400 hover:underline">{subj.name}</td>
                          <td className="px-6 py-4">{subj.examType}</td>
                          <td className="px-6 py-4">{subj.theory}</td>
                          <td className="px-6 py-4">{subj.practical}</td>
                          <td className="px-6 py-4">{subj.total}</td>
                        </tr>
                      ))}
                      <tr className="font-semibold bg-gray-700 text-lg">
                        <td colSpan="5" className="px-6 py-4">Total Marks</td>
                        <td className="px-6 py-4">
                          {semData.subjects.reduce((sum, subj) => sum + subj.total, 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="mt-4 text-base px-6 py-3">
                    <a href={semData.pdfUrl} download className="text-teal-400 hover:underline">
                      📥 Download Full Syllabus (PDF)
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic text-lg">Syllabus coming soon...</p>
              )}
            </div>
          );
        })}

        {/* Subject Modal */}
        {selectedSubject && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-6">
            <div className="bg-gray-800 p-8 rounded-2xl max-w-lg w-full relative shadow-lg"> {/* bigger modal */}
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
                onClick={() => setSelectedSubject(null)}
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold text-teal-400 mb-4">{selectedSubject.name}</h2>
              <p className="text-gray-300 mb-3 text-lg"><strong>Code:</strong> {selectedSubject.code}</p>
              <p className="text-gray-300 mb-3 text-lg"><strong>Exam Type:</strong> {selectedSubject.examType}</p>
              <p className="text-gray-300 mb-3 text-lg"><strong>Theory:</strong> {selectedSubject.theory} Marks</p>
              <p className="text-gray-300 mb-3 text-lg"><strong>Practical:</strong> {selectedSubject.practical} Marks</p>
              <p className="text-gray-300 mb-3 text-lg"><strong>Total:</strong> {selectedSubject.total} Marks</p>
              <p className="text-gray-400 mt-4 text-base">{selectedSubject.details}</p>
              <p className="text-gray-500 mt-3 text-sm">
                (Refer pages {selectedSubject.pages[0]}–{selectedSubject.pages[1]} in PDF)
              </p>
              <a
                href={syllabusData[
                  Object.keys(syllabusData).find((s) =>
                    syllabusData[s].subjects.includes(selectedSubject)
                  )
                ]?.pdfUrl}
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

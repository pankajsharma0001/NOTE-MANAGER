import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { syllabusData } from "../syllabus";
import DashboardLayout from "../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

export default function Syllabus() {
  const { data: session } = useSession();
  const [selectedSubject, setSelectedSubject] = useState(null);
  const semesters = Object.keys(syllabusData);
  const [activeSem, setActiveSem] = useState("First Semester");

  // Auto-select user's current semester on load
  useEffect(() => {
    if (session?.user?.semester) {
      const userSem = session.user.semester;
      const matched = semesters.find((s) =>
        s.toLowerCase().startsWith(userSem.toLowerCase())
      );
      if (matched) setActiveSem(matched);
    }
  }, [session]);

  const semData = syllabusData[activeSem];

  return (
    <DashboardLayout>
      <div className="relative min-h-[calc(100vh-80px)] p-4 sm:p-6 md:p-8 overflow-hidden font-sans">
        
        {/* Soft Glowing Ambient Background Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 pb-4 border-b border-gray-800 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Course Syllabus
            </h1>
            <p className="text-gray-400 text-sm mt-1">Official IOE Civil Engineering course structures and marking schemes</p>
          </div>

          {semData && (
            <a
              href={semData.pdfUrl}
              download
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800/80 hover:bg-teal-500 hover:text-gray-900 border border-gray-700/50 hover:border-transparent rounded-xl text-teal-400 font-bold text-sm shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download PDF ({activeSem})
            </a>
          )}
        </div>

        {/* Semester select dropdown for mobile */}
        <div className="relative mb-8 md:hidden">
          <select
            value={activeSem}
            onChange={(e) => setActiveSem(e.target.value)}
            className="w-full p-3.5 pr-10 rounded-xl bg-gray-900 text-gray-300 border border-gray-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors font-bold text-sm appearance-none shadow-inner cursor-pointer"
          >
            {semesters.map((semester) => (
              <option key={semester} value={semester} className="bg-gray-900 text-gray-200">
                {semester}
              </option>
            ))}
          </select>
          {/* Custom dropdown chevron arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-teal-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Scrollable Semester Tab Selector (Desktop only) */}
        <div className="hidden md:flex gap-2.5 overflow-x-auto pb-4 mb-8 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {semesters.map((semester) => {
            const isActive = activeSem === semester;
            return (
              <button
                key={semester}
                onClick={() => setActiveSem(semester)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl font-bold text-sm border transition-all duration-300 cursor-pointer shadow-md
                  ${isActive 
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent scale-102" 
                    : "bg-gray-900/60 text-gray-400 border-gray-800 hover:text-white hover:border-gray-700"
                  }`}
              >
                {semester}
              </button>
            );
          })}
        </div>

        {/* Syllabus Content with Motion Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSem}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full"
          >
            {semData ? (
              <div className="bg-gradient-to-br from-gray-900/60 via-gray-800/20 to-gray-950/60 backdrop-blur-xl border border-gray-800/80 rounded-2xl shadow-2xl overflow-hidden">
                
                {/* Responsive Table Container */}
                <div className="overflow-x-auto">
                  <table className="w-full table-auto text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-900/80 border-b border-gray-800 text-teal-400 uppercase tracking-wider text-xs font-bold">
                        <th className="px-6 py-4">Subject Code</th>
                        <th className="px-6 py-4">Subject Name</th>
                        <th className="px-6 py-4 text-center">Exam Type</th>
                        <th className="px-6 py-4 text-center">Theory</th>
                        <th className="px-6 py-4 text-center">Practical</th>
                        <th className="px-6 py-4 text-center font-extrabold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {semData.subjects.map((subj, i) => (
                        <tr
                          key={i}
                          className="hover:bg-teal-500/5 cursor-pointer transition-colors duration-200"
                          onClick={() => setSelectedSubject(subj)}
                        >
                          <td className="px-6 py-4.5 font-mono text-xs text-gray-400">{subj.code}</td>
                          <td className="px-6 py-4.5">
                            <span className="text-white font-semibold hover:text-teal-400 transition-colors flex items-center gap-2">
                              {subj.name}
                              <svg className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-teal-400 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-center">
                            <span className={`inline-flex px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider
                              ${subj.examType.toLowerCase() === "both" 
                                ? "bg-teal-500/10 text-teal-400 border border-teal-500/20" 
                                : subj.examType.toLowerCase() === "theory" 
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              }`}
                            >
                              {subj.examType}
                            </span>
                          </td>
                          <td className="px-6 py-4.5 text-center text-gray-300 font-medium">{subj.theory}</td>
                          <td className="px-6 py-4.5 text-center text-gray-300 font-medium">{subj.practical}</td>
                          <td className="px-6 py-4.5 text-center text-teal-400 font-bold">{subj.total}</td>
                        </tr>
                      ))}
                      
                      {/* Total Marks Row */}
                      <tr className="bg-gray-900/40 font-bold text-sm">
                        <td colSpan="5" className="px-6 py-5 text-right text-gray-400 uppercase tracking-wider text-xs">
                          Total Semester Weight
                        </td>
                        <td className="px-6 py-5 text-center text-white border-l border-gray-800 text-base">
                          {semData.subjects.reduce((sum, subj) => sum + subj.total, 0)} Marks
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 bg-gray-900/40 border border-gray-800 rounded-2xl"
              >
                <span className="text-5xl mb-4">🚀</span>
                <p className="text-gray-400 italic font-semibold">Syllabus coming soon...</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Subject Details Modal */}
        <AnimatePresence>
          {selectedSubject && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 sm:p-6 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900 border border-gray-800 p-6 sm:p-8 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 p-2 rounded-full bg-gray-900/60 hover:bg-gray-800 border border-gray-800/80 hover:border-gray-700 text-gray-400 hover:text-white transition duration-200 cursor-pointer shadow-md"
                  onClick={() => setSelectedSubject(null)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Modal Title */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-1.5 leading-tight pr-8">
                  {selectedSubject.name}
                </h2>
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-mono text-xs text-teal-400 font-bold bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded">
                    {selectedSubject.code}
                  </span>
                  <span className="text-gray-500 text-xs flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    Page {selectedSubject.pages[0]}–{selectedSubject.pages[1]} in Syllabus PDF
                  </span>
                </div>

                {/* Marks Breakdown Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-2xl text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Theory</div>
                    <div className="text-xl font-bold text-gray-200">{selectedSubject.theory}</div>
                  </div>
                  <div className="bg-gray-900/60 border border-gray-800/80 p-3 rounded-2xl text-center">
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1">Practical</div>
                    <div className="text-xl font-bold text-gray-200">{selectedSubject.practical}</div>
                  </div>
                  <div className="bg-teal-500/5 border border-teal-500/20 p-3 rounded-2xl text-center">
                    <div className="text-[10px] uppercase font-bold text-teal-400/70 tracking-wider mb-1">Total</div>
                    <div className="text-xl font-extrabold text-teal-400">{selectedSubject.total}</div>
                  </div>
                </div>

                {/* Description Details */}
                <div className="bg-gray-900/40 border border-gray-800/60 rounded-2xl p-4.5 mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subject Details / Syllabus Outline:</h4>
                  <p className="text-gray-300 text-sm leading-relaxed max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {selectedSubject.details || "Comprehensive course topics, lab lists, reference books, and grading rubrics detailed inside official IOE syllabus PDF."}
                  </p>
                </div>

                {/* Download Button */}
                <a
                  href={
                    syllabusData[
                      Object.keys(syllabusData).find((s) =>
                        syllabusData[s].subjects.some(sub => sub.code === selectedSubject.code)
                      )
                    ]?.pdfUrl
                  }
                  download
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 transition duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Syllabus PDF
                </a>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}

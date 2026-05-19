import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    const res = await fetch("/api/favorites/get");
    const data = await res.json();
    if (data.success) setFavorites(data.favorites);
    setLoading(false);
  };

  const removeFavorite = async (noteId, semester) => {
    // visually remove first (animation)
    setFavorites((prev) =>
      prev.filter((fav) => !(fav.noteId === noteId && fav.semester === semester))
    );

    // backend sync
    await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, semester }),
    });
  };

  const goToNote = (semester, noteId) => {
    router.push(`/notes/${semester}/${noteId}`);
  };

  // Capitalize semesters beautifully
  const formatSemester = (sem) => {
    if (!sem) return "";
    return sem.charAt(0).toUpperCase() + sem.slice(1) + " Semester";
  };

  return (
    <DashboardLayout>
      <div className="relative min-h-[calc(100vh-80px)] p-4 sm:p-6 md:p-8 overflow-hidden font-sans">
        
        {/* Soft Glowing Ambient Background Blobs */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-4 border-b border-gray-800 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <svg className="w-8 h-8 text-rose-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              My Favorites
            </h1>
            <p className="text-gray-400 text-sm mt-1">Your saved reference notes and materials</p>
          </div>
          
          {!loading && favorites.length > 0 && (
            <div className="flex items-center gap-2 self-start sm:self-auto bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm px-4 py-1.5 rounded-full font-semibold shadow-lg">
              <span>{favorites.length}</span>
              <span>{favorites.length === 1 ? 'Note Saved' : 'Notes Saved'}</span>
            </div>
          )}
        </div>

        {loading ? (
          /* Shimmer Skeleton Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-900/60 border border-gray-800 rounded-2xl p-6 h-48 flex flex-col justify-between">
                <div>
                  <div className="h-4 bg-gray-800 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-gray-800 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                </div>
                <div className="h-10 bg-gray-800 rounded-xl w-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          /* Gorgeous Glassmorphic Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center text-center py-20 px-4 bg-gradient-to-br from-gray-900/40 via-gray-900/10 to-gray-950/40 backdrop-blur-md border border-gray-800 rounded-3xl max-w-xl mx-auto shadow-2xl"
          >
            <div className="relative mb-6 p-6 bg-rose-500/5 rounded-full border border-rose-500/10 shadow-inner">
              <svg className="w-16 h-16 text-rose-500/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              {/* Plus decorator */}
              <div className="absolute -top-1 -right-1 text-teal-400 font-bold text-xl animate-bounce">+</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No favorites saved yet</h3>
            <p className="text-gray-400 max-w-sm mb-8 text-sm leading-relaxed">
              Browse through notes, question papers, and files. Click the heart icon to save reference materials here for quick access!
            </p>
            <Link href="/notes" className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2">
              Browse All Notes
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </motion.div>
        ) : (
          /* Premium Animated Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {favorites.map((fav) => (
                <motion.div
                  key={`${fav.noteId}-${fav.semester}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    y: 30,
                    transition: { duration: 0.3 },
                  }}
                  whileHover={{ y: -4 }}
                  className="group relative bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-950/60 backdrop-blur-xl border border-gray-800 hover:border-teal-500/40 p-6 rounded-2xl shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                  onClick={() => goToNote(fav.semester, fav.noteId)}
                >
                  
                  {/* Subtle Glowing Radial Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/0 via-teal-500/0 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Heart Remove Button */}
                  <button
                    className="absolute top-4 right-4 p-2 rounded-full bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition duration-300 border border-rose-500/20 hover:border-transparent z-20 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.noteId, fav.semester);
                    }}
                    title="Remove from favorites"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  <div>
                    {/* Subject Tag */}
                    <div className="mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-800/80 text-teal-400 border border-gray-700/50 uppercase tracking-wider">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        {fav.subject || "Reference"}
                      </span>
                    </div>

                    {/* Note Title */}
                    <h2 className="text-xl font-bold mb-3 text-white group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                      {fav.title || "Untitled Note"}
                    </h2>
                  </div>

                  {/* Bottom Row */}
                  <div className="mt-6 pt-4 border-t border-gray-800/60 flex items-center justify-between text-sm">
                    {/* Semester badge */}
                    <span className="text-gray-400 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-teal-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      {formatSemester(fav.semester)}
                    </span>

                    {/* View CTA */}
                    <span className="text-teal-400 font-bold group-hover:text-teal-300 flex items-center gap-1 transition-colors">
                      View
                      <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </span>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

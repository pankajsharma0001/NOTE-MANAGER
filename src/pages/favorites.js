import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../components/DashboardLayout";

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

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white">
          Favorites
        </h1>

        {loading ? (
          <p className="text-gray-400">Loading...</p>
        ) : favorites.length === 0 ? (
          <p className="text-gray-400">No favorites yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {favorites.map((fav) => (
                <motion.div
                  key={fav.noteId}
                  layout
                  initial={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{
                    opacity: 0,
                    scale: 0.8,
                    rotate: Math.random() * 30 - 15,
                    y: 50,
                    transition: { duration: 0.5 },
                  }}
                  className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-4 sm:p-6 rounded-xl shadow-lg hover:scale-[1.02] transition cursor-pointer flex flex-col justify-between"
                  onClick={() => goToNote(fav.semester, fav.noteId)}
                >
                  {/* ❌ Remove button */}
                  <button
                    className="absolute top-2 right-2 text-red-500 text-lg sm:text-xl hover:scale-110 transition-transform z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFavorite(fav.noteId, fav.semester);
                    }}
                  >
                    ❌
                  </button>

                  {/* Card Content */}
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold mb-2 text-teal-400">
                      {fav.title || "Untitled Note"}
                    </h2>
                    <p className="text-gray-400 text-sm sm:text-base mb-1">
                      Subject: {fav.subject || "Not specified"}
                    </p>
                    <p className="text-gray-400 text-sm sm:text-base">
                      Semester: {fav.semester}
                    </p>
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

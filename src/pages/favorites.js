import { useEffect, useState } from "react";
import { useRouter } from "next/router";
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
    const res = await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, semester }),
    });
    const data = await res.json();
    if (data.success) {
      setFavorites((prev) =>
        prev.filter((fav) => !(fav.noteId === noteId && fav.semester === semester))
      );
    }
  };


  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Favorites</h1>

      {loading ? (
        <p>Loading...</p>
      ) : favorites.length === 0 ? (
        <p>No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {favorites.map((fav) => (
            <div
              key={fav.noteId}
              className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transition cursor-pointer"
            >
              {/* Remove button at top-right */}
              <button
                className="absolute top-2 right-2 text-red-500 text-2xl"
                onClick={() => removeFavorite(fav.noteId, fav.semester)}
              >
                ❌
              </button>

              <h2 className="text-xl font-semibold mb-2 text-teal-400">{fav.title}</h2>
              <p className="text-gray-400 mb-2">Semester: {fav.semester}</p>
            </div>

          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
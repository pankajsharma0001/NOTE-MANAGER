import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const semestersData = [
  { slug: "first", name: "First Semester", year: "First Year", subjectsCount: 6, color: "from-blue-500 to-cyan-400", shadow: "hover:shadow-cyan-500/50" },
  { slug: "second", name: "Second Semester", year: "First Year", subjectsCount: 7, color: "from-purple-500 to-indigo-400", shadow: "hover:shadow-indigo-500/50" },
  { slug: "third", name: "Third Semester", year: "Second Year", subjectsCount: 6, color: "from-emerald-500 to-teal-400", shadow: "hover:shadow-teal-500/50" },
  { slug: "fourth", name: "Fourth Semester", year: "Second Year", subjectsCount: 6, color: "from-orange-500 to-amber-400", shadow: "hover:shadow-orange-500/50" },
  { slug: "fifth", name: "Fifth Semester", year: "Third Year", subjectsCount: 6, color: "from-pink-500 to-rose-400", shadow: "hover:shadow-pink-500/50" },
  { slug: "sixth", name: "Sixth Semester", year: "Third Year", subjectsCount: 8, color: "from-indigo-500 to-blue-400", shadow: "hover:shadow-blue-500/50" },
  { slug: "seventh", name: "Seventh Semester", year: "Fourth Year", subjectsCount: 6, color: "from-teal-500 to-emerald-400", shadow: "hover:shadow-emerald-500/50" },
  { slug: "eighth", name: "Eighth Semester", year: "Fourth Year", subjectsCount: 2, color: "from-red-500 to-orange-400", shadow: "hover:shadow-red-500/50" },
];

export default function Notes() {
  const router = useRouter();
  const [noteCounts, setNoteCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function fetchCounts() {
      const cached = sessionStorage.getItem("noteCountsCache");
      if (cached) {
        if (!ignore) {
          setNoteCounts(JSON.parse(cached));
          setLoading(false);
        }
        return;
      }

      const entries = await Promise.all(
        semestersData.map(async (semester) => {
          try {
            const res = await fetch(`/api/notes?semester=${semester.slug}`);
            const data = await res.json();
            return [semester.slug, data.success ? data.data.length : 0];
          } catch {
            return [semester.slug, 0];
          }
        })
      );

      const counts = Object.fromEntries(entries);
      sessionStorage.setItem("noteCountsCache", JSON.stringify(counts));
      if (!ignore) {
        setNoteCounts(counts);
        setLoading(false);
      }
    }

    fetchCounts();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-col mb-4 animate-slideInRight">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">Engineering Notes</h1>
        <p className="text-gray-400 text-xs md:text-sm">
          Find all computer engineering notes, resources, and syllabus properly organized by semester.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {semestersData.map((sem, index) => {
          const count = noteCounts[sem.slug];
          const isReady = !loading && count !== undefined;

          return (
            <div
              key={sem.slug}
              onClick={() => router.push(`/notes/${sem.slug}`)}
              className={`relative bg-gray-800 rounded-xl p-4 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${sem.shadow} animate-fadeInUp overflow-hidden group`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Decorative background gradient */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${sem.color} rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
              
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {sem.year}
                    </span>
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${sem.color} shadow-md`}>
                      <svg
                        className="w-4 h-4 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white mb-0.5 group-hover:text-teal-400 transition-colors">
                    {sem.name}
                  </h2>
                  <p className="text-xs text-gray-400 mb-4">
                    {sem.subjectsCount} Subjects Available
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-gray-700 pt-3 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 mb-0.5">Total Notes</span>
                    {loading ? (
                      <div className="h-5 w-10 bg-gray-700 rounded animate-shimmer"></div>
                    ) : (
                      <span className="text-sm font-semibold text-white">
                        {count} <span className="text-xs font-normal text-gray-400">{count === 1 ? 'Note' : 'Notes'}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-gray-400 group-hover:text-white transition-colors transform group-hover:translate-x-0.5 duration-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";

const years = [
  { year: "First Year", semesters: [{ name: "First Semester", slug: "first" }, { name: "Second Semester", slug: "second" }] },
  { year: "Second Year", semesters: [{ name: "Third Semester", slug: "third" }, { name: "Fourth Semester", slug: "fourth" }] },
  { year: "Third Year", semesters: [{ name: "Fifth Semester", slug: "fifth" }, { name: "Sixth Semester", slug: "sixth" }] },
  { year: "Fourth Year", semesters: [{ name: "Seventh Semester", slug: "seventh" }, { name: "Eighth Semester", slug: "eighth" }] },
];

const semesters = years.flatMap((year) => year.semesters);

export default function Notes() {
  const router = useRouter();
  const [noteCounts, setNoteCounts] = useState({});

  useEffect(() => {
    let ignore = false;

    async function fetchCounts() {
      const cached = sessionStorage.getItem("noteCountsCache");
      if (cached) {
        if (!ignore) setNoteCounts(JSON.parse(cached));
        return;
      }

      const entries = await Promise.all(
        semesters.map(async (semester) => {
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
      if (!ignore) setNoteCounts(counts);
    }

    fetchCounts();
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Notes</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {years.map((year) => (
          <div key={year.year} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-400 text-center sm:text-left">{year.year}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {year.semesters.map((sem) => {
                const count = noteCounts[sem.slug];

                return (
                  <div
                    key={sem.slug}
                    onClick={() => router.push(`/notes/${sem.slug}`)}
                    className="flex flex-col items-center justify-center gap-3 p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-teal-400 hover:text-gray-900 transition transform hover:scale-105 text-center min-h-[8rem]"
                  >
                    <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 bg-gray-800 text-white rounded-lg w-20 h-16 sm:w-24 sm:h-20 shadow-md">
                      <svg
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <path d="M14 2v6h6" />
                        <path d="M16 13H8" />
                        <path d="M16 17H8" />
                        <path d="M10 9H8" />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold">
                        {count ?? "..."} {count === 1 ? "Note" : "Notes"}
                      </span>
                    </div>
                    <span className="text-base sm:text-lg font-medium truncate max-w-full">{sem.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

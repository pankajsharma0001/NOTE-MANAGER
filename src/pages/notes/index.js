import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";

export default function Notes() {
  const router = useRouter();

  const years = [
    { year: "First Year", semesters: [{ name: "First Semester", slug: "first" }, { name: "Second Semester", slug: "second" }] },
    { year: "Second Year", semesters: [{ name: "Third Semester", slug: "third" }, { name: "Fourth Semester", slug: "fourth" }] },
    { year: "Third Year", semesters: [{ name: "Fifth Semester", slug: "fifth" }, { name: "Sixth Semester", slug: "sixth" }] },
    { year: "Fourth Year", semesters: [{ name: "Seventh Semester", slug: "seventh" }, { name: "Eighth Semester", slug: "eighth" }] },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">Notes</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
        {years.map((year, idx) => (
          <div key={idx} className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-teal-400 text-center sm:text-left">{year.year}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {year.semesters.map((sem, i) => (
                <div
                  key={i}
                  onClick={() => router.push(`/notes/${sem.slug}`)}
                  className="flex items-center justify-center sm:justify-start p-4 bg-gray-700 rounded-lg cursor-pointer hover:bg-teal-400 hover:text-gray-900 transition transform hover:scale-105 text-center sm:text-left"
                >
                  <span className="text-2xl mr-3">{/* 📁 icon */}📁</span>
                  <span className="truncate">{sem.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}

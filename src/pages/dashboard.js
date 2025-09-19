import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Profile from "./profile"; // import the Profile component
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [status, router]);

  // Show profile modal if first login
  useEffect(() => {
    if (status === "authenticated" && session?.user?.profileComplete === false) {
      setShowProfilePrompt(true);
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  const handleProfileComplete = async () => {
    // Update session immediately
    await update({
      ...session,
      user: { ...session.user, profileComplete: true },
    });
    setShowProfilePrompt(false);
  };

  const notes = [
    { id: 1, title: "Handwritten Note", subject: "Communication English", progress: 30, lastUpdated: "1 month ago" },
    { id: 2, title: "OLD Question solutions", subject: "", progress: 100, lastUpdated: "2 months ago" },
    { id: 3, title: "Textbook: Effective Technical Communication", subject: "", progress: 60, lastUpdated: "3 weeks ago" },
  ];

  const sidebarItems = [
    { icon: "🏠", label: "Home" },
    { icon: "📁", label: "Notes" },
    { icon: "⭐", label: "Favorites" },
    { icon: "📖", label: "Syllabus" },
    { icon: "🔗", label: "Share" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 relative">
      {/* Profile Modal on First Login */}
      {showProfilePrompt && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <Profile embedded onComplete={handleProfileComplete} />
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className={showProfilePrompt ? "flex min-h-screen w-full blur-sm pointer-events-none" : "flex min-h-screen w-full"}>
        {/* Sidebar */}
        <aside className="w-20 bg-gray-950 text-white flex flex-col items-center py-6 space-y-6 relative z-0">
          {sidebarItems.map((item, index) => (
            <div key={index} className="relative w-full flex flex-col items-center">
              <button
                className={`p-3 rounded-lg hover:bg-gray-800 transition relative z-10`}
                onClick={() => {
                  setActiveTab(index);
                  if (item.label === "Home") router.push("/dashboard");
                  else if (item.label === "Notes") router.push("/notes");
                  else if (item.label === "Favorites") router.push("/favorites");
                  else if (item.label === "Syllabus") router.push("/syllabus");
                  else if (item.label === "Share") router.push("/share");
                }}
              >
                <span role="img" aria-label={item.label}>{item.icon}</span>
              </button>
              <span className="text-xs mt-1">{item.label}</span>
              {activeTab === index && (
                <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full z-0 transition-all duration-300"></span>
              )}
            </div>
          ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 relative">
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h2 className="text-gray-400 text-lg">Good Afternoon ☕</h2>
              <h1 className="text-3xl font-bold">
                Let&apos;s start learning, <span className="text-teal-400">{session.user.name.toUpperCase()}</span>
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div className="relative mt-4 sm:mt-0" ref={dropdownRef}>
              <Image
                src={session.user.image}
                alt="Profile"
                className="w-12 h-12 rounded-full ring-2 ring-teal-400 cursor-pointer"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn">
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-white">
              <h3 className="text-sm mb-2 text-teal-400 opacity-80">First Semester</h3>
              <h2 className="font-semibold text-lg mb-2">Your Semester</h2>
              <p className="mb-4 text-gray-400">Explore your current semester notes.</p>
              <button className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition">EXPLORE</button>
            </div>
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-white">
              <h3 className="text-sm mb-2 text-teal-400 opacity-80">Learning Reminders</h3>
              <h2 className="font-semibold text-lg mb-2">Schedule time to learn</h2>
              <p className="mb-4 text-gray-400">A little each day adds up. Get reminders from your calendar.</p>
              <button className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition">SET REMINDER</button>
            </div>
            <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-center text-white">
              <h2 className="font-semibold text-lg mb-2">Hey {session.user.name.toUpperCase()}!</h2>
              <div className="bg-gray-700 h-2 rounded-full w-full mb-2">
                <div className="bg-teal-400 h-2 rounded-full w-[75%] transition-all"></div>
              </div>
              <p className="mb-1 text-gray-300">75% Completed</p>
              <p className="text-sm text-gray-400">Semester: First</p>
              <p className="text-sm text-gray-400">College: Pulchowk Campus</p>
              <p className="mt-2 text-sm text-gray-400">You have logged in 77 times.</p>
            </div>
          </div>

          {/* Notes Section */}
          <section className="mb-8">
            <h3 className="text-gray-400 mb-2">You&apos;re reading in the <strong>Communication English</strong> notes</h3>
            {notes.map((note) => (
              <div key={note.id} className="bg-gray-800 p-4 rounded-xl shadow mb-4 flex justify-between items-center hover:scale-105 transform transition">
                <div>
                  <h4 className="font-semibold text-white">{note.title}</h4>
                  {note.subject && <p className="text-gray-400 text-sm">{note.subject}</p>}
                  <div className="bg-gray-700 h-2 rounded-full w-48 mt-2">
                    <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${note.progress}%` }}></div>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">{note.lastUpdated}</p>
                </div>
                <button className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition">KEEP LEARNING</button>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
}

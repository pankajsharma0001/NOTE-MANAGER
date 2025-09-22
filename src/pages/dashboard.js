import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Profile from "./profile";
import Image from "next/image";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [stats, setStats] = useState({ percentCompleted: 0, lastReadNote: null });
  const dropdownRef = useRef();

  const timeSince = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000); // in seconds
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const fetchStats = async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch(`/api/user/stats?userId=${session.user.id}`);
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (session?.user?.id) fetchStats();
  }, [session]);

  // Listen to noteRead events to refresh stats
  useEffect(() => {
    const handleNoteRead = () => fetchStats();
    window.addEventListener("noteRead", handleNoteRead);
    return () => window.removeEventListener("noteRead", handleNoteRead);
  }, [session]);

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

  const handleProfileComplete = async (updatedUserData) => {
    await update({
      ...session,
      user: { ...session.user, ...updatedUserData, profileComplete: true },
    });
    fetchStats(); // refresh dashboard stats immediately
    setShowProfilePrompt(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    else if (hour < 18) return "Good Afternoon ☕";
    return "Good Evening 🌙";
  };

  const sidebarItems = [
    { icon: "🏠", label: "Home" },
    { icon: "📁", label: "Notes" },
    { icon: "⭐", label: "Favorites" },
    { icon: "📖", label: "Syllabus" },
    { icon: "🔗", label: "Share" },
  ];

  const handleExploreClick = () => {
    if (session.user.semester) {
      router.push(`/notes?semester=${session.user.semester}`);
    } else {
      setShowProfilePrompt(true);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 relative">
      {/* Profile modal for first login */}
      {showProfilePrompt && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <Profile embedded onComplete={handleProfileComplete} />
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-20 bg-gray-950 text-white flex flex-col items-center py-6 space-y-6 fixed h-full">
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
      <main className="flex-1 ml-20 overflow-y-auto h-screen">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-8 sticky top-0 bg-gray-900 z-20">
          <div>
            <h2 className="text-gray-400 text-lg">{getGreeting()}</h2>
            <h1 className="text-3xl font-bold">
              Let's start learning, <span className="text-teal-400">{session.user.name?.toUpperCase()}</span>
            </h1>
          </div>

          <div className="relative mt-4 sm:mt-0" ref={dropdownRef}>
            <Image
              src={session.user.image || "/default-avatar.png"}
              alt="Profile"
              className="w-12 h-12 rounded-full ring-2 ring-teal-400 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              width={80}
              height={80}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 animate-fadeIn">
                <button onClick={() => router.push("/profile")} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition">
                  Profile
                </button>
                <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition">
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0">
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-white">
            <h3 className="text-sm mb-2 text-teal-400 opacity-80">Semester</h3>
            <h2 className="font-semibold text-lg mb-2">{session.user.semester || "Not set"}</h2>
            <p className="mb-4 text-gray-400">{session.user.college || "Set your college in profile."}</p>
            <button onClick={handleExploreClick} className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition">
              {session.user.semester ? "EXPLORE" : "SET PROFILE"}
            </button>
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
              <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${stats.percentCompleted}%` }}></div>
            </div>
            <p className="mb-1 text-gray-300">{stats.percentCompleted}% Completed</p>
            <p className="text-sm text-gray-400">Semester: {session.user.semester || "N/A"}</p>
            <p className="text-sm text-gray-400">College: {session.user.college || "N/A"}</p>
            <p className="mt-2 text-sm text-gray-400">You have logged in {session.user.loginCount || 1} times.</p>
          </div>
        </div>

        {/* Notes Section */}
        <section className="p-8 pt-0">
          <h3 className="text-gray-400 mb-2">
            {stats.lastReadNote
              ? `Last read note: ${stats.lastReadNote.title}`
              : "You haven't read any notes yet."}
          </h3>
          {stats.lastReadNote && (
          <div className="bg-gray-800 p-4 rounded-xl shadow mb-4 flex justify-between items-center hover:scale-105 transform transition">
            <div>
              <h4 className="font-semibold text-white">{stats.lastReadNote.title}</h4>
              {stats.lastReadNote.subject && (
                <p className="text-gray-400 text-sm">{stats.lastReadNote.subject}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Last read: {timeSince(stats.lastReadAt)}
              </p>
            </div>
            <button
              onClick={() =>
                router.push(`/notes/${stats.lastReadNote.semester || 'general'}/${stats.lastReadNote._id}`)
              }
              className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition"
            >
              CONTINUE
            </button>
          </div>
        )}
        </section>
      </main>
    </div>
  );
}

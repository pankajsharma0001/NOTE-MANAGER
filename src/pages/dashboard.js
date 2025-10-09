import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Profile from "./profile";
import Image from "next/image";
import DashboardLayout from "../components/DashboardLayout";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [stats, setStats] = useState({ percentCompleted: 0, lastReadNote: null });
  const dropdownRef = useRef();

  // Calculate time since a date
  const timeSince = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  // Fetch dashboard stats
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

  // Refresh stats when a note is read
  useEffect(() => {
    const handleNoteRead = () => fetchStats();
    window.addEventListener("noteRead", handleNoteRead);
    return () => window.removeEventListener("noteRead", handleNoteRead);
  }, [session]);

  // Redirect unauthenticated users
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

  // Prompt profile completion on first login
  useEffect(() => {
    if (status === "authenticated" && !session?.user?.profileComplete) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false); // hide if already completed
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  const handleProfileComplete = async (updatedUserData) => {
    await update({
      ...session,
      user: { ...session.user, ...updatedUserData, profileComplete: true },
    });
    // fetchStats();
    setShowProfilePrompt(false);
  };

  const handleExploreClick = () => {
    if (session.user.semester) {
      router.push(`/notes/${session.user.semester.toLowerCase()}`);
    } else {
      setShowProfilePrompt(true);
    }
  };

  return (
    <DashboardLayout>
      {/* Profile modal for first-time login */}
      {showProfilePrompt && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <Profile embedded onComplete={handleProfileComplete} />
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-2">
        {/* Semester Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-white">
          <h3 className="text-sm mb-2 text-teal-400 opacity-80">Semester</h3>
          <h2 className="font-semibold text-lg mb-2">
            {session.user.semester || "Not set"}
          </h2>
          <p className="mb-4 text-gray-400">
            {session.user.college || "Set your college in profile."}
          </p>
          <button
            onClick={handleExploreClick}
            className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition"
          >
            {session.user.semester ? "EXPLORE" : "SET PROFILE"}
          </button>
        </div>

        {/* Learning Reminders */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-white">
          <h3 className="text-sm mb-2 text-teal-400 opacity-80">
            Learning Reminders
          </h3>
          <h2 className="font-semibold text-lg mb-2">Schedule time to learn</h2>
          <p className="mb-4 text-gray-400">
            A little each day adds up. Get reminders from your calendar.
          </p>
          <button className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition">
            SET REMINDER
          </button>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-105 transform transition text-center text-white">
          <h2 className="font-semibold text-lg mb-2">
            Hey {session.user.name?.toUpperCase()}!
          </h2>
          <div className="bg-gray-700 h-2 rounded-full w-full mb-2">
            <div
              className="bg-teal-400 h-2 rounded-full"
              style={{ width: `${stats.percentCompleted}%` }}
            ></div>
          </div>
          <p className="mb-1 text-gray-300">
            {stats.percentCompleted}% Completed
          </p>
          <p className="text-sm text-gray-400">
            Semester: {session.user.semester || "N/A"}
          </p>
          <p className="text-sm text-gray-400">
            College: {session.user.college || "N/A"}
          </p>
          <p className="mt-2 text-sm text-gray-400">
            You have logged in {session.user.loginCount || 1} times.
          </p>
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
              <h4 className="font-semibold text-white">
                {stats.lastReadNote.title}
              </h4>
              {stats.lastReadNote.subject && (
                <p className="text-gray-400 text-sm">
                  {stats.lastReadNote.subject}
                </p>
              )}
              <p className="text-gray-400 text-xs mt-1">
                Last read: {timeSince(stats.lastReadAt)}
              </p>
            </div>
            <button
              onClick={() =>
                router.push(
                  `/notes/${stats.lastReadNote.semester?.toLowerCase() || "general"}/${stats.lastReadNote._id}`
                )
              }
              className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition"
            >
              CONTINUE
            </button>
          </div>
        )}
      </section>

      {/* QR Codes for WhatsApp and Telegram */}
      <div className="fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
        {/* WhatsApp QR */}
        <a
          href="https://chat.whatsapp.com/BiJgWxfsEFA7gjQcqS0Nct"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl shadow-lg p-2 flex items-center hover:scale-105 transition"
        >
          <img
            src="/whatsappQR.png"
            alt="Join WhatsApp"
            width={80}
            height={80}
            className="rounded"
          />
          <span className="ml-2 text-gray-800 font-semibold">WhatsApp</span>
        </a>
        {/* Telegram QR */}
        
      </div>
    </DashboardLayout>
  );
}

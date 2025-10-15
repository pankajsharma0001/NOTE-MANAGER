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

  const timeSince = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
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

  useEffect(() => {
    if (session?.user?.id) fetchStats();
  }, [session]);

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

  useEffect(() => {
    if (status === "authenticated" && !session?.user?.profileComplete) {
      setShowProfilePrompt(true);
    } else {
      setShowProfilePrompt(false);
    }
  }, [status, session]);

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  const handleProfileComplete = async (updatedUserData) => {
    await update({
      ...session,
      user: { ...session.user, ...updatedUserData, profileComplete: true },
    });
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
        {/* Semester Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-[1.02] transform transition text-white">
          <h3 className="text-sm mb-2 text-teal-400 opacity-80">Semester</h3>
          <h2 className="font-semibold text-lg mb-2">
            {session.user.semester || "Not set"}
          </h2>
          <p className="mb-4 text-gray-400 text-sm sm:text-base">
            {session.user.college || "Set your college in profile."}
          </p>
          <button
            onClick={handleExploreClick}
            className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition text-sm sm:text-base"
          >
            {session.user.semester ? "EXPLORE" : "SET PROFILE"}
          </button>
        </div>

        {/* Learning Reminders */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-[1.02] transform transition text-white">
          <h3 className="text-sm mb-2 text-teal-400 opacity-80">
            Learning Reminders
          </h3>
          <h2 className="font-semibold text-lg mb-2">Schedule time to learn</h2>
          <p className="mb-4 text-gray-400 text-sm sm:text-base">
            A little each day adds up. Get reminders from your calendar.
          </p>
          <button className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition text-sm sm:text-base">
            SET REMINDER
          </button>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-[1.02] transform transition text-center text-white">
          <h2 className="font-semibold text-lg mb-2">
            Hey {session.user.name?.toUpperCase()}!
          </h2>
          <div className="bg-gray-700 h-2 rounded-full w-full mb-2">
            <div
              className="bg-teal-400 h-2 rounded-full"
              style={{ width: `${stats.percentCompleted}%` }}
            ></div>
          </div>
          <p className="mb-1 text-gray-300 text-sm sm:text-base">
            {stats.percentCompleted}% Completed
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            Semester: {session.user.semester || "N/A"}
          </p>
          <p className="text-xs sm:text-sm text-gray-400">
            College: {session.user.college || "N/A"}
          </p>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">
            You have logged in {session.user.loginCount || 1} times.
          </p>
        </div>
      </div>

      {/* Notes Section */}
      <section className="p-4 sm:p-8 pt-0">
        <h3 className="text-gray-400 mb-2 text-sm sm:text-base">
          {stats.lastReadNote
            ? `Last read note: ${stats.lastReadNote.title}`
            : "You haven't read any notes yet."}
        </h3>
        {stats.lastReadNote && (
          <div className="bg-gray-800 p-4 rounded-xl shadow mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:scale-[1.02] transform transition">
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">
                {stats.lastReadNote.title}
              </h4>
              {stats.lastReadNote.subject && (
                <p className="text-gray-400 text-xs sm:text-sm">
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
              className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition w-full sm:w-auto text-sm sm:text-base"
            >
              CONTINUE
            </button>
          </div>
        )}
      </section>

      {/* QR Codes Section (responsive right on desktop, center on mobile) */}
      <section className="w-full mt-8 p-4 flex flex-wrap items-center justify-center sm:justify-end gap-6">
        {/* WhatsApp QR */}
        <div className="flex flex-col items-center">
          <a
            href="https://chat.whatsapp.com/BiJgWxfsEFA7gjQcqS0Nct"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl shadow-lg p-2 hover:scale-105 transition"
          >
            <img
              src="/whatsappQR.png"
              alt="Join WhatsApp"
              width={100}
              height={100}
              className="rounded"
            />
          </a>
          <span className="mt-2 text-gray-300 font-semibold text-sm">WhatsApp</span>
        </div>

      </section>

    </DashboardLayout>
  );
}

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Profile from "./profile";
import DashboardLayout from "../components/DashboardLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [stats, setStats] = useState({ percentCompleted: 0, lastReadNote: null });
  const dropdownRef = useRef();

  // Reminder states
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderTime, setReminderTime] = useState(null);
  const [reminderTitle, setReminderTitle] = useState("Study Session");
  const [reminders, setReminders] = useState([]);

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

  const scheduleBrowserNotification = () => {
    if (!reminderTime) return;

    const delay = new Date(reminderTime) - new Date();
    if (delay > 0) {
      Notification.requestPermission().then(() => {
        setTimeout(() => {
          new Notification(reminderTitle, {
            body: "Time to study! Open your dashboard.",
          });
        }, delay);
      });
    }

    // Add to local reminders array
    setReminders((prev) => [
      ...prev,
      { title: reminderTitle, time: reminderTime },
    ]);
    setReminderTime(null);
    setReminderTitle("Study Session");
    setShowReminderModal(false);
  };

  const formatForGoogleCalendar = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0];
  };

  return (
    <DashboardLayout>
      {/* Profile modal */}
      {showProfilePrompt && (
        <div className="absolute inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <Profile embedded onComplete={handleProfileComplete} />
        </div>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md">
            <h3 className="text-teal-400 text-lg font-semibold mb-3">Set Reminder</h3>
            <input
              type="text"
              placeholder="Reminder title"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full p-2 rounded mb-3 bg-gray-700 text-white"
            />
            <DatePicker
              selected={reminderTime}
              onChange={(date) => setReminderTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={1}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Select date & time"
              className="w-full sm:ml-4 p-2 pl-8 rounded bg-gray-700 text-white mb-3"
            />
            <div className="flex flex-col gap-3">
              <button
                onClick={scheduleBrowserNotification}
                className="w-full bg-teal-400 text-gray-900 py-2 rounded hover:bg-teal-500"
              >
                Save
              </button>

              {reminderTime && (
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    reminderTitle
                  )}&dates=${formatForGoogleCalendar(reminderTime)}/${formatForGoogleCalendar(reminderTime)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >
                  Add to Google Calendar
                </a>
              )}

              <button
                onClick={() => setShowReminderModal(false)}
                className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 md:p-6">
        {/* Semester Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-[1.02] transform transition text-white">
          <h3 className="text-sm mb-2 text-teal-400 opacity-80">Semester</h3>
          <h2 className="font-semibold text-lg mb-2">{session.user.semester || "Not set"}</h2>
          <p className="mb-4 text-gray-400 text-sm sm:text-base">{session.user.college || "Set your college in profile."}</p>
          <button
            onClick={handleExploreClick}
            className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition text-sm sm:text-base"
          >
            {session.user.semester ? "EXPLORE" : "SET PROFILE"}
          </button>
        </div>

        {/* Learning Reminders */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-[1.02] transform transition text-white">
          <h3 className="text-sm mb-2 text-teal-400 opacity-80">Learning Reminders</h3>
          <h2 className="font-semibold text-lg mb-2">Schedule time to learn</h2>
          <p className="mb-4 text-gray-400 text-sm sm:text-base">
            A little each day adds up. Get reminders from your calendar.
          </p>
          <button
            onClick={() => setShowReminderModal(true)}
            className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition text-sm sm:text-base"
          >
            SET REMINDER
          </button>
        </div>

        {/* Progress Card */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 p-6 rounded-xl shadow-lg hover:scale-[1.02] transform transition text-center text-white">
          <h2 className="font-semibold text-lg mb-2">
            Hey {session.user.name?.toUpperCase()}!
          </h2>
          <div className="bg-gray-700 h-2 rounded-full w-full mb-2">
            <div className="bg-teal-400 h-2 rounded-full" style={{ width: `${stats.percentCompleted}%` }}></div>
          </div>
          <p className="mb-1 text-gray-300 text-sm sm:text-base">{stats.percentCompleted}% Completed</p>
          <p className="text-xs sm:text-sm text-gray-400">Semester: {session.user.semester || "N/A"}</p>
          <p className="text-xs sm:text-sm text-gray-400">College: {session.user.college || "N/A"}</p>
          <p className="mt-2 text-xs sm:text-sm text-gray-400">You have logged in {session.user.loginCount || 1} times.</p>
        </div>
      </div>

      {/* Notes Section */}
      <section className="p-4 sm:p-8 pt-0">
        <h3 className="text-gray-400 mb-2 text-sm sm:text-base">
          {stats.lastReadNote ? `Last read note: ${stats.lastReadNote.title}` : "You haven't read any notes yet."}
        </h3>

        {stats.lastReadNote && (
          <div className="bg-gray-800 p-4 rounded-xl shadow mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:scale-[1.02] transform transition">
            <div>
              <h4 className="font-semibold text-white text-sm sm:text-base">{stats.lastReadNote.title}</h4>
              {stats.lastReadNote.subject && <p className="text-gray-400 text-xs sm:text-sm">{stats.lastReadNote.subject}</p>}
              <p className="text-gray-400 text-xs mt-1">Last read: {timeSince(stats.lastReadAt)}</p>
            </div>
            <button
              onClick={() =>
                router.push(`/notes/${stats.lastReadNote.semester?.toLowerCase() || "general"}/${stats.lastReadNote._id}`)
              }
              className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition w-full sm:w-auto text-sm sm:text-base"
            >
              CONTINUE
            </button>
          </div>
        )}

        {/* Show all scheduled reminders */}
        {reminders.length > 0 && (
          <div className="mt-4">
            <h4 className="text-teal-400 font-semibold mb-2">Upcoming Reminders</h4>
            {reminders.map((r, idx) => (
              <div
                key={idx}
                className="bg-gray-800 p-3 rounded-xl shadow mb-2 flex justify-between items-center text-sm sm:text-base"
              >
                <span>{r.title}</span>
                <div className="flex gap-2">
                  <span>{new Date(r.time).toLocaleString()}</span>
                  <a
                    href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                      r.title
                    )}&dates=${formatForGoogleCalendar(r.time)}/${formatForGoogleCalendar(r.time)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-xs sm:text-sm"
                  >
                    Add to Google Calendar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Profile from "./profile";
import DashboardLayout from "../components/DashboardLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";

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

  const timersRef = useRef({});

  // Helper to schedule a single browser notification timer
  const scheduleTimer = useCallback((reminder) => {
    const delay = new Date(reminder.time) - new Date();
    if (delay <= 0) return;

    if (timersRef.current[reminder.time]) {
      clearTimeout(timersRef.current[reminder.time]);
    }

    const timerId = setTimeout(() => {
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(reminder.title, {
            body: "Time to study! Open your dashboard.",
          });
        }
      }

      // Remove from list/localStorage after firing
      setReminders((prev) => {
        const updated = prev.filter((r) => r.time !== reminder.time);
        localStorage.setItem("study_reminders", JSON.stringify(updated));
        return updated;
      });

      delete timersRef.current[reminder.time];
    }, delay);

    timersRef.current[reminder.time] = timerId;
  }, []);

  const deleteReminder = useCallback((time) => {
    if (timersRef.current[time]) {
      clearTimeout(timersRef.current[time]);
      delete timersRef.current[time];
    }
    setReminders((prev) => {
      const updated = prev.filter((r) => r.time !== time);
      localStorage.setItem("study_reminders", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const timeSince = (date) => {
    if (!date) return "";
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff} sec ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;
    try {
      const res = await fetch("/api/user/stats");
      const data = await res.json();
      if (!data.error) setStats(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === "authenticated") fetchStats();
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router, fetchStats]);

  useEffect(() => {
    const handleNoteRead = () => fetchStats();
    window.addEventListener("noteRead", handleNoteRead);
    return () => window.removeEventListener("noteRead", handleNoteRead);
  }, [fetchStats]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (!session.user.profileComplete) {
        setShowProfilePrompt(true);
      } else {
        setShowProfilePrompt(false);
      }
    }
  }, [status, session]);

  // Load and reschedule reminders on mount
  useEffect(() => {
    const saved = localStorage.getItem("study_reminders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = new Date();
        const active = [];

        parsed.forEach((r) => {
          const delay = new Date(r.time) - now;
          if (delay > 0) {
            active.push(r);
            scheduleTimer(r);
          }
        });

        setReminders(active);
        localStorage.setItem("study_reminders", JSON.stringify(active));
      } catch (err) {
        console.error("Failed to parse study reminders:", err);
      }
    }

    // Cleanup active timers on unmount
    return () => {
      Object.values(timersRef.current).forEach((timerId) => clearTimeout(timerId));
      timersRef.current = {};
    };
  }, [scheduleTimer]);

  // Show loading while checking session
  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto mb-4"></div>
            <p className="text-white text-lg">Checking your session...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect if no session after checking
  if (!session) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white text-lg">Redirecting to login...</p>
        </div>
      </DashboardLayout>
    );
  }

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

    const reminderDate = new Date(reminderTime);
    const delay = reminderDate - new Date();

    if (delay <= 0) {
      alert("❌ Please select a future time.");
      return;
    }

    const newReminder = { title: reminderTitle, time: reminderTime.toISOString() };

    // Request notification permission and schedule timer
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          scheduleTimer(newReminder);
        } else {
          alert("⚠️ Notification permission is required for browser alerts.");
        }
      });
    }

    // Add to state and localStorage
    setReminders((prev) => {
      const updated = [...prev, newReminder];
      localStorage.setItem("study_reminders", JSON.stringify(updated));
      return updated;
    });

    setReminderTime(null);
    setReminderTitle("Study Session");
    setShowReminderModal(false);
  };

  const formatForGoogleCalendar = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, "").split(".")[0];
  };

  // Progress ring component
  const ProgressRing = ({ percent }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return (
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="#1f2937" strokeWidth="8" fill="none" />
        <circle
          cx="50" cy="50" r={radius}
          stroke="url(#progressGradient)" strokeWidth="8" fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
    );
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl w-full max-w-md border border-gray-700/50 shadow-2xl">
            <h3 className="text-teal-400 text-lg font-bold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Set Reminder
            </h3>
            <input
              type="text"
              placeholder="Reminder title"
              value={reminderTitle}
              onChange={(e) => setReminderTitle(e.target.value)}
              className="w-full p-3 rounded-xl mb-3 bg-gray-900 border border-gray-700 text-white focus:outline-none focus:border-teal-500 transition"
            />
            <DatePicker
              selected={reminderTime}
              onChange={(date) => setReminderTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={1}
              dateFormat="yyyy-MM-dd HH:mm"
              placeholderText="Select date & time"
              className="w-full p-3 rounded-xl bg-gray-900 border border-gray-700 text-white mb-4 focus:outline-none focus:border-teal-500"
            />
            <div className="flex flex-col gap-3">
              <button
                onClick={scheduleBrowserNotification}
                className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white py-2.5 rounded-xl hover:from-teal-400 hover:to-emerald-500 font-bold transition shadow-lg shadow-teal-500/20"
              >
                Save Reminder
              </button>

              {reminderTime && (
                <a
                  href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                    reminderTitle
                  )}&dates=${formatForGoogleCalendar(reminderTime)}/${formatForGoogleCalendar(reminderTime)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2.5 rounded-xl hover:bg-blue-500/30 font-semibold transition"
                >
                  📅 Add to Google Calendar
                </a>
              )}

              <button
                onClick={() => setShowReminderModal(false)}
                className="w-full bg-gray-800 border border-gray-700 text-gray-300 py-2.5 rounded-xl hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-2 sm:p-4 md:p-6 pb-24 md:pb-6">
        {/* Hero Welcome Banner */}
        <div className="relative bg-gradient-to-r from-gray-800/80 via-gray-900/60 to-gray-800/80 rounded-2xl p-6 sm:p-8 mb-8 overflow-hidden border border-gray-700/30">
          {/* Ambient Glow Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Hey, <span className="text-teal-400">{session.user.name?.split(" ")[0]}</span> 👋
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {session.user.semester
                  ? `${session.user.semester} Semester · ${session.user.college || "Setup Your College"}`
                  : "Complete your profile to get personalized content"}
              </p>
            </div>
            <button
              onClick={handleExploreClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 hover:from-teal-400 hover:to-emerald-500 transition-all duration-300 transform hover:-translate-y-0.5 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              {session.user.semester ? "Explore Notes" : "Set Profile"}
            </button>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Progress Card */}
          <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700/40 shadow-lg flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <ProgressRing percent={stats.percentCompleted} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-lg font-extrabold">{stats.percentCompleted}%</span>
              </div>
            </div>
            <div>
              <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Progress</h3>
              <p className="text-white font-bold text-lg mt-0.5">Completed</p>
              <p className="text-gray-500 text-xs mt-0.5">{session.user.semester || "N/A"} Sem</p>
            </div>
          </div>

          {/* Login Count Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Logins</h3>
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M13.8 12H3" /></svg>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">{session.user.loginCount || 1}</p>
            <p className="text-xs text-gray-500 mt-1">Total sessions</p>
          </div>

          {/* Reminder Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Reminders</h3>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <p className="text-2xl font-extrabold text-white">{reminders.length}</p>
            <button
              onClick={() => setShowReminderModal(true)}
              className="text-xs text-teal-400 font-semibold mt-1 hover:text-teal-300 transition cursor-pointer"
            >
              + Set Reminder
            </button>
          </div>

          {/* Semester Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-5 border border-gray-700/40 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Semester</h3>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
            </div>
            <p className="text-xl font-extrabold text-white capitalize">{session.user.semester || "Not Set"}</p>
            <p className="text-xs text-gray-500 mt-1 truncate">{session.user.college || "Set in profile"}</p>
          </div>
        </div>

        {/* Continue Reading Section */}
        {stats.lastReadNote && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              Continue Reading
            </h3>
            <div
              className="bg-gradient-to-r from-gray-800/80 to-gray-900/80 p-5 rounded-2xl border border-gray-700/40 shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer group hover:border-teal-500/30 transition-all duration-300"
              onClick={() =>
                router.push(`/notes/${stats.lastReadNote.semester?.toLowerCase() || "general"}/${stats.lastReadNote._id}`)
              }
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white text-base group-hover:text-teal-400 transition-colors truncate">{stats.lastReadNote.title}</h4>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  {stats.lastReadNote.subject && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                      {stats.lastReadNote.subject}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {timeSince(stats.lastReadAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-teal-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Reminders */}
        {reminders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Upcoming Reminders
            </h3>
            <div className="space-y-2">
              {reminders.map((r, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/60 p-4 rounded-xl border border-gray-700/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 animate-fadeInUp"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <span className="font-semibold text-white text-sm">{r.title}</span>
                      <p className="text-xs text-gray-500">{new Date(r.time).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <a
                      href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                        r.title
                      )}&dates=${formatForGoogleCalendar(r.time)}/${formatForGoogleCalendar(r.time)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-xs font-semibold transition"
                    >
                      📅 Add to Calendar
                    </a>
                    <button
                      onClick={() => deleteReminder(r.time)}
                      className="text-red-400 hover:text-red-300 text-xs font-semibold transition cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Browse Notes", icon: "📁", path: "/notes", color: "from-teal-500/10 to-emerald-500/5 border-teal-500/20 hover:border-teal-500/40" },
              { label: "Upload Note", icon: "📤", path: "/share", color: "from-blue-500/10 to-indigo-500/5 border-blue-500/20 hover:border-blue-500/40" },
              { label: "Favorites", icon: "⭐", path: "/favorites", color: "from-amber-500/10 to-yellow-500/5 border-amber-500/20 hover:border-amber-500/40" },
              { label: "Syllabus", icon: "📖", path: "/syllabus", color: "from-purple-500/10 to-pink-500/5 border-purple-500/20 hover:border-purple-500/40" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                className={`bg-gradient-to-br ${action.color} border rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg cursor-pointer`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span className="text-xs font-bold text-gray-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Connect & Games Section */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Connect & Play
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              { label: "Sudoko", href: "https://sudoko-pro.vercel.app/", img: "/sudokoQR.png" },
              { label: "Memory Match", href: "https://trilokey.com.np/", img: "/memoryMatchQR.png" },
              { label: "WhatsApp", href: "https://chat.whatsapp.com/BiJgWxfsEFA7gjQcqS0Nct", img: "/whatsappQR.png" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gray-800/60 border border-gray-700/30 rounded-2xl p-3 pr-5 hover:border-gray-600 hover:bg-gray-800 transition-all duration-300 group"
              >
                <div className="bg-white rounded-xl p-1.5 shadow-md group-hover:scale-105 transition-transform">
                  <Image
                    src={item.img}
                    alt={item.label}
                    width={48}
                    height={48}
                    className="rounded w-10 h-10 sm:w-12 sm:h-12"
                  />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs">Scan or click to open</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

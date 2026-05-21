import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";
import useSWR from "swr";
import DashboardLayout from "../components/DashboardLayout";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function Profile({ embedded = false, onComplete }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  // Fetch gamification stats
  const { data: statsData, mutate: mutateStats } = useSWR(
    status === "authenticated" ? "/api/user/profile-stats" : null,
    fetcher
  );
  const stats = statsData?.data;

  const [editing, setEditing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [semester, setSemester] = useState("");
  const [college, setCollege] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const semesterOptions = [
    "First", "Second", "Third", "Fourth",
    "Fifth", "Sixth", "Seventh", "Eighth"
  ];

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || "");
      setEmail(session.user.email || "");
      setSemester(session.user.semester || "");
      setCollege(session.user.college || "");
      setAddress(session.user.address || "");
      setPhone(session.user.phone || "");

      if (
        !session.user.profileComplete &&
        (!session.user.semester || !session.user.college ||
         !session.user.address || !session.user.phone)
      ) {
        setIsFirstTime(true);
        setEditing(true);
      }
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      alert("❌ Name is required");
      return;
    }
    if (!semester) {
      alert("❌ Semester is required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          semester,
          college,
          address,
          phone,
          profileComplete: true,
        }),
      });
      const data = await res.json();

      if (data.success) {
        await update({ ...session, user: { ...session.user, ...data.user } });
        setEditing(false);
        setIsFirstTime(false);
        if (onComplete) onComplete(data.user);
      } else {
        alert("❌ Error: " + data.message);
      }
    } catch (err) {
      alert("❌ Error updating profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (session?.user) {
      setName(session.user.name || "");
      setSemester(session.user.semester || "");
      setCollege(session.user.college || "");
      setAddress(session.user.address || "");
      setPhone(session.user.phone || "");
    }
    setEditing(false);
  };

  const handleSkip = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profileComplete: true }),
      });
      const data = await res.json();
      if (data.success) {
        await update({ ...session, user: { ...session.user, ...data.user } });
        setEditing(false);
        setIsFirstTime(false);
        if (onComplete) onComplete(data.user);
      }
    } catch (err) {
      alert("❌ Error skipping profile: " + err.message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("❌ Please select a valid image file (PNG/JPEG/WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("❌ Image size must be less than 5MB.");
      return;
    }

    setAvatarUploading(true);
    try {
      const publicId = `avatars/${session.user.id}-${Date.now()}`;
      
      // 1. Get signature from backend
      const params = new URLSearchParams({ publicId });
      const sigRes = await fetch(`/api/share/upload?${params.toString()}`);
      const { signature, timestamp } = await sigRes.json();
      
      if (!signature) throw new Error("Could not generate signature");

      // 2. Upload directly to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "");
      cloudinaryFormData.append("timestamp", timestamp);
      cloudinaryFormData.append("signature", signature);
      cloudinaryFormData.append("public_id", publicId);

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      if (!cloudName) {
        throw new Error("Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable.");
      }

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.error?.message || "Cloudinary upload failed");
      }

      const imageUrl = uploadData.secure_url;

      // 3. Save to database via user update API
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageUrl }),
      });
      const data = await res.json();

      if (data.success) {
        await update({ ...session, user: { ...session.user, image: imageUrl } });
        // Trigger stats refresh in case profile-stats is cached
        mutateStats();
      } else {
        throw new Error(data.message || "Failed to update profile image in database");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error uploading avatar: " + err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  const getRankProgress = (notesCount) => {
    if (notesCount === 0) {
      return {
        current: "Newbie Uploader 🌱",
        next: "Rising Star 💫",
        progress: 0,
        label: "0 / 1 note for next rank",
      };
    } else if (notesCount >= 1 && notesCount < 3) {
      const nextRankReq = 3;
      return {
        current: "Rising Star 💫",
        next: "Expert Contributor 🎓",
        progress: (notesCount / nextRankReq) * 100,
        label: `${notesCount} / 3 notes for next rank`,
      };
    } else if (notesCount >= 3 && notesCount < 6) {
      const nextRankReq = 6;
      return {
        current: "Expert Contributor 🎓",
        next: "Legend Contributor 🏆",
        progress: (notesCount / nextRankReq) * 100,
        label: `${notesCount} / 6 notes for next rank`,
      };
    } else {
      return {
        current: "Legend Contributor 🏆",
        next: null,
        progress: 100,
        label: "Maximum Rank Achieved! 👑",
      };
    }
  };

  const progressInfo = stats ? getRankProgress(stats.notes.length) : null;

  const profileCard = (
    <div className="relative p-6 sm:p-8 rounded-2xl bg-gray-800/40 backdrop-blur-md border border-gray-700/50 shadow-2xl overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
        
        {/* Avatar block with interactive uploader */}
        <div className="relative group flex-shrink-0">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-teal-500/20 group-hover:ring-teal-400/40 transition-all duration-300">
            <Image
              src={session.user.image || "/default-avatar.png"}
              alt="Profile"
              className={`w-full h-full object-cover transition-all duration-500 ${avatarUploading ? "blur-sm" : ""}`}
              width={144}
              height={144}
              unoptimized
            />
            {/* Hover overlay - only active when not uploading */}
            {!avatarUploading && (
              <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-xs font-semibold">
                <svg className="w-6 h-6 text-teal-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Upload Photo
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
            )}
            
            {/* Uploading loading overlay */}
            {avatarUploading && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[10px] text-teal-400 font-medium">Uploading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Info or Edit Form Container */}
        <div className="flex-1 w-full">
          {/* Tabs Navigation (only show when not embedded and not editing) */}
          {!embedded && !editing && (
            <div className="flex gap-2 p-1 bg-gray-900/60 rounded-xl border border-gray-800/80 mb-6 max-w-xs mx-auto md:mx-0">
              <button
                onClick={() => setActiveTab("info")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
                  activeTab === "info"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/10"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                👤 Details
              </button>
              <button
                onClick={() => setActiveTab("contributions")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 ${
                  activeTab === "contributions"
                    ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/10"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                🏆 Contributions
              </button>
            </div>
          )}

          {/* Tab 1: Profile Details (View Mode) */}
          {!editing && activeTab === "info" && (
            <div className="space-y-5 animate-fadeInUp">
              <div className="border-b border-gray-700/50 pb-4 text-center md:text-left">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{name}</h2>
                <p className="text-teal-400/80 text-sm font-medium mt-1">{email}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Semester", val: semester ? `${semester} Semester` : "Not specified", icon: (
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  ) },
                  { label: "College", val: college || "Not specified", icon: (
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" /></svg>
                  ) },
                  { label: "Address", val: address || "Not specified", icon: (
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) },
                  { label: "Phone", val: phone || "Not specified", icon: (
                    <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  ) },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-xl border border-gray-700/30">
                    <div className="p-2 bg-teal-500/10 rounded-lg flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{item.label}</span>
                      <p className="text-white text-sm font-semibold truncate mt-0.5">{item.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setEditing(true)}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-500 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </button>
            </div>
          )}

          {/* Tab 2: Contributions Tab (View Mode) */}
          {!editing && activeTab === "contributions" && stats && (
            <div className="space-y-6 animate-fadeInUp">
              <div>
                <h3 className="text-lg font-bold text-white mb-4">🏆 Contribution Summary</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Current Rank */}
                  <div className={`p-4 rounded-xl border bg-gradient-to-br flex flex-col justify-center items-center text-center shadow-lg transform hover:scale-[1.02] transition-all duration-300 ${stats.badge.color}`}>
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Rank Badge</span>
                    <span className="text-base font-extrabold mt-1.5">{stats.badge.name}</span>
                  </div>

                  {/* Notes Uploaded */}
                  <div className="p-4 rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm flex flex-col justify-center items-center text-center shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Uploaded Notes</span>
                    <span className="text-2xl font-extrabold text-teal-400 mt-1">{stats.notes.length}</span>
                  </div>

                  {/* Upvotes Earned */}
                  <div className="p-4 rounded-xl border border-gray-700/50 bg-gray-900/40 backdrop-blur-sm flex flex-col justify-center items-center text-center shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Upvotes Earned</span>
                    <span className="text-2xl font-extrabold text-emerald-400 mt-1">👍 {stats.totalUpvotes}</span>
                  </div>
                </div>
              </div>

              {/* Progress towards Next Rank */}
              {progressInfo && (
                <div className="p-4 rounded-xl border border-gray-700/30 bg-gray-900/20 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-gray-400">Rank Progress</span>
                    <span className="text-teal-400 font-bold">{progressInfo.label}</span>
                  </div>
                  
                  {/* Outer Bar */}
                  <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressInfo.progress}%` }}
                    />
                  </div>
                  
                  {progressInfo.next && (
                    <p className="text-[11px] text-gray-500 text-right">
                      Next Rank: <span className="text-gray-300 font-medium">{progressInfo.next}</span>
                    </p>
                  )}
                </div>
              )}

              {/* User Contributed Notes List */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">📁 My Uploaded Notes</h4>
                {stats.notes.length === 0 ? (
                  <p className="text-xs text-gray-400 bg-gray-900/30 p-4 rounded-xl border border-gray-700/40 text-center">
                    You have not uploaded any notes yet. Shared notes will appear here once uploaded!
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-gray-700/40 shadow-inner bg-gray-900/20">
                    <table className="w-full text-left text-xs text-gray-300">
                      <thead className="bg-gray-950/45 text-gray-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Title</th>
                          <th className="px-4 py-3 font-semibold hidden sm:table-cell">Subject</th>
                          <th className="px-4 py-3 font-semibold text-center">Views</th>
                          <th className="px-4 py-3 font-semibold text-center">Upvotes</th>
                          <th className="px-4 py-3 font-semibold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {stats.notes.map((note) => (
                          <tr key={note._id} className="hover:bg-gray-800/20 transition-colors">
                            <td className="px-4 py-3 font-semibold text-white max-w-[150px] truncate" title={note.title}>
                              {note.title}
                            </td>
                            <td className="px-4 py-3 hidden sm:table-cell max-w-[120px] truncate text-gray-400" title={note.subject}>
                              {note.subject}
                            </td>
                            <td className="px-4 py-3 text-center text-gray-400 font-medium">
                              {note.views}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-400 font-bold">
                              {note.upvotes ? note.upvotes.length : 0}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => router.push(`/notes/${note.semester}/${note._id}`)}
                                className="text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer"
                              >
                                View →
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Edit Profile / First Time Setup Form */}
          {editing && (
            <div className="space-y-5 animate-fadeInUp">
              <div className="border-b border-gray-700/50 pb-3">
                <h3 className="text-xl font-bold text-white">
                  {isFirstTime ? "🚀 Welcome! Complete Your Profile" : "✏️ Edit Profile Info"}
                </h3>
                <p className="text-xs text-gray-400 mt-1">Fields marked with * are required.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Name *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      👤
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/50 text-gray-100 border border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
                      placeholder="Your Name"
                    />
                  </div>
                </div>

                {/* Email (Read Only) */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Email (Read Only)</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-650">
                      📧
                    </span>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-800/40 text-gray-500 border border-gray-800 cursor-not-allowed text-sm"
                    />
                  </div>
                </div>

                {/* Semester */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Semester *</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      🎓
                    </span>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/50 text-gray-100 border border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm appearance-none"
                    >
                      <option value="">-- Select Semester --</option>
                      {semesterOptions.map((s) => (
                        <option key={s} value={s}>{s} Semester</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* College */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">College</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      🏫
                    </span>
                    <input
                      type="text"
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/50 text-gray-100 border border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
                      placeholder="e.g. Pulchowk Campus"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      📍
                    </span>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/50 text-gray-100 border border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
                      placeholder="e.g. Lalitpur, Nepal"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                      📞
                    </span>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 rounded-xl bg-gray-900/50 text-gray-100 border border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
                      placeholder="e.g. 984XXXXXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700/30">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-400 hover:to-emerald-500 transition-all duration-200 flex-1 shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                {isFirstTime ? (
                  <button
                    onClick={handleSkip}
                    className="px-6 py-2.5 bg-gray-700 text-gray-300 font-semibold rounded-xl hover:bg-gray-650 transition flex-1 cursor-pointer"
                  >
                    Skip Setup
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2.5 bg-gray-800 border border-gray-700 text-gray-400 font-semibold rounded-xl hover:bg-gray-700 hover:text-gray-355 transition flex-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="w-full max-w-2xl bg-gray-800 p-1.5 rounded-2xl shadow-2xl animate-fadeInUp">
        {profileCard}
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-4 pb-24 sm:pb-8">
        
        {/* Header toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Profile Details</h1>
            <p className="text-gray-400 text-xs mt-1">Manage your student profile info and track upload stats</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gray-850 hover:bg-gray-800 border border-gray-700/50 text-gray-300 hover:text-white rounded-xl transition text-xs font-semibold cursor-pointer"
            >
              ← Back
            </button>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl transition text-xs font-semibold cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {profileCard}
      </div>
    </DashboardLayout>
  );
}

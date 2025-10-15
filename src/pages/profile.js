import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Profile({ embedded = false, onComplete }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [editing, setEditing] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [semester, setSemester] = useState("");
  const [college, setCollege] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");

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

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
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
        if (onComplete) onComplete();
      }
    } catch (err) {
      alert("❌ Error updating profile: " + err.message);
    }
  };

  const handleSkip = async () => {
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, profileComplete: true }),
      });
      const data = await res.json();
      if (data.success) {
        await update({ ...session, user: { ...session.user, ...data.user } });
        setEditing(false);
        setIsFirstTime(false);
        if (onComplete) onComplete();
      }
    } catch (err) {
      alert("❌ Error skipping profile: " + err.message);
    }
  };

  return (
    <div className={`${embedded ? "bg-gray-800 p-6 rounded-lg shadow-lg" : "min-h-screen bg-gray-900 p-4 sm:p-8"}`}>
      {!embedded && (
        <header className="flex flex-col items-center mb-6 sm:mb-8 gap-4">
        {/* Profile Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">Profile</h1>

        {/* Buttons below the title */}
        <div className="flex gap-4 w-full sm:w-auto justify-start">
          {!isFirstTime && (
            <button
              onClick={() => router.back()}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition text-white"
            >
              ← Back
            </button>
          )}
          {!isFirstTime && (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 rounded-lg hover:bg-red-700 text-white transition"
            >
              Logout
            </button>
          )}
        </div>
      </header>
      )}

      <div className={`${embedded ? "" : "max-w-3xl mx-auto"} bg-gray-800 p-4 sm:p-8 rounded-xl shadow-lg`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-6">
          <Image
            src={session.user.image || "/default-avatar.png"}
            alt="Profile"
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-2 ring-teal-400"
            width={128}
            height={128}
          />

          <div className="flex-1 w-full">
            {!editing ? (
              <div className="flex flex-col gap-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-white">{name}</h2>
                <p className="text-gray-400">{email}</p>
                {semester && <p className="text-gray-400">Semester: {semester}</p>}
                {college && <p className="text-gray-400">College: {college}</p>}
                {address && <p className="text-gray-400">Address: {address}</p>}
                {phone && <p className="text-gray-400">Phone: {phone}</p>}

                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition w-full sm:w-auto"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 w-full">
                <div>
                  <label className="block text-gray-300 mb-1">Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    readOnly
                    className="w-full px-4 py-2 rounded-lg bg-gray-600 text-gray-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1">Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  >
                    <option value="">-- Select Semester --</option>
                    {semesterOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {[{ label: "College", val: college, set: setCollege },
                  { label: "Address", val: address, set: setAddress },
                  { label: "Phone", val: phone, set: setPhone }
                ].map((f, i) => (
                  <div key={i}>
                    <label className="block text-gray-300 mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={f.val}
                      onChange={(e) => f.set(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition flex-1"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition flex-1"
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

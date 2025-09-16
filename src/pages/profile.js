import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  if (status === "loading") return <p>Loading...</p>;
  if (!session) {
    router.push("/login");
    return null;
  }

  const handleSave = () => {
    // Here you can add API call to update the user's name/email in DB
    setEditing(false);
    alert("Profile updated! (Add DB integration to save changes)");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      {/* Header with Back Button */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>

      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-xl shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start mb-6">
          <img
            src={session.user.image}
            alt="Profile"
            className="w-24 h-24 rounded-full ring-2 ring-teal-400 mb-4 sm:mb-0 sm:mr-6"
          />
          <div className="flex-1">
            {!editing ? (
              <>
                <h2 className="text-2xl font-semibold">{name}</h2>
                <p className="text-gray-400">{email}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-4 px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition"
                >
                  Edit Profile
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-4">
                <div>
                  <label className="block text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-400"
                  />
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-teal-400 text-gray-900 rounded-lg hover:bg-teal-500 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-600 text-gray-200 rounded-lg hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <section className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Account Info</h3>
          <ul className="text-gray-400 space-y-1">
            <li>Logged in as: {session.user.email}</li>
            <li>Name: {session.user.name}</li>
            <li>Profile picture URL: {session.user.image}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

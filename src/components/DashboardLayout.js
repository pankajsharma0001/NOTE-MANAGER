// components/DashboardLayout.js
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const sidebarItems = [
    { icon: "🏠", label: "Home", path: "/dashboard" },
    { icon: "📁", label: "Notes", path: "/notes" },
    { icon: "⭐", label: "Favorites", path: "/favorites" },
    { icon: "📖", label: "Syllabus", path: "/syllabus" },
    { icon: "🔗", label: "Share", path: "/share" },
  ];

  // Admin only
  const adminEmails = ["sharmapankaj102030@gmail.com"];
  if (session?.user?.email && adminEmails.includes(session.user.email)) {
    sidebarItems.push({
      icon: "📝",
      label: "Approvals",
      path: "/admin/approvals",
    });
  }

  // Detect current active tab
  const activeTab = sidebarItems.findIndex((item) => {
    if (item.path === "/notes") {
      return router.asPath.startsWith("/notes");
    }
    return router.asPath === item.path;
  });

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

  if (status === "loading") return <p>Loading...</p>;
  if (!session) return null;

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <aside className="w-20 bg-gray-950 text-white flex flex-col items-center py-6 space-y-6 relative">
        {sidebarItems.map((item, index) => (
          <div key={index} className="relative w-full flex flex-col items-center">
            <button
              className="p-3 rounded-lg hover:bg-gray-800 transition relative z-10"
              onClick={() => router.push(item.path)}
            >
              <span role="img" aria-label={item.label}>
                {item.icon}
              </span>
            </button>
            <span className="text-xs mt-1">{item.label}</span>

            {activeTab === index && (
              <span className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full z-0 transition-all duration-300"></span>
            )}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8" key={router.asPath}>
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-gray-400 text-lg">Good Afternoon ☕</h2>
            <h1 className="text-3xl font-bold">
              Welcome,{" "}
              <span className="text-teal-400">
                {session.user.name?.toUpperCase()}
              </span>
            </h1>
          </div>

          {/* Profile Dropdown */}
          <div className="relative mt-4 sm:mt-0" ref={dropdownRef}>
            <Image
              src={session.user.image}
              alt="Profile"
              className="w-12 h-12 rounded-full ring-2 ring-teal-400 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              width={80}
              height={80}
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

        {children}
      </main>
    </div>
  );
}

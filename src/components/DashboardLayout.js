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

  // 🔹 Dynamic Greeting based on time
  const [greeting, setGreeting] = useState("");
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning ☀️");
    else if (hour < 18) setGreeting("Good Afternoon ☕");
    else setGreeting("Good Evening 🌙");
  }, []);

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
      <aside className="bg-gray-950 text-white flex md:flex-col flex-row md:w-16 w-full fixed md:top-0 bottom-0 md:left-0 left-0 z-50 md:h-screen h-16 md:py-6 py-2 md:space-y-6 space-x-6 md:space-x-0 justify-around md:justify-start items-center">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className="relative md:w-full flex md:flex-col flex-row items-center justify-center md:justify-start"
          >
            <button
              className="p-3 rounded-lg hover:bg-gray-800 transition relative z-10"
              onClick={() => router.push(item.path)}
            >
              <span role="img" aria-label={item.label}>
                {item.icon}
              </span>
            </button>
            <span className="text-xs mt-1 md:mt-1 md:text-center hidden md:block">
              {item.label}
            </span>

            {/* Active Indicator */}
            {activeTab === index && (
              <>
                {/* Vertical for PC */}
                <span className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full"></span>
                {/* Horizontal for Mobile */}
                <span className="md:hidden absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-teal-400 rounded-t-full"></span>
              </>
            )}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main className="
              flex-1 
              md:ml-16 ml-0 
              md:px-8 px-4  /* <-- reduced horizontal padding on mobile */
              md:pt-8 pt-2 
              md:pb-0 pb-12
            "
            key={router.asPath}
      >
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-gray-400 text-lg">{greeting}</h2>
              <h1 className="text-3xl font-bold">
                Welcome, <span className="text-teal-400">{session.user.name?.toUpperCase()}</span>
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div
              className="relative flex-shrink-0 mt-4 sm:mt-0"
              ref={dropdownRef}
            >
              <Image
                src={session.user.image}
                alt="Profile"
                className="w-12 h-12 rounded-full ring-2 ring-teal-400 cursor-pointer object-cover"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                width={48}
                height={48}
              />
              {dropdownOpen && (
                <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 w-40 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50 animate-slideInRight">
                  <button
                    onClick={() => router.push("/profile")}
                    className="w-full text-left px-4 py-2 hover:bg-teal-500 hover:text-gray-900 transition-colors duration-200"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="w-full text-left px-4 py-2 hover:bg-red-500 hover:text-white transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}

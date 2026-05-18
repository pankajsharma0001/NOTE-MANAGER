import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ totalStudents: 0, totalNotes: 0 });
  // Avoid hydration mismatch by delaying full render until mounted on client
  const [mounted, setMounted] = useState(false);
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }
    fetchStats();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  // Render a minimal stable placeholder on the server to avoid hydration mismatches.
  if (!mounted) return <div className="min-h-screen bg-gray-900" />;

  return (
    <div className="h-[100dvh] overflow-hidden w-full flex flex-col justify-center md:flex-row bg-gray-900 text-white font-sans">

      {/* Left / Top Panel - Branding & Welcome text */}
      <div className="w-full h-[45dvh] md:h-full md:w-1/2 p-4 sm:p-6 md:p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden flex-none md:flex-1">
        {/* Subtle background glow */}
        <div className="absolute top-10 left-10 w-48 h-48 md:w-72 md:h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-20"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 md:w-72 md:h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] md:blur-[100px] opacity-20 hidden md:block"></div>

        <div className="relative z-10 w-full max-w-xl mx-auto md:mx-0 flex flex-col justify-center">
          <h1 className="text-[28px] leading-tight sm:text-4xl md:text-5xl font-extrabold mb-1 md:mb-4 text-white mt-4 md:mt-0 text-center md:text-left">
            Welcome Back
          </h1>
          <p className="text-teal-400 text-[13px] sm:text-sm md:text-xl font-semibold mb-2 md:mb-6 flex items-center justify-center md:justify-start gap-2">
            ✨ Note Manager
          </p>
          <p className="text-gray-400 text-[12px] sm:text-sm md:text-lg leading-snug lg:leading-relaxed mb-4 md:mb-8 hidden sm:block text-center md:text-left">
            Access our comprehensive collection of engineering notes, question papers, syllabus, and study materials to help you ace exams and succeed in your studies.
          </p>

          <div className="grid grid-cols-2 gap-3 md:gap-4 mt-2 sm:mt-4 md:mt-8">
            <div className="bg-gray-900 border border-gray-800 p-2 sm:p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-lg">
              <h3 className="text-xl sm:text-3xl md:text-4xl font-bold text-teal-400 mb-0 md:mb-2">{stats.totalStudents || "..."}+</h3>
              <p className="text-gray-500 text-[9px] md:text-sm font-medium tracking-wide">Total Students</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-2 sm:p-4 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center justify-center shadow-lg">
              <h3 className="text-xl sm:text-3xl md:text-4xl font-bold text-blue-400 mb-0 md:mb-2">{stats.totalNotes || "..."}+</h3>
              <p className="text-gray-500 text-[9px] md:text-sm font-medium tracking-wide">Study Materials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right / Bottom Panel - Auth */}
      <div className="w-full h-[55dvh] md:h-full md:w-1/2 p-4 sm:p-6 md:p-12 lg:p-20 flex flex-col justify-center items-center bg-gray-900 flex-none md:flex-1 relative md:border-l border-gray-800">
        <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm border border-gray-700/80 rounded-xl md:rounded-2xl p-5 sm:p-8 md:p-10 shadow-2xl flex flex-col items-center mx-auto my-auto h-auto">

          <Image
            src="/note-icon.jpg"
            alt="Logo"
            width={72}
            height={72}
            className="w-12 h-12 md:w-[72px] md:h-[72px] rounded-xl shadow-md mb-3 md:mb-8 ring-4 ring-gray-700"
          />

          <h2 className="text-lg md:text-2xl font-bold text-white mb-1 md:mb-2 text-center leading-tight">Forget the old way.</h2>
          <p className="text-gray-400 text-[11px] md:text-sm mb-4 md:mb-8 text-center">
            You can have the best study materials here.
          </p>

          <button
            onClick={handleSignIn}
            disabled={isLoading || status === "loading"}
            className="w-full flex items-center justify-center gap-2 md:gap-3 bg-white text-gray-900 font-semibold py-2.5 md:py-3.5 px-4 rounded-lg shadow hover:bg-gray-100 hover:shadow-lg transition-all disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading || status === "loading" ? (
              <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Image
                src="https://www.svgrepo.com/show/355037/google.svg"
                alt="Google"
                className="w-4 h-4 md:w-5 md:h-5 mx-0"
                width={20}
                height={20}
              />
            )}
            <span className="text-xs sm:text-sm md:text-base">
              {isLoading || status === "loading" ? "Authenticating..." : "Continue with Google"}
            </span>
          </button>

          <div className="w-full mt-5 md:mt-8 pt-4 md:pt-6 border-t border-gray-700 flex flex-col items-center gap-2 md:gap-4">
            <div className="flex items-center justify-center gap-1.5 md:gap-2 text-[9px] md:text-xs text-gray-400 text-center">
              <svg className="w-3 h-3 md:w-4 md:h-4 text-teal-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              <span>We never share your info without your consent.</span>
            </div>

            <p className="text-[9px] sm:text-xs text-gray-500 text-center mt-1 md:mt-2">
              By signing in, you agree to the{" "}
              <Link href="/terms" className="text-teal-400 hover:text-teal-300 hover:underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="text-teal-400 hover:text-teal-300 hover:underline">
                Privacy Policy
              </Link>.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

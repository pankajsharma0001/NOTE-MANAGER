import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login"); // 🚀 redirect to login page
    }
  }, [status, router]);

  if (status === "loading") return <p>Loading...</p>;

  if (!session) return null; // while redirecting, don’t flash content

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        Hello, {session.user.name} 👋
      </h1>
      <Image
        src={session.user.image}
        alt="User Avatar"
        className="w-20 h-20 rounded-full shadow-md mb-4"
      />
      <button
        onClick={() => signOut()}
        className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}

import { signIn } from "next-auth/react";
import { useEffect, useRef } from "react";

export default function Login() {
  const particleCount = 15;
  const colors = ["#ffffff40", "#fffc40", "#40ffc3", "#ff40b3"];
  const containerRef = useRef(null);

  useEffect(() => {
    const particles = containerRef.current.querySelectorAll(".particle");
    const handleMouseMove = (e) => {
      particles.forEach((p) => {
        const rect = p.getBoundingClientRect();
        const dx = rect.x + rect.width / 2 - e.clientX;
        const dy = rect.y + rect.height / 2 - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          p.style.transform = `translate(${dx / 5}px, ${dy / 5}px)`;
        } else {
          p.style.transform = `translate(0px, 0px)`;
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 overflow-hidden"
    >
      {/* Interactive particles */}
      {Array.from({ length: particleCount }).map((_, i) => {
        const size = Math.random() * 80 + 20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const delay = Math.random() * 5;
        return (
          <div
            key={i}
            className="absolute rounded-full particle animate-float"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              top: `${top}%`,
              left: `${left}%`,
              backgroundColor: color,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      {/* Glassmorphic card */}
      <div className="relative z-10 bg-white/30 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10 w-full max-w-sm text-center animate-card-fade">
        <img
          src="/note-icon.png"
          alt="Notes"
          className="w-20 h-20 mx-auto mb-4"
        />
        <h1 className="text-3xl font-extrabold text-white drop-shadow-md">
          Note Manager
        </h1>
        <p className="text-white/80 mt-2 mb-6">
          Sign in with Google to continue
        </p>

        <button
          onClick={() => signIn("google")}
          className="flex items-center justify-center gap-3 w-full py-3 px-5 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl animate-bounce-slow"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google"
            className="w-6 h-6"
          />
          Sign in with Google
        </button>

        <p className="mt-6 text-white/70 text-xs">
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer">Terms</span> &{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* Animations */}
      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.5;
          }
          50% {
            transform: translate(0, -30px) rotate(45deg);
            opacity: 0.8;
          }
          100% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 0.5;
          }
        }
        .animate-card-fade {
          animation: fadeInUp 1s ease forwards;
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite alternate;
        }
        @keyframes bounce {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}

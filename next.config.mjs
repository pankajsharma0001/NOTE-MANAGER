// next.config.mjs
import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */

// ✅ Initialize PWA plugin
const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // only enable in production
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // for Google profile images
      },
    ],
  },
  turbopack: {},
};

// ✅ Export wrapped config
export default withPWA(nextConfig);

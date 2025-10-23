import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <>
      <div className="max-w-4xl mx-auto bg-gray-900 text-gray-200 p-6 sm:p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-teal-400 mb-6 text-center">
          Privacy Policy
        </h1>

        <p className="mb-4">
          This Privacy Policy describes how <strong>Note Manager</strong> ("we",
          "our", or "us") collects, uses, and protects your information when you
          use our website and services.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          1. Information We Collect
        </h2>
        <p className="mb-3">
          We collect information you provide directly when you sign in with your
          Google account. This includes:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Your Google account name and email address</li>
          <li>Notes, favorites, and preferences saved in your account</li>
          <li>Analytics data (such as page views) collected anonymously</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          2. How We Use Your Information
        </h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>To provide, maintain, and improve our note management services</li>
          <li>To allow you to save and sync your notes and favorites</li>
          <li>To personalize your experience</li>
          <li>
            To display relevant ads (via Google AdSense) and support our service
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          3. Third-Party Services
        </h2>
        <p className="mb-3">
          We use trusted third-party services that may collect information in
          accordance with their own privacy policies:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>
            <strong>Google AdSense</strong> – for showing ads. AdSense may use
            cookies or web beacons to serve personalized ads.
          </li>
          <li>
            <strong>Vercel Analytics</strong> – for understanding anonymous usage
            trends.
          </li>
          <li>
            <strong>NextAuth (Google Sign-In)</strong> – for secure
            authentication.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          4. Data Security
        </h2>
        <p className="mb-4">
          We take reasonable measures to protect your personal information from
          unauthorized access or disclosure. However, no online service is
          completely secure.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          5. Your Rights
        </h2>
        <p className="mb-4">
          You may request deletion of your data at any time by contacting us or
          removing your Google sign-in data from Note Manager. You can also
          revoke access from your Google account settings.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          6. Cookies
        </h2>
        <p className="mb-4">
          We use cookies to maintain your login session and to show relevant ads.
          You can disable cookies in your browser settings, but some features may
          stop working.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          7. Changes to This Policy
        </h2>
        <p className="mb-4">
          We may update this Privacy Policy occasionally. Any changes will be
          reflected on this page with the updated date.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          8. Contact Us
        </h2>
        <p className="mb-8">
          If you have any questions or concerns about this Privacy Policy, you
          can contact us at:{" "}
          <span className="text-teal-400">engineeringnotez@gmail.com</span>
        </p>

        <p className="text-gray-400 text-sm text-center">
          Last updated: October 2025
        </p>

        <div className="text-center mt-10">
          <Link
            href="/"
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg shadow-lg transition-all duration-300"
          >
            ⬅ Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

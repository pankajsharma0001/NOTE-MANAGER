import DashboardLayout from "../components/DashboardLayout";
import Link from "next/link";

export default function Terms() {
  return (
    <>
      <div className="max-w-4xl mx-auto bg-gray-900 text-gray-200 p-6 sm:p-10 rounded-2xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-teal-400 mb-6 text-center">
          Terms & Conditions
        </h1>

        <p className="mb-4">
          Welcome to <strong>Note Manager</strong>. By accessing or using our website or
          services, you agree to be bound by these Terms and Conditions. Please
          read them carefully before using the app.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          1. Use of Service
        </h2>
        <p className="mb-4">
          Note Manager allows you to store, organize, and manage your study notes.
          You agree to use this platform only for lawful purposes and in
          accordance with these terms.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          2. User Accounts
        </h2>
        <p className="mb-4">
          You must sign in using your Google account to use certain features.
          You are responsible for maintaining the confidentiality of your login
          information and all activities under your account.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          3. Content Ownership
        </h2>
        <p className="mb-4">
          You retain ownership of the notes and content you create or upload on
          Note Manager. However, by using this service, you grant us limited
          permission to store and process that data to provide functionality.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          4. Prohibited Activities
        </h2>
        <ul className="list-disc pl-6 mb-4 space-y-1">
          <li>Using Note Manager for any illegal purpose</li>
          <li>Uploading harmful code, malware, or abusive content</li>
          <li>Attempting to gain unauthorized access to the platform</li>
          <li>Copying or redistributing the platform’s source code</li>
        </ul>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          5. Advertising and Third-Party Services
        </h2>
        <p className="mb-4">
          Note Manager uses third-party services like Google AdSense and Vercel
          Analytics. Ads displayed are managed by Google and are subject to
          Google’s own{" "}
          <a
            href="https://policies.google.com/technologies/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-400 underline"
          >
            Advertising Policies
          </a>
          . We do not control the content or frequency of ads displayed.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          6. Disclaimer of Warranties
        </h2>
        <p className="mb-4">
          Our service is provided "as is" without any warranties, express or
          implied. We do not guarantee uninterrupted or error-free operation of
          the platform.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          7. Limitation of Liability
        </h2>
        <p className="mb-4">
          Note Manager and its developers are not liable for any damages,
          losses, or data issues arising from the use of this platform.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          8. Changes to These Terms
        </h2>
        <p className="mb-4">
          We may update these Terms from time to time. Any changes will take
          effect immediately upon posting on this page. You are encouraged to
          review them periodically.
        </p>

        <h2 className="text-2xl font-semibold text-white mt-8 mb-3">
          9. Contact Us
        </h2>
        <p className="mb-8">
          For any questions regarding these Terms, please contact us at:{" "}
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

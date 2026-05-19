import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import DashboardLayout from "../../components/DashboardLayout";
import AnalyticsTab from "../../components/admin/AnalyticsTab";
import ApprovalsTab from "../../components/admin/ApprovalsTab";
import BulkUploadTab from "../../components/admin/BulkUploadTab";
import ManageNotesTab from "../../components/admin/ManageNotesTab";
import AdminsTab from "../../components/admin/AdminsTab";

const baseTabs = [
  { key: "analytics", label: "📊 Analytics" },
  { key: "approvals", label: "📝 Approvals" },
  { key: "bulk-upload", label: "📤 Bulk Upload" },
  { key: "manage", label: "⚙️ Manage Notes" },
];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("analytics");

  // Add Admins tab if superadmin
  const tabs = session?.user?.superadmin 
    ? [...baseTabs, { key: "admins", label: "👥 Manage Admins" }] 
    : baseTabs;

  // Read tab from URL query on mount
  useEffect(() => {
    if (router.query.tab && tabs.some(t => t.key === router.query.tab)) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab, session?.user?.superadmin]);

  // Update URL when tab changes
  const switchTab = (key) => {
    setActiveTab(key);
    router.replace({ pathname: "/admin", query: { tab: key } }, undefined, { shallow: true });
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  if (status === "loading" || session?.user?.role !== "admin") return null;

  return (
    <DashboardLayout>
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-800 p-1 rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => switchTab(tab.key)}
            className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-teal-500 text-white shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "approvals" && <ApprovalsTab />}
        {activeTab === "bulk-upload" && <BulkUploadTab />}
        {activeTab === "manage" && <ManageNotesTab />}
        {activeTab === "admins" && session?.user?.superadmin && <AdminsTab />}
      </div>
    </DashboardLayout>
  );
}

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Login from "./Login";
import DashboardLayout from "./dashboard/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Equipment from "@/pages/Equipment";
import Billing from "@/pages/Billing";
import Support from "@/pages/Support";
import NetworkManagement from "@/pages/NetworkManagement";
import NetworkMap from "@/pages/NetworkMap";
import HotspotManagement from "@/pages/HotspotManagement";
import Inventory from "@/pages/Inventory";
import Messages from "@/pages/Messages";
import Analytics from "@/pages/Analytics";
import Profile from "@/pages/Profile";
import Settings from "@/pages/Settings";
import ApiSettings from "@/pages/ApiSettings";
import Invoices from "@/pages/Invoices";
import CustomerPortal from "@/pages/CustomerPortal";
import PackageManagement from "@/pages/PackageManagement";
import DeveloperPortal from "@/pages/DeveloperPortal";
import ApiDocumentation from "@/pages/ApiDocumentation";
import LicenseManagement from "@/pages/LicenseManagement";
import AccessDenied from "./AccessDenied";
import NotFound from "@/pages/NotFound";
import NetworkStatus from "@/pages/NetworkStatus";
import SuperAdminLicenseManagement from "@/pages/SuperAdminLicenseManagement";

const AppContent = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const isAdmin = profile.role === 'super_admin' || profile.role === 'isp_admin';
  const canAccessDashboard = ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'].includes(profile.role);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={canAccessDashboard ? <Dashboard /> : <Navigate to="/access-denied" />} />
        <Route path="/clients" element={canAccessDashboard ? <Clients /> : <Navigate to="/access-denied" />} />
        <Route path="/equipment" element={canAccessDashboard ? <Equipment /> : <Navigate to="/access-denied" />} />
        <Route path="/billing" element={canAccessDashboard ? <Billing /> : <Navigate to="/access-denied" />} />
        <Route path="/support" element={canAccessDashboard ? <Support /> : <Navigate to="/access-denied" />} />
        <Route path="/network" element={canAccessDashboard ? <NetworkManagement /> : <Navigate to="/access-denied" />} />
        <Route path="/network-map" element={canAccessDashboard ? <NetworkMap /> : <Navigate to="/access-denied" />} />
        <Route path="/network-status" element={canAccessDashboard ? <NetworkStatus /> : <Navigate to="/access-denied" />} />
        <Route path="/hotspots" element={canAccessDashboard ? <HotspotManagement /> : <Navigate to="/access-denied" />} />
        <Route path="/inventory" element={canAccessDashboard ? <Inventory /> : <Navigate to="/access-denied" />} />
        <Route path="/messages" element={canAccessDashboard ? <Messages /> : <Navigate to="/access-denied" />} />
        <Route path="/analytics" element={canAccessDashboard ? <Analytics /> : <Navigate to="/access-denied" />} />
        <Route path="/packages" element={isAdmin ? <PackageManagement /> : <Navigate to="/access-denied" />} />
        <Route path="/developer-portal" element={isAdmin ? <DeveloperPortal /> : <Navigate to="/access-denied" />} />
        <Route path="/api-documentation" element={isAdmin ? <ApiDocumentation /> : <Navigate to="/access-denied" />} />
        <Route path="/license-management" element={isAdmin ? <LicenseManagement /> : <Navigate to="/access-denied" />} />
        {/* Super Admin only route - hidden from navigation */}
        <Route path="/system-license-admin" element={profile.role === 'super_admin' ? <SuperAdminLicenseManagement /> : <Navigate to="/access-denied" />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={isAdmin ? <Settings /> : <Navigate to="/access-denied" />} />
        <Route path="/api-settings" element={isAdmin ? <ApiSettings /> : <Navigate to="/access-denied" />} />
        <Route path="/invoices" element={canAccessDashboard ? <Invoices /> : <Navigate to="/access-denied" />} />
        <Route path="/customer-portal" element={<CustomerPortal />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AppContent;

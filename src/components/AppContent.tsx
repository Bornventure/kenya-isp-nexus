
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
import PackageManagement from "@/pages/PackageManagement";
import DeveloperPortal from "@/pages/DeveloperPortal";
import ApiDocumentation from "@/pages/ApiDocumentation";
import LicenseManagement from "@/pages/LicenseManagement";
import LicenseActivation from "@/pages/LicenseActivation";
import AccessDenied from "./AccessDenied";
import NotFound from "@/pages/NotFound";
import NetworkStatus from "@/pages/NetworkStatus";
import SuperAdminLicenseManagement from "@/pages/SuperAdminLicenseManagement";
import LicenseGuard from "@/components/license/LicenseGuard";
import Index from "@/pages/Index";

const AppContent = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show index page if no user is logged in
  if (!user || !profile) {
    return (
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  // If user doesn't have a company and is not super admin, redirect to license activation
  if (!profile.isp_company_id && profile.role !== 'super_admin') {
    return <LicenseActivation />;
  }

  const isAdmin = profile.role === 'super_admin' || profile.role === 'isp_admin';
  const canAccessDashboard = ['super_admin', 'isp_admin', 'billing_finance', 'customer_support', 'sales_account_manager', 'network_operations', 'infrastructure_asset', 'hotspot_admin'].includes(profile.role);

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/license-activation" element={<LicenseActivation />} />
        
        <Route path="/" element={canAccessDashboard ? (
          <LicenseGuard feature="dashboard" allowReadOnly={true}>
            <Dashboard />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/clients" element={canAccessDashboard ? (
          <LicenseGuard feature="client management">
            <Clients />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/equipment" element={canAccessDashboard ? (
          <LicenseGuard feature="equipment management">
            <Equipment />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/billing" element={canAccessDashboard ? (
          <LicenseGuard feature="billing management">
            <Billing />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/support" element={canAccessDashboard ? (
          <LicenseGuard feature="support system" allowReadOnly={true}>
            <Support />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/network" element={canAccessDashboard ? (
          <LicenseGuard feature="network management">
            <NetworkManagement />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/network-map" element={canAccessDashboard ? (
          <LicenseGuard feature="network mapping" allowReadOnly={true}>
            <NetworkMap />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/network-status" element={canAccessDashboard ? (
          <LicenseGuard feature="network status monitoring" allowReadOnly={true}>
            <NetworkStatus />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/hotspots" element={canAccessDashboard ? (
          <LicenseGuard feature="hotspot management">
            <HotspotManagement />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/inventory" element={canAccessDashboard ? (
          <LicenseGuard feature="inventory management">
            <Inventory />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/messages" element={canAccessDashboard ? (
          <LicenseGuard feature="messaging system" allowReadOnly={true}>
            <Messages />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/analytics" element={canAccessDashboard ? (
          <LicenseGuard feature="analytics dashboard" allowReadOnly={true}>
            <Analytics />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/packages" element={isAdmin ? (
          <LicenseGuard feature="package management">
            <PackageManagement />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/developer-portal" element={isAdmin ? (
          <LicenseGuard feature="developer portal" allowReadOnly={true}>
            <DeveloperPortal />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/api-documentation" element={isAdmin ? (
          <LicenseGuard feature="API documentation" allowReadOnly={true}>
            <ApiDocumentation />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/license-management" element={isAdmin ? (
          <LicenseGuard feature="license management" allowReadOnly={true}>
            <LicenseManagement />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        {/* Super Admin only route - NO LICENSE GUARD - always accessible */}
        <Route path="/system-license-admin" element={profile.role === 'super_admin' ? <SuperAdminLicenseManagement /> : <Navigate to="/access-denied" />} />
        
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={isAdmin ? (
          <LicenseGuard feature="system settings">
            <Settings />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/api-settings" element={isAdmin ? (
          <LicenseGuard feature="API settings">
            <ApiSettings />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/invoices" element={canAccessDashboard ? (
          <LicenseGuard feature="invoice management" allowReadOnly={true}>
            <Invoices />
          </LicenseGuard>
        ) : <Navigate to="/access-denied" />} />
        
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AppContent;

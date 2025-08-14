
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Login from '@/components/Login';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LicenseExpiredBanner from '@/components/license/LicenseExpiredBanner';

// Import placeholder components for all routes
import ClientsPage from '@/pages/Clients';
import EquipmentPage from '@/pages/Equipment';
import InventoryPage from '@/pages/Inventory';
import NetworkPage from '@/pages/Network';
import NetworkMapPage from '@/pages/NetworkMap';
import NetworkStatusPage from '@/pages/NetworkStatus';
import SystemInfrastructurePage from '@/pages/SystemInfrastructure';
import HotspotsPage from '@/pages/Hotspots';
import BillingPage from '@/pages/Billing';
import InvoicesPage from '@/pages/Invoices';
import SupportPage from '@/pages/Support';
import MessagesPage from '@/pages/Messages';
import AnalyticsPage from '@/pages/Analytics';
import PackagesPage from '@/pages/Packages';
import LicenseManagementPage from '@/pages/LicenseManagement';
import SystemLicenseAdminPage from '@/pages/SystemLicenseAdmin';
import DataMigrationPage from '@/pages/DataMigration';
import DeveloperPortalPage from '@/pages/DeveloperPortal';
import SettingsPage from '@/pages/Settings';

const AppContent = () => {
  const { user, profile, isLoading } = useAuth();

  console.log('AppContent auth state:', { user: !!user, profile: !!profile, isLoading });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes - only accessible when authenticated */}
      {user && profile ? (
        <Route path="/dashboard" element={
          <DashboardLayout>
            <LicenseExpiredBanner />
            <Dashboard />
          </DashboardLayout>
        } />
      ) : null}
      
      {user && profile ? (
        <>
          <Route path="/clients" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <ClientsPage />
            </DashboardLayout>
          } />
          <Route path="/equipment" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <EquipmentPage />
            </DashboardLayout>
          } />
          <Route path="/inventory" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <InventoryPage />
            </DashboardLayout>
          } />
          <Route path="/network" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <NetworkPage />
            </DashboardLayout>
          } />
          <Route path="/network-map" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <NetworkMapPage />
            </DashboardLayout>
          } />
          <Route path="/network-status" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <NetworkStatusPage />
            </DashboardLayout>
          } />
          <Route path="/system-infrastructure" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <SystemInfrastructurePage />
            </DashboardLayout>
          } />
          <Route path="/hotspots" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <HotspotsPage />
            </DashboardLayout>
          } />
          <Route path="/billing" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <BillingPage />
            </DashboardLayout>
          } />
          <Route path="/invoices" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <InvoicesPage />
            </DashboardLayout>
          } />
          <Route path="/support" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <SupportPage />
            </DashboardLayout>
          } />
          <Route path="/messages" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <MessagesPage />
            </DashboardLayout>
          } />
          <Route path="/analytics" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <AnalyticsPage />
            </DashboardLayout>
          } />
          <Route path="/packages" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <PackagesPage />
            </DashboardLayout>
          } />
          <Route path="/license-management" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <LicenseManagementPage />
            </DashboardLayout>
          } />
          <Route path="/system-license-admin" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <SystemLicenseAdminPage />
            </DashboardLayout>
          } />
          <Route path="/data-migration" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <DataMigrationPage />
            </DashboardLayout>
          } />
          <Route path="/developer-portal" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <DeveloperPortalPage />
            </DashboardLayout>
          } />
          <Route path="/settings" element={
            <DashboardLayout>
              <LicenseExpiredBanner />
              <SettingsPage />
            </DashboardLayout>
          } />
        </>
      ) : null}
      
      {/* Redirect unauthenticated users */}
      <Route path="*" element={
        user && profile ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
      } />
    </Routes>
  );
};

export default AppContent;


import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import Login from '@/components/auth/Login';

// Page imports
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import HotspotsPage from '@/pages/Hotspots';
import ServicePackages from '@/pages/ServicePackages';
import Equipment from '@/pages/Equipment';
import BaseStations from '@/pages/BaseStations';
import NetworkMap from '@/pages/NetworkMap';
import Inventory from '@/pages/Inventory';
import Billing from '@/pages/Billing';
import Invoices from '@/pages/Invoices';
import Reports from '@/pages/Reports';
import Analytics from '@/pages/Analytics';
import Messages from '@/pages/Messages';
import Support from '@/pages/Support';
import Settings from '@/pages/Settings';

// Admin pages
import UserManagement from '@/components/admin/UserManagement';
import CompanyManagement from '@/pages/admin/CompanyManagement';
import SystemSettings from '@/pages/admin/SystemSettings';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/hotspots" element={<HotspotsPage />} />
        <Route path="/service-packages" element={<ServicePackages />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/base-stations" element={<BaseStations />} />
        <Route path="/network-map" element={<NetworkMap />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/support" element={<Support />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* Admin routes */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/companies" element={<CompanyManagement />} />
        <Route path="/admin/system" element={<SystemSettings />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export default AppContent;

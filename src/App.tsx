
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Billing from '@/pages/Billing';
import Network from '@/pages/Network';
import NetworkManagement from '@/pages/NetworkManagement';
import Inventory from '@/pages/Inventory';
import Support from '@/pages/Support';
import Settings from '@/pages/Settings';
import SystemInfrastructure from '@/pages/SystemInfrastructure';
import SuperAdmin from '@/pages/SuperAdmin';
import UserManagement from '@/pages/UserManagement';
import CompanyManagement from '@/pages/CompanyManagement';
import SystemTest from '@/pages/SystemTest';
import HotspotManagement from '@/pages/HotspotManagement';
import NotificationCenter from '@/pages/NotificationCenter';
import ClientPortal from '@/pages/ClientPortal';
import Login from '@/pages/Login';
import Registration from '@/pages/Registration';
import CompanyRegistration from '@/pages/CompanyRegistration';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Registration />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/company-registration" element={<CompanyRegistration />} />
              
              {/* Protected routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="billing" element={<Billing />} />
                <Route path="network" element={<Network />} />
                <Route path="network-management" element={<NetworkManagement />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="support" element={<Support />} />
                <Route path="settings" element={<Settings />} />
                <Route path="infrastructure" element={<SystemInfrastructure />} />
                <Route path="super-admin" element={<SuperAdmin />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="company-management" element={<CompanyManagement />} />
                <Route path="system-test" element={<SystemTest />} />
                <Route path="hotspot" element={<HotspotManagement />} />
                <Route path="notifications" element={<NotificationCenter />} />
              </Route>
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
          <Toaster />
          <ReactQueryDevtools initialIsOpen={false} />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

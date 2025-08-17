
import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import Login from '@/components/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Equipment from '@/pages/Equipment';
import Inventory from '@/pages/Inventory';
import NetworkManagement from '@/pages/NetworkManagement';
import NetworkMap from '@/pages/NetworkMap';
import Billing from '@/pages/Billing';
import Support from '@/pages/Support';
import Settings from '@/pages/Settings';
import UserManagement from '@/pages/UserManagement';
import CompanyManagement from '@/pages/CompanyManagement';
import Sidebar from '@/components/layout/Sidebar';
import Layout from '@/components/layout/Layout';
import { AuthProvider } from '@/contexts/AuthContext';
import Workflow from '@/pages/Workflow';

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/*" element={<AppContent />} />
            </Routes>
          </BrowserRouter>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const AppContent = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/workflow" element={<Workflow />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/network-management" element={<NetworkManagement />} />
        <Route path="/network-map" element={<NetworkMap />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/support" element={<Support />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/company-management" element={<CompanyManagement />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
};

export default App;

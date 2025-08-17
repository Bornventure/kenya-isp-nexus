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
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { CompanyRegistration } from '@/pages/CompanyRegistration';
import { Dashboard } from '@/pages/Dashboard';
import { Clients } from '@/pages/Clients';
import { Equipment } from '@/pages/Equipment';
import { Inventory } from '@/pages/Inventory';
import { Billing } from '@/pages/Billing';
import { Invoices } from '@/pages/Invoices';
import { Payments } from '@/pages/Payments';
import { Analytics } from '@/pages/Analytics';
import { NetworkMonitoring } from '@/pages/NetworkMonitoring';
import { Hotspots } from '@/pages/Hotspots';
import { Support } from '@/pages/Support';
import { Messaging } from '@/pages/Messaging';
import { Reports } from '@/pages/Reports';
import { AdminPanel } from '@/pages/AdminPanel';
import { Settings } from '@/pages/Settings';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
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
              <Route path="/register" element={<Register />} />
              <Route path="/company-registration" element={<CompanyRegistration />} />
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
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/network-monitoring" element={<NetworkMonitoring />} />
            <Route path="/hotspots" element={<Hotspots />} />
            <Route path="/support" element={<Support />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;

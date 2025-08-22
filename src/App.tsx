
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Billing from '@/pages/Billing';
import Invoices from '@/pages/Invoices';
import Equipment from '@/pages/Equipment';
import Inventory from '@/pages/Inventory';
import NetworkStatus from '@/pages/NetworkStatus';
import NetworkMonitoring from '@/pages/NetworkMonitoring';
import SystemInfrastructure from '@/pages/SystemInfrastructure';
import Hotspots from '@/pages/Hotspots';
import ServicePackages from '@/pages/ServicePackages';
import Analytics from '@/pages/Analytics';
import Reports from '@/pages/Reports';
import Messages from '@/pages/Messages';
import Support from '@/pages/Support';
import UserManagement from '@/pages/UserManagement';
import CompanyManagement from '@/pages/CompanyManagement';
import Settings from '@/pages/Settings';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="clients" element={<Clients />} />
                <Route path="billing" element={<Billing />} />
                <Route path="invoices" element={<Invoices />} />
                <Route path="billing/payments" element={<Billing />} />
                <Route path="billing/reports" element={<Billing />} />
                <Route path="equipment" element={<Equipment />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="network" element={<NetworkStatus />} />
                <Route path="network-status" element={<NetworkStatus />} />
                <Route path="network-monitoring" element={<NetworkMonitoring />} />
                <Route path="system-infrastructure" element={<SystemInfrastructure />} />
                <Route path="hotspots" element={<Hotspots />} />
                <Route path="service-packages" element={<ServicePackages />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="reports" element={<Reports />} />
                <Route path="messages" element={<Messages />} />
                <Route path="support" element={<Support />} />
                <Route path="user-management" element={<UserManagement />} />
                <Route path="company-management" element={<CompanyManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </div>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

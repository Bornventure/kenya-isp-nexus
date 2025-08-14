
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import ClientDetails from '@/components/clients/details/ClientDetailsPage';
import Billing from '@/pages/Billing';
import NetworkStatus from '@/pages/NetworkStatus';
import NetworkMonitoring from '@/pages/NetworkMonitoring';
import SystemInfrastructure from '@/pages/SystemInfrastructure';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Inventory from '@/pages/Inventory';
import UserManagement from '@/pages/UserManagement';
import CompanyManagement from '@/pages/CompanyManagement';
import Hotspots from '@/pages/Hotspots';
import Messaging from '@/pages/Messaging';
import { Toaster } from '@/components/ui/toaster';

const AppContent = () => {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/clients/:id" element={<ClientDetails />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/network-status" element={<NetworkStatus />} />
            <Route path="/network-monitoring" element={<NetworkMonitoring />} />
            <Route path="/system-infrastructure" element={<SystemInfrastructure />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/company-management" element={<CompanyManagement />} />
            <Route path="/hotspots" element={<Hotspots />} />
            <Route path="/messaging" element={<Messaging />} />
          </Routes>
        </main>
      </div>
      <Toaster />
    </div>
  );
};

export default AppContent;

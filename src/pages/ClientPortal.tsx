
import React, { useState } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import ClientLoginForm from '@/components/client-portal/ClientLoginForm';
import ClientDashboardLayout from '@/components/client-portal/ClientDashboardLayout';
import ClientDashboard from '@/components/client-portal/ClientDashboard';
import WalletPage from '@/components/client-portal/WalletPage';

const ClientPortal = () => {
  const { client } = useClientAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Show login form if not authenticated
  if (!client) {
    return <ClientLoginForm />;
  }

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClientDashboard onTabChange={setActiveTab} />;
      case 'wallet':
        return <WalletPage />;
      case 'invoices':
        return <div>Invoices component coming soon...</div>;
      case 'support':
        return <div>Support component coming soon...</div>;
      case 'profile':
        return <div>Profile component coming soon...</div>;
      default:
        return <ClientDashboard onTabChange={setActiveTab} />;
    }
  };

  return (
    <ClientDashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderTabContent()}
    </ClientDashboardLayout>
  );
};

export default ClientPortal;

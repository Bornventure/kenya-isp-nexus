
import React, { useState, useEffect } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import ClientLoginForm from '@/components/client-portal/ClientLoginForm';
import ClientDashboardLayout from '@/components/client-portal/ClientDashboardLayout';
import ClientDashboard from '@/components/client-portal/ClientDashboard';
import WalletPage from '@/components/client-portal/WalletPage';
import InvoicesPage from '@/components/client-portal/InvoicesPage';
import DocumentsPage from '@/components/client-portal/DocumentsPage';
import SupportPage from '@/components/client-portal/SupportPage';
import ProfilePage from '@/components/client-portal/ProfilePage';

const ClientPortal = () => {
  const { client } = useClientAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle URL-based tab switching for PWA shortcuts
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['dashboard', 'wallet', 'invoices', 'documents', 'support', 'profile'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  // Update URL when tab changes (for PWA navigation)
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab !== 'dashboard') {
      url.searchParams.set('tab', activeTab);
    } else {
      url.searchParams.delete('tab');
    }
    window.history.replaceState({}, '', url.toString());
  }, [activeTab]);

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
        return <InvoicesPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'support':
        return <SupportPage />;
      case 'profile':
        return <ProfilePage />;
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

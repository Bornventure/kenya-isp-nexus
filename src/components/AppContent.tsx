
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import ClientsPage from '@/pages/ClientsPage';
import EquipmentPage from '@/pages/EquipmentPage';
import BillingPage from '@/pages/BillingPage';
import TicketsPage from '@/pages/TicketsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import WorkflowDashboard from '@/pages/WorkflowDashboard';
import ClientOnboardingWorkflow from '@/components/workflow/ClientOnboardingWorkflow';
import SMSTemplateManager from '@/components/sms/SMSTemplateManager';
import MessagingPage from '@/pages/MessagingPage';
import InventoryPage from '@/pages/InventoryPage';
import HotspotsPage from '@/pages/HotspotsPage';
import NetworkPage from '@/pages/NetworkPage';
import SettingsPage from '@/pages/SettingsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import ServiceActivationManager from '@/components/services/ServiceActivationManager';
import InstallationInvoiceManager from '@/components/invoices/InstallationInvoiceManager';
import PaymentMonitor from '@/components/payments/PaymentMonitor';
import WalletMonitor from '@/components/monitoring/WalletMonitor';
import NetworkIntegration from '@/components/network/NetworkIntegration';

const AppContent: React.FC = () => {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<string>('dashboard');

  useEffect(() => {
    const path = location.pathname.slice(1);
    setCurrentPage(path || 'dashboard');
  }, [location]);

  const renderContent = () => {
    switch (currentPage) {
      case '':
      case 'dashboard':
        return <DashboardPage />;
      case 'clients':
        return <ClientsPage />;
      case 'equipment':
        return <EquipmentPage />;
      case 'invoices':
        return <InvoicesPage />;
      case 'installation':
        return <InstallationInvoiceManager />;
      case 'payment-monitor':
        return <PaymentMonitor />;
      case 'wallet-monitor':
        return <WalletMonitor />;
      case 'network-integration':
        return <NetworkIntegration />;
      case 'service-activation':
        return <ServiceActivationManager />;
      case 'billing':
        return <BillingPage />;
      case 'tickets':
        return <TicketsPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'workflow':
        return <WorkflowDashboard />;
      case 'onboarding':
        return <ClientOnboardingWorkflow />;
      case 'sms-templates':
        return <SMSTemplateManager />;
      case 'messaging':
        return <MessagingPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'hotspots':
        return <HotspotsPage />;
      case 'network':
        return <NetworkPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex-1 p-6">
      {renderContent()}
    </div>
  );
};

export default AppContent;

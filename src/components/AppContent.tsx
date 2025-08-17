import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import Clients from '@/pages/Clients';
import Equipment from '@/pages/Equipment';
import Inventory from '@/pages/Inventory';
import ServicePackages from '@/pages/ServicePackages';
import BaseStations from '@/pages/BaseStations';
import NetworkMap from '@/pages/NetworkMap';
import Invoices from '@/pages/billing/Invoices';
import Payments from '@/pages/billing/Payments';
import InstallationInvoices from '@/pages/billing/InstallationInvoices';
import Hotspots from '@/pages/operations/Hotspots';
import SupportTickets from '@/pages/operations/SupportTickets';
import NetworkAnalytics from '@/pages/analytics/NetworkAnalytics';
import Reports from '@/pages/analytics/Reports';
import NetworkMonitoring from '@/pages/monitoring/NetworkMonitoring';
import RadiusMonitoring from '@/pages/monitoring/RadiusMonitoring';
import SystemSettings from '@/pages/administration/SystemSettings';
import UserManagement from '@/pages/administration/UserManagement';
import AuditLogs from '@/pages/AuditLogs';
import ClientWorkflowManager from './workflow/ClientWorkflowManager';
import NotificationTemplatesManager from './templates/NotificationTemplatesManager';

const AppContent: React.FC = () => {
  return (
    <div className="flex-1 p-4">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/clients/workflow" element={<ClientWorkflowManager />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/service-packages" element={<ServicePackages />} />
        <Route path="/base-stations" element={<BaseStations />} />
        <Route path="/network-map" element={<NetworkMap />} />
        
        {/* Billing Routes */}
        <Route path="/billing" element={<Navigate to="/billing/invoices" replace />} />
        <Route path="/billing/invoices" element={<Invoices />} />
        <Route path="/billing/payments" element={<Payments />} />
        <Route path="/billing/installation-invoices" element={<InstallationInvoices />} />
        
        {/* Operations Routes */}
        <Route path="/operations" element={<Navigate to="/operations/hotspots" replace />} />
        <Route path="/operations/hotspots" element={<Hotspots />} />
        <Route path="/operations/support-tickets" element={<SupportTickets />} />
        
        {/* Analytics Routes */}
        <Route path="/analytics" element={<Navigate to="/analytics/network" replace />} />
        <Route path="/analytics/network" element={<NetworkAnalytics />} />
        <Route path="/analytics/reports" element={<Reports />} />
        
        {/* Network Monitoring Routes */}
        <Route path="/monitoring" element={<Navigate to="/monitoring/network" replace />} />
        <Route path="/monitoring/network" element={<NetworkMonitoring />} />
        <Route path="/monitoring/radius" element={<RadiusMonitoring />} />
        
        {/* Administration Routes */}
        <Route path="/administration/system-settings" element={<SystemSettings />} />
        <Route path="/administration/user-management" element={<UserManagement />} />
        <Route path="/administration/templates" element={<NotificationTemplatesManager />} />
        
        {/* Audit Logs Route */}
        <Route path="/audit-logs" element={<AuditLogs />} />
      </Routes>
    </div>
  );
};

export default AppContent;

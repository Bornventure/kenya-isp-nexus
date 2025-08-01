
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import BillingFinanceDashboard from './roles/BillingFinanceDashboard';
import CustomerSupportDashboard from './roles/CustomerSupportDashboard';
import SalesAccountManagerDashboard from './roles/SalesAccountManagerDashboard';
import NetworkOperationsDashboard from './roles/NetworkOperationsDashboard';
import InfrastructureAssetDashboard from './roles/InfrastructureAssetDashboard';
import HotspotAdminDashboard from './roles/HotspotAdminDashboard';

export const RoleBasedDashboard = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'super_admin':
        return <SuperAdminDashboard />;
      case 'isp_admin':
        return <SuperAdminDashboard />;
      case 'billing_admin':
      case 'billing_finance':
        return <BillingFinanceDashboard />;
      case 'customer_support':
        return <CustomerSupportDashboard />;
      case 'sales_manager':
      case 'sales_account_manager':
        return <SalesAccountManagerDashboard />;
      case 'network_engineer':
      case 'network_operations':
        return <NetworkOperationsDashboard />;
      case 'infrastructure_manager':
      case 'infrastructure_asset':
        return <InfrastructureAssetDashboard />;
      case 'hotspot_admin':
        return <HotspotAdminDashboard />;
      case 'technician':
        return <InfrastructureAssetDashboard />; // Technicians get infrastructure dashboard
      case 'readonly':
        return <SuperAdminDashboard />; // Read-only users get basic dashboard view
      default:
        // For any unhandled roles, show a basic dashboard
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div className="w-full">
      {renderDashboard()}
    </div>
  );
};

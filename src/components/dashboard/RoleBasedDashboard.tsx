
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

  console.log('Current user role:', profile.role);

  const renderDashboard = () => {
    switch (profile.role) {
      case 'super_admin':
        console.log('Rendering SuperAdminDashboard for super_admin');
        return <SuperAdminDashboard />;
      case 'isp_admin':
        console.log('Rendering SuperAdminDashboard for isp_admin');
        return <SuperAdminDashboard />;
      case 'billing_admin':
      case 'billing_finance':
        console.log('Rendering BillingFinanceDashboard for billing role');
        return <BillingFinanceDashboard />;
      case 'customer_support':
        console.log('Rendering CustomerSupportDashboard for customer_support');
        return <CustomerSupportDashboard />;
      case 'sales_manager':
      case 'sales_account_manager':
        console.log('Rendering SalesAccountManagerDashboard for sales role');
        return <SalesAccountManagerDashboard />;
      case 'network_engineer':
      case 'network_operations':
        console.log('Rendering NetworkOperationsDashboard for network role');
        return <NetworkOperationsDashboard />;
      case 'infrastructure_manager':
      case 'infrastructure_asset':
        console.log('Rendering InfrastructureAssetDashboard for infrastructure role');
        return <InfrastructureAssetDashboard />;
      case 'hotspot_admin':
        console.log('Rendering HotspotAdminDashboard for hotspot_admin');
        return <HotspotAdminDashboard />;
      case 'technician':
        console.log('Rendering InfrastructureAssetDashboard for technician');
        return <InfrastructureAssetDashboard />; // Technicians get infrastructure dashboard
      case 'readonly':
        console.log('Rendering SuperAdminDashboard for readonly user');
        return <SuperAdminDashboard />; // Read-only users get basic dashboard view
      default:
        console.log('Unhandled role, rendering SuperAdminDashboard:', profile.role);
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

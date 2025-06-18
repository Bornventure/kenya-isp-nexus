
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerSupportDashboard from './roles/CustomerSupportDashboard';
import SalesAccountManagerDashboard from './roles/SalesAccountManagerDashboard';
import BillingFinanceDashboard from './roles/BillingFinanceDashboard';
import NetworkOperationsDashboard from './roles/NetworkOperationsDashboard';
import InfrastructureAssetDashboard from './roles/InfrastructureAssetDashboard';
import SuperAdminDashboard from './roles/SuperAdminDashboard';
import HotspotAdminDashboard from './roles/HotspotAdminDashboard';

const RoleBasedDashboard = () => {
  const { profile } = useAuth();

  const getRoleDashboard = () => {
    switch (profile?.role) {
      case 'customer_support':
        return <CustomerSupportDashboard />;
      case 'sales_manager':
        return <SalesAccountManagerDashboard />;
      case 'billing_admin':
        return <BillingFinanceDashboard />;
      case 'network_engineer':
        return <NetworkOperationsDashboard />;
      case 'infrastructure_manager':
        return <InfrastructureAssetDashboard />;
      case 'hotspot_admin':
        return <HotspotAdminDashboard />;
      case 'super_admin':
      case 'isp_admin':
        return <SuperAdminDashboard />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  return (
    <div className="p-6">
      {getRoleDashboard()}
    </div>
  );
};

export default RoleBasedDashboard;


import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedProductionNetworkPanel from '@/components/network/EnhancedProductionNetworkPanel';

const NetworkManagement = () => {
  const { profile } = useAuth();

  // Allow super_admin, isp_admin, and network_admin access
  if (!profile || !['super_admin', 'isp_admin', 'network_admin'].includes(profile.role)) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access network management.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <EnhancedProductionNetworkPanel />
    </div>
  );
};

export default NetworkManagement;

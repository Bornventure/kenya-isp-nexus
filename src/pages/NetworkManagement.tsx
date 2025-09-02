
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProductionNetworkPanel from '@/components/network/ProductionNetworkPanel';

const NetworkManagement = () => {
  const { profile } = useAuth();

  // Only allow ISP admins and super admins
  if (!profile || !['isp_admin', 'super_admin'].includes(profile.role)) {
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
      <ProductionNetworkPanel />
    </div>
  );
};

export default NetworkManagement;

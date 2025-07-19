
import React from 'react';
import ProductionNetworkPanel from '@/components/network/ProductionNetworkPanel';

const NetworkManagement = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Production Network Management</h1>
        <p className="text-muted-foreground mt-2">
          Real-time MikroTik RouterOS integration for automatic network access control, speed management, and data cap monitoring
        </p>
      </div>
      
      <ProductionNetworkPanel />
    </div>
  );
};

export default NetworkManagement;

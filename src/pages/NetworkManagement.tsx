
import React from 'react';
import NetworkManagementPanel from '@/components/network/NetworkManagementPanel';

const NetworkManagement = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Network Management</h1>
        <p className="text-muted-foreground mt-2">
          SNMP-based automatic network access control and device monitoring
        </p>
      </div>
      
      <NetworkManagementPanel />
    </div>
  );
};

export default NetworkManagement;

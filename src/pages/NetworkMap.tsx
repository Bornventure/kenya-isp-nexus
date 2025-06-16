
import React from 'react';
import EnhancedNetworkMap from '@/components/network/EnhancedNetworkMap';

const NetworkMap = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Network Map</h1>
        <p className="text-muted-foreground mt-2">
          Interactive map showing client locations, equipment, and network infrastructure
        </p>
      </div>
      
      <EnhancedNetworkMap />
    </div>
  );
};

export default NetworkMap;

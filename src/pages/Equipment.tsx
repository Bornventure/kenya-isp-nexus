
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentActions from '@/components/equipment/EquipmentActions';
import EquipmentLifecycleManager from '@/components/equipment/EquipmentLifecycleManager';
import RealNetworkInfrastructureManager from '@/components/infrastructure/RealNetworkInfrastructureManager';
import NetworkDeviceMonitor from '@/components/equipment/NetworkDeviceMonitor';
import EquipmentInventoryManager from '@/components/equipment/EquipmentInventoryManager';
import { MikrotikRouterManager } from '@/components/network/MikroTikRouterManager';

const Equipment = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Equipment Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage network equipment, live device monitoring, MikroTik routers, and complete equipment lifecycle
        </p>
      </div>
      
      <Tabs defaultValue="live-monitoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="live-monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik Routers</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live-monitoring">
          <NetworkDeviceMonitor />
        </TabsContent>
        
        <TabsContent value="mikrotik">
          <MikrotikRouterManager />
        </TabsContent>
        
        <TabsContent value="infrastructure">
          <RealNetworkInfrastructureManager />
        </TabsContent>
        
        <TabsContent value="inventory">
          <EquipmentInventoryManager />
        </TabsContent>
        
        <TabsContent value="lifecycle">
          <EquipmentLifecycleManager />
        </TabsContent>
        
        <TabsContent value="overview">
          <EquipmentActions />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Equipment;

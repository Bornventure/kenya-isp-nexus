
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EquipmentActions from '@/components/equipment/EquipmentActions';
import EquipmentLifecycleManager from '@/components/equipment/EquipmentLifecycleManager';

const Equipment = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Equipment Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage network equipment, SNMP configuration, and complete equipment lifecycle
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Equipment Overview</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <EquipmentActions />
        </TabsContent>
        
        <TabsContent value="lifecycle">
          <EquipmentLifecycleManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Equipment;

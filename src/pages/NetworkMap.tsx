
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedNetworkMap from '@/components/network/EnhancedNetworkMap';
import NetworkTopologyMap from '@/components/network/NetworkTopologyMap';

const NetworkMap = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Network Visualization</h1>
        <p className="text-muted-foreground mt-2">
          Interactive maps and topology diagrams of your network infrastructure
        </p>
      </div>
      
      <Tabs defaultValue="geographic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geographic">Geographic Map</TabsTrigger>
          <TabsTrigger value="topology">Network Topology</TabsTrigger>
        </TabsList>
        
        <TabsContent value="geographic">
          <EnhancedNetworkMap />
        </TabsContent>
        
        <TabsContent value="topology">
          <NetworkTopologyMap />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkMap;

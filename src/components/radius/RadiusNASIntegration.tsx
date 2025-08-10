
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RadiusConfigurationPanel from './RadiusConfigurationPanel';
import NASManagementPanel from './NASManagementPanel';

const RadiusNASIntegration = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">RADIUS & NAS Management</h1>
          <p className="text-muted-foreground">
            Configure RADIUS server and manage Network Access Server (NAS) clients
          </p>
        </div>
      </div>

      <Tabs defaultValue="nas-clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="nas-clients">NAS Clients</TabsTrigger>
          <TabsTrigger value="radius-config">RADIUS Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="nas-clients">
          <NASManagementPanel />
        </TabsContent>

        <TabsContent value="radius-config">
          <RadiusConfigurationPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RadiusNASIntegration;

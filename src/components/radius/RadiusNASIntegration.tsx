
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadiusServerManager } from '@/components/NetworkManagement/RadiusServerManager';
import { MikrotikRouterManager } from '@/components/NetworkManagement/MikrotikRouterManager';
import { Server, Router, Network } from 'lucide-react';

const RadiusNASIntegration = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network & RADIUS Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Manage your MikroTik routers and configure RADIUS authentication. 
            Add routers to your inventory first, then enable specific routers for RADIUS authentication.
          </p>
          
          <Tabs defaultValue="routers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="routers" className="flex items-center gap-2">
                <Router className="h-4 w-4" />
                Router Inventory
              </TabsTrigger>
              <TabsTrigger value="radius" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                RADIUS Configuration
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="routers" className="mt-6">
              <MikrotikRouterManager />
            </TabsContent>
            
            <TabsContent value="radius" className="mt-6">
              <RadiusServerManager />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadiusNASIntegration;

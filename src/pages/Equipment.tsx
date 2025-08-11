
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MikrotikRouterManager } from '@/components/NetworkManagement/MikrotikRouterManager';
import MikroTikSetupWizard from '@/components/network/MikroTikSetupWizard';
import NetworkEquipmentList from '@/components/equipment/NetworkEquipmentList';
import { Network, Router, Settings } from 'lucide-react';

const Equipment = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Network className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Network Equipment Management</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik Routers</TabsTrigger>
          <TabsTrigger value="setup">Setup Wizard</TabsTrigger>
          <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Network Equipment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <NetworkEquipmentList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mikrotik" className="space-y-6">
          <MikrotikRouterManager />
        </TabsContent>

        <TabsContent value="setup" className="space-y-6">
          <MikroTikSetupWizard />
        </TabsContent>

        <TabsContent value="lifecycle" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Equipment Lifecycle Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Manage the complete lifecycle of your network equipment from procurement to decommissioning.
                </p>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Inventory Promotion</h3>
                      <p className="text-sm text-muted-foreground">
                        Promote inventory items to active network equipment. Visit the Inventory page to promote items.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Equipment Assignment</h3>
                      <p className="text-sm text-muted-foreground">
                        Assign equipment to clients and track deployment status.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-2">Maintenance Tracking</h3>
                      <p className="text-sm text-muted-foreground">
                        Schedule and track maintenance activities for your equipment.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Equipment;

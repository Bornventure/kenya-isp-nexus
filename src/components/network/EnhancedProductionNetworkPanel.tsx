import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Users, Zap, Settings, Router } from 'lucide-react';
import { MikrotikRouterManager } from './MikroTikRouterManager';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useClients } from '@/hooks/useClients';
import { useProductionNetworkManagement } from '@/hooks/useProductionNetworkManagement';

const EnhancedProductionNetworkPanel = () => {
  const { routers } = useMikrotikRouters();
  const { clients } = useClients();
  const { disconnectClient, reconnectClient, applySpeedLimit } = useProductionNetworkManagement();
  const [activeTab, setActiveTab] = useState('overview');

  const onlineRouters = routers.filter(r => r.connection_status === 'online');
  const activeClients = clients.filter(c => c.status === 'active');
  const suspendedClients = clients.filter(c => c.status === 'suspended');

  const handleClientAction = async (action: 'disconnect' | 'reconnect' | 'speed_limit', clientId: string, packageId?: string) => {
    try {
      switch (action) {
        case 'disconnect':
          await disconnectClient(clientId);
          break;
        case 'reconnect':
          await reconnectClient(clientId);
          break;
        case 'speed_limit':
          if (packageId) {
            await applySpeedLimit(clientId, packageId);
          }
          break;
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production Network Management</h1>
          <p className="text-muted-foreground mt-2">
            Real-time MikroTik RouterOS integration for automatic network access control, speed management, and RADIUS authentication
          </p>
        </div>
      </div>

      {/* Network Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routers</CardTitle>
            <Router className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineRouters.length}</div>
            <p className="text-xs text-muted-foreground">of {routers.length} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeClients.length}</div>
            <p className="text-xs text-muted-foreground">connected users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{suspendedClients.length}</div>
            <p className="text-xs text-muted-foreground">blocked users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">all systems operational</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Network Overview</TabsTrigger>
          <TabsTrigger value="routers">Router Management</TabsTrigger>
          <TabsTrigger value="clients">Client Control</TabsTrigger>
          <TabsTrigger value="radius">RADIUS Config</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Router Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {routers.slice(0, 5).map((router) => (
                  <div key={router.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-3">
                      <Router className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{router.name}</p>
                        <p className="text-sm text-muted-foreground">{router.ip_address}</p>
                      </div>
                    </div>
                    <Badge variant={router.connection_status === 'online' ? 'default' : 'destructive'}>
                      {router.connection_status}
                    </Badge>
                  </div>
                ))}
                {routers.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No routers configured. Add routers in the Router Management tab.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Network Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                    <span>System started monitoring at {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-blue-500 rounded-full" />
                    <span>{activeClients.length} clients currently connected</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-2 w-2 bg-amber-500 rounded-full" />
                    <span>{suspendedClients.length} clients suspended</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="routers">
          <MikrotikRouterManager />
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client Network Control</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage client connections and apply speed limits directly from the ISP system
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {client.service_packages?.name} - {client.service_packages?.speed}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={client.status === 'active' ? 'default' : client.status === 'suspended' ? 'destructive' : 'secondary'}>
                        {client.status}
                      </Badge>
                      <div className="flex gap-1">
                        {client.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleClientAction('disconnect', client.id)}
                          >
                            Disconnect
                          </Button>
                        )}
                        {client.status === 'suspended' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleClientAction('reconnect', client.id)}
                          >
                            Reconnect
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClientAction('speed_limit', client.id, client.service_package_id || '')}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Apply Speed
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {clients.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No clients found. Add clients to start managing their network access.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radius" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RADIUS Integration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure FreeRADIUS integration with MikroTik routers for PPPoE authentication
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Settings className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">RADIUS Configuration Required</h4>
                    <p className="text-sm text-amber-700 mt-1">
                      To enable automatic PPPoE user provisioning and speed limit management:
                    </p>
                    <ul className="text-sm text-amber-700 mt-2 space-y-1 ml-4">
                      <li>• Configure FreeRADIUS server integration</li>
                      <li>• Set up MikroTik NAS client configuration</li>
                      <li>• Enable automatic user provisioning</li>
                      <li>• Configure speed limit attributes</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">RADIUS Server Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>FreeRADIUS Service</span>
                      <Badge variant="secondary">Not Configured</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Auto Provisioning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span>User Creation</span>
                      <Badge variant="secondary">Disabled</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4">
                <Button disabled>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure RADIUS Integration
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This feature requires additional server configuration and will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProductionNetworkPanel;

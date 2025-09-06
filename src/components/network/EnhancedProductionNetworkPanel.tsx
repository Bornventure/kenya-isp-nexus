import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Users, Zap, Settings, Router, Server, UserCheck, Wifi, RefreshCw } from 'lucide-react';
import { MikrotikRouterManager } from '@/components/network/MikroTikRouterManager';
import { RadiusServerManager } from '@/components/NetworkManagement/RadiusServerManager';
import RadiusUserManager from '@/components/NetworkManagement/RadiusUserManager';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import { useClients } from '@/hooks/useClients';
import { useRadiusServers } from '@/hooks/useRadiusServers';
import { useProductionNetworkManagement } from '@/hooks/useProductionNetworkManagement';

const EnhancedProductionNetworkPanel = () => {
  const { routers, isLoading: routersLoading } = useMikrotikRouters();
  const { clients, isLoading: clientsLoading } = useClients();
  const { radiusServers, isLoading: radiusLoading } = useRadiusServers();
  const { disconnectClient, reconnectClient, applySpeedLimit } = useProductionNetworkManagement();
  const [activeTab, setActiveTab] = useState('overview');

  const connectedRouters = routers.filter(r => r.connection_status === 'connected');
  const activeClients = clients.filter(c => c.status === 'active');
  const suspendedClients = clients.filter(c => c.status === 'suspended');
  const radiusEnabledRouters = radiusServers.filter(s => s.is_enabled).length;

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
            <div className="text-2xl font-bold text-green-600">{connectedRouters.length}</div>
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
            <CardTitle className="text-sm font-medium">RADIUS Servers</CardTitle>
            <Server className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{radiusEnabledRouters}</div>
            <p className="text-xs text-muted-foreground">enabled routers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="routers">Router Management</TabsTrigger>
          <TabsTrigger value="clients">Client Control</TabsTrigger>
          <TabsTrigger value="radius">RADIUS Config</TabsTrigger>
          <TabsTrigger value="radius-users">RADIUS Users</TabsTrigger>
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
                    <Badge variant={router.connection_status === 'connected' ? 'default' : 'destructive'}>
                      {router.connection_status || 'unknown'}
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
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Client Network Control
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage client connections, assign services, and control network access in real-time
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Refresh Status
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Active Sessions</p>
                          <p className="text-2xl font-bold text-green-600">{activeClients.length}</p>
                        </div>
                        <Wifi className="h-8 w-8 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Suspended</p>
                          <p className="text-2xl font-bold text-red-600">{suspendedClients.length}</p>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Total Clients</p>
                          <p className="text-2xl font-bold">{clients.length}</p>
                        </div>
                        <UserCheck className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-3">
                  {clients.map((client) => (
                    <div key={client.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex-shrink-0">
                            <div className={`w-3 h-3 rounded-full ${
                              client.status === 'active' ? 'bg-green-500' : 
                              client.status === 'suspended' ? 'bg-red-500' : 'bg-gray-500'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{client.name}</h3>
                              <Badge variant={
                                client.status === 'active' ? 'default' : 
                                client.status === 'suspended' ? 'destructive' : 'secondary'
                              }>
                                {client.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                              <p>📞 {client.phone}</p>
                              <p>💼 {client.service_packages?.name || 'No package'}</p>
                              <p>⚡ {client.service_packages?.speed || 'No speed limit'}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mt-1">
                              <p>💰 Rate: KES {client.monthly_rate || 0}/month</p>
                              <p>📍 {client.address}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
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
                  {clients.length === 0 && !clientsLoading && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Clients Found</h3>
                      <p className="text-gray-500 mb-4">
                        Add clients to start managing their network access and service assignments.
                      </p>
                    </div>
                  )}
                  {clientsLoading && (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading clients...</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radius" className="space-y-4">
          <RadiusServerManager />
        </TabsContent>

        <TabsContent value="radius-users" className="space-y-4">
          <RadiusUserManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProductionNetworkPanel;

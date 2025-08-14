
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Router, 
  Shield, 
  Activity, 
  Settings,
  Plus,
  TestTube,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useMikrotikIntegration } from '@/hooks/useMikrotikIntegration';
import { useRadiusServers, useNASClients } from '@/hooks/useRadius';

const NetworkPage = () => {
  const {
    activeClients,
    interfaces,
    systemResources,
    isLoadingClients,
    isLoadingInterfaces,
    isLoadingResources,
    testConnection,
    isTesting
  } = useMikrotikIntegration();

  const { data: radiusServers = [], isLoading: radiusLoading } = useRadiusServers();
  const { data: nasClients = [], isLoading: nasLoading } = useNASClients();

  const [activeTab, setActiveTab] = useState('overview');

  const handleTestMikroTik = () => {
    testConnection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Network Management</h1>
        <p className="text-muted-foreground">
          Manage MikroTik routers, RADIUS servers, and network monitoring
        </p>
      </div>

      {/* Network Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Router className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Clients</p>
                <p className="text-2xl font-bold">{activeClients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">RADIUS Servers</p>
                <p className="text-2xl font-bold">{radiusServers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interfaces</p>
                <p className="text-2xl font-bold">{interfaces.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">NAS Clients</p>
                <p className="text-2xl font-bold">{nasClients.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik</TabsTrigger>
          <TabsTrigger value="radius">RADIUS</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Resources */}
          {systemResources && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">CPU Load</p>
                    <p className="text-2xl font-bold">{systemResources['cpu-load']}%</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Free Memory</p>
                    <p className="text-2xl font-bold">
                      {Math.round(parseInt(systemResources['free-memory']) / 1024 / 1024)}MB
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Uptime</p>
                    <p className="text-2xl font-bold">{systemResources.uptime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Network Interfaces */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                Network Interfaces
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interfaces.map((interface_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{interface_.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {interface_.type} - {interface_['mac-address']}
                      </p>
                    </div>
                    <Badge variant={interface_.running === 'true' ? 'default' : 'destructive'}>
                      {interface_.running === 'true' ? 'Running' : 'Down'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mikrotik" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Router className="h-5 w-5" />
                  MikroTik Management
                </CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleTestMikroTik}
                    disabled={isTesting}
                    className="gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    {isTesting ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button className="gap-2">
                    <Settings className="h-4 w-4" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Active PPPoE Clients */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Active PPPoE Clients</h3>
                {isLoadingClients ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeClients.map((client, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            IP: {client['caller-id']} | Uptime: {client.uptime}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="default">Connected</Badge>
                          <Button size="sm" variant="outline">
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    ))}
                    {activeClients.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No active PPPoE clients
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radius" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  RADIUS Configuration
                </CardTitle>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Server
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">RADIUS Servers</h3>
                {radiusLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {radiusServers.map((server) => (
                      <div key={server.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{server.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {server.server_address}:{server.auth_port}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={server.is_enabled ? 'default' : 'outline'}>
                            {server.is_enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                          {server.is_primary && (
                            <Badge variant="secondary">Primary</Badge>
                          )}
                          <Button size="sm" variant="outline">
                            Test
                          </Button>
                        </div>
                      </div>
                    ))}
                    {radiusServers.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No RADIUS servers configured
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-semibold">NAS Clients</h3>
                {nasLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nasClients.map((nas) => (
                      <div key={nas.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{nas.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {nas.nas_ip_address} | {nas.type}
                          </p>
                        </div>
                        <Badge variant={nas.is_active ? 'default' : 'outline'}>
                          {nas.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))}
                    {nasClients.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No NAS clients configured
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Network Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Real-time Monitoring</h3>
                <p className="text-muted-foreground">
                  Network monitoring dashboard will be available here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkPage;

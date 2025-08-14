
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Network, 
  Wifi, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Settings,
  RefreshCw,
  Database,
  Router,
  Monitor
} from 'lucide-react';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';

const SystemInfrastructure = () => {
  const { devices, isLoading, startMonitoring, stopMonitoring, isMonitoring } = useRealSNMP();
  const { routers, isLoading: routersLoading, testConnection } = useMikrotikRouters();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock data for infrastructure components
  const serverStats = {
    cpu: 45,
    memory: 67,
    disk: 82,
    network: 34,
    uptime: '15d 8h 32m'
  };

  const infrastructureComponents = [
    {
      id: 1,
      name: 'Main Server',
      type: 'server',
      status: 'online',
      location: 'Data Center A',
      lastSeen: '2 minutes ago',
      metrics: { cpu: 45, memory: 67, disk: 82 }
    },
    {
      id: 2,
      name: 'Database Server',
      type: 'database',
      status: 'online',
      location: 'Data Center A',
      lastSeen: '1 minute ago',
      metrics: { cpu: 23, memory: 45, disk: 56 }
    },
    {
      id: 3,
      name: 'Network Controller',
      type: 'network',
      status: 'warning',
      location: 'Data Center B',
      lastSeen: '5 minutes ago',
      metrics: { cpu: 78, memory: 89, disk: 45 }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="h-5 w-5" />;
      case 'database':
        return <Database className="h-5 w-5" />;
      case 'network':
        return <Network className="h-5 w-5" />;
      case 'router':
        return <Router className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Infrastructure</h1>
          <p className="text-muted-foreground">
            Monitor and manage your network infrastructure components
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setSelectedTab('overview')}
          className={`px-4 py-2 border-b-2 font-medium ${
            selectedTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setSelectedTab('servers')}
          className={`px-4 py-2 border-b-2 font-medium ${
            selectedTab === 'servers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Servers
        </button>
        <button
          onClick={() => setSelectedTab('network')}
          className={`px-4 py-2 border-b-2 font-medium ${
            selectedTab === 'network'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Network Devices
        </button>
        <button
          onClick={() => setSelectedTab('routers')}
          className={`px-4 py-2 border-b-2 font-medium ${
            selectedTab === 'routers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          MikroTik Routers
        </button>
      </div>

      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* System Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Network Devices</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{devices.length}</div>
                <p className="text-xs text-muted-foreground">
                  SNMP monitored
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MikroTik Routers</CardTitle>
                <Router className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{routers.length}</div>
                <p className="text-xs text-muted-foreground">
                  {routers.filter(r => r.connection_status === 'online').length} online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">99.8%</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>{serverStats.cpu}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${serverStats.cpu}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>{serverStats.memory}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${serverStats.memory}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Disk Usage</span>
                    <span>{serverStats.disk}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-600 h-2 rounded-full" 
                      style={{ width: `${serverStats.disk}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Network I/O</span>
                    <span>{serverStats.network}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${serverStats.network}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedTab === 'servers' && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {infrastructureComponents.filter(c => c.type === 'server' || c.type === 'database').map((component) => (
              <Card key={component.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTypeIcon(component.type)}
                      <div>
                        <h3 className="font-semibold">{component.name}</h3>
                        <p className="text-sm text-muted-foreground">{component.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(component.status)}
                          <Badge variant={component.status === 'online' ? 'default' : 'destructive'}>
                            {component.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last seen: {component.lastSeen}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">CPU</p>
                      <p className="text-lg font-semibold">{component.metrics.cpu}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Memory</p>
                      <p className="text-lg font-semibold">{component.metrics.memory}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Disk</p>
                      <p className="text-lg font-semibold">{component.metrics.disk}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'network' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading network devices...</div>
          ) : devices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Network Devices Found</h3>
                <p className="text-muted-foreground">
                  Add network devices to start monitoring your infrastructure.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {devices.map((device) => (
                <Card key={device.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Network className="h-8 w-8" />
                        <div>
                          <h3 className="font-semibold">{device.name}</h3>
                          <p className="text-sm text-muted-foreground">{device.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                          {device.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-semibold capitalize">{device.type}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">CPU</p>
                        <p className="font-semibold">{device.cpuUsage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Memory</p>
                        <p className="font-semibold">{device.memoryUsage}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Uptime</p>
                        <p className="font-semibold">{Math.floor(device.uptime / 3600)}h</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab === 'routers' && (
        <div className="space-y-4">
          {routersLoading ? (
            <div className="text-center py-8">Loading MikroTik routers...</div>
          ) : routers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Router className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No MikroTik Routers Found</h3>
                <p className="text-muted-foreground">
                  Add MikroTik routers to manage your network infrastructure.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {routers.map((router) => (
                <Card key={router.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Router className="h-8 w-8" />
                        <div>
                          <h3 className="font-semibold">{router.name}</h3>
                          <p className="text-sm text-muted-foreground">{router.ip_address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant={router.connection_status === 'online' ? 'default' : 'destructive'}>
                          {router.connection_status}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(router.id)}
                        >
                          Test Connection
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-semibold capitalize">{router.status}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">SNMP Version</p>
                        <p className="font-semibold">v{router.snmp_version}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Client Network</p>
                        <p className="font-semibold text-xs">{router.client_network}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Gateway</p>
                        <p className="font-semibold text-xs">{router.gateway}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SystemInfrastructure;

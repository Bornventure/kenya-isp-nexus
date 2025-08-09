
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Activity, Router, Wifi, Server, Zap, RefreshCw, Settings, Play, Pause } from 'lucide-react';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useMikrotikRouters } from '@/hooks/useMikrotikRouters';
import AddSNMPDeviceDialog from '../network/AddSNMPDeviceDialog';

const NetworkDeviceMonitor = () => {
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [showAddDevice, setShowAddDevice] = useState(false);
  
  const {
    devices: snmpDevices,
    isLoading: snmpLoading,
    isMonitoring,
    addDevice,
    testConnection,
    startMonitoring,
    stopMonitoring,
    refreshDevices,
    disconnectClient,
    reconnectClient
  } = useRealSNMP();

  const { 
    routers: mikrotikRouters, 
    isLoading: mikrotikLoading,
    testConnection: testMikrotikConnection
  } = useMikrotikRouters();

  useEffect(() => {
    if (isAutoRefresh && !isMonitoring) {
      const interval = setInterval(refreshDevices, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isAutoRefresh, isMonitoring, refreshDevices]);

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    await addDevice(ip, community, version);
    setShowAddDevice(false);
  };

  const allDevices = [...snmpDevices, ...mikrotikRouters.map(router => ({
    id: router.id,
    name: router.name,
    ip: router.ip_address,
    community: router.snmp_community,
    version: router.snmp_version,
    status: router.connection_status,
    type: 'mikrotik_router' as const,
    uptime: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    interfaces: []
  }))];

  const onlineCount = allDevices.filter(d => d.status === 'online').length;
  const offlineCount = allDevices.filter(d => d.status === 'offline').length;
  const totalDevices = allDevices.length;

  const deviceTypeIcons = {
    router: Router,
    switch: Server,
    access_point: Wifi,
    mikrotik_router: Router,
    firewall: Server,
    load_balancer: Server
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    const Icon = deviceTypeIcons[type as keyof typeof deviceTypeIcons] || Server;
    return <Icon className="h-5 w-5" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Network Device Monitoring</h2>
          <p className="text-muted-foreground">Real-time monitoring of all network equipment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAutoRefresh(!isAutoRefresh)}
          >
            {isAutoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDevices}
            disabled={snmpLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${snmpLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDevice(true)}>
            Add Device
          </Button>
          {isMonitoring ? (
            <Button variant="destructive" onClick={stopMonitoring}>
              Stop Monitoring
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDevices}</div>
            <p className="text-xs text-muted-foreground">Network devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineCount}</div>
            <p className="text-xs text-muted-foreground">Active devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineCount}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Network health</p>
          </CardContent>
        </Card>
      </div>

      {/* Device List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Devices ({totalDevices})</TabsTrigger>
          <TabsTrigger value="online">Online ({onlineCount})</TabsTrigger>
          <TabsTrigger value="offline">Offline ({offlineCount})</TabsTrigger>
          <TabsTrigger value="mikrotik">MikroTik ({mikrotikRouters.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Network Devices</CardTitle>
            </CardHeader>
            <CardContent>
              {totalDevices === 0 ? (
                <div className="text-center py-12">
                  <Router className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Devices Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first network device to start live monitoring.
                  </p>
                  <Button onClick={() => setShowAddDevice(true)}>
                    Add First Device
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {allDevices.map((device) => (
                    <Card key={device.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DeviceIcon type={device.type} />
                            <div>
                              <CardTitle className="text-lg">{device.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{device.ip}</p>
                            </div>
                          </div>
                          <Badge className={`text-white ${getStatusColor(device.status)}`}>
                            {device.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium">CPU Usage</div>
                            <div className="flex items-center gap-2">
                              <Progress value={device.cpuUsage} className="h-2" />
                              <span className="text-sm">{device.cpuUsage.toFixed(1)}%</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium">Memory Usage</div>
                            <div className="flex items-center gap-2">
                              <Progress value={device.memoryUsage} className="h-2" />
                              <span className="text-sm">{device.memoryUsage.toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <div className="font-medium capitalize">{device.type.replace('_', ' ')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">SNMP:</span>
                            <div className="font-medium">v{device.version}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Interfaces:</span>
                            <div className="font-medium">{device.interfaces?.length || 0}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Uptime:</span>
                            <div className="font-medium">{Math.floor(device.uptime / 3600)}h</div>
                          </div>
                        </div>

                        <div className="flex justify-between pt-2 border-t">
                          <Button size="sm" variant="outline">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                          <Button size="sm" variant="outline">
                            <Activity className="h-4 w-4 mr-1" />
                            Monitor
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="online">
          <Card>
            <CardHeader>
              <CardTitle>Online Devices ({onlineCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allDevices
                  .filter(device => device.status === 'online')
                  .map((device) => (
                    <Card key={device.id} className="border-green-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <DeviceIcon type={device.type} />
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <p className="text-sm text-muted-foreground">{device.ip}</p>
                            </div>
                          </div>
                          <Badge className="bg-green-500 text-white">Online</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offline">
          <Card>
            <CardHeader>
              <CardTitle>Offline Devices ({offlineCount})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {allDevices
                  .filter(device => device.status === 'offline')
                  .map((device) => (
                    <Card key={device.id} className="border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            <div>
                              <h4 className="font-medium">{device.name}</h4>
                              <p className="text-sm text-muted-foreground">{device.ip}</p>
                            </div>
                          </div>
                          <Badge variant="destructive">Offline</Badge>
                        </div>
                        <div className="mt-3">
                          <Button size="sm" variant="outline" className="w-full">
                            Test Connection
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mikrotik">
          <Card>
            <CardHeader>
              <CardTitle>MikroTik Routers ({mikrotikRouters.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {mikrotikRouters.map((router) => (
                  <Card key={router.id} className="border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Router className="h-5 w-5 text-blue-600" />
                          <div>
                            <h4 className="font-medium">{router.name}</h4>
                            <p className="text-sm text-muted-foreground">{router.ip_address}</p>
                          </div>
                        </div>
                        <Badge className={`text-white ${getStatusColor(router.connection_status)}`}>
                          {router.connection_status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Username:</span>
                          <div className="font-medium">{router.admin_username}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Interface:</span>
                          <div className="font-medium">{router.pppoe_interface}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => testMikrotikConnection(router.id)}
                        >
                          Test
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Configure
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddSNMPDeviceDialog
        open={showAddDevice}
        onOpenChange={setShowAddDevice}
        onDeviceAdded={handleAddDevice}
        onTestConnection={testConnection}
        isLoading={snmpLoading}
      />
    </div>
  );
};

export default NetworkDeviceMonitor;

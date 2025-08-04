import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useClients } from '@/hooks/useClients';
import AddSNMPDeviceDialog from './AddSNMPDeviceDialog';
import { 
  Router, 
  Wifi, 
  Server, 
  Plus,
  Settings,
  Activity,
  Users,
  Network,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  WifiOff
} from 'lucide-react';

const ProductionNetworkControl = () => {
  const {
    devices,
    isLoading,
    isMonitoring,
    addDevice,
    testConnection,
    disconnectClient,
    reconnectClient,
    startMonitoring,
    stopMonitoring,
    refreshDevices,
  } = useRealSNMP();

  const { clients } = useClients();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const deviceTypeIcons = {
    router: Router,
    switch: Server,
    access_point: Wifi
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    await addDevice(ip, community, version);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Network className="h-6 w-6" />
              Production Network Control Center
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshDevices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={isMonitoring ? "destructive" : "default"}
                size="sm"
                onClick={isMonitoring ? stopMonitoring : startMonitoring}
              >
                <Activity className="h-4 w-4 mr-2" />
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <Server className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">{devices.length}</div>
              <div className="text-sm text-blue-600">Network Devices</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-700">
                {devices.filter(d => d.status === 'online').length}
              </div>
              <div className="text-sm text-green-600">Online</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <div className="text-2xl font-bold text-red-700">
                {devices.filter(d => d.status === 'offline').length}
              </div>
              <div className="text-sm text-red-600">Offline</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <Users className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-700">{clients.length}</div>
              <div className="text-sm text-purple-600">Total Clients</div>
            </div>
          </div>

          <Tabs defaultValue="devices" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="devices">Network Devices</TabsTrigger>
              <TabsTrigger value="monitoring">Real-time Monitor</TabsTrigger>
              <TabsTrigger value="control">Device Control</TabsTrigger>
            </TabsList>
            
            <TabsContent value="devices" className="space-y-4">
              {devices.length === 0 ? (
                <div className="text-center py-12">
                  <Router className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Devices Connected</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your gateway router or network devices to start monitoring and control.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Network Device
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.map((device) => {
                    const Icon = deviceTypeIcons[device.type];
                    return (
                      <Card key={device.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedDevice === device.id ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedDevice(device.id)}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-5 w-5 text-blue-500" />
                              <div>
                                <h4 className="font-semibold">{device.name}</h4>
                                <p className="text-sm text-muted-foreground">{device.ip}</p>
                              </div>
                            </div>
                            <Badge className={`text-white ${getStatusColor(device.status)}`}>
                              {device.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Uptime:</span>
                              <div className="font-medium">{formatUptime(device.uptime)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Type:</span>
                              <div className="font-medium capitalize">{device.type}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>CPU Usage</span>
                                <span>{device.cpuUsage.toFixed(1)}%</span>
                              </div>
                              <Progress value={device.cpuUsage} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>Memory Usage</span>
                                <span>{device.memoryUsage.toFixed(1)}%</span>
                              </div>
                              <Progress value={device.memoryUsage} className="h-2" />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm pt-2 border-t">
                            <span className="text-muted-foreground">
                              {device.interfaces.length} interfaces
                            </span>
                            <span className="text-xs text-muted-foreground">
                              SNMP v{device.version}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="monitoring" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Real-time monitoring data will be displayed here.</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="control" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Device Control</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedDevice ? (
                    <div>
                      <h4 className="text-lg font-semibold mb-2">Control Options</h4>
                      <p>Selected Device: {selectedDevice}</p>
                      <Button variant="destructive" onClick={() => disconnectClient(devices.find(d => d.id === selectedDevice)?.ip || '', 'test-client')}>
                        <WifiOff className="h-4 w-4 mr-2" />
                        Disconnect Client
                      </Button>
                      <Button variant="default" onClick={() => reconnectClient(devices.find(d => d.id === selectedDevice)?.ip || '', 'test-client')}>
                        <Wifi className="h-4 w-4 mr-2" />
                        Reconnect Client
                      </Button>
                    </div>
                  ) : (
                    <p>Select a device to view control options.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddSNMPDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onDeviceAdded={handleAddDevice}
        onTestConnection={testConnection}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductionNetworkControl;

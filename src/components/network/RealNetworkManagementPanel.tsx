
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import AddSNMPDeviceDialog from './AddSNMPDeviceDialog';
import { 
  Router, 
  Wifi, 
  Server, 
  Plus,
  WifiOff,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Zap,
  RefreshCw
} from 'lucide-react';

const RealNetworkManagementPanel = () => {
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

  const [showAddDialog, setShowAddDialog] = useState(false);

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
              <Settings className="h-5 w-5" />
              Real Network Management (SNMP)
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
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{devices.length}</div>
              <div className="text-sm text-muted-foreground">Total Devices</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {devices.filter(d => d.status === 'online').length}
              </div>
              <div className="text-sm text-muted-foreground">Online Devices</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">
                {devices.filter(d => d.status === 'offline').length}
              </div>
              <div className="text-sm text-muted-foreground">Offline Devices</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">
                {devices.reduce((sum, d) => sum + d.interfaces.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Interfaces</div>
            </div>
          </div>

          {devices.length === 0 ? (
            <div className="text-center py-12">
              <Wifi className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Network Devices Found</h3>
              <p className="text-muted-foreground mb-4">
                Add your first router, switch, or access point to start monitoring your network.
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add SNMP Device
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Network Devices</h4>
              {devices.map((device) => {
                const Icon = deviceTypeIcons[device.type];
                return (
                  <div key={device.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon className="h-6 w-6 text-blue-500" />
                        <div>
                          <h5 className="font-semibold">{device.name}</h5>
                          <p className="text-sm text-muted-foreground">{device.ip}</p>
                        </div>
                      </div>
                      <Badge className={`text-white ${getStatusColor(device.status)}`}>
                        {device.status === 'online' ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Online
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3 mr-1" />
                            Offline
                          </>
                        )}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-muted-foreground">Uptime</label>
                        <div className="font-medium">{formatUptime(device.uptime)}</div>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">CPU Usage</label>
                        <div className="font-medium">{device.cpuUsage.toFixed(1)}%</div>
                        <Progress value={device.cpuUsage} className="w-full mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Memory Usage</label>
                        <div className="font-medium">{device.memoryUsage.toFixed(1)}%</div>
                        <Progress value={device.memoryUsage} className="w-full mt-1" />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground">Interfaces</label>
                        <div className="font-medium">
                          {device.interfaces.filter(i => i.status === 'up').length} / {device.interfaces.length}
                        </div>
                      </div>
                    </div>

                    {device.interfaces.length > 0 && (
                      <div>
                        <h6 className="text-sm font-medium mb-2">Network Interfaces</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {device.interfaces.slice(0, 4).map((networkInterface) => (
                            <div key={networkInterface.index} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                              <span className="font-medium">{networkInterface.name}</span>
                              <div className="flex items-center gap-2">
                                <Badge variant={networkInterface.status === 'up' ? 'default' : 'secondary'}>
                                  {networkInterface.status}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatBytes(networkInterface.bytesIn + networkInterface.bytesOut)}
                                </span>
                              </div>
                            </div>
                          ))}
                          {device.interfaces.length > 4 && (
                            <div className="text-xs text-muted-foreground p-2">
                              +{device.interfaces.length - 4} more interfaces
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => disconnectClient(device.ip, 'test-client')}
                        disabled={device.status === 'offline'}
                      >
                        <WifiOff className="h-4 w-4 mr-2" />
                        Test Disconnect
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => reconnectClient(device.ip, 'test-client')}
                        disabled={device.status === 'offline'}
                      >
                        <Wifi className="h-4 w-4 mr-2" />
                        Test Reconnect
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

export default RealNetworkManagementPanel;

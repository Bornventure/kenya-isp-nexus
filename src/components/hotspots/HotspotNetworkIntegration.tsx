import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wifi, Users, Activity, Settings } from 'lucide-react';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';

interface NetworkDevice {
  id: string;
  type: 'mikrotik' | 'switch' | 'access_point';
  ipAddress: string;
  status: 'online' | 'offline' | 'warning';
  clients: Array<{
    clientId: string;
    isConnected: boolean;
    bytesIn: number;
    bytesOut: number;
  }>;
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
}

interface HotspotNetworkIntegrationProps {
  selectedHotspot: string | null;
}

const HotspotNetworkIntegration: React.FC<HotspotNetworkIntegrationProps> = ({ selectedHotspot }) => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const deviceList = await enhancedSnmpService.getDeviceStatus();
      // Transform DeviceStatus[] to NetworkDevice[]
      const transformedDevices: NetworkDevice[] = deviceList.map(device => ({
        id: device.routerId,
        type: 'mikrotik',
        ipAddress: device.ip,
        status: device.status === 'online' ? 'online' : 'offline',
        clients: Array.from({ length: device.connectedClients }, (_, i) => ({
          clientId: `client-${device.routerId}-${i}`,
          isConnected: true,
          bytesIn: Math.floor(Math.random() * 1000000),
          bytesOut: Math.floor(Math.random() * 1000000)
        })),
        uptime: parseInt(device.uptime.replace(/\D/g, '')) || 0,
        cpuUsage: device.cpuUsage,
        memoryUsage: device.memoryUsage
      }));
      setDevices(transformedDevices);
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const startMonitoring = async () => {
    setIsMonitoring(true);
    await enhancedSnmpService.startMonitoring();
    // Refresh device list periodically
    const interval = setInterval(loadDevices, 30000);
    return () => clearInterval(interval);
  };

  const stopMonitoring = async () => {
    setIsMonitoring(false);
    await enhancedSnmpService.stopMonitoring();
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Network Integration</h2>
        <div className="flex space-x-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button variant="outline" onClick={loadDevices}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {devices.reduce((total, device) => total + device.clients.length, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No network devices found. Add equipment to start monitoring.
              </div>
            ) : (
              devices.map((device) => (
                <div key={device.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{device.type.toUpperCase()}</span>
                        <span className="text-sm text-muted-foreground">{device.ipAddress}</span>
                      </div>
                      <Badge 
                        variant={device.status === 'online' ? 'default' : 
                               device.status === 'warning' ? 'destructive' : 'secondary'}
                      >
                        {device.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Uptime:</span>
                      <div className="font-medium">{formatUptime(device.uptime)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CPU:</span>
                      <div className="font-medium">{device.cpuUsage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Memory:</span>
                      <div className="font-medium">{device.memoryUsage.toFixed(1)}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Clients:</span>
                      <div className="font-medium">{device.clients.length}</div>
                    </div>
                  </div>

                  {device.clients.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Connected Clients:</h4>
                      <div className="space-y-2">
                        {device.clients.slice(0, 3).map((client, index) => (
                          <div key={index} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                            <span>{client.clientId}</span>
                            <div className="flex space-x-4 text-xs text-muted-foreground">
                              <span>↓ {formatBytes(client.bytesIn)}</span>
                              <span>↑ {formatBytes(client.bytesOut)}</span>
                            </div>
                          </div>
                        ))}
                        {device.clients.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{device.clients.length - 3} more clients
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotNetworkIntegration;

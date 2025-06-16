
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { snmpService } from '@/services/snmpService';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';
import { 
  Router, 
  Wifi, 
  Server, 
  Signal,
  WifiOff,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';

const NetworkManagementPanel = () => {
  const [autoManagementEnabled, setAutoManagementEnabled] = useState(true);
  const [deviceStats, setDeviceStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    managedClients: 0
  });

  const { disconnectClient, reconnectClient } = useNetworkManagement();

  useEffect(() => {
    // Initialize SNMP service and load configuration
    const initializeNetworkManagement = async () => {
      await snmpService.loadDeviceConfiguration();
      
      // Start device monitoring
      const monitorInterval = setInterval(() => {
        snmpService.monitorDeviceStatus();
      }, 30000); // Check every 30 seconds

      return () => clearInterval(monitorInterval);
    };

    initializeNetworkManagement();
  }, []);

  const handleTestDisconnect = async () => {
    await disconnectClient('test-client-001');
  };

  const handleTestReconnect = async () => {
    await reconnectClient('test-client-001');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SNMP Network Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-management">Automatic Network Management</Label>
              <p className="text-sm text-muted-foreground">
                Automatically disconnect/reconnect clients based on billing status
              </p>
            </div>
            <Switch
              id="auto-management"
              checked={autoManagementEnabled}
              onCheckedChange={setAutoManagementEnabled}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Server className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{deviceStats.totalDevices}</div>
              <div className="text-sm text-muted-foreground">Total Devices</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{deviceStats.onlineDevices}</div>
              <div className="text-sm text-muted-foreground">Online Devices</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Wifi className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{deviceStats.managedClients}</div>
              <div className="text-sm text-muted-foreground">Managed Clients</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleTestDisconnect} variant="destructive" size="sm">
              <WifiOff className="h-4 w-4 mr-2" />
              Test Disconnect
            </Button>
            <Button onClick={handleTestReconnect} variant="default" size="sm">
              <Wifi className="h-4 w-4 mr-2" />
              Test Reconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Network Device Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'router-001', name: 'Main Router', type: 'router', ip: '192.168.1.1', status: 'online' },
              { id: 'switch-001', name: 'Distribution Switch A', type: 'switch', ip: '192.168.1.10', status: 'online' },
              { id: 'ap-001', name: 'Access Point - Zone A', type: 'access_point', ip: '192.168.1.50', status: 'offline' }
            ].map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {device.type === 'router' && <Router className="h-5 w-5" />}
                  {device.type === 'switch' && <Server className="h-5 w-5" />}
                  {device.type === 'access_point' && <Wifi className="h-5 w-5" />}
                  <div>
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">{device.ip}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={device.status === 'online' ? 'default' : 'destructive'}
                    className={device.status === 'online' ? 'bg-green-500' : ''}
                  >
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkManagementPanel;

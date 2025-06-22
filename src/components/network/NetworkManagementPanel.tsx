
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { snmpService } from '@/services/snmpService';
import { qosService } from '@/services/qosService';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';
import { 
  Router, 
  Wifi, 
  Server, 
  Signal,
  WifiOff,
  CheckCircle,
  XCircle,
  Settings,
  Gauge,
  Activity,
  Shield,
  Zap
} from 'lucide-react';

const NetworkManagementPanel = () => {
  const [autoManagementEnabled, setAutoManagementEnabled] = useState(true);
  const [qosMonitoringEnabled, setQosMonitoringEnabled] = useState(true);
  const [deviceStats, setDeviceStats] = useState({
    totalDevices: 0,
    onlineDevices: 0,
    managedClients: 0,
    qosPoliciesActive: 0,
    bandwidthUtilization: 0
  });

  const { disconnectClient, reconnectClient, applyQoSToClient } = useNetworkManagement();

  useEffect(() => {
    // Initialize comprehensive SNMP service
    const initializeNetworkManagement = async () => {
      await snmpService.initialize();
      
      // Update stats periodically
      const statsInterval = setInterval(async () => {
        const devices = snmpService.getComprehensiveDeviceStatus();
        const qosPolicies = qosService.getActiveQoSPolicies();
        
        setDeviceStats({
          totalDevices: devices.length,
          onlineDevices: devices.filter(d => d.status === 'online').length,
          managedClients: qosPolicies.length,
          qosPoliciesActive: qosPolicies.length,
          bandwidthUtilization: Math.random() * 100 // Simulated
        });
      }, 5000);

      return () => clearInterval(statsInterval);
    };

    initializeNetworkManagement();
  }, []);

  const handleTestDisconnect = async () => {
    await disconnectClient('test-client-001');
  };

  const handleTestReconnect = async () => {
    await reconnectClient('test-client-001');
  };

  const handleTestQoS = async () => {
    await applyQoSToClient('test-client-001', 'test-package-001');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Comprehensive SNMP Network Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="qos-monitoring">QoS Monitoring & Enforcement</Label>
                <p className="text-sm text-muted-foreground">
                  Monitor and enforce speed limits via SNMP
                </p>
              </div>
              <Switch
                id="qos-monitoring"
                checked={qosMonitoringEnabled}
                onCheckedChange={setQosMonitoringEnabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
            
            <div className="text-center p-4 border rounded-lg">
              <Gauge className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{deviceStats.qosPoliciesActive}</div>
              <div className="text-sm text-muted-foreground">QoS Policies</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">{deviceStats.bandwidthUtilization.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Bandwidth Util.</div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Network Operations</h4>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleTestDisconnect} variant="destructive" size="sm">
                <WifiOff className="h-4 w-4 mr-2" />
                Test Disconnect
              </Button>
              <Button onClick={handleTestReconnect} variant="default" size="sm">
                <Wifi className="h-4 w-4 mr-2" />
                Test Reconnect
              </Button>
              <Button onClick={handleTestQoS} variant="outline" size="sm">
                <Gauge className="h-4 w-4 mr-2" />
                Test QoS Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Network Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { 
                id: 'router-001', 
                name: 'Main Router - Cisco ISR4321', 
                type: 'router', 
                ip: '192.168.1.1', 
                status: 'online',
                capabilities: ['routing', 'qos', 'firewall', 'vpn'],
                utilization: 45,
                activeClients: 12
              },
              { 
                id: 'switch-001', 
                name: 'Distribution Switch A - Ubiquiti 24-Port', 
                type: 'switch', 
                ip: '192.168.1.10', 
                status: 'online',
                capabilities: ['switching', 'vlan', 'qos', 'stp'],
                utilization: 67,
                activeClients: 8
              },
              { 
                id: 'ap-001', 
                name: 'Access Point - Zone A - UniFi AC Pro', 
                type: 'access_point', 
                ip: '192.168.1.50', 
                status: 'offline',
                capabilities: ['wireless', 'wpa3', 'band_steering'],
                utilization: 0,
                activeClients: 0
              }
            ].map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {device.type === 'router' && <Router className="h-5 w-5 text-blue-500" />}
                  {device.type === 'switch' && <Server className="h-5 w-5 text-green-500" />}
                  {device.type === 'access_point' && <Wifi className="h-5 w-5 text-purple-500" />}
                  <div className="flex-1">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {device.ip} • {device.activeClients} clients
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {device.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {device.utilization}% utilization
                    </div>
                    <Progress value={device.utilization} className="w-20 mt-1" />
                  </div>
                  
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            QoS & Speed Control Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Real-time monitoring of speed limits and traffic shaping policies across all network equipment.
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 border rounded">
                <div className="text-sm font-medium text-green-600">Active Policies</div>
                <div className="text-2xl font-bold">{deviceStats.qosPoliciesActive}</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm font-medium text-blue-600">Avg. Compliance</div>
                <div className="text-2xl font-bold">98.5%</div>
              </div>
              <div className="p-3 border rounded">
                <div className="text-sm font-medium text-orange-600">Policy Violations</div>
                <div className="text-2xl font-bold">2</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkManagementPanel;

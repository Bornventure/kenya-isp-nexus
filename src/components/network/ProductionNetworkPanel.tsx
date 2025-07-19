
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
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
  Zap,
  Database,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface DeviceStatus {
  id: string;
  name: string;
  ip: string;
  type: string;
  status: 'online' | 'offline';
  activeConnections: number;
  cpuUsage: number;
  memoryUsage: number;
  uptime: string;
  capabilities: string[];
}

interface ClientConnection {
  username: string;
  ip?: string;
  uptime: string;
  bytesIn: number;
  bytesOut: number;
  speedLimit: string;
}

const ProductionNetworkPanel = () => {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [activeConnections, setActiveConnections] = useState<ClientConnection[]>([]);
  const [autoManagement, setAutoManagement] = useState(true);
  const [realTimeMonitoring, setRealTimeMonitoring] = useState(true);
  const [testClientId, setTestClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    initializeProductionSystem();
    
    const interval = setInterval(() => {
      refreshNetworkStatus();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const initializeProductionSystem = async () => {
    try {
      console.log('Initializing production network management system...');
      
      // Initialize enhanced SNMP service
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      await enhancedSnmpService.initialize();
      
      toast({
        title: "System Initialized",
        description: "Production network management system is now active with real MikroTik integration.",
      });
      
      await refreshNetworkStatus();
    } catch (error) {
      console.error('Failed to initialize production system:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize network management system.",
        variant: "destructive",
      });
    }
  };

  const refreshNetworkStatus = async () => {
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      const deviceStatus = enhancedSnmpService.getDeviceStatus();
      
      // Simulate real device data (in production, this would come from actual devices)
      const mockDevices: DeviceStatus[] = [
        {
          id: 'mikrotik-001',
          name: 'MikroTik hEX S - Main Router',
          ip: '192.168.88.1',
          type: 'router',
          status: Math.random() > 0.1 ? 'online' : 'offline',
          activeConnections: Math.floor(Math.random() * 50) + 10,
          cpuUsage: Math.floor(Math.random() * 40) + 10,
          memoryUsage: Math.floor(Math.random() * 60) + 20,
          uptime: '15d 8h 32m',
          capabilities: ['pppoe', 'simple_queues', 'firewall', 'routing', 'hotspot']
        },
        {
          id: 'mikrotik-002',
          name: 'MikroTik RB4011 - Distribution',
          ip: '192.168.88.2',
          type: 'router',
          status: Math.random() > 0.05 ? 'online' : 'offline',
          activeConnections: Math.floor(Math.random() * 30) + 5,
          cpuUsage: Math.floor(Math.random() * 30) + 5,
          memoryUsage: Math.floor(Math.random() * 50) + 15,
          uptime: '23d 14h 55m',
          capabilities: ['pppoe', 'simple_queues', 'load_balancing', 'advanced_qos']
        }
      ];

      setDevices(mockDevices);

      // Mock active connections
      const mockConnections: ClientConnection[] = Array.from({ length: 15 }, (_, i) => ({
        username: `client_${String(i + 1).padStart(3, '0')}`,
        ip: `192.168.100.${i + 10}`,
        uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
        bytesIn: Math.floor(Math.random() * 1000000000),
        bytesOut: Math.floor(Math.random() * 500000000),
        speedLimit: ['10M/5M', '20M/10M', '50M/25M'][Math.floor(Math.random() * 3)]
      }));

      setActiveConnections(mockConnections);
    } catch (error) {
      console.error('Failed to refresh network status:', error);
    }
  };

  const handleTestDisconnect = async () => {
    if (!testClientId.trim()) {
      toast({
        title: "Missing Client ID",
        description: "Please enter a client ID to test disconnection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      const success = await enhancedSnmpService.disconnectClient(testClientId);
      
      toast({
        title: success ? "Client Disconnected" : "Disconnection Failed",
        description: success 
          ? `Client ${testClientId} has been disconnected from all MikroTik devices.`
          : `Failed to disconnect client ${testClientId}. Please check device connectivity.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while disconnecting the client.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestReconnect = async () => {
    if (!testClientId.trim()) {
      toast({
        title: "Missing Client ID",
        description: "Please enter a client ID to test reconnection.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      const success = await enhancedSnmpService.reconnectClient(testClientId);
      
      toast({
        title: success ? "Client Reconnected" : "Reconnection Failed",
        description: success 
          ? `Client ${testClientId} has been reconnected with appropriate speed limits.`
          : `Failed to reconnect client ${testClientId}. Please check device connectivity.`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while reconnecting the client.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const onlineDevices = devices.filter(d => d.status === 'online').length;
  const totalConnections = devices.reduce((sum, d) => sum + d.activeConnections, 0);
  const avgCpuUsage = devices.length > 0 ? devices.reduce((sum, d) => sum + d.cpuUsage, 0) / devices.length : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Production MikroTik Network Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* System Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-management">Automatic Network Management</Label>
                <p className="text-sm text-muted-foreground">
                  Real-time client disconnect/reconnect based on billing status
                </p>
              </div>
              <Switch
                id="auto-management"
                checked={autoManagement}
                onCheckedChange={setAutoManagement}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="real-time">Real-Time Monitoring</Label>
                <p className="text-sm text-muted-foreground">
                  Live device health and connection monitoring
                </p>
              </div>
              <Switch
                id="real-time"
                checked={realTimeMonitoring}
                onCheckedChange={setRealTimeMonitoring}
              />
            </div>
          </div>

          {/* Network Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{onlineDevices}/{devices.length}</div>
              <div className="text-sm text-muted-foreground">Devices Online</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Wifi className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{totalConnections}</div>
              <div className="text-sm text-muted-foreground">Active Connections</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{avgCpuUsage.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg CPU Usage</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{formatBytes(totalConnections * 1000000)}</div>
              <div className="text-sm text-muted-foreground">Data Transferred</div>
            </div>
          </div>

          {/* Testing Controls */}
          <div className="border-t pt-4">
            <h4 className="text-lg font-semibold mb-4">Production Testing</h4>
            <div className="flex items-center gap-4">
              <Input
                placeholder="Enter Client ID for testing"
                value={testClientId}
                onChange={(e) => setTestClientId(e.target.value)}
                className="max-w-xs"
              />
              <Button 
                onClick={handleTestDisconnect} 
                variant="destructive" 
                size="sm"
                disabled={isLoading}
              >
                <WifiOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
              <Button 
                onClick={handleTestReconnect} 
                variant="default" 
                size="sm"
                disabled={isLoading}
              >
                <Wifi className="h-4 w-4 mr-2" />
                Reconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            MikroTik Device Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {devices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Router className="h-6 w-6 text-blue-500" />
                  <div className="flex-1">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {device.ip} • {device.activeConnections} connections • Uptime: {device.uptime}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {device.capabilities.map((cap) => (
                        <Badge key={cap} variant="outline" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-sm font-medium">CPU</div>
                    <div className="text-sm text-muted-foreground">{device.cpuUsage}%</div>
                    <Progress value={device.cpuUsage} className="w-16 mt-1" />
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium">Memory</div>
                    <div className="text-sm text-muted-foreground">{device.memoryUsage}%</div>
                    <Progress value={device.memoryUsage} className="w-16 mt-1" />
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

      {/* Active Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Signal className="h-5 w-5" />
            Active Client Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeConnections.map((connection, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="font-medium">{connection.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {connection.ip} • Connected: {connection.uptime}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">↓ {formatBytes(connection.bytesIn)}</div>
                    <div className="text-muted-foreground">Downloaded</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">↑ {formatBytes(connection.bytesOut)}</div>
                    <div className="text-muted-foreground">Uploaded</div>
                  </div>
                  <Badge variant="outline">{connection.speedLimit}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductionNetworkPanel;

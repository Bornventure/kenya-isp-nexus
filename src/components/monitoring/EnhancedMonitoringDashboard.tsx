
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Activity,
  Wifi,
  Server,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Download,
  RefreshCw,
  Signal,
  Cpu,
  HardDrive
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';
import { dataUsageService } from '@/services/dataUsageService';

interface NetworkStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  connectedClients: number;
  averageUptime: number;
  totalBandwidth: number;
  usedBandwidth: number;
}

const EnhancedMonitoringDashboard = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    connectedClients: 0,
    averageUptime: 0,
    totalBandwidth: 0,
    usedBandwidth: 0
  });
  const [devices, setDevices] = useState<any[]>([]);
  const [topDataUsers, setTopDataUsers] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    loadMonitoringData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(loadMonitoringData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadMonitoringData = async () => {
    try {
      setLoading(true);
      
      // Load device status
      const deviceData = await enhancedSnmpService.getDeviceStatus();
      setDevices(deviceData);

      // Calculate network statistics
      const stats = calculateNetworkStats(deviceData);
      setNetworkStats(stats);

      // Load top data users
      const dataUsers = await dataUsageService.getTopDataUsers(10);
      setTopDataUsers(dataUsers);

      // Generate sample traffic data (in real implementation, this would come from SNMP)
      const trafficHistory = generateTrafficData();
      setTrafficData(trafficHistory);

      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNetworkStats = (deviceData: any[]): NetworkStats => {
    const totalDevices = deviceData.length;
    const onlineDevices = deviceData.filter(d => d.status === 'online').length;
    const offlineDevices = totalDevices - onlineDevices;
    const connectedClients = deviceData.reduce((sum, d) => sum + (d.clients?.length || 0), 0);
    const averageUptime = deviceData.length > 0 
      ? deviceData.reduce((sum, d) => sum + (d.uptime || 0), 0) / deviceData.length 
      : 0;

    // Mock bandwidth calculations (would come from SNMP in real implementation)
    const totalBandwidth = totalDevices * 1000; // 1Gbps per device
    const usedBandwidth = connectedClients * 10; // 10Mbps average per client

    return {
      totalDevices,
      onlineDevices,
      offlineDevices,
      connectedClients,
      averageUptime,
      totalBandwidth,
      usedBandwidth
    };
  };

  const generateTrafficData = () => {
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        inbound: Math.floor(Math.random() * 100) + 50,
        outbound: Math.floor(Math.random() * 80) + 30,
        timestamp: time
      });
    }
    
    return data;
  };

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-500';
      case 'offline': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const getDeviceStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Monitoring Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time network health and performance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadMonitoringData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{networkStats.totalDevices}</div>
                <p className="text-sm text-muted-foreground">Total Devices</p>
                <p className="text-xs text-green-600">
                  {networkStats.onlineDevices} online, {networkStats.offlineDevices} offline
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {networkStats.connectedClients}
                </div>
                <p className="text-sm text-muted-foreground">Connected Clients</p>
                <p className="text-xs text-muted-foreground">Active sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {networkStats.averageUptime.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Avg Uptime</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">
                  {((networkStats.usedBandwidth / networkStats.totalBandwidth) * 100).toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">Bandwidth Usage</p>
                <Progress 
                  value={(networkStats.usedBandwidth / networkStats.totalBandwidth) * 100} 
                  className="mt-2" 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Last updated: {lastUpdate.toLocaleString()}
      </p>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Device Status</TabsTrigger>
          <TabsTrigger value="traffic">Traffic Analysis</TabsTrigger>
          <TabsTrigger value="clients">Client Usage</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Events</TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Network Devices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getDeviceStatusIcon(device.status)}
                          <span className="font-medium">{device.ipAddress}</span>
                          <Badge variant="outline">{device.type}</Badge>
                        </div>
                        <Badge 
                          variant={device.status === 'online' ? 'default' : 'destructive'}
                        >
                          {device.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Uptime:</span>
                          <div>{formatUptime(device.uptime)}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Clients:</span>
                          <div>{device.clients?.length || 0}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">CPU:</span>
                          <div>{device.cpuUsage?.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <div>{device.memoryUsage?.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      {device.cpuUsage > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>CPU Usage</span>
                            <span>{device.cpuUsage?.toFixed(1)}%</span>
                          </div>
                          <Progress value={device.cpuUsage} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={devices.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ipAddress" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cpuUsage" fill="#8884d8" name="CPU %" />
                    <Bar dataKey="memoryUsage" fill="#82ca9d" name="Memory %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Network Traffic (Last 24 Hours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trafficData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="inbound" 
                    stroke="#8884d8" 
                    name="Inbound (Mbps)" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="outbound" 
                    stroke="#82ca9d" 
                    name="Outbound (Mbps)" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Top Data Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topDataUsers.map((user, index) => (
                  <div key={user.clientId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">Client {user.clientId.slice(-8)}</div>
                        <div className="text-sm text-muted-foreground">
                          {dataUsageService.formatBytes(user.totalBytes)} this month
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {user.percentageUsed.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">of allowance</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts & Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Mock alerts - would come from real monitoring system */}
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">High CPU Usage</div>
                    <div className="text-sm text-muted-foreground">
                      Router 192.168.1.1 CPU usage above 85%
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      2 minutes ago
                    </div>
                  </div>
                  <Badge variant="secondary">Warning</Badge>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Device Offline</div>
                    <div className="text-sm text-muted-foreground">
                      Switch 192.168.1.10 is not responding
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      5 minutes ago
                    </div>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>

                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Service Restored</div>
                    <div className="text-sm text-muted-foreground">
                      Connection to base station restored
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      15 minutes ago
                    </div>
                  </div>
                  <Badge variant="default">Info</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMonitoringDashboard;

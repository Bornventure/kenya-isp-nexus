import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NetworkManagementPanel from '@/components/network/NetworkManagementPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Server, 
  Wifi, 
  Router, 
  Signal, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  TrendingUp,
  Zap,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useClients } from '@/hooks/useClients';

const NetworkStatus = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const navigate = useNavigate();
  const { 
    devices, 
    isLoading, 
    isMonitoring, 
    refreshDevices, 
    startMonitoring, 
    stopMonitoring 
  } = useRealSNMP();
  
  const { clients: managedClients } = useClients();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'router': return <Router className="h-4 w-4" />;
      case 'switch': return <Activity className="h-4 w-4" />;
      case 'access_point': return <Wifi className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  const getTotalConnectedClients = () => {
    return devices.reduce((total, device) => {
      return total + (device.interfaces?.length || 0);
    }, 0);
  };

  const getAverageUptime = () => {
    if (devices.length === 0) return 0;
    const totalUptime = devices.reduce((sum, device) => sum + device.uptime, 0);
    return (totalUptime / devices.length / 86400) * 100; // Convert to percentage
  };

  const getNetworkLoad = () => {
    if (devices.length === 0) return 0;
    const totalCpu = devices.reduce((sum, device) => sum + device.cpuUsage, 0);
    return totalCpu / devices.length;
  };

  const overallStats = {
    totalNodes: devices.length,
    onlineNodes: devices.filter(d => d.status === 'online').length,
    offlineNodes: devices.filter(d => d.status === 'offline').length,
    averageUptime: getAverageUptime(),
    totalConnectedClients: getTotalConnectedClients(),
    networkLoad: getNetworkLoad()
  };

  const handleAddNetworkDevice = () => {
    navigate('/network-monitoring'); // Navigate to the network monitoring page which has SNMP management
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Status & Management</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of network infrastructure and SNMP-based client management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshDevices}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {isMonitoring ? (
            <Button variant="destructive" size="sm" onClick={stopMonitoring}>
              Stop Monitoring
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={startMonitoring}>
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Nodes</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalNodes}</div>
            <p className="text-xs text-muted-foreground">
              {overallStats.onlineNodes} online, {overallStats.offlineNodes} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overallStats.averageUptime.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Average across all nodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Managed Clients</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedClients.length}</div>
            <p className="text-xs text-muted-foreground">Total registered clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Load</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.networkLoad.toFixed(1)}%</div>
            <Progress value={overallStats.networkLoad} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="infrastructure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="infrastructure">Network Infrastructure</TabsTrigger>
          <TabsTrigger value="management">SNMP Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="infrastructure">
          <Card>
            <CardHeader>
              <CardTitle>Network Infrastructure</CardTitle>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No network devices found</h3>
                  <p className="text-muted-foreground mb-4">
                    Add SNMP devices to start monitoring your network infrastructure
                  </p>
                  <Button onClick={handleAddNetworkDevice}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Network Device
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getTypeIcon(device.type)}
                          <div>
                            <h4 className="font-medium">{device.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {device.type} • {device.ip}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(device.status)}
                          <Badge className={`text-white ${getStatusColor(device.status)}`}>
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
                          <span className="text-muted-foreground">CPU Usage:</span>
                          <div className="font-medium">{device.cpuUsage}%</div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <div className="font-medium">{device.memoryUsage.toFixed(1)}%</div>
                        </div>
                        
                        <div>
                          <span className="text-muted-foreground">Interfaces:</span>
                          <div className="font-medium">{device.interfaces?.length || 0}</div>
                        </div>
                      </div>

                      {device.interfaces && device.interfaces.length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium mb-2">Interfaces</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {device.interfaces.slice(0, 4).map((iface, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded">
                                <span>{iface.name}</span>
                                <Badge variant={iface.status === 'up' ? 'default' : 'destructive'}>
                                  {iface.status}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="management">
          <NetworkManagementPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkStatus;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap
} from 'lucide-react';

const NetworkStatus = () => {
  const [timeRange, setTimeRange] = useState('24h');

  // Mock network infrastructure data
  const networkNodes = [
    {
      id: 'tower-001',
      name: 'Main Tower - Kisumu CBD',
      type: 'Base Station',
      status: 'online',
      uptime: 99.8,
      connectedClients: 45,
      capacity: 100,
      signalStrength: 92,
      lastMaintenance: '2024-04-15'
    },
    {
      id: 'repeater-002',
      name: 'Repeater - Milimani',
      type: 'Repeater',
      status: 'online',
      uptime: 98.5,
      connectedClients: 23,
      capacity: 50,
      signalStrength: 87,
      lastMaintenance: '2024-04-10'
    },
    {
      id: 'ap-003',
      name: 'Access Point - Nyalenda',
      type: 'Access Point',
      status: 'warning',
      uptime: 95.2,
      connectedClients: 18,
      capacity: 30,
      signalStrength: 78,
      lastMaintenance: '2024-03-28'
    },
    {
      id: 'switch-004',
      name: 'Core Switch - Data Center',
      type: 'Network Switch',
      status: 'online',
      uptime: 99.9,
      connectedClients: 0,
      capacity: 0,
      signalStrength: 0,
      lastMaintenance: '2024-05-01'
    },
    {
      id: 'router-005',
      name: 'Edge Router - Kondele',
      type: 'Router',
      status: 'offline',
      uptime: 0,
      connectedClients: 0,
      capacity: 25,
      signalStrength: 0,
      lastMaintenance: '2024-03-15'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Base Station': return <Server className="h-4 w-4" />;
      case 'Repeater': return <Signal className="h-4 w-4" />;
      case 'Access Point': return <Wifi className="h-4 w-4" />;
      case 'Router': return <Router className="h-4 w-4" />;
      case 'Network Switch': return <Activity className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const overallStats = {
    totalNodes: networkNodes.length,
    onlineNodes: networkNodes.filter(n => n.status === 'online').length,
    warningNodes: networkNodes.filter(n => n.status === 'warning').length,
    offlineNodes: networkNodes.filter(n => n.status === 'offline').length,
    averageUptime: networkNodes.reduce((acc, node) => acc + node.uptime, 0) / networkNodes.length,
    totalConnectedClients: networkNodes.reduce((acc, node) => acc + node.connectedClients, 0),
    networkLoad: 68
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of network infrastructure and performance
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
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
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
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalConnectedClients}</div>
            <p className="text-xs text-muted-foreground">Connected clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Load</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.networkLoad}%</div>
            <Progress value={overallStats.networkLoad} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Network Nodes Status */}
      <Card>
        <CardHeader>
          <CardTitle>Network Infrastructure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {networkNodes.map((node) => (
              <div key={node.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(node.type)}
                    <div>
                      <h4 className="font-medium">{node.name}</h4>
                      <p className="text-sm text-muted-foreground">{node.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(node.status)}
                    <Badge className={`text-white ${getStatusColor(node.status)}`}>
                      {node.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Uptime:</span>
                    <div className="font-medium">{node.uptime}%</div>
                  </div>
                  
                  {node.type !== 'Network Switch' && (
                    <>
                      <div>
                        <span className="text-muted-foreground">Clients:</span>
                        <div className="font-medium">
                          {node.connectedClients}/{node.capacity}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Signal:</span>
                        <div className="font-medium">{node.signalStrength}%</div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <span className="text-muted-foreground">Last Maintenance:</span>
                    <div className="font-medium">{node.lastMaintenance}</div>
                  </div>
                </div>

                {node.type !== 'Network Switch' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity</span>
                      <span>{node.connectedClients}/{node.capacity}</span>
                    </div>
                    <Progress 
                      value={(node.connectedClients / node.capacity) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkStatus;

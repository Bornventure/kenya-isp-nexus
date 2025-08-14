
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Router, 
  Wifi, 
  Signal, 
  Server, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Zap,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useNetworkEquipment } from '@/hooks/useNetworkEquipment';
import { useClients } from '@/hooks/useClients';
import { useRealNetworkTesting } from '@/hooks/useRealNetworkTesting';
import NetworkInfrastructureView from '@/components/network/NetworkInfrastructureView';

const NetworkStatus = () => {
  const [timeRange, setTimeRange] = useState('24h');
  const navigate = useNavigate();
  const { equipment, isLoading: equipmentLoading } = useNetworkEquipment();
  const { clients, getClientStats } = useClients();
  const { getDemoStatus } = useRealNetworkTesting();
  
  const isDemoMode = getDemoStatus();
  const stats = getClientStats();

  // Calculate network metrics from real data
  const getNetworkMetrics = () => {
    const activeEquipment = equipment.filter(e => 
      e.status === 'deployed' || e.status === 'available'
    );
    
    return {
      totalDevices: equipment.length,
      activeDevices: activeEquipment.length,
      offlineDevices: equipment.length - activeEquipment.length,
      connectedClients: stats.activeClients,
      averageUptime: equipment.length > 0 ? 98.5 : 0, // Placeholder until real monitoring
      networkLoad: Math.min(stats.activeClients * 10, 100) // Estimated load
    };
  };

  const metrics = getNetworkMetrics();

  const handleAddNetworkDevice = () => {
    navigate('/network-monitoring');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Network Status</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of your network infrastructure and performance
          </p>
        </div>
        <div className="flex items-center gap-4">
          {isDemoMode && (
            <Badge variant="destructive" className="px-3 py-1">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Demo Mode
            </Badge>
          )}
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Devices</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDevices}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeDevices} active, {metrics.offlineDevices} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.connectedClients}</div>
            <p className="text-xs text-muted-foreground">active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.averageUptime}%</div>
            <p className="text-xs text-muted-foreground">last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Load</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.networkLoad}%</div>
            <p className="text-xs text-muted-foreground">current utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="infrastructure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="infrastructure">Network Infrastructure</TabsTrigger>
          <TabsTrigger value="monitoring">Performance Monitoring</TabsTrigger>
          <TabsTrigger value="snmp">SNMP Management</TabsTrigger>
        </TabsList>

        <TabsContent value="infrastructure">
          <NetworkInfrastructureView />
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{metrics.averageUptime}%</div>
                      <div className="text-sm text-green-700">Uptime</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">125 Mbps</div>
                      <div className="text-sm text-blue-700">Total Throughput</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">2.1 TB</div>
                      <div className="text-sm text-purple-700">Data Today</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">42°C</div>
                      <div className="text-sm text-orange-700">Avg Temp</div>
                    </div>
                  </div>
                  
                  {isDemoMode && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <AlertTriangle className="h-5 w-5 text-orange-600 inline mr-2" />
                      <span className="text-orange-900 text-sm">
                        Demo Mode: Performance metrics are simulated. Configure network agents for real monitoring.
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="snmp">
          {equipment.length === 0 ? (
            <Card>
              <CardContent className="text-center p-8">
                <Server className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No SNMP Devices</h3>
                <p className="text-muted-foreground mb-4">
                  Add network equipment to your inventory and configure SNMP settings to enable monitoring
                </p>
                <Button onClick={handleAddNetworkDevice}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Network Device
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {equipment
                .filter(device => device.snmp_community)
                .map((device) => (
                  <Card key={device.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Server className="h-5 w-5" />
                          {device.brand} {device.model}
                        </div>
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          SNMP v{device.snmp_version}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">IP:</span> {device.ip_address}
                        </div>
                        <div>
                          <span className="font-medium">Community:</span> {device.snmp_community}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {device.status}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Activity className="h-3 w-3 mr-1" />
                          Query
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Zap className="h-3 w-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
          
          {isDemoMode && equipment.some(d => d.snmp_community) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <h4 className="font-medium text-orange-900">Demo Mode Active</h4>
                    <p className="text-sm text-orange-700">
                      SNMP queries are simulated. Configure network agents for real device monitoring.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkStatus;

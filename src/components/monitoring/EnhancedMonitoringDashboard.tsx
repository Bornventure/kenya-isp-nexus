
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { enhancedSnmpService, DeviceStatus } from '@/services/enhancedSnmpService';
import { 
  Activity, 
  Server, 
  Wifi, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const EnhancedMonitoringDashboard: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const { data: networkMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['network-metrics'],
    queryFn: () => enhancedSnmpService.getNetworkMetrics(),
    refetchInterval: 30000
  });

  const { data: deviceStatuses, isLoading: devicesLoading } = useQuery({
    queryKey: ['device-statuses'],
    queryFn: () => enhancedSnmpService.getDeviceStatuses(),
    refetchInterval: 30000
  });

  useEffect(() => {
    if (deviceStatuses) {
      // Generate alerts based on device status
      const newAlerts = deviceStatuses
        .filter(device => device.status === 'warning' || device.status === 'offline')
        .map(device => ({
          id: device.id,
          type: device.status === 'offline' ? 'critical' : 'warning',
          message: `${device.name} (${device.ipAddress}) is ${device.status}`,
          timestamp: new Date().toISOString()
        }));
      setAlerts(newAlerts);
    }
  }, [deviceStatuses]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'offline': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Server className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'default';
      case 'warning': return 'secondary';
      case 'offline': return 'destructive';
      default: return 'outline';
    }
  };

  if (metricsLoading || devicesLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Metrics Overview */}
      {networkMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Devices</p>
                  <p className="text-2xl font-bold">{networkMetrics.totalDevices}</p>
                </div>
                <Server className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Online</p>
                  <p className="text-2xl font-bold text-green-600">{networkMetrics.onlineDevices}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bandwidth Usage</p>
                  <p className="text-2xl font-bold">
                    {Math.round((networkMetrics.usedBandwidth / networkMetrics.totalBandwidth) * 100)}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold">{networkMetrics.avgResponseTime}ms</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {alert.type === 'critical' ? 
                      <XCircle className="h-5 w-5 text-red-600" /> : 
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    }
                    <span className="font-medium">{alert.message}</span>
                  </div>
                  <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
                    {alert.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Device Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Network Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceStatuses && deviceStatuses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deviceStatuses.map((device) => (
                <Card key={device.id} className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedDevice(device.id)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(device.status)}
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <Badge variant={getStatusColor(device.status) as any}>
                        {device.status}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>IP: {device.ipAddress}</div>
                      <div>CPU: {device.cpuUsage || 0}%</div>
                      <div>Memory: {device.memoryUsage || 0}%</div>
                      <div>Uptime: {Math.floor((device.uptime || 0) / 3600)}h</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No devices found</p>
              <p className="text-sm text-gray-500 mt-2">
                Configure network monitoring to see device status
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMonitoringDashboard;

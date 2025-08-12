
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';
import { Wifi, Router, Activity, AlertTriangle } from 'lucide-react';

interface HotspotNetworkIntegrationProps {
  hotspotId: string;
}

const HotspotNetworkIntegration: React.FC<HotspotNetworkIntegrationProps> = ({ hotspotId }) => {
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

  const handleTestConnectivity = async (ipAddress: string) => {
    try {
      const result = await enhancedSnmpService.testConnectivity(ipAddress);
      console.log('Connectivity test result:', result);
    } catch (error) {
      console.error('Connectivity test failed:', error);
    }
  };

  const handleRestartDevice = async (deviceId: string) => {
    try {
      console.log('Restarting device:', deviceId);
      // This would send restart command via SNMP/API
    } catch (error) {
      console.error('Failed to restart device:', error);
    }
  };

  if (metricsLoading || devicesLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Network Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {networkMetrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{networkMetrics.onlineDevices}</div>
                <div className="text-sm text-gray-600">Online Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{networkMetrics.offlineDevices}</div>
                <div className="text-sm text-gray-600">Offline Devices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{networkMetrics.warningDevices}</div>
                <div className="text-sm text-gray-600">Warning</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{networkMetrics.avgResponseTime}ms</div>
                <div className="text-sm text-gray-600">Avg Response</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Router className="h-5 w-5" />
            Network Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceStatuses && deviceStatuses.length > 0 ? (
            <div className="space-y-4">
              {deviceStatuses.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <Wifi className="h-5 w-5" />
                      <span className="font-medium">{device.name}</span>
                      <Badge variant={
                        device.status === 'online' ? 'default' : 
                        device.status === 'warning' ? 'secondary' : 'destructive'
                      }>
                        {device.status}
                      </Badge>
                      <span className="text-sm text-gray-600">{device.ipAddress}</span>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>CPU: {device.cpuUsage || 0}%</div>
                      <div>Memory: {device.memoryUsage || 0}%</div>
                      <div>Temp: {device.temperature || 0}°C</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnectivity(device.ipAddress)}
                    >
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestartDevice(device.id)}
                    >
                      Restart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No network devices found</p>
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

export default HotspotNetworkIntegration;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { enhancedSnmpService } from '@/services/enhancedSnmpService';
import { Activity, Wifi, Users, AlertCircle } from 'lucide-react';

interface NetworkDevice {
  id: string;
  type: 'mikrotik' | 'switch' | 'access_point';
  ipAddress: string;
  status: 'online' | 'offline' | 'warning';
  clients: any[];
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
}

const HotspotNetworkIntegration = () => {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [monitoring, setMonitoring] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const networkDevices = await enhancedSnmpService.getDeviceStatus();
      setDevices(networkDevices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    } finally {
      setLoading(false);
    }
  };

  const startMonitoring = async () => {
    try {
      setMonitoring(true);
      await enhancedSnmpService.startMonitoring();
      // Refresh devices every 30 seconds
      const interval = setInterval(loadDevices, 30000);
      return () => clearInterval(interval);
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      setMonitoring(false);
    }
  };

  const stopMonitoring = async () => {
    try {
      await enhancedSnmpService.stopMonitoring();
      setMonitoring(false);
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
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

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'mikrotik': return <Wifi className="h-4 w-4" />;
      case 'switch': return <Activity className="h-4 w-4" />;
      case 'access_point': return <Users className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Network Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading network devices...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Network Device Monitoring</CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={monitoring ? stopMonitoring : startMonitoring}
              variant={monitoring ? "destructive" : "default"}
            >
              {monitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            <Button onClick={loadDevices} variant="outline">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {devices.map((device) => (
              <Card key={device.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(device.type)}
                    <span className="font-medium">{device.type.toUpperCase()}</span>
                  </div>
                  <Badge className={getStatusColor(device.status)}>
                    {device.status}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  IP: {device.ipAddress}
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Uptime:</span>
                    <div className="font-medium">{Math.floor(device.uptime / 3600)}h</div>
                  </div>
                  <div>
                    <span className="text-gray-500">CPU:</span>
                    <div className="font-medium">{device.cpuUsage}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Memory:</span>
                    <div className="font-medium">{device.memoryUsage}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Clients:</span>
                    <div className="font-medium">{device.clients.length}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {devices.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No network devices found. Add equipment with IP addresses to start monitoring.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HotspotNetworkIntegration;

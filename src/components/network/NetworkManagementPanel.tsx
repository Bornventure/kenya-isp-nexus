
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Router, 
  Activity, 
  Users, 
  Settings, 
  Plus, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';
import AddSNMPDeviceDialog from './AddSNMPDeviceDialog';

const NetworkManagementPanel: React.FC = () => {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const { 
    devices, 
    isLoading, 
    isMonitoring, 
    addDevice, 
    testConnection, 
    refreshDevices, 
    startMonitoring, 
    stopMonitoring,
    disconnectClient,
    reconnectClient
  } = useRealSNMP();
  
  const { clients, disconnectClient: networkDisconnect, reconnectClient: networkReconnect } = useNetworkManagement();

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    try {
      await addDevice(ip, community, version);
      setShowAddDevice(false);
    } catch (error) {
      console.error('Failed to add device:', error);
      throw error;
    }
  };

  const handleTestConnection = async (ip: string, community: string, version: number) => {
    return await testConnection(ip, community, version);
  };

  const onlineDevices = devices.filter(device => device.status === 'online').length;
  const offlineDevices = devices.filter(device => device.status === 'offline').length;
  const totalBandwidthUtil = devices.length > 0 
    ? devices.reduce((sum, device) => sum + (device.cpuUsage || 0), 0) / devices.length 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'offline': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-6 w-6" />
                Comprehensive SNMP Network Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Real-time monitoring and control of network infrastructure via SNMP
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshDevices}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setShowAddDevice(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Real-time Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
              <div className="text-sm text-muted-foreground">Total Devices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{onlineDevices}</div>
              <div className="text-sm text-muted-foreground">Online Devices</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{clients.length}</div>
              <div className="text-sm text-muted-foreground">Managed Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {devices.reduce((sum, device) => sum + (device.interfaces?.length || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Active Interfaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{totalBandwidthUtil.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Avg. CPU Usage</div>
            </div>
          </div>

          {/* Network Operations */}
          <div className="mb-6">
            <h4 className="text-lg font-medium mb-3">Network Operations</h4>
            <div className="flex flex-wrap gap-2">
              {isMonitoring ? (
                <Button variant="destructive" size="sm" onClick={stopMonitoring}>
                  Stop Monitoring
                </Button>
              ) : (
                <Button variant="default" size="sm" onClick={startMonitoring}>
                  Start Monitoring
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clients.length > 0 && disconnectClient(clients[0].ip, clients[0].mac || 'unknown')}
                disabled={clients.length === 0}
              >
                Test Disconnect
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clients.length > 0 && reconnectClient(clients[0].ip, clients[0].mac || 'unknown')}
                disabled={clients.length === 0}
              >
                Test Reconnect
              </Button>
            </div>
          </div>

          {/* Enhanced Network Device Status */}
          <div>
            <h4 className="text-lg font-medium mb-3">Network Device Status</h4>
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Router className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="mb-2">No SNMP devices configured</p>
                <p className="text-sm mb-4">Add your first network device to start monitoring</p>
                <Button onClick={() => setShowAddDevice(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add SNMP Device
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Router className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{device.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {device.ip} • {device.interfaces?.length || 0} interfaces
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(device.status)}
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                          {device.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Type</div>
                        <div className="font-medium capitalize">{device.type}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Uptime</div>
                        <div className="font-medium">{formatUptime(device.uptime)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CPU Usage</div>
                        <div className="font-medium">{device.cpuUsage}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Memory</div>
                        <div className="font-medium">{device.memoryUsage.toFixed(1)}%</div>
                      </div>
                    </div>

                    {device.status === 'online' && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>System Load</span>
                          <span>{device.cpuUsage}%</span>
                        </div>
                        <Progress value={device.cpuUsage} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* QoS & Speed Control Status */}
          {devices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">QoS & Speed Control Status</h4>
              <div className="text-sm text-muted-foreground mb-4">
                Real-time monitoring of speed limits and traffic shaping policies across all network equipment.
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{devices.length}</div>
                  <div className="text-sm text-muted-foreground">Active Devices</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{((onlineDevices / devices.length) * 100).toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">Avg. Compliance</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{offlineDevices}</div>
                  <div className="text-sm text-muted-foreground">Offline Devices</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Device Dialog */}
      {showAddDevice && (
        <AddSNMPDeviceDialog
          open={showAddDevice}
          onClose={() => setShowAddDevice(false)}
          onAddDevice={handleAddDevice}
          onTestConnection={handleTestConnection}
        />
      )}
    </div>
  );
};

export default NetworkManagementPanel;

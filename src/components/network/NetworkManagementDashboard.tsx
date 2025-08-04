
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Router, Activity, Users, Settings, RefreshCw } from 'lucide-react';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useEquipment } from '@/hooks/useEquipment';
import AddSNMPDeviceDialog from './AddSNMPDeviceDialog';
import RealNetworkManagementPanel from './RealNetworkManagementPanel';
import ProductionNetworkControl from './ProductionNetworkControl';

const NetworkManagementDashboard: React.FC = () => {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const {
    devices,
    isLoading: snmpLoading,
    isMonitoring,
    addDevice,
    testConnection,
    startMonitoring,
    stopMonitoring,
    refreshDevices
  } = useRealSNMP();

  const { equipment, isLoading: equipmentLoading } = useEquipment();

  const handleAddDevice = async (ip: string, community: string, version: number) => {
    try {
      const device = await addDevice(ip, community, version);
      console.log('Device added successfully:', device);
      setShowAddDevice(false);
    } catch (error) {
      console.error('Failed to add device:', error);
      throw error;
    }
  };

  const handleTestConnection = async (ip: string, community: string, version: number) => {
    try {
      const result = await testConnection(ip, community, version);
      return result;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  };

  const onlineDevices = devices.filter(device => device.status === 'online').length;
  const offlineDevices = devices.filter(device => device.status === 'offline').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network Management</h1>
          <p className="text-muted-foreground">Monitor and manage your network infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDevices}
            disabled={snmpLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${snmpLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddDevice(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
          {isMonitoring ? (
            <Button variant="destructive" onClick={stopMonitoring}>
              Stop Monitoring
            </Button>
          ) : (
            <Button variant="default" onClick={startMonitoring}>
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Router className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-xs text-muted-foreground">SNMP managed devices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{onlineDevices}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{offlineDevices}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={isMonitoring ? 'default' : 'secondary'}>
                {isMonitoring ? 'Active' : 'Stopped'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Real-time monitoring</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Device Overview</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
          <TabsTrigger value="control">Network Control</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Network Devices</CardTitle>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-8">
                  <Router className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No devices configured</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first network device to start monitoring
                  </p>
                  <Button onClick={() => setShowAddDevice(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Device
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Router className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">{device.ip}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                              {device.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {device.type} • SNMP v{device.version}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">
                          <div>CPU: {device.cpuUsage}%</div>
                          <div>Memory: {device.memoryUsage.toFixed(1)}%</div>
                          <div>Uptime: {Math.floor(device.uptime / 3600)}h</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <RealNetworkManagementPanel />
        </TabsContent>

        <TabsContent value="control">
          <ProductionNetworkControl />
        </TabsContent>
      </Tabs>

      {/* Add Device Dialog */}
      <AddSNMPDeviceDialog
        open={showAddDevice}
        onOpenChange={setShowAddDevice}
        onDeviceAdded={handleAddDevice}
        onTestConnection={handleTestConnection}
        isLoading={snmpLoading}
      />
    </div>
  );
};

export default NetworkManagementDashboard;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Activity, Router, Wifi, Settings } from 'lucide-react';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import NetworkDiagnosticsPanel from '@/components/network/NetworkDiagnosticsPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const NetworkMonitoring = () => {
  const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);
  const [newDevice, setNewDevice] = useState({
    ip: '',
    community: 'public',
    version: '2c',
    name: '',
    description: ''
  });

  const { devices, isLoading, addDevice, testConnection } = useRealSNMP();

  const handleAddDevice = async () => {
    try {
      await addDevice({
        ip: newDevice.ip,
        community: newDevice.community,
        version: parseInt(newDevice.version),
        name: newDevice.name,
        description: newDevice.description
      });
      setNewDevice({
        ip: '',
        community: 'public',
        version: '2c',
        name: '',
        description: ''
      });
      setShowAddDeviceDialog(false);
    } catch (error) {
      console.error('Failed to add device:', error);
    }
  };

  const handleTestConnection = async (deviceIp: string) => {
    try {
      await testConnection(deviceIp, 'public', 2);
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Network Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor and manage your network infrastructure in real-time
          </p>
        </div>
        <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add SNMP Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  placeholder="Router-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-ip">IP Address</Label>
                <Input
                  id="device-ip"
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice({ ...newDevice, ip: e.target.value })}
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snmp-community">SNMP Community</Label>
                <Input
                  id="snmp-community"
                  value={newDevice.community}
                  onChange={(e) => setNewDevice({ ...newDevice, community: e.target.value })}
                  placeholder="public"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="snmp-version">SNMP Version</Label>
                <Select value={newDevice.version} onValueChange={(value) => setNewDevice({ ...newDevice, version: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Version 1</SelectItem>
                    <SelectItem value="2c">Version 2c</SelectItem>
                    <SelectItem value="3">Version 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="device-description">Description</Label>
                <Input
                  id="device-description"
                  value={newDevice.description}
                  onChange={(e) => setNewDevice({ ...newDevice, description: e.target.value })}
                  placeholder="Main router for building A"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDeviceDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddDevice}>
                  Add Device
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="devices" className="gap-2">
            <Router className="h-4 w-4" />
            SNMP Devices
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="gap-2">
            <Activity className="h-4 w-4" />
            Network Diagnostics
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="gap-2">
            <Wifi className="h-4 w-4" />
            Live Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                SNMP Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {devices.map((device, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Router className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{device.name}</h4>
                          <p className="text-sm text-muted-foreground">{device.ip}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                          {device.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(device.ip)}
                        >
                          Test
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <p className="font-medium">{Math.floor(device.uptime / 86400)}d {Math.floor((device.uptime % 86400) / 3600)}h</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">CPU:</span>
                        <p className="font-medium">{device.cpuUsage || 0}%</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Memory:</span>
                        <p className="font-medium">{device.memoryUsage || 0}%</p>
                      </div>
                    </div>
                  </div>
                ))}

                {devices.length === 0 && (
                  <div className="text-center py-8">
                    <Router className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No SNMP Devices</h3>
                    <p className="text-gray-500 mb-4">
                      Add your first SNMP device to start monitoring network infrastructure.
                    </p>
                    <Button onClick={() => setShowAddDeviceDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Device
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostics">
          <NetworkDiagnosticsPanel />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Live Network Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">342</div>
                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">125 Mbps</div>
                    <p className="text-sm text-muted-foreground">Throughput</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">12ms</div>
                    <p className="text-sm text-muted-foreground">Avg Latency</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetworkMonitoring;

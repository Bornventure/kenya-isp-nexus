
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useClients } from '@/hooks/useClients';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AddSNMPDeviceDialog from './AddSNMPDeviceDialog';
import { 
  Wifi, 
  WifiOff, 
  Activity, 
  Users, 
  Plus,
  Router,
  Settings,
  Shield,
  Zap
} from 'lucide-react';

const ProductionNetworkControl = () => {
  const { clients, isLoading: clientsLoading } = useClients();
  const {
    devices,
    isLoading,
    isMonitoring,
    addDevice,
    testConnection,
    disconnectClient,
    reconnectClient,
    startMonitoring,
    stopMonitoring,
    refreshDevices,
  } = useRealSNMP();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [clientControlForm, setClientControlForm] = useState({
    deviceIp: '',
    clientMac: '',
    clientId: ''
  });

  const activeClients = clients.filter(client => client.status === 'active');

  const handleClientDisconnect = async () => {
    if (!clientControlForm.deviceIp || !clientControlForm.clientMac) {
      return;
    }

    await disconnectClient(clientControlForm.deviceIp, clientControlForm.clientMac);
  };

  const handleClientReconnect = async () => {
    if (!clientControlForm.deviceIp || !clientControlForm.clientMac) {
      return;
    }

    await reconnectClient(clientControlForm.deviceIp, clientControlForm.clientMac);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Production Network Control</h2>
          <p className="text-muted-foreground">Real-time network management and client control</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isMonitoring ? "destructive" : "default"}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            <Activity className="h-4 w-4 mr-2" />
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Device
          </Button>
        </div>
      </div>

      {/* Network Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeClients.length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Devices</CardTitle>
            <Router className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
            <p className="text-xs text-muted-foreground">
              {devices.filter(d => d.status === 'online').length} online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'online').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time SNMP monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
            <Activity className={`h-4 w-4 ${isMonitoring ? 'text-green-600' : 'text-gray-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-sm font-medium ${isMonitoring ? 'text-green-600' : 'text-gray-600'}`}>
              {isMonitoring ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isMonitoring ? 'Monitoring all devices' : 'Click to start monitoring'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="devices">Network Devices</TabsTrigger>
          <TabsTrigger value="client-control">Client Control</TabsTrigger>
          <TabsTrigger value="monitoring">Network Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Router className="h-5 w-5" />
                Network Devices
              </CardTitle>
            </CardHeader>
            <CardContent>
              {devices.length === 0 ? (
                <div className="text-center py-12">
                  <Router className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Network Devices</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your router, switch, or access point using its IP address to start managing your network.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Network Device
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {devices.map((device) => (
                    <div key={device.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Router className="h-5 w-5 text-blue-500" />
                          <div>
                            <h4 className="font-semibold">{device.name}</h4>
                            <p className="text-sm text-muted-foreground">{device.ip}</p>
                          </div>
                        </div>
                        <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                          {device.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">CPU:</span>
                          <div className="font-medium">{device.cpuUsage.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Memory:</span>
                          <div className="font-medium">{device.memoryUsage.toFixed(1)}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Interfaces:</span>
                          <div className="font-medium">{device.interfaces.length}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setClientControlForm(prev => ({ ...prev, deviceIp: device.ip }));
                          }}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="client-control">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Client Network Control
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="deviceIp">Device IP Address</Label>
                  <Input
                    id="deviceIp"
                    placeholder="192.168.1.1"
                    value={clientControlForm.deviceIp}
                    onChange={(e) => setClientControlForm(prev => ({ 
                      ...prev, 
                      deviceIp: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientMac">Client MAC Address</Label>
                  <Input
                    id="clientMac"
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={clientControlForm.clientMac}
                    onChange={(e) => setClientControlForm(prev => ({ 
                      ...prev, 
                      clientMac: e.target.value 
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="clientId">Client ID (Optional)</Label>
                  <Input
                    id="clientId"
                    placeholder="Client identifier"
                    value={clientControlForm.clientId}
                    onChange={(e) => setClientControlForm(prev => ({ 
                      ...prev, 
                      clientId: e.target.value 
                    }))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleClientDisconnect}
                  disabled={!clientControlForm.deviceIp || !clientControlForm.clientMac || isLoading}
                >
                  <WifiOff className="h-4 w-4 mr-2" />
                  Disconnect Client
                </Button>
                <Button
                  variant="default"
                  onClick={handleClientReconnect}
                  disabled={!clientControlForm.deviceIp || !clientControlForm.clientMac || isLoading}
                >
                  <Wifi className="h-4 w-4 mr-2" />
                  Reconnect Client
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-4">Recent Clients</h4>
                <div className="space-y-2">
                  {activeClients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center justify-between p-3 bg-muted rounded">
                      <div>
                        <span className="font-medium">{client.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">{client.email}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{client.status}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setClientControlForm(prev => ({
                              ...prev,
                              clientId: client.id,
                              // You would need client's MAC address from your data
                              clientMac: '' // This should come from client data
                            }));
                          }}
                        >
                          Control
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Network Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <div className="text-sm font-medium text-blue-600">Total Interfaces</div>
                    <div className="text-2xl font-bold">
                      {devices.reduce((sum, d) => sum + d.interfaces.length, 0)}
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-sm font-medium text-green-600">Active Interfaces</div>
                    <div className="text-2xl font-bold">
                      {devices.reduce((sum, d) => sum + d.interfaces.filter(i => i.status === 'up').length, 0)}
                    </div>
                  </div>
                  <div className="p-4 border rounded">
                    <div className="text-sm font-medium text-orange-600">Monitoring Status</div>
                    <div className="text-lg font-bold">
                      {isMonitoring ? '🟢 Active' : '🔴 Inactive'}
                    </div>
                  </div>
                </div>

                {devices.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-4">Device Performance</h4>
                    <div className="space-y-4">
                      {devices.map((device) => (
                        <div key={device.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{device.name}</span>
                            <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                              {device.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Uptime:</span>
                              <div>{Math.floor(device.uptime / 3600)}h {Math.floor((device.uptime % 3600) / 60)}m</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">CPU:</span>
                              <div>{device.cpuUsage.toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Memory:</span>
                              <div>{device.memoryUsage.toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Interfaces Up:</span>
                              <div>{device.interfaces.filter(i => i.status === 'up').length}/{device.interfaces.length}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddSNMPDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onDeviceAdded={addDevice}
        onTestConnection={testConnection}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ProductionNetworkControl;

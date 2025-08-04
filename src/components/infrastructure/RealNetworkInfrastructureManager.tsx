
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealSNMP } from '@/hooks/useRealSNMP';
import { useEquipment } from '@/hooks/useEquipment';
import AddSNMPDeviceDialog from '../network/AddSNMPDeviceDialog';
import { Plus, Router, Server, Wifi, Activity, Settings } from 'lucide-react';

const RealNetworkInfrastructureManager = () => {
  const { equipment, isLoading: equipmentLoading } = useEquipment();
  const {
    devices: snmpDevices,
    isLoading: snmpLoading,
    addDevice,
    testConnection,
    refreshDevices
  } = useRealSNMP();

  const [showAddDialog, setShowAddDialog] = useState(false);

  // Filter equipment to show only network infrastructure devices
  const networkEquipment = equipment.filter(device => 
    ['core_router', 'edge_router', 'switch', 'firewall', 'load_balancer', 'access_point'].includes(device.type)
  );

  const deviceTypeIcons = {
    router: Router,
    switch: Server,
    access_point: Wifi,
    core_router: Router,
    edge_router: Router,
    firewall: Server,
    load_balancer: Server
  };

  const statusColors = {
    active: 'bg-green-500',
    online: 'bg-green-500',
    inactive: 'bg-gray-500',
    offline: 'bg-red-500',
    maintenance: 'bg-yellow-500',
    failed: 'bg-red-500'
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    const Icon = deviceTypeIcons[type as keyof typeof deviceTypeIcons] || Server;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Network Infrastructure</h2>
          <p className="text-muted-foreground">Manage network equipment and monitor live devices via SNMP</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add SNMP Device
        </Button>
      </div>

      <Tabs defaultValue="live-devices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="live-devices">Live SNMP Devices</TabsTrigger>
          <TabsTrigger value="equipment-database">Equipment Database</TabsTrigger>
        </TabsList>

        <TabsContent value="live-devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Live Network Devices ({snmpDevices.length})
                </div>
                <Button variant="outline" size="sm" onClick={refreshDevices}>
                  Refresh
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {snmpLoading ? (
                <div className="text-center py-8">Loading SNMP devices...</div>
              ) : snmpDevices.length === 0 ? (
                <div className="text-center py-12">
                  <Router className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Live Devices</h3>
                  <p className="text-muted-foreground mb-4">
                    Add network devices via SNMP to monitor them in real-time.
                  </p>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add SNMP Device
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {snmpDevices.map((device) => (
                    <Card key={device.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DeviceIcon type={device.type} />
                            <CardTitle className="text-lg">{device.name}</CardTitle>
                          </div>
                          <Badge className={`text-white ${statusColors[device.status] || 'bg-gray-500'}`}>
                            {device.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <div className="font-medium capitalize">{device.type.replace('_', ' ')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IP Address:</span>
                            <div className="font-medium">{device.ip}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">CPU:</span>
                            <div className="font-medium">{device.cpuUsage.toFixed(1)}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Memory:</span>
                            <div className="font-medium">{device.memoryUsage.toFixed(1)}%</div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">SNMP:</span> v{device.version} ({device.community})
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Interfaces:</span> {device.interfaces.length}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Activity className={`h-3 w-3 ${device.status === 'online' ? 'text-green-500' : 'text-red-500'}`} />
                          <span className="text-xs text-muted-foreground">
                            Uptime: {Math.floor(device.uptime / 3600)}h {Math.floor((device.uptime % 3600) / 60)}m
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment-database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Equipment Database ({networkEquipment.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipmentLoading ? (
                <div className="text-center py-8">Loading equipment database...</div>
              ) : networkEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <Server className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Equipment Registered</h3>
                  <p className="text-muted-foreground mb-4">
                    Equipment added via SNMP will also appear in the database.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {networkEquipment.map((device) => (
                    <Card key={device.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DeviceIcon type={device.type} />
                            <CardTitle className="text-lg">{device.brand} {device.model}</CardTitle>
                          </div>
                          <Badge className={`text-white ${statusColors[device.status as keyof typeof statusColors] || 'bg-gray-500'}`}>
                            {device.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Type:</span>
                            <div className="font-medium capitalize">{device.type.replace('_', ' ')}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Brand:</span>
                            <div className="font-medium">{device.brand}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Model:</span>
                            <div className="font-medium">{device.model}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Serial:</span>
                            <div className="font-medium">{device.serial_number}</div>
                          </div>
                        </div>

                        {device.ip_address && (
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="text-muted-foreground">IP:</span> {device.ip_address}
                            </div>
                            {device.snmp_community && (
                              <div className="text-sm">
                                <span className="text-muted-foreground">SNMP:</span> v{device.snmp_version} ({device.snmp_community})
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Activity className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-muted-foreground">
                            {device.auto_discovered ? 'Auto-discovered' : 'Manually added'} • 
                            {device.approval_status}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddSNMPDeviceDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onDeviceAdded={addDevice}
        onTestConnection={testConnection}
        isLoading={snmpLoading}
      />
    </div>
  );
};

export default RealNetworkInfrastructureManager;

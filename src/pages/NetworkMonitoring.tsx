
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SNMPDevice {
  id: string;
  name: string;
  ip: string;
  community: string;
  version: number;
  status: 'online' | 'offline' | 'warning';
  lastSeen: Date;
  description?: string;
}

const NetworkMonitoring = () => {
  const [devices, setDevices] = useState<SNMPDevice[]>([]);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const { toast } = useToast();

  const [newDevice, setNewDevice] = useState({
    name: '',
    ip: '',
    community: 'public',
    version: 2,
    description: ''
  });

  const handleAddDevice = () => {
    const deviceId = Date.now().toString();
    const device: SNMPDevice = {
      id: deviceId,
      name: newDevice.name,
      ip: newDevice.ip,
      community: newDevice.community,
      version: newDevice.version,
      status: 'online',
      lastSeen: new Date(),
      description: newDevice.description
    };

    setDevices(prev => [...prev, device]);
    setShowAddDevice(false);
    setNewDevice({ name: '', ip: '', community: 'public', version: 2, description: '' });
    
    toast({
      title: "Device Added",
      description: `SNMP device ${newDevice.name} has been added successfully.`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Network Monitoring</h1>
        <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add SNMP Device
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add SNMP Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="device-name">Device Name</Label>
                <Input
                  id="device-name"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Router-01"
                />
              </div>
              <div>
                <Label htmlFor="device-ip">IP Address</Label>
                <Input
                  id="device-ip"
                  value={newDevice.ip}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, ip: e.target.value }))}
                  placeholder="192.168.1.1"
                />
              </div>
              <div>
                <Label htmlFor="device-community">SNMP Community</Label>
                <Input
                  id="device-community"
                  value={newDevice.community}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, community: e.target.value }))}
                  placeholder="public"
                />
              </div>
              <div>
                <Label htmlFor="device-version">SNMP Version</Label>
                <Select 
                  value={newDevice.version.toString()} 
                  onValueChange={(value) => setNewDevice(prev => ({ ...prev, version: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">v1</SelectItem>
                    <SelectItem value="2">v2c</SelectItem>
                    <SelectItem value="3">v3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="device-description">Description</Label>
                <Input
                  id="device-description"
                  value={newDevice.description}
                  onChange={(e) => setNewDevice(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Main router for branch office"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDevice(false)}>
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

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SNMP Devices</CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No SNMP devices configured</p>
                <p className="text-sm">Click "Add SNMP Device" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(device.status)}
                      <div>
                        <h3 className="font-medium">{device.name}</h3>
                        <p className="text-sm text-muted-foreground">{device.ip}</p>
                        {device.description && (
                          <p className="text-xs text-muted-foreground">{device.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                        {device.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Last seen: {device.lastSeen.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkMonitoring;

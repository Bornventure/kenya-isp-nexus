
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Router, Server, Wifi, Settings, MapPin, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NetworkDevice {
  id: string;
  name: string;
  type: 'core_router' | 'edge_router' | 'switch' | 'firewall' | 'load_balancer' | 'access_point';
  brand: string;
  model: string;
  ip_address: string;
  management_ip?: string;
  location: string;
  status: 'active' | 'inactive' | 'maintenance' | 'failed';
  snmp_community?: string;
  snmp_version?: number;
  role: 'core' | 'distribution' | 'access' | 'management';
  uptime?: number;
  cpu_usage?: number;
  memory_usage?: number;
  last_seen?: Date;
  interfaces_count?: number;
  active_interfaces?: number;
}

const NetworkInfrastructureManager = () => {
  const { toast } = useToast();
  const [devices, setDevices] = useState<NetworkDevice[]>([
    {
      id: '1',
      name: 'Core Router Main',
      type: 'core_router',
      brand: 'Cisco',
      model: 'ISR4331',
      ip_address: '192.168.1.1',
      management_ip: '192.168.100.1',
      location: 'Main Data Center',
      status: 'active',
      role: 'core',
      uptime: 99.8,
      cpu_usage: 15,
      memory_usage: 45,
      last_seen: new Date(),
      interfaces_count: 8,
      active_interfaces: 6
    },
    {
      id: '2',
      name: 'Distribution Switch',
      type: 'switch',
      brand: 'Cisco',
      model: 'Catalyst 3850',
      ip_address: '192.168.1.10',
      location: 'Main Rack',
      status: 'active',
      role: 'distribution',
      uptime: 99.9,
      cpu_usage: 8,
      memory_usage: 32,
      last_seen: new Date(),
      interfaces_count: 48,
      active_interfaces: 24
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<NetworkDevice | null>(null);
  const [formData, setFormData] = useState<Partial<NetworkDevice>>({});

  const deviceTypeIcons = {
    core_router: Router,
    edge_router: Router,
    switch: Server,
    firewall: Server,
    load_balancer: Server,
    access_point: Wifi
  };

  const statusColors = {
    active: 'bg-green-500',
    inactive: 'bg-gray-500',
    maintenance: 'bg-yellow-500',
    failed: 'bg-red-500'
  };

  const handleAddDevice = () => {
    setSelectedDevice(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEditDevice = (device: NetworkDevice) => {
    setSelectedDevice(device);
    setFormData(device);
    setIsDialogOpen(true);
  };

  const handleSaveDevice = () => {
    if (selectedDevice) {
      // Update existing device
      setDevices(devices.map(d => d.id === selectedDevice.id ? { ...selectedDevice, ...formData } : d));
      toast({
        title: "Device Updated",
        description: "Network device has been updated successfully.",
      });
    } else {
      // Add new device
      const newDevice: NetworkDevice = {
        id: Date.now().toString(),
        ...formData as NetworkDevice,
        last_seen: new Date()
      };
      setDevices([...devices, newDevice]);
      toast({
        title: "Device Added",
        description: "Network device has been added successfully.",
      });
    }
    setIsDialogOpen(false);
  };

  const DeviceIcon = ({ type }: { type: NetworkDevice['type'] }) => {
    const Icon = deviceTypeIcons[type] || Server;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Network Infrastructure</h2>
          <p className="text-muted-foreground">Manage core network routers, switches, and infrastructure devices</p>
        </div>
        <Button onClick={handleAddDevice} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Infrastructure Device
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map((device) => (
          <Card key={device.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEditDevice(device)}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DeviceIcon type={device.type} />
                  <CardTitle className="text-lg">{device.name}</CardTitle>
                </div>
                <Badge className={`text-white ${statusColors[device.status]}`}>
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
                  <span className="text-muted-foreground">Role:</span>
                  <div className="font-medium capitalize">{device.role}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Brand:</span>
                  <div className="font-medium">{device.brand}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Model:</span>
                  <div className="font-medium">{device.model}</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span>{device.location}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">IP:</span> {device.ip_address}
                </div>
              </div>

              {device.uptime !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className="font-medium">{device.uptime}%</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Interfaces</span>
                    <span className="font-medium">{device.active_interfaces}/{device.interfaces_count}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  Last seen: {device.last_seen?.toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Device Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDevice ? 'Edit Network Device' : 'Add Network Device'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 space-y-4">
            <div>
              <Label htmlFor="name">Device Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Core Router Main"
              />
            </div>

            <div>
              <Label htmlFor="type">Device Type</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NetworkDevice['type'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select device type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core_router">Core Router</SelectItem>
                  <SelectItem value="edge_router">Edge Router</SelectItem>
                  <SelectItem value="switch">Network Switch</SelectItem>
                  <SelectItem value="firewall">Firewall</SelectItem>
                  <SelectItem value="load_balancer">Load Balancer</SelectItem>
                  <SelectItem value="access_point">Access Point</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Cisco, Ubiquiti, MikroTik"
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="ISR4331, RB1100AHx4"
              />
            </div>

            <div>
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                placeholder="192.168.1.1"
              />
            </div>

            <div>
              <Label htmlFor="management_ip">Management IP (Optional)</Label>
              <Input
                id="management_ip"
                value={formData.management_ip || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, management_ip: e.target.value }))}
                placeholder="192.168.100.1"
              />
            </div>

            <div>
              <Label htmlFor="role">Network Role</Label>
              <Select
                value={formData.role || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as NetworkDevice['role'] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="distribution">Distribution</SelectItem>
                  <SelectItem value="access">Access</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as NetworkDevice['status'] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Main Data Center, Tower Site A"
              />
            </div>

            <div>
              <Label htmlFor="snmp_community">SNMP Community (Optional)</Label>
              <Input
                id="snmp_community"
                value={formData.snmp_community || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                placeholder="public"
              />
            </div>

            <div>
              <Label htmlFor="snmp_version">SNMP Version</Label>
              <Select
                value={formData.snmp_version?.toString() || '2'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Version 1</SelectItem>
                  <SelectItem value="2">Version 2c</SelectItem>
                  <SelectItem value="3">Version 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDevice}>
              {selectedDevice ? 'Update Device' : 'Add Device'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NetworkInfrastructureManager;


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
import { useEquipment } from '@/hooks/useEquipment';

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
  const { equipment, createEquipment, updateEquipment, isLoading } = useEquipment();
  
  // Filter equipment to show only network infrastructure devices
  const networkDevices = equipment.filter(device => 
    ['core_router', 'edge_router', 'switch', 'firewall', 'load_balancer', 'access_point'].includes(device.type)
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({});

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

  const handleEditDevice = (device: any) => {
    setSelectedDevice(device);
    setFormData({
      type: device.type,
      brand: device.brand,
      model: device.model,
      serial_number: device.serial_number,
      ip_address: device.ip_address,
      snmp_community: device.snmp_community,
      snmp_version: device.snmp_version,
      status: device.status,
      notes: device.notes
    });
    setIsDialogOpen(true);
  };

  const handleSaveDevice = () => {
    if (selectedDevice) {
      // Update existing device
      updateEquipment({
        id: selectedDevice.id,
        updates: {
          type: formData.type,
          brand: formData.brand,
          model: formData.model,
          serial_number: formData.serial_number,
          ip_address: formData.ip_address,
          snmp_community: formData.snmp_community,
          snmp_version: formData.snmp_version,
          status: formData.status,
          notes: formData.notes
        }
      });
    } else {
      // Add new device
      createEquipment({
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        serial_number: formData.serial_number || `${formData.type}-${Date.now()}`,
        ip_address: formData.ip_address,
        snmp_community: formData.snmp_community || 'public',
        snmp_version: formData.snmp_version || 2,
        status: formData.status || 'active',
        notes: formData.notes,
        approval_status: 'approved' // Auto-approve infrastructure devices
      });
    }
    setIsDialogOpen(false);
  };

  const DeviceIcon = ({ type }: { type: string }) => {
    const Icon = deviceTypeIcons[type as keyof typeof deviceTypeIcons] || Server;
    return <Icon className="h-4 w-4" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading network infrastructure...</div>;
  }

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
        {networkDevices.map((device) => (
          <Card key={device.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleEditDevice(device)}>
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
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <Activity className="h-3 w-3 text-green-500" />
                <span className="text-xs text-muted-foreground">
                  Added: {new Date(device.created_at).toLocaleDateString()}
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
              <Label htmlFor="type">Device Type</Label>
              <Select
                value={formData.type || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
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
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                placeholder="Device serial number"
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'active'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
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

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this device"
                rows={3}
              />
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

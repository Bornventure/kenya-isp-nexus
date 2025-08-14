
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Equipment } from '@/types/equipment';
import { Save, X } from 'lucide-react';

interface EditEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onSubmit: (id: string, data: Partial<Equipment>) => void;
  isLoading: boolean;
}

const EditEquipmentDialog: React.FC<EditEquipmentDialogProps> = ({
  open,
  onOpenChange,
  equipment,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    ip_address: '',
    location: '',
    notes: '',
    status: 'available' as const,
    snmp_community: 'public',
    snmp_version: 2,
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        type: equipment.type || '',
        brand: equipment.brand || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        mac_address: equipment.mac_address || '',
        ip_address: equipment.ip_address?.toString() || '',
        location: equipment.location || '',
        notes: equipment.notes || '',
        status: equipment.status || 'available',
        snmp_community: equipment.snmp_community || 'public',
        snmp_version: equipment.snmp_version || 2,
      });
    }
  }, [equipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (equipment) {
      onSubmit(equipment.id, formData);
    }
  };

  if (!equipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Edit Equipment</DialogTitle>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Equipment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Router">Router</SelectItem>
                    <SelectItem value="Switch">Switch</SelectItem>
                    <SelectItem value="Access Point">Access Point</SelectItem>
                    <SelectItem value="Modem">Modem</SelectItem>
                    <SelectItem value="Firewall">Firewall</SelectItem>
                    <SelectItem value="Base Station">Base Station</SelectItem>
                    <SelectItem value="CPE">CPE</SelectItem>
                    <SelectItem value="Antenna">Antenna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Network Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  value={formData.mac_address}
                  onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ip_address">IP Address</Label>
                <Input
                  id="ip_address"
                  value={formData.ip_address}
                  onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="snmp_community">SNMP Community</Label>
                <Input
                  id="snmp_community"
                  value={formData.snmp_community}
                  onChange={(e) => setFormData({ ...formData, snmp_community: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="snmp_version">SNMP Version</Label>
                <Select 
                  value={formData.snmp_version.toString()} 
                  onValueChange={(value) => setFormData({ ...formData, snmp_version: parseInt(value) })}
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="deployed">Deployed</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="damaged">Damaged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              <Save className="h-4 w-4" />
              {isLoading ? 'Updating...' : 'Update Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipmentDialog;

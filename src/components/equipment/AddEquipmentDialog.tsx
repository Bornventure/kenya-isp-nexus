
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEquipment } from '@/hooks/useEquipment';
import { useToast } from '@/hooks/use-toast';

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEquipmentDialog = ({ open, onOpenChange }: AddEquipmentDialogProps) => {
  const { createEquipment, isCreating } = useEquipment();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2,
    notes: '',
    status: 'available'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.serial_number) {
      toast({
        title: "Validation Error",
        description: "Equipment type and serial number are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createEquipment({
        ...formData,
        approval_status: 'pending'
      });
      
      // Reset form
      setFormData({
        type: '',
        brand: '',
        model: '',
        serial_number: '',
        mac_address: '',
        ip_address: '',
        snmp_community: 'public',
        snmp_version: 2,
        notes: '',
        status: 'available'
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding equipment:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Equipment Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Router">Router</SelectItem>
                  <SelectItem value="Switch">Switch</SelectItem>
                  <SelectItem value="Access Point">Access Point</SelectItem>
                  <SelectItem value="Modem">Modem</SelectItem>
                  <SelectItem value="Firewall">Firewall</SelectItem>
                  <SelectItem value="Server">Server</SelectItem>
                  <SelectItem value="Antenna">Antenna</SelectItem>
                  <SelectItem value="Cable">Cable</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="serial_number">Serial Number *</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => handleInputChange('serial_number', e.target.value)}
                placeholder="Enter serial number"
                required
              />
            </div>

            <div>
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder="Enter brand"
              />
            </div>

            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Enter model"
              />
            </div>

            <div>
              <Label htmlFor="mac_address">MAC Address</Label>
              <Input
                id="mac_address"
                value={formData.mac_address}
                onChange={(e) => handleInputChange('mac_address', e.target.value)}
                placeholder="00:00:00:00:00:00"
              />
            </div>

            <div>
              <Label htmlFor="ip_address">IP Address</Label>
              <Input
                id="ip_address"
                value={formData.ip_address}
                onChange={(e) => handleInputChange('ip_address', e.target.value)}
                placeholder="192.168.1.1"
              />
            </div>

            <div>
              <Label htmlFor="snmp_community">SNMP Community</Label>
              <Input
                id="snmp_community"
                value={formData.snmp_community}
                onChange={(e) => handleInputChange('snmp_community', e.target.value)}
                placeholder="public"
              />
            </div>

            <div>
              <Label htmlFor="snmp_version">SNMP Version</Label>
              <Select value={formData.snmp_version.toString()} onValueChange={(value) => handleInputChange('snmp_version', parseInt(value))}>
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
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this equipment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEquipmentDialog;

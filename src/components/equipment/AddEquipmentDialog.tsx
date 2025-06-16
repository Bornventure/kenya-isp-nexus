
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import { EquipmentType } from '@/hooks/useEquipmentTypes';
import EquipmentTypeSelector from './EquipmentTypeSelector';

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddEquipmentDialog: React.FC<AddEquipmentDialogProps> = ({ open, onOpenChange }) => {
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [selectedType, setSelectedType] = useState<EquipmentType | null>(null);
  const [formData, setFormData] = useState({
    serial_number: '',
    mac_address: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: '2',
    port_number: '',
    vlan_id: '',
    client_id: '',
    notes: '',
  });

  const { toast } = useToast();
  const { createEquipment, isCreating } = useEquipment();
  const { clients } = useClients();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedType) {
      toast({
        title: "Equipment Type Required",
        description: "Please select an equipment type first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Only pass the fields that are being set, let the mutation handle defaults
      await createEquipment({
        equipment_type_id: selectedType.id,
        type: selectedType.device_type,
        brand: selectedType.brand,
        model: selectedType.model,
        serial_number: formData.serial_number,
        mac_address: formData.mac_address || null,
        ip_address: formData.ip_address || null,
        snmp_community: formData.snmp_community,
        snmp_version: parseInt(formData.snmp_version),
        port_number: formData.port_number ? parseInt(formData.port_number) : null,
        vlan_id: formData.vlan_id ? parseInt(formData.vlan_id) : null,
        client_id: formData.client_id || null,
        notes: formData.notes || null,
        status: 'pending',
        approval_status: 'pending',
      });

      toast({
        title: "Equipment Added",
        description: "Equipment has been added and is pending approval.",
      });

      onOpenChange(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setFormData({
      serial_number: '',
      mac_address: '',
      ip_address: '',
      snmp_community: 'public',
      snmp_version: '2',
      port_number: '',
      vlan_id: '',
      client_id: '',
      notes: '',
    });
  };

  const handleTypeSelect = (type: EquipmentType) => {
    setSelectedType(type);
    // Apply default configuration
    if (type.default_config) {
      setFormData(prev => ({
        ...prev,
        snmp_community: type.snmp_settings?.community || 'public',
        snmp_version: type.snmp_settings?.version?.toString() || '2',
      }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Equipment Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Equipment Type</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedType ? (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{selectedType.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedType.brand} {selectedType.model}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTypeSelector(true)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowTypeSelector(true)}
                  >
                    Select Equipment Type
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mac_address">MAC Address</Label>
                <Input
                  id="mac_address"
                  value={formData.mac_address}
                  onChange={(e) => setFormData(prev => ({ ...prev, mac_address: e.target.value }))}
                  placeholder="00:00:00:00:00:00"
                />
              </div>
            </div>

            {/* Network Configuration */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Network Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_address">IP Address</Label>
                    <Input
                      id="ip_address"
                      value={formData.ip_address}
                      onChange={(e) => setFormData(prev => ({ ...prev, ip_address: e.target.value }))}
                      placeholder="192.168.1.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="snmp_community">SNMP Community</Label>
                    <Input
                      id="snmp_community"
                      value={formData.snmp_community}
                      onChange={(e) => setFormData(prev => ({ ...prev, snmp_community: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="snmp_version">SNMP Version</Label>
                    <Select value={formData.snmp_version} onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: value }))}>
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
                  <div className="space-y-2">
                    <Label htmlFor="port_number">Port Number</Label>
                    <Input
                      id="port_number"
                      type="number"
                      value={formData.port_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, port_number: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vlan_id">VLAN ID</Label>
                    <Input
                      id="vlan_id"
                      type="number"
                      value={formData.vlan_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, vlan_id: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Assignment */}
            <div className="space-y-2">
              <Label htmlFor="client_id">Assign to Client (Optional)</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this equipment..."
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || !selectedType}>
                {isCreating ? 'Adding...' : 'Add Equipment'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <EquipmentTypeSelector
        open={showTypeSelector}
        onOpenChange={setShowTypeSelector}
        onSelect={handleTypeSelect}
      />
    </>
  );
};

export default AddEquipmentDialog;

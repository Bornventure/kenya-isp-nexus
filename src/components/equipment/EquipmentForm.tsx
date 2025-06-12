
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';

const EquipmentForm: React.FC = () => {
  const { createEquipment, isCreating } = useEquipment();
  const { clients } = useClients();
  
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    status: 'available' as const,
    client_id: '',
    purchase_date: '',
    warranty_end_date: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type || !formData.serial_number) {
      return;
    }

    const equipmentData = {
      type: formData.type,
      brand: formData.brand || null,
      model: formData.model || null,
      serial_number: formData.serial_number,
      mac_address: formData.mac_address || null,
      status: formData.status,
      client_id: formData.client_id || null,
      purchase_date: formData.purchase_date || null,
      warranty_end_date: formData.warranty_end_date || null,
      notes: formData.notes || null,
    };

    createEquipment(equipmentData);
    
    // Reset form
    setFormData({
      type: '',
      brand: '',
      model: '',
      serial_number: '',
      mac_address: '',
      status: 'available',
      client_id: '',
      purchase_date: '',
      warranty_end_date: '',
      notes: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Equipment Type *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select equipment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Router">Router</SelectItem>
              <SelectItem value="Switch">Switch</SelectItem>
              <SelectItem value="Access Point">Access Point</SelectItem>
              <SelectItem value="Modem">Modem</SelectItem>
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
            onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            placeholder="Enter serial number"
          />
        </div>

        <div>
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="e.g., Cisco, TP-Link"
          />
        </div>

        <div>
          <Label htmlFor="model">Model</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="Model number"
          />
        </div>

        <div>
          <Label htmlFor="mac_address">MAC Address</Label>
          <Input
            id="mac_address"
            value={formData.mac_address}
            onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
            placeholder="XX:XX:XX:XX:XX:XX"
          />
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="damaged">Damaged</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="client_id">Assign to Client</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select client (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="purchase_date">Purchase Date</Label>
          <Input
            id="purchase_date"
            type="date"
            value={formData.purchase_date}
            onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="warranty_end_date">Warranty End Date</Label>
          <Input
            id="warranty_end_date"
            type="date"
            value={formData.warranty_end_date}
            onChange={(e) => setFormData({ ...formData, warranty_end_date: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about this equipment..."
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isCreating}>
          {isCreating ? 'Adding...' : 'Add Equipment'}
        </Button>
      </div>
    </form>
  );
};

export default EquipmentForm;

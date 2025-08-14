import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateInventoryItem } from '@/hooks/useInventory';

interface AddInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddInventoryItemDialog: React.FC<AddInventoryItemDialogProps> = ({
  open,
  onOpenChange
}) => {
  const { createEquipment, isPending } = useCreateInventoryItem();
  
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serial_number: '',
    mac_address: '',
    status: 'available' as const,
    notes: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEquipment.mutate(formData);
    setFormData({
      name: '',
      type: '',
      brand: '',
      model: '',
      serial_number: '',
      mac_address: '',
      status: 'available',
      notes: '',
      location: ''
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name</Label>
              <Input
                id="item-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="CPE Router"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-type">Item Type</Label>
              <Input
                id="item-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="Router"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-brand">Item Brand</Label>
              <Input
                id="item-brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                placeholder="TP-Link"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-model">Item Model</Label>
              <Input
                id="item-model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Archer C6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-serial">Serial Number</Label>
              <Input
                id="item-serial"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="SN123456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-mac">MAC Address</Label>
              <Input
                id="item-mac"
                value={formData.mac_address}
                onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                placeholder="00:1A:2B:3C:4D:5E"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-status">Item Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Available" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="deployed">Deployed</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="damaged">Damaged</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="item-location">Item Location</Label>
              <Input
                id="item-location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Warehouse A"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="item-notes">Item Notes</Label>
            <Input
              id="item-notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the item"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryItemDialog;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateInventoryItem } from '@/hooks/useInventory';

interface AddInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddInventoryItemDialog: React.FC<AddInventoryItemDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { mutate: createItem, isPending } = useCreateInventoryItem();
  const [formData, setFormData] = useState({
    category: '',
    type: '',
    name: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    mac_address: '',
    purchase_date: '',
    warranty_expiry_date: '',
    supplier: '',
    cost: '',
    location: '',
    status: 'In Stock',
    notes: '',
    // Consumable fields
    item_sku: '',
    quantity_in_stock: '',
    reorder_level: '',
    unit_cost: '',
    // Infrastructure fields
    capacity: '',
    installation_date: '',
    // Logical resource fields
    ip_address: '',
    subnet_mask: '',
  });

  const categories = [
    'Network Hardware',
    'CPE',
    'Infrastructure',
    'Logical Resource',
    'Consumable',
  ];

  const networkHardwareTypes = ['Router', 'Switch', 'Server', 'OLT', 'Power Supply', 'SFP'];
  const cpeTypes = ['Modem', 'Router', 'Antenna', 'ONU/ONT'];
  const infrastructureTypes = ['Fiber Cable', 'Tower', 'Cabinet', 'Pole', 'Splitter'];
  const logicalResourceTypes = ['IPv4 Address', 'IPv6 Subnet'];

  const getTypeOptions = () => {
    switch (formData.category) {
      case 'Network Hardware':
        return networkHardwareTypes;
      case 'CPE':
        return cpeTypes;
      case 'Infrastructure':
        return infrastructureTypes;
      case 'Logical Resource':
        return logicalResourceTypes;
      default:
        return [];
    }
  };

  const getStatusOptions = () => {
    switch (formData.category) {
      case 'CPE':
        return ['In Stock', 'Provisioning', 'Deployed', 'Faulty', 'In Repair', 'Returned'];
      case 'Infrastructure':
        return ['Active', 'Under Construction', 'Decommissioned'];
      case 'Logical Resource':
        return ['Available', 'Reserved', 'Assigned'];
      default:
        return ['In Stock', 'Live/Deployed', 'Maintenance', 'Faulty', 'Retired'];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData: any = {
      category: formData.category,
      type: formData.type,
      name: formData.name || null,
      manufacturer: formData.manufacturer || null,
      model: formData.model || null,
      serial_number: formData.serial_number || null,
      mac_address: formData.mac_address || null,
      purchase_date: formData.purchase_date || null,
      warranty_expiry_date: formData.warranty_expiry_date || null,
      supplier: formData.supplier || null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      location: formData.location || null,
      status: formData.status,
      notes: formData.notes || null,
    };

    // Add category-specific fields
    if (formData.category === 'Consumable') {
      itemData.item_sku = formData.item_sku || null;
      itemData.quantity_in_stock = formData.quantity_in_stock ? parseInt(formData.quantity_in_stock) : null;
      itemData.reorder_level = formData.reorder_level ? parseInt(formData.reorder_level) : null;
      itemData.unit_cost = formData.unit_cost ? parseFloat(formData.unit_cost) : null;
    }

    if (formData.category === 'Infrastructure') {
      itemData.capacity = formData.capacity || null;
      itemData.installation_date = formData.installation_date || null;
    }

    if (formData.category === 'Logical Resource') {
      itemData.ip_address = formData.ip_address || null;
      itemData.subnet_mask = formData.subnet_mask || null;
    }

    createItem(itemData, {
      onSuccess: () => {
        setFormData({
          category: '',
          type: '',
          name: '',
          manufacturer: '',
          model: '',
          serial_number: '',
          mac_address: '',
          purchase_date: '',
          warranty_expiry_date: '',
          supplier: '',
          cost: '',
          location: '',
          status: 'In Stock',
          notes: '',
          item_sku: '',
          quantity_in_stock: '',
          reorder_level: '',
          unit_cost: '',
          capacity: '',
          installation_date: '',
          ip_address: '',
          subnet_mask: '',
        });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value, type: '' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
                disabled={!formData.category}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {getTypeOptions().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Item name"
              />
            </div>

            <div>
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
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
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                placeholder="Serial number"
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
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getStatusOptions().map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="Supplier name"
              />
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
              <Label htmlFor="warranty_expiry_date">Warranty Expiry</Label>
              <Input
                id="warranty_expiry_date"
                type="date"
                value={formData.warranty_expiry_date}
                onChange={(e) => setFormData({ ...formData, warranty_expiry_date: e.target.value })}
              />
            </div>

            {formData.category !== 'Logical Resource' && (
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Physical location"
                />
              </div>
            )}

            {/* Consumable-specific fields */}
            {formData.category === 'Consumable' && (
              <>
                <div>
                  <Label htmlFor="item_sku">Item SKU</Label>
                  <Input
                    id="item_sku"
                    value={formData.item_sku}
                    onChange={(e) => setFormData({ ...formData, item_sku: e.target.value })}
                    placeholder="SKU"
                  />
                </div>
                <div>
                  <Label htmlFor="quantity_in_stock">Quantity in Stock</Label>
                  <Input
                    id="quantity_in_stock"
                    type="number"
                    value={formData.quantity_in_stock}
                    onChange={(e) => setFormData({ ...formData, quantity_in_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="reorder_level">Reorder Level</Label>
                  <Input
                    id="reorder_level"
                    type="number"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="unit_cost">Unit Cost</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    step="0.01"
                    value={formData.unit_cost}
                    onChange={(e) => setFormData({ ...formData, unit_cost: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </>
            )}

            {/* Infrastructure-specific fields */}
            {formData.category === 'Infrastructure' && (
              <>
                <div>
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="e.g., 48 Core"
                  />
                </div>
                <div>
                  <Label htmlFor="installation_date">Installation Date</Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => setFormData({ ...formData, installation_date: e.target.value })}
                  />
                </div>
              </>
            )}

            {/* Logical Resource-specific fields */}
            {formData.category === 'Logical Resource' && (
              <>
                <div>
                  <Label htmlFor="ip_address">IP Address/Subnet</Label>
                  <Input
                    id="ip_address"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.1 or 2001:db8::/32"
                  />
                </div>
                <div>
                  <Label htmlFor="subnet_mask">Subnet Mask</Label>
                  <Input
                    id="subnet_mask"
                    value={formData.subnet_mask}
                    onChange={(e) => setFormData({ ...formData, subnet_mask: e.target.value })}
                    placeholder="255.255.255.0"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !formData.category || !formData.type}>
              {isPending ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryItemDialog;

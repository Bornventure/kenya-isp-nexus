import React, { useState, useEffect } from 'react';
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
import { useInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';

interface EditInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
}

const EditInventoryItemDialog: React.FC<EditInventoryItemDialogProps> = ({
  open,
  onOpenChange,
  itemId,
}) => {
  const { data: item, isLoading } = useInventoryItem(itemId);
  const { mutate: updateItem, isPending } = useUpdateInventoryItem();
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData({
        category: item.category,
        type: item.type,
        name: item.name || '',
        manufacturer: item.manufacturer || '',
        model: item.model || '',
        serial_number: item.serial_number || '',
        mac_address: item.mac_address || '',
        purchase_date: item.purchase_date || '',
        warranty_expiry_date: item.warranty_expiry_date || '',
        supplier: item.supplier || '',
        cost: item.cost || '',
        location: item.location || '',
        status: item.status,
        notes: item.notes || '',
        item_sku: item.item_sku || '',
        quantity_in_stock: item.quantity_in_stock || '',
        reorder_level: item.reorder_level || '',
        unit_cost: item.unit_cost || '',
        capacity: item.capacity || '',
        installation_date: item.installation_date || '',
        ip_address: item.ip_address || '',
        subnet_mask: item.subnet_mask || '',
      });
    }
  }, [item]);

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
    
    const updates = {
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
      item_sku: formData.item_sku || null,
      quantity_in_stock: formData.quantity_in_stock ? parseInt(formData.quantity_in_stock) : null,
      reorder_level: formData.reorder_level ? parseInt(formData.reorder_level) : null,
      unit_cost: formData.unit_cost ? parseFloat(formData.unit_cost) : null,
      capacity: formData.capacity || null,
      installation_date: formData.installation_date || null,
      ip_address: formData.ip_address || null,
      subnet_mask: formData.subnet_mask || null,
    };

    updateItem({ itemId, updates }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item - {item?.item_id}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div>
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                value={formData.type}
                disabled
                className="bg-gray-100"
              />
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

            {/* Category-specific fields */}
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryItemDialog;

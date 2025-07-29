
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePromoteToNetworkEquipment, InventoryItem } from '@/hooks/useInventory';
import { useEquipmentTypes } from '@/hooks/useEquipmentTypes';
import { Loader2 } from 'lucide-react';

interface PromoteToEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventoryItem: InventoryItem | null;
}

const PromoteToEquipmentDialog: React.FC<PromoteToEquipmentDialogProps> = ({
  open,
  onOpenChange,
  inventoryItem,
}) => {
  const [formData, setFormData] = useState({
    equipment_type_id: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2,
    notes: '',
  });

  const { mutate: promoteToEquipment, isPending } = usePromoteToNetworkEquipment();
  const { data: equipmentTypes = [], isLoading: typesLoading, error: typesError } = useEquipmentTypes();

  console.log('Equipment types:', equipmentTypes);
  console.log('Types loading:', typesLoading);
  console.log('Types error:', typesError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryItem) return;

    console.log('Promoting item with data:', formData);
    promoteToEquipment(
      {
        inventoryItemId: inventoryItem.id,
        equipmentData: {
          ...formData,
          notes: formData.notes || `Promoted from inventory item ${inventoryItem.item_id}`,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setFormData({
            equipment_type_id: '',
            ip_address: '',
            snmp_community: 'public',
            snmp_version: 2,
            notes: '',
          });
        },
      }
    );
  };

  if (!inventoryItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promote to Network Equipment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Item Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Current Inventory Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Item ID:</span> {inventoryItem.item_id}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {inventoryItem.type}
                </div>
                <div>
                  <span className="font-medium">Manufacturer:</span> {inventoryItem.manufacturer || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {inventoryItem.model || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Serial:</span> {inventoryItem.serial_number || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">MAC:</span> {inventoryItem.mac_address || 'N/A'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Network Equipment Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipment_type_id">Equipment Type</Label>
                {typesError ? (
                  <div className="text-sm text-destructive p-2 border border-destructive rounded">
                    Error loading equipment types: {typesError.message}
                  </div>
                ) : (
                  <Select 
                    value={formData.equipment_type_id} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type_id: value }))}
                    disabled={typesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        typesLoading ? "Loading equipment types..." : "Select equipment type"
                      } />
                      {typesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    </SelectTrigger>
                    <SelectContent>
                      {typesLoading ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Loading...
                        </SelectItem>
                      ) : equipmentTypes.length === 0 ? (
                        <SelectItem value="no-types" disabled>
                          No equipment types available
                        </SelectItem>
                      ) : (
                        equipmentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.brand} {type.model})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="snmp_version">SNMP Version</Label>
                <Select 
                  value={formData.snmp_version.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, snmp_version: parseInt(value) }))}
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

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes for network equipment..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending || !formData.equipment_type_id || typesLoading}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Promoting...
                </>
              ) : (
                'Promote to Network Equipment'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteToEquipmentDialog;

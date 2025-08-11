import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { usePromoteToNetworkEquipment } from '@/hooks/useInventory';
import { Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { InventoryItem } from '@/hooks/useInventory';

// Ensure props use the shared InventoryItem type where item_id is optional
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
  const [equipmentData, setEquipmentData] = useState({
    equipment_type_id: '',
    ip_address: '',
    snmp_community: 'public',
    snmp_version: 2,
    notes: '',
  });

  const { mutate: promoteEquipment, isPending } = usePromoteToNetworkEquipment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inventoryItem) {
      toast({
        title: "Error",
        description: "No inventory item selected.",
        variant: "destructive",
      });
      return;
    }

    promoteEquipment(
      {
        inventoryItemId: inventoryItem.id,
        equipmentData: equipmentData,
      },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Item promoted to network equipment successfully.",
          });
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: "Failed to promote item. Please try again.",
            variant: "destructive",
          });
          console.error('Error promoting item:', error);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Promote to Network Equipment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="equipment_type_id">Equipment Type ID</Label>
            <Input
              type="text"
              id="equipment_type_id"
              value={equipmentData.equipment_type_id}
              onChange={(e) =>
                setEquipmentData({ ...equipmentData, equipment_type_id: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="ip_address">IP Address</Label>
            <Input
              type="text"
              id="ip_address"
              value={equipmentData.ip_address}
              onChange={(e) =>
                setEquipmentData({ ...equipmentData, ip_address: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="snmp_community">SNMP Community</Label>
            <Input
              type="text"
              id="snmp_community"
              value={equipmentData.snmp_community}
              onChange={(e) =>
                setEquipmentData({ ...equipmentData, snmp_community: e.target.value })
              }
            />
          </div>

          <div>
            <Label htmlFor="snmp_version">SNMP Version</Label>
            <Input
              type="number"
              id="snmp_version"
              value={equipmentData.snmp_version}
              onChange={(e) =>
                setEquipmentData({ ...equipmentData, snmp_version: parseInt(e.target.value, 10) })
              }
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={equipmentData.notes}
              onChange={(e) => setEquipmentData({ ...equipmentData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Promoting...
                </>
              ) : (
                'Promote'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteToEquipmentDialog;

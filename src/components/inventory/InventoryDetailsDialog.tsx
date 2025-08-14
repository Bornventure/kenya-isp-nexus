
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { InventoryItem } from '@/hooks/useInventoryItems';

interface InventoryDetailsDialogProps {
  item: InventoryItem | null;
  open: boolean;
  onClose: () => void;
}

const InventoryDetailsDialog: React.FC<InventoryDetailsDialogProps> = ({ item, open, onClose }) => {
  if (!item) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'default';
      case 'Low Stock': return 'destructive';
      case 'Out of Stock': return 'secondary';
      case 'Deployed': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inventory Item Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {item.name || `${item.manufacturer} ${item.model}` || item.type}
              </h3>
              <p className="text-muted-foreground">
                {item.category} - {item.type}
              </p>
            </div>
            <Badge variant={getStatusColor(item.status)}>
              {item.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">Basic Information</h4>
              
              {item.manufacturer && (
                <div>
                  <span className="text-sm text-muted-foreground">Manufacturer:</span>
                  <p className="font-medium">{item.manufacturer}</p>
                </div>
              )}
              
              {item.model && (
                <div>
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <p className="font-medium">{item.model}</p>
                </div>
              )}
              
              {item.serial_number && (
                <div>
                  <span className="text-sm text-muted-foreground">Serial Number:</span>
                  <p className="font-mono text-sm">{item.serial_number}</p>
                </div>
              )}
              
              {item.mac_address && (
                <div>
                  <span className="text-sm text-muted-foreground">MAC Address:</span>
                  <p className="font-mono text-sm">{item.mac_address}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Stock & Location</h4>
              
              {item.quantity_in_stock !== null && (
                <div>
                  <span className="text-sm text-muted-foreground">Quantity in Stock:</span>
                  <p className="font-medium">{item.quantity_in_stock}</p>
                </div>
              )}
              
              {item.reorder_level !== null && (
                <div>
                  <span className="text-sm text-muted-foreground">Reorder Level:</span>
                  <p className="font-medium">{item.reorder_level}</p>
                </div>
              )}
              
              {item.location && (
                <div>
                  <span className="text-sm text-muted-foreground">Location:</span>
                  <p className="font-medium">{item.location}</p>
                </div>
              )}
              
              {item.unit_cost !== null && (
                <div>
                  <span className="text-sm text-muted-foreground">Unit Cost:</span>
                  <p className="font-medium">KES {item.unit_cost}</p>
                </div>
              )}
            </div>
          </div>

          {item.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{item.notes}</p>
              </div>
            </>
          )}

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>Created: {new Date(item.created_at).toLocaleString()}</p>
            <p>Last Updated: {new Date(item.updated_at).toLocaleString()}</p>
            {item.item_id && <p>Item ID: {item.item_id}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDetailsDialog;

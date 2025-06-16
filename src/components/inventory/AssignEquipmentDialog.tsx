
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, CheckCircle } from 'lucide-react';
import { useInventoryItems, useAssignEquipmentToClient } from '@/hooks/useInventory';

interface AssignEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

const AssignEquipmentDialog: React.FC<AssignEquipmentDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  clientName,
}) => {
  const [search, setSearch] = useState('');
  const { mutate: assignEquipment, isPending } = useAssignEquipmentToClient();
  
  // Only show CPE items that are in stock
  const { data: availableEquipment, isLoading } = useInventoryItems({
    category: 'CPE',
    status: 'In Stock',
    search: search || undefined,
  });

  const handleAssign = (itemId: string) => {
    assignEquipment(
      { itemId, clientId },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSearch('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Equipment to {clientName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search available equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Equipment */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">Loading available equipment...</div>
            ) : availableEquipment && availableEquipment.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Serial Number</TableHead>
                    <TableHead>MAC Address</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableEquipment.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        {item.item_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.type}</div>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          {item.manufacturer && (
                            <div className="text-xs text-muted-foreground">
                              {item.manufacturer}
                            </div>
                          )}
                          <div className="font-medium">{item.model || item.name}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.serial_number || '-'}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.mac_address || '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleAssign(item.id)}
                          disabled={isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Assign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <p>No available CPE equipment found</p>
                <p className="text-sm">Add CPE equipment to inventory or check if items are in stock</p>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEquipmentDialog;

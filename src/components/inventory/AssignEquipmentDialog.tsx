
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, CheckCircle, User } from 'lucide-react';
import { useInventoryItems, useAssignEquipmentToClient } from '@/hooks/useInventory';
import { useClients } from '@/hooks/useClients';

interface AssignEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string; // Optional - if provided, will assign to this specific client
  clientName?: string; // Optional - if provided, will show this client name
}

const AssignEquipmentDialog: React.FC<AssignEquipmentDialogProps> = ({
  open,
  onOpenChange,
  clientId: preSelectedClientId,
  clientName: preSelectedClientName,
}) => {
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState(preSelectedClientId || '');
  const { mutate: assignEquipment, isPending } = useAssignEquipmentToClient();
  
  // Get clients for selection if no client is pre-selected
  const { clients, isLoading: clientsLoading } = useClients();
  
  // Only show CPE items that are in stock
  const { data: availableEquipment, isLoading } = useInventoryItems({
    category: 'CPE',
    status: 'In Stock',
    search: search || undefined,
  });

  const handleAssign = (itemId: string) => {
    const clientToAssign = preSelectedClientId || selectedClientId;
    if (!clientToAssign) {
      alert('Please select a client first');
      return;
    }

    assignEquipment(
      { itemId, clientId: clientToAssign },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSearch('');
          if (!preSelectedClientId) {
            setSelectedClientId('');
          }
        },
      }
    );
  };

  const selectedClient = preSelectedClientId 
    ? { name: preSelectedClientName }
    : clients.find(c => c.id === selectedClientId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[600px]">
        <DialogHeader>
          <DialogTitle>
            Assign Equipment {selectedClient ? `to ${selectedClient.name}` : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Client Selection - only show if no client is pre-selected */}
          {!preSelectedClientId && (
            <div className="space-y-2">
              <Label>Select Client</Label>
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{client.name} ({client.phone})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

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
                          disabled={isPending || (!preSelectedClientId && !selectedClientId)}
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

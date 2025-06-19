
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { Loader2, User, Package } from 'lucide-react';

interface UnifiedEquipmentAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: { itemId: string; clientId: string }) => void;
  itemId: string;
  itemName: string;
  isLoading?: boolean;
}

const UnifiedEquipmentAssignmentDialog: React.FC<UnifiedEquipmentAssignmentDialogProps> = ({
  isOpen,
  onClose,
  onAssign,
  itemId,
  itemName,
  isLoading = false
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [notes, setNotes] = useState('');
  const clientsQuery = useClients();
  const clients = clientsQuery.data || [];
  const clientsLoading = clientsQuery.isLoading;

  const handleAssign = () => {
    if (!selectedClientId) return;
    
    onAssign({
      itemId,
      clientId: selectedClientId
    });
  };

  const handleClose = () => {
    setSelectedClientId('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assign Equipment to Client
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Equipment:</p>
            <p className="text-sm text-gray-600">{itemName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Select Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {clientsLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading clients...
                    </div>
                  </SelectItem>
                ) : clients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>
                    No clients available
                  </SelectItem>
                ) : (
                  clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <span className="font-medium">{client.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({client.phone})
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this assignment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedClientId || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                'Assign Equipment'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UnifiedEquipmentAssignmentDialog;

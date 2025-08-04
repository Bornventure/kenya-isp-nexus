
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { Loader2, User, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedEquipmentAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (data: { itemId: string; clientId: string }) => void;
  itemId: string;
  itemName: string;
  itemType?: 'inventory' | 'equipment';
  isLoading?: boolean;
}

const UnifiedEquipmentAssignmentDialog: React.FC<UnifiedEquipmentAssignmentDialogProps> = ({
  isOpen,
  onClose,
  onAssign,
  itemId,
  itemName,
  itemType = 'inventory',
  isLoading = false
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [notes, setNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const { clients, isLoading: clientsLoading } = useClients();
  const { toast } = useToast();
  const { profile } = useAuth();

  // Filter only approved and active clients for assignment
  const availableClients = clients.filter(client => 
    client.status === 'approved' || client.status === 'active'
  );

  const handleAssign = async () => {
    if (!selectedClientId) {
      toast({
        title: "Client Required",
        description: "Please select a client for assignment.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }

    setIsAssigning(true);
    try {
      console.log(`Assigning ${itemType} ${itemId} to client ${selectedClientId}`);

      if (itemType === 'inventory') {
        // Update inventory item assignment
        const { error: inventoryError } = await supabase
          .from('inventory_items')
          .update({
            assigned_customer_id: selectedClientId,
            status: 'Assigned',
            assignment_date: new Date().toISOString(),
            notes: notes.trim() || null
          })
          .eq('id', itemId);

        if (inventoryError) throw inventoryError;

        // Create client equipment record
        const { error: clientEquipmentError } = await supabase
          .from('client_equipment')
          .insert({
            client_id: selectedClientId,
            inventory_item_id: itemId,
            equipment_id: itemId, // Use itemId as equipment_id for inventory items
            assigned_by: profile.id,
            network_config: { notes: notes.trim() || null }
          });

        if (clientEquipmentError) throw clientEquipmentError;
      } else {
        // Update equipment assignment
        const { error: equipmentError } = await supabase
          .from('equipment')
          .update({
            client_id: selectedClientId,
            status: 'assigned',
            notes: notes.trim() || null
          })
          .eq('id', itemId);

        if (equipmentError) throw equipmentError;

        // Create equipment assignment record
        const { error: assignmentError } = await supabase
          .from('equipment_assignments')
          .insert({
            client_id: selectedClientId,
            equipment_id: itemId,
            assigned_by: profile.id,
            installation_notes: notes.trim() || null,
            isp_company_id: profile.isp_company_id!
          });

        if (assignmentError) throw assignmentError;
      }

      const selectedClient = clients.find(c => c.id === selectedClientId);
      toast({
        title: "Assignment Successful",
        description: `${itemName} has been assigned to ${selectedClient?.name}.`,
      });

      onAssign({
        itemId,
        clientId: selectedClientId
      });

      handleClose();
    } catch (error) {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
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
            <p className="text-xs text-gray-500 mt-1">Type: {itemType}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Select Client</Label>
            <Select 
              value={selectedClientId} 
              onValueChange={setSelectedClientId}
              disabled={clientsLoading || isAssigning}
            >
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
                ) : availableClients.length === 0 ? (
                  <SelectItem value="no-clients" disabled>
                    No approved clients available
                  </SelectItem>
                ) : (
                  availableClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <span className="font-medium">{client.name}</span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({client.phone}) - {client.status}
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
              disabled={isAssigning}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedClientId || isAssigning}
            >
              {isAssigning ? (
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

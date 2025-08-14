
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useClients } from '@/hooks/useClients';
import { useAssignEquipmentToClient } from '@/hooks/useInventory';
import type { Equipment } from '@/hooks/useInventory';

interface AssignEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
}

const AssignEquipmentDialog: React.FC<AssignEquipmentDialogProps> = ({
  open,
  onOpenChange,
  equipment
}) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const { clients, isLoading: clientsLoading } = useClients();
  const { mutate: deployEquipment, isPending: isDeploying } = useAssignEquipmentToClient();

  const handleAssign = () => {
    if (selectedClientId && equipment) {
      deployEquipment({
        equipmentId: equipment.id,
        clientId: selectedClientId
      });
      onOpenChange(false);
    }
  };

  // Filter out equipment that's already assigned
  const isEquipmentAssigned = equipment?.client_id;

  // Filter clients to exclude those with existing equipment assignments
  const activeClients = clients.filter(client => client.status === 'active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Equipment to Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Equipment Details</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Type:</strong> {equipment?.type}
              </div>
              <div>
                <strong>Model:</strong> {equipment?.model || 'N/A'}
              </div>
              <div>
                <strong>Serial Number:</strong> {equipment?.serial_number || 'N/A'}
              </div>
              <div>
                <strong>Status:</strong> {equipment?.status}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="client-select">Select Client</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a client..." />
              </SelectTrigger>
              <SelectContent>
                {activeClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {client.phone} • {client.address}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedClientId || isDeploying}
            >
              {isDeploying ? 'Assigning...' : 'Assign Equipment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssignEquipmentDialog;

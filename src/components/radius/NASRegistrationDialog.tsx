
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useUpdateInventoryItem } from '@/hooks/useInventory';

interface NASRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: any;
}

const NASRegistrationDialog: React.FC<NASRegistrationDialogProps> = ({
  open,
  onOpenChange,
  equipment
}) => {
  const { mutate: updateEquipment, isPending: isUpdating } = useUpdateInventoryItem();

  const handleRegisterAsNAS = () => {
    updateEquipment({
      id: equipment.id,
      updates: { 
        status: 'deployed',
        notes: 'Registered as RADIUS NAS device'
      }
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register as RADIUS NAS</DialogTitle>
        </DialogHeader>
        <p className="mb-4 text-sm text-muted-foreground">
          Register this equipment as a Network Access Server (NAS) for RADIUS authentication.
        </p>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleRegisterAsNAS} disabled={isUpdating}>
            {isUpdating ? 'Registering...' : 'Register as NAS'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NASRegistrationDialog;

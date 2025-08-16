
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedApprovalDialogProps {
  client: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  client,
  open,
  onOpenChange,
}) => {
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  
  const { equipment, isLoading: equipmentLoading } = useEquipment();
  const { updateClient } = useClients();
  const { toast } = useToast();

  const availableEquipment = equipment?.filter(eq => eq.status === 'available') || [];

  const handleApprove = async () => {
    if (!selectedEquipment) {
      toast({
        title: "Equipment Required",
        description: "Please select equipment for this client",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);
    try {
      await updateClient({
        id: client.id,
        updates: {
          status: 'active',
          approved_at: new Date().toISOString(),
          notes: `Approved with equipment: ${selectedEquipment}`,
        }
      });

      toast({
        title: "Client Approved",
        description: "Client has been successfully approved and activated",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving client:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setIsRejecting(true);
    try {
      await updateClient({
        id: client.id,
        updates: {
          status: 'rejected',
          rejection_reason: rejectionReason,
          notes: `Rejected: ${rejectionReason}`,
        }
      });

      toast({
        title: "Client Rejected",
        description: "Client application has been rejected",
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting client:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Review Client Application</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">{client?.name}</h3>
            <p className="text-sm text-muted-foreground">{client?.email}</p>
            <p className="text-sm text-muted-foreground">{client?.phone}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment">Assign Equipment</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {availableEquipment.map((eq) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.type} - {eq.model} ({eq.serial_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Rejection Reason (if rejecting)</Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={isApproving || equipmentLoading}
              className="flex-1"
            >
              <Check className="h-4 w-4 mr-2" />
              {isApproving ? 'Approving...' : 'Approve'}
            </Button>
            
            <Button
              onClick={handleReject}
              disabled={isRejecting}
              variant="destructive"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

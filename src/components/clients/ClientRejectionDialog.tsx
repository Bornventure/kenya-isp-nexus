
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useClientRejection } from '@/hooks/useClientRejection';

interface ClientRejectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

const ClientRejectionDialog: React.FC<ClientRejectionDialogProps> = ({
  open,
  onOpenChange,
  clientId,
  clientName,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const { rejectClient, isRejecting } = useClientRejection();

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }

    rejectClient(
      { clientId, rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          setRejectionReason('');
          onOpenChange(false);
        },
      }
    );
  };

  const handleCancel = () => {
    setRejectionReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reject Client Application</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You are about to reject the application for: <strong>{clientName}</strong>
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Rejection Reason *
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a clear reason for rejecting this application..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              disabled={isRejecting}
            />
            <p className="text-xs text-muted-foreground">
              This reason will be visible to the sales manager who submitted the application.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || isRejecting}
          >
            {isRejecting ? 'Rejecting...' : 'Reject Application'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ClientRejectionDialog;

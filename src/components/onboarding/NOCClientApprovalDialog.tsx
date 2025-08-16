
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useClients, type DatabaseClient } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';

interface NOCClientApprovalDialogProps {
  client: DatabaseClient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NOCClientApprovalDialog: React.FC<NOCClientApprovalDialogProps> = ({
  client,
  open,
  onOpenChange,
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { updateClient } = useClients();
  const { user } = useAuth();

  const handleApprove = async () => {
    if (!client || !user) return;

    try {
      await updateClient({
        id: client.id,
        updates: {
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: notes || client.notes,
        },
      });
      onOpenChange(false);
      setNotes('');
    } catch (error) {
      console.error('Error approving client:', error);
    }
  };

  const handleReject = async () => {
    if (!client || !user) return;

    try {
      await updateClient({
        id: client.id,
        updates: {
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          notes: notes || client.notes,
        },
      });
      onOpenChange(false);
      setNotes('');
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting client:', error);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Client Approval - {client.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <p className="text-sm">{client.name}</p>
            </div>
            <div>
              <Label>Email</Label>
              <p className="text-sm">{client.email}</p>
            </div>
            <div>
              <Label>Phone</Label>
              <p className="text-sm">{client.phone}</p>
            </div>
            <div>
              <Label>Status</Label>
              <Badge variant="outline">{client.status}</Badge>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this client..."
              className="mt-1"
            />
          </div>

          {client.status === 'pending' && (
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason (if rejecting)</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Provide reason if rejecting..."
                className="mt-1"
              />
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {client.status === 'pending' && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>
                  Approve
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NOCClientApprovalDialog;

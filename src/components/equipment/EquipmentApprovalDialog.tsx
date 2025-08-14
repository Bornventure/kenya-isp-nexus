
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Equipment } from '@/types/equipment';

interface EquipmentApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes: string) => void;
}

const EquipmentApprovalDialog: React.FC<EquipmentApprovalDialogProps> = ({
  open,
  onOpenChange,
  equipment,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  if (!equipment) return null;

  const handleApprove = () => {
    onApprove(equipment.id, notes || undefined);
    setNotes('');
    setAction(null);
    onOpenChange(false);
  };

  const handleReject = () => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(equipment.id, notes);
    setNotes('');
    setAction(null);
    onOpenChange(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Equipment Approval</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Equipment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {getStatusIcon(equipment.approval_status || 'pending')}
                {equipment.brand} {equipment.model}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Type</p>
                  <p className="text-sm text-muted-foreground">{equipment.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Serial Number</p>
                  <p className="text-sm text-muted-foreground">{equipment.serial_number}</p>
                </div>
                {equipment.ip_address && (
                  <div>
                    <p className="text-sm font-medium">IP Address</p>
                    <p className="text-sm text-muted-foreground">{equipment.ip_address}</p>
                  </div>
                )}
                {equipment.mac_address && (
                  <div>
                    <p className="text-sm font-medium">MAC Address</p>
                    <p className="text-sm text-muted-foreground">{equipment.mac_address}</p>
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <p className="text-sm font-medium">Current Status</p>
                <Badge variant={getStatusColor(equipment.approval_status || 'pending')}>
                  {equipment.approval_status || 'pending'}
                </Badge>
              </div>

              {equipment.notes && (
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <p className="text-sm text-muted-foreground">{equipment.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approval Actions */}
          {(equipment.approval_status === 'pending' || !equipment.approval_status) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Review Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="approval-notes">Notes (optional for approval, required for rejection)</Label>
                  <Textarea
                    id="approval-notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this equipment..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleApprove}
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    className="flex-1"
                    variant="destructive"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentApprovalDialog;


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Equipment } from '@/hooks/useEquipment';

interface EquipmentApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: Equipment | null;
  onApprove: (id: string, notes?: string) => void;
  onReject: (id: string, notes?: string) => void;
}

const EquipmentApprovalDialog: React.FC<EquipmentApprovalDialogProps> = ({
  open,
  onOpenChange,
  equipment,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  if (!equipment) return null;

  const handleApprove = () => {
    onApprove(equipment.id, notes);
    toast({
      title: "Equipment Approved",
      description: "Equipment has been approved and is now active.",
    });
    onOpenChange(false);
    setNotes('');
  };

  const handleReject = () => {
    if (!notes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this equipment.",
        variant: "destructive",
      });
      return;
    }
    onReject(equipment.id, notes);
    toast({
      title: "Equipment Rejected",
      description: "Equipment has been rejected.",
    });
    onOpenChange(false);
    setNotes('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Equipment Approval</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Equipment Details */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{equipment.brand} {equipment.model}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(equipment.approval_status || 'pending')}
                    <Badge variant="outline">
                      {equipment.approval_status || 'pending'}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span> {equipment.type}
                  </div>
                  <div>
                    <span className="font-medium">Serial:</span> {equipment.serial_number}
                  </div>
                  {equipment.mac_address && (
                    <div>
                      <span className="font-medium">MAC:</span> {equipment.mac_address}
                    </div>
                  )}
                  {equipment.ip_address && (
                    <div>
                      <span className="font-medium">IP:</span> {equipment.ip_address}
                    </div>
                  )}
                </div>

                {equipment.clients && (
                  <div className="text-sm">
                    <span className="font-medium">Assigned to:</span> {equipment.clients.name}
                  </div>
                )}

                {equipment.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span>
                    <p className="mt-1 text-muted-foreground">{equipment.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Approval Notes */}
          <div className="space-y-2">
            <Label htmlFor="approval-notes">
              {equipment.approval_status === 'pending' ? 'Approval/Rejection Notes' : 'Additional Notes'}
            </Label>
            <Textarea
              id="approval-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                equipment.approval_status === 'pending'
                  ? "Add notes about the approval decision..."
                  : "Add additional notes..."
              }
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          {equipment.approval_status === 'pending' && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button onClick={handleApprove}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EquipmentApprovalDialog;

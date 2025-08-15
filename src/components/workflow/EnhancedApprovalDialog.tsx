
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Router, Package } from 'lucide-react';
import { Client } from '@/types/client';
import { useEquipment } from '@/hooks/useEquipment';
import { useInventoryItems } from '@/hooks/useInventory';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client;
  onApprove: (clientId: string, notes: string) => Promise<void>;
  onReject: (clientId: string, reason: string) => Promise<void>;
}

export const EnhancedApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  client,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [step, setStep] = useState<'review' | 'approve' | 'reject'>('review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: equipmentData } = useEquipment();
  const { data: inventoryData } = useInventoryItems({});

  // Safely handle equipment data
  const availableEquipment = Array.isArray(equipmentData) 
    ? equipmentData.filter(eq => eq.status === 'available')
    : [];

  const availableInventory = Array.isArray(inventoryData)
    ? inventoryData.filter(item => item.status === 'In Stock')
    : [];

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove(client.id, notes);
      onOpenChange(false);
      setStep('review');
      setNotes('');
    } catch (error) {
      console.error('Error approving client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await onReject(client.id, rejectionReason);
      onOpenChange(false);
      setStep('review');
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Client Application Review - {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {step === 'review' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Client Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {client.name}</div>
                    <div><strong>Email:</strong> {client.email}</div>
                    <div><strong>Phone:</strong> {client.phone}</div>
                    <div><strong>ID Number:</strong> {client.idNumber}</div>
                    <div><strong>Type:</strong> {client.clientType}</div>
                    <div><strong>Connection:</strong> {client.connectionType}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Service Details</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Package:</strong> {client.servicePackage}</div>
                    <div><strong>Monthly Rate:</strong> KES {client.monthlyRate.toLocaleString()}</div>
                    <div><strong>Location:</strong> {client.location.address}</div>
                    <div><strong>County:</strong> {client.location.county}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Router className="h-4 w-4" />
                  Available Equipment ({availableEquipment.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableEquipment.map((equipment) => (
                    <div key={equipment.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{equipment.type} - {equipment.brand}</span>
                      <Badge variant="outline">Available</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Available Inventory ({availableInventory.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {availableInventory.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{item.type} - {item.name}</span>
                      <Badge variant="outline">In Stock</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => setStep('approve')}
                  className="flex-1"
                >
                  Approve Application
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setStep('reject')}
                  className="flex-1"
                >
                  Reject Application
                </Button>
              </div>
            </>
          )}

          {step === 'approve' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Approve Client Application</h3>
              <div>
                <Label htmlFor="approval-notes">Approval Notes</Label>
                <Textarea
                  id="approval-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about the approval..."
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep('review')} variant="outline">
                  Back to Review
                </Button>
                <Button onClick={handleApprove} disabled={isSubmitting}>
                  {isSubmitting ? 'Approving...' : 'Confirm Approval'}
                </Button>
              </div>
            </div>
          )}

          {step === 'reject' && (
            <div className="space-y-4">
              <h3 className="font-semibold">Reject Client Application</h3>
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep('review')} variant="outline">
                  Back to Review
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject} 
                  disabled={isSubmitting || !rejectionReason.trim()}
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

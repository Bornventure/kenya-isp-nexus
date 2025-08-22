
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowOrchestration } from '@/hooks/useWorkflowOrchestration';
import { useEquipment } from '@/hooks/useEquipment';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/types/client';
import { CheckCircle, XCircle } from 'lucide-react';

interface EnhancedApprovalDialogProps {
  client: Client | null;
  open: boolean;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
}

const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  client,
  open,
  onClose,
  onOpenChange
}) => {
  const { profile } = useAuth();
  const { processApproval, processRejection } = useWorkflowOrchestration();
  const { equipment } = useEquipment();
  
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  // Safely filter available equipment
  const availableEquipment = Array.isArray(equipment) 
    ? equipment.filter(eq => eq.status === 'available' && eq.approval_status === 'approved')
    : [];

  const handleApprove = async () => {
    if (!client || !selectedEquipment || !profile?.id) return;
    
    setIsProcessing(true);
    try {
      await processApproval(client.id, selectedEquipment, profile.id);
      onClose();
    } catch (error) {
      console.error('Error approving client:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!client || !rejectionReason.trim() || !profile?.id) return;
    
    setIsProcessing(true);
    try {
      await processRejection(client.id, rejectionReason.trim(), profile.id);
      onClose();
    } catch (error) {
      console.error('Error rejecting client:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Client Application</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Client Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span> {client.name}
              </div>
              <div>
                <span className="font-medium">Phone:</span> {client.phone}
              </div>
              <div>
                <span className="font-medium">Email:</span> {client.email}
              </div>
              <div>
                <span className="font-medium">Location:</span> {client.address}
              </div>
              <div>
                <span className="font-medium">Connection Type:</span> {client.connection_type}
              </div>
              <div>
                <span className="font-medium">Monthly Rate:</span> KES {client.monthly_rate}
              </div>
            </div>
          </div>

          {action === 'approve' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Assign Equipment *</Label>
                <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment to assign..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEquipment.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.brand} {eq.model} - {eq.serial_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {action === 'reject' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setAction(action === 'approve' ? null : 'approve')}
                className="bg-green-50 border-green-200 hover:bg-green-100"
              >
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                {action === 'approve' ? 'Cancel Approval' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAction(action === 'reject' ? null : 'reject')}
                className="bg-red-50 border-red-200 hover:bg-red-100"
              >
                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                {action === 'reject' ? 'Cancel Rejection' : 'Reject'}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              {action === 'approve' && (
                <Button
                  onClick={handleApprove}
                  disabled={!selectedEquipment || isProcessing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Approval'}
                </Button>
              )}
              {action === 'reject' && (
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || isProcessing}
                  variant="destructive"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;

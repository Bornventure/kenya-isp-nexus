
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle, Package } from 'lucide-react';
import { useEquipment } from '@/hooks/useApiQueries';
import { useWorkflowOrchestration } from '@/hooks/useWorkflowOrchestration';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
}

const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  open,
  onOpenChange,
  client
}) => {
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: equipment = [] } = useEquipment();
  const { processApproval, processRejection } = useWorkflowOrchestration();
  const { profile } = useAuth();

  // Filter available equipment
  const availableEquipment = equipment.filter(eq => eq.status === 'available');

  const resetDialog = () => {
    setAction(null);
    setSelectedEquipment('');
    setNotes('');
    setIsProcessing(false);
  };

  useEffect(() => {
    if (!open) {
      resetDialog();
    }
  }, [open]);

  const handleApprove = async () => {
    if (!selectedEquipment) {
      alert('Please select equipment to assign');
      return;
    }

    setIsProcessing(true);
    try {
      await processApproval(client.id, selectedEquipment, profile?.id || '');
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving client:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    try {
      await processRejection(client.id, notes, profile?.id || '');
      onOpenChange(false);
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
          <DialogTitle>Client Application Review</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Details */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{client.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{client.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">ID Number</p>
                  <p className="text-sm text-muted-foreground">{client.id_number}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">
                    {client.address}, {client.sub_county}, {client.county}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Package</p>
                  <p className="text-sm text-muted-foreground">
                    KES {client.monthly_rate?.toLocaleString()}/month
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Connection Type</p>
                  <p className="text-sm text-muted-foreground">{client.connection_type}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Selection */}
          {!action && (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setAction('approve')}
                className="gap-2"
                size="lg"
              >
                <CheckCircle className="h-4 w-4" />
                Approve Application
              </Button>
              <Button
                onClick={() => setAction('reject')}
                variant="destructive"
                className="gap-2"
                size="lg"
              >
                <XCircle className="h-4 w-4" />
                Reject Application
              </Button>
            </div>
          )}

          {/* Approval Form */}
          {action === 'approve' && (
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-green-800">Approve Application</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="equipment-select">Assign Equipment *</Label>
                    <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                      <SelectTrigger id="equipment-select">
                        <SelectValue placeholder="Select equipment to assign">
                          {selectedEquipment && (
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              {availableEquipment.find(eq => eq.id === selectedEquipment)?.model}
                            </div>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableEquipment.map((eq) => (
                          <SelectItem key={eq.id} value={eq.id}>
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              <div>
                                <p className="font-medium">{eq.brand} {eq.model}</p>
                                <p className="text-xs text-muted-foreground">S/N: {eq.serial_number}</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="approval-notes">Installation Notes (Optional)</Label>
                    <Textarea
                      id="approval-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any installation notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleApprove}
                      disabled={!selectedEquipment || isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Approval'}
                    </Button>
                    <Button
                      onClick={() => setAction(null)}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Form */}
          {action === 'reject' && (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Reject Application</h3>
                  </div>
                  
                  <div>
                    <Label htmlFor="rejection-reason">Reason for Rejection *</Label>
                    <Textarea
                      id="rejection-reason"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Provide a detailed reason for rejection..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleReject}
                      disabled={!notes.trim() || isProcessing}
                      variant="destructive"
                      className="flex-1"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                    </Button>
                    <Button
                      onClick={() => setAction(null)}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Back
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;

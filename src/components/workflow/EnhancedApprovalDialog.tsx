
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, User, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useEquipment } from '@/hooks/useEquipment';
import { Client } from '@/types/client';
import { Equipment } from '@/types/equipment';
import { useToast } from '@/hooks/use-toast';

interface EnhancedApprovalDialogProps {
  client: Client;
  onClose: () => void;
  onApprove: (clientId: string, notes?: string) => void;
  onReject: (clientId: string, reason: string) => void;
}

export const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  client,
  onClose,
  onApprove,
  onReject,
}) => {
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  
  const { updateClient } = useClients();
  const { equipment } = useEquipment();
  const { toast } = useToast();

  // Filter available equipment (not assigned to clients)
  const availableEquipment = Array.isArray(equipment) 
    ? equipment.filter((eq: Equipment) => eq.status === 'available')
    : [];

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(client.id, notes);
      
      // Update client status
      updateClient({
        id: client.id,
        updates: {
          status: 'approved',
          approved_at: new Date().toISOString(),
          notes: notes || undefined,
        }
      });

      toast({
        title: "Client Approved",
        description: `${client.name} has been approved successfully.`,
      });
      
      onClose();
    } catch (error) {
      console.error('Error approving client:', error);
      toast({
        title: "Error",
        description: "Failed to approve client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(client.id, rejectionReason);
      
      // Update client status
      updateClient({
        id: client.id,
        updates: {
          status: 'pending',
          rejection_reason: rejectionReason,
          rejected_at: new Date().toISOString(),
        }
      });

      toast({
        title: "Client Rejected",
        description: `${client.name} has been rejected.`,
        variant: "destructive",
      });
      
      onClose();
    } catch (error) {
      console.error('Error rejecting client:', error);
      toast({
        title: "Error",
        description: "Failed to reject client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Approval - {client.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Name</h4>
              <p className="text-sm">{client.name}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Phone</h4>
              <p className="text-sm">{client.phone}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Email</h4>
              <p className="text-sm">{client.email || 'Not provided'}</p>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Client Type</h4>
              <Badge variant="secondary">{client.clientType}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Connection Type</h4>
              <Badge variant="outline">{client.connectionType}</Badge>
            </div>
            <div>
              <h4 className="font-medium text-sm text-gray-600 mb-1">Monthly Rate</h4>
              <p className="text-sm font-medium">KES {client.monthlyRate?.toLocaleString()}</p>
            </div>
          </div>

          {/* Location Information */}
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Location
            </h4>
            <p className="text-sm">{client.address}</p>
            <p className="text-sm text-gray-600">{client.location?.county}, {client.location?.subCounty}</p>
          </div>

          {/* Equipment Assignment */}
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">Assign Equipment (Optional)</h4>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment to assign" />
              </SelectTrigger>
              <SelectContent>
                {availableEquipment.map((eq: Equipment) => (
                  <SelectItem key={eq.id} value={eq.id}>
                    {eq.type} - {eq.brand} {eq.model} ({eq.serial_number})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approval Notes */}
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">Approval Notes</h4>
            <Textarea
              placeholder="Add any notes about this approval..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Rejection Reason */}
          <div>
            <h4 className="font-medium text-sm text-gray-600 mb-2">Rejection Reason (if rejecting)</h4>
            <Textarea
              placeholder="Provide reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isProcessing}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={isProcessing}
              className="gap-2"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedApprovalDialog;

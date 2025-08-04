
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, User, Phone, Mail, MapPin, Package, Calendar, CreditCard, Loader2 } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface NOCClientApprovalDialogProps {
  open: boolean;
  onClose: () => void;
  client: any;
  onApprove?: () => void;
}

const NOCClientApprovalDialog: React.FC<NOCClientApprovalDialogProps> = ({
  open,
  onClose,
  client,
  onApprove
}) => {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateClient } = useClients();
  const { toast } = useToast();
  const { profile } = useAuth();

  const handleApprove = async () => {
    if (!profile?.id || !client?.id) {
      toast({
        title: "Error",
        description: "Missing required information for approval.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Approving client:', client.id);
      
      await updateClient({
        id: client.id,
        updates: {
          status: 'approved',
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          installation_status: 'scheduled'
        }
      });

      toast({
        title: "Client Approved",
        description: `${client.name} has been approved and scheduled for installation.`,
      });

      onApprove?.();
      onClose();
    } catch (error) {
      console.error('Error approving client:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!profile?.id || !client?.id) {
      toast({
        title: "Error",
        description: "Missing required information for rejection.",
        variant: "destructive",
      });
      return;
    }

    if (!notes.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this client.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Rejecting client:', client.id);
      
      await updateClient({
        id: client.id,
        updates: {
          status: 'suspended',
          approved_by: profile.id,
          approved_at: new Date().toISOString(),
          notes: notes.trim()
        }
      });

      toast({
        title: "Client Rejected",
        description: `${client.name} has been rejected with the provided reason.`,
        variant: "destructive",
      });

      onApprove?.();
      onClose();
    } catch (error) {
      console.error('Error rejecting client:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!client) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Approval Review - {client.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={client.status === 'pending' ? 'secondary' : 'default'}>
              {client.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Submitted: {new Date(client.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{client.name}</span>
                </div>
                {client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{client.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>ID: {client.id_number}</span>
                </div>
                <div className="text-sm">
                  <strong>Client Type:</strong> {client.client_type}
                </div>
                <div className="text-sm">
                  <strong>Connection Type:</strong> {client.connection_type}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location & Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {client.sub_county}, {client.county}
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span>{client.service_packages?.name || 'Package not assigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Rate: KES {client.monthly_rate?.toLocaleString()}/month</span>
                </div>
                {client.installation_date && (
                  <div className="text-sm">
                    <strong>Installation Date:</strong> {new Date(client.installation_date).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Notes Section */}
          <div className="space-y-3">
            <Label htmlFor="notes">
              Approval Notes {client.status === 'pending' ? '(Required for rejection)' : '(Optional)'}
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this approval or reason for rejection..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              disabled={isProcessing}
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            Reject
          </Button>
          <Button 
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NOCClientApprovalDialog;

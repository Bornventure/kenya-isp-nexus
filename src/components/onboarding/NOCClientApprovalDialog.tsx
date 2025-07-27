
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, MapPin, Wifi, Package, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEquipment } from '@/hooks/useEquipment';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';
import { useTechnicalInstallations } from '@/hooks/useTechnicalInstallations';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseClient } from '@/hooks/useClients';

interface NOCClientApprovalDialogProps {
  client: DatabaseClient;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
}

const NOCClientApprovalDialog: React.FC<NOCClientApprovalDialogProps> = ({
  client,
  open,
  onClose,
  onApprove,
}) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { equipment, isLoading: equipmentLoading } = useEquipment();
  const { createInstallationInvoice } = useInstallationInvoices();
  const { createTechnicalInstallation } = useTechnicalInstallations();
  const [isApproving, setIsApproving] = useState(false);

  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [installationNotes, setInstallationNotes] = useState('');

  const availableEquipment = equipment.filter(eq => 
    eq.status === 'available' && 
    eq.approval_status === 'approved'
  );

  const handleApprove = async () => {
    if (selectedEquipment.length === 0) {
      toast({
        title: "Equipment Required",
        description: "Please select at least one equipment item for the client.",
        variant: "destructive",
      });
      return;
    }

    setIsApproving(true);

    try {
      // Update client status to approved
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      if (clientError) throw clientError;

      // Create equipment assignments
      const equipmentAssignments = selectedEquipment.map(equipmentId => ({
        client_id: client.id,
        equipment_id: equipmentId,
        assigned_by: profile?.id,
        installation_notes: installationNotes,
        isp_company_id: profile?.isp_company_id,
      }));

      const { error: assignmentError } = await supabase
        .from('equipment_assignments')
        .insert(equipmentAssignments);

      if (assignmentError) throw assignmentError;

      // Update equipment status to assigned
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({ status: 'assigned' })
        .in('id', selectedEquipment);

      if (equipmentError) throw equipmentError;

      // Get equipment details for invoice
      const { data: equipmentDetails, error: equipmentDetailsError } = await supabase
        .from('equipment')
        .select('type, brand, model, serial_number')
        .in('id', selectedEquipment);

      if (equipmentDetailsError) throw equipmentDetailsError;

      // Create installation invoice
      createInstallationInvoice({
        client_id: client.id,
        equipment_details: equipmentDetails,
        notes: installationNotes,
      });

      // Create technical installation record
      createTechnicalInstallation({
        client_id: client.id,
      });

      toast({
        title: "Client Approved Successfully",
        description: "Client has been approved, equipment assigned, and installation invoice generated.",
      });

      onApprove();
      onClose();
    } catch (error) {
      console.error('Error approving client:', error);
      toast({
        title: "Error",
        description: "Failed to approve client. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const maskPhoneNumber = (phone: string) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 10) {
      return cleaned.substring(0, 3) + 'xxx' + cleaned.substring(6);
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Client Approval - Network Operations Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-sm">{client.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-sm">{client.email || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <p className="text-sm">{maskPhoneNumber(client.phone)}</p>
                </div>
                <div>
                  <Label>ID Number</Label>
                  <p className="text-sm">{client.id_number}</p>
                </div>
                <div>
                  <Label>Client Type</Label>
                  <Badge variant="outline">{client.client_type}</Badge>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </h3>
              <div className="space-y-2">
                <div>
                  <Label>Address</Label>
                  <p className="text-sm">{client.address}</p>
                </div>
                <div>
                  <Label>County</Label>
                  <p className="text-sm">{client.county}</p>
                </div>
                <div>
                  <Label>Sub County</Label>
                  <p className="text-sm">{client.sub_county}</p>
                </div>
                {client.latitude && client.longitude && (
                  <div>
                    <Label>Coordinates</Label>
                    <p className="text-sm">{client.latitude}, {client.longitude}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Information */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Service Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Connection Type</Label>
                <Badge variant="outline">{client.connection_type}</Badge>
              </div>
              <div>
                <Label>Service Package</Label>
                <p className="text-sm">{client.service_packages?.name || 'Not specified'}</p>
              </div>
              <div>
                <Label>Monthly Rate</Label>
                <p className="text-sm">KES {client.monthly_rate.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Equipment Assignment */}
          <div>
            <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Equipment Assignment
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="equipment">Select Equipment *</Label>
                <Select 
                  value={selectedEquipment[0] || ''} 
                  onValueChange={(value) => setSelectedEquipment([value])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={equipmentLoading ? 'Loading equipment...' : 'Select equipment'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEquipment.map(eq => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.type} - {eq.brand} {eq.model} (S/N: {eq.serial_number})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableEquipment.length === 0 && !equipmentLoading && (
                  <p className="text-sm text-yellow-600 mt-1">
                    No available equipment. Please ensure equipment is approved and available.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="installation_notes">Installation Notes</Label>
                <Textarea
                  id="installation_notes"
                  value={installationNotes}
                  onChange={(e) => setInstallationNotes(e.target.value)}
                  placeholder="Any special installation requirements or notes"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isApproving}>
            Cancel
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={isApproving || selectedEquipment.length === 0}
            className="gap-2"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isApproving ? 'Approving...' : 'Approve & Generate Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NOCClientApprovalDialog;

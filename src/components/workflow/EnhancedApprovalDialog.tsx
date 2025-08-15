
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  CreditCard,
  Package,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { Client } from '@/types/client';
import { useEquipment } from '@/hooks/useApiQueries';
import { useEquipmentAssignment } from '@/hooks/useEquipmentAssignment';
import { useWorkflowManagement } from '@/hooks/useWorkflowManagement';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';

interface EnhancedApprovalDialogProps {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  client,
  isOpen,
  onClose,
}) => {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [installationNotes, setInstallationNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('review');

  const { data: equipment = [] } = useEquipment();
  const { assignEquipment, isAssigningEquipment } = useEquipmentAssignment();
  const { updateWorkflowStage, isUpdatingWorkflow } = useWorkflowManagement();
  const { createInstallationInvoice, isCreating } = useInstallationInvoices();

  const availableEquipment = equipment.filter(eq => eq.status === 'available');

  const handleApprove = async () => {
    if (!selectedEquipmentId) {
      alert('Please select equipment for the client');
      return;
    }

    try {
      // Step 1: Assign equipment
      assignEquipment({
        clientId: client.id,
        equipmentId: selectedEquipmentId,
        installationNotes,
      });

      // Step 2: Update workflow to approved with equipment assignment
      updateWorkflowStage({
        clientId: client.id,
        stage: 'equipment_assigned',
        stageData: {
          equipment_id: selectedEquipmentId,
          installation_notes: installationNotes,
        },
        notes: 'Client approved and equipment assigned',
      });

      // Step 3: Generate installation invoice
      createInstallationInvoice({
        client_id: client.id,
        equipment_details: {
          equipment_id: selectedEquipmentId,
          installation_notes: installationNotes,
        },
        notes: 'Installation invoice generated after approval',
      });

      onClose();
    } catch (error) {
      console.error('Error in approval process:', error);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    updateWorkflowStage({
      clientId: client.id,
      stage: 'rejected',
      stageData: {
        rejection_reason: rejectionReason,
      },
      notes: `Application rejected: ${rejectionReason}`,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Application Review - {client.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="review">Review Details</TabsTrigger>
            <TabsTrigger value="equipment">Equipment Assignment</TabsTrigger>
            <TabsTrigger value="decision">Final Decision</TabsTrigger>
          </TabsList>

          <TabsContent value="review" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Name:</strong> {client.name}</div>
                  <div><strong>ID Number:</strong> {client.id_number}</div>
                  <div><strong>Client Type:</strong> 
                    <Badge variant="outline" className="ml-2">{client.client_type}</Badge>
                  </div>
                  {client.email && <div><strong>Email:</strong> {client.email}</div>}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <strong>Phone:</strong> {client.phone}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Address:</strong> {client.address}</div>
                  <div><strong>County:</strong> {client.county}</div>
                  <div><strong>Sub County:</strong> {client.sub_county}</div>
                  {client.latitude && client.longitude && (
                    <div><strong>Coordinates:</strong> {client.latitude}, {client.longitude}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Service Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><strong>Connection Type:</strong> 
                    <Badge className="ml-2">{client.connection_type}</Badge>
                  </div>
                  <div><strong>Monthly Rate:</strong> KES {client.monthly_rate}</div>
                  <div><strong>Service Package:</strong> {client.service_packages?.name || 'N/A'}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {client.mpesa_number && <div><strong>M-Pesa Number:</strong> {client.mpesa_number}</div>}
                  {client.kra_pin_number && <div><strong>KRA PIN:</strong> {client.kra_pin_number}</div>}
                  <div><strong>Wallet Balance:</strong> KES {client.wallet_balance || 0}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Equipment Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Select Equipment for Client
                  </label>
                  <Select value={selectedEquipmentId} onValueChange={setSelectedEquipmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose equipment..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEquipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.type} - {eq.brand} {eq.model} (S/N: {eq.serial_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableEquipment.length === 0 && (
                    <p className="text-sm text-yellow-600 mt-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      No available equipment found. Please add equipment to inventory first.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Installation Notes
                  </label>
                  <Textarea
                    value={installationNotes}
                    onChange={(e) => setInstallationNotes(e.target.value)}
                    placeholder="Add any special installation instructions or notes..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="decision" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Application Decision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-green-600">Approve Application</h3>
                    <p className="text-sm text-muted-foreground">
                      This will approve the client, assign the selected equipment, and generate an installation invoice.
                    </p>
                    <Button
                      onClick={handleApprove}
                      disabled={!selectedEquipmentId || isAssigningEquipment || isUpdatingWorkflow || isCreating}
                      className="w-full"
                      variant="default"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {isAssigningEquipment || isUpdatingWorkflow || isCreating ? 'Processing...' : 'Approve & Process'}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-red-600">Reject Application</h3>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide reason for rejection..."
                      rows={3}
                    />
                    <Button
                      onClick={handleReject}
                      disabled={!rejectionReason.trim() || isUpdatingWorkflow}
                      className="w-full"
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {isUpdatingWorkflow ? 'Processing...' : 'Reject Application'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;

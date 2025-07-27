import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useEquipment } from '@/hooks/useEquipment';
import { useClients } from '@/hooks/useClients';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NOCClientApprovalDialogProps {
  client: any;
  open: boolean;
  onClose: () => void;
  onApprove: () => void;
}

const NOCClientApprovalDialog = ({ client, open, onClose, onApprove }: NOCClientApprovalDialogProps) => {
  const { equipment } = useEquipment();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Filter available equipment (not already assigned)
  const availableEquipment = equipment.filter(eq => eq.status === 'available');

  const handleApprove = async () => {
    if (!selectedEquipment) {
      toast({
        title: "Error",
        description: "Please select equipment to assign to this client",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Update client status to approved (not active yet)
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', client.id);

      if (clientError) throw clientError;

      // Assign equipment to client
      const { error: assignmentError } = await supabase
        .from('equipment_assignments')
        .insert({
          client_id: client.id,
          equipment_id: selectedEquipment,
          assigned_by: profile?.id,
          isp_company_id: profile?.isp_company_id,
        });

      if (assignmentError) throw assignmentError;

      // Update equipment status to assigned
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({
          status: 'assigned',
          client_id: client.id,
        })
        .eq('id', selectedEquipment);

      if (equipmentError) throw equipmentError;

      // Get installation fee from system settings
      const { data: settings, error: settingsError } = await supabase
        .from('system_settings')
        .select('installation_fee')
        .eq('isp_company_id', profile?.isp_company_id)
        .single();

      if (settingsError) throw settingsError;

      const installationFee = settings?.installation_fee || 0;
      const vatAmount = installationFee * 0.16;
      const totalAmount = installationFee + vatAmount;

      // Generate installation invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .rpc('generate_installation_invoice_number');

      if (invoiceError) throw invoiceError;

      const { error: createInvoiceError } = await supabase
        .from('installation_invoices')
        .insert({
          client_id: client.id,
          invoice_number: invoiceData,
          amount: installationFee,
          vat_amount: vatAmount,
          total_amount: totalAmount,
          status: 'pending',
          isp_company_id: profile?.isp_company_id,
          equipment_details: {
            equipment_id: selectedEquipment,
            assigned_by: profile?.id,
            assigned_at: new Date().toISOString(),
          },
        });

      if (createInvoiceError) throw createInvoiceError;

      // Create technical installation record
      const { error: technicalError } = await supabase
        .from('technical_installations')
        .insert({
          client_id: client.id,
          status: 'pending',
          isp_company_id: profile?.isp_company_id,
        });

      if (technicalError) throw technicalError;

      toast({
        title: "Client Approved",
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Approve Client & Assign Equipment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm">{client.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm">{client.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Phone</Label>
                  <p className="text-sm">{client.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">County</Label>
                  <p className="text-sm">{client.county}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Address</Label>
                <p className="text-sm">{client.address}</p>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Current Status:</Label>
                <Badge variant="outline">{client.status}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Equipment Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="equipment">Select Equipment</Label>
                  <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose equipment to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEquipment.map((eq) => (
                        <SelectItem key={eq.id} value={eq.id}>
                          {eq.type} - {eq.brand} {eq.model} ({eq.serial_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {availableEquipment.length === 0 && (
                  <p className="text-sm text-red-500">No equipment available for assignment</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleApprove} 
            disabled={!selectedEquipment || isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'Processing...' : 'Approve & Generate Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NOCClientApprovalDialog;

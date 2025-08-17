
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowItem {
  id: string;
  client_id: string;
  current_stage: string;
  stage_data: any;
  assigned_to: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  clients?: {
    name: string;
    email: string;
    phone: string;
    id_number: string;
    mpesa_number: string;
    address: string;
    county: string;
    sub_county: string;
    connection_type: string;
    monthly_rate: number;
  };
}

export const useClientWorkflow = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workflowItems = [], isLoading } = useQuery({
    queryKey: ['client-workflow', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('client_workflow_status')
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            id_number,
            mpesa_number,
            address,
            county,
            sub_county,
            connection_type,
            monthly_rate
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkflowItem[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createInstallationInvoice = async (clientId: string, equipmentDetails: any, notes: string) => {
    try {
      // Generate unique invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data: invoice, error } = await supabase
        .from('installation_invoices')
        .insert({
          client_id: clientId,
          invoice_number: invoiceNumber,
          amount: 5000, // Default installation fee
          vat_amount: 800, // 16% VAT
          total_amount: 5800,
          equipment_details: equipmentDetails,
          notes: notes,
          status: 'pending',
          isp_company_id: profile?.isp_company_id
        })
        .select()
        .single();

      if (error) throw error;
      return invoice;
    } catch (error) {
      console.error('Invoice creation failed:', error);
      return null;
    }
  };

  const approveClient = useMutation({
    mutationFn: async ({ clientId, equipmentId, notes }: { 
      clientId: string; 
      equipmentId: string; 
      notes: string; 
    }) => {
      // Update client status to approved
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({ 
          status: 'approved',
          approved_by: profile?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (clientUpdateError) throw clientUpdateError;

      // Update workflow status
      const { error: workflowError } = await supabase
        .from('client_workflow_status')
        .update({
          current_stage: 'approved',
          stage_data: { equipment_id: equipmentId },
          assigned_to: profile?.id,
          notes: notes,
          completed_at: new Date().toISOString()
        })
        .eq('client_id', clientId);

      if (workflowError) throw workflowError;

      // Create equipment assignment
      const { error: equipmentError } = await supabase
        .from('client_equipment_assignments')
        .insert({
          client_id: clientId,
          equipment_id: equipmentId,
          assigned_by: profile?.id,
          installation_notes: notes,
          isp_company_id: profile?.isp_company_id
        });

      if (equipmentError) throw equipmentError;

      // Generate installation invoice
      const invoice = await createInstallationInvoice(clientId, { equipment_id: equipmentId }, notes);
      
      return { success: true, invoiceId: invoice?.id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-workflow'] });
      toast({
        title: "Client Approved",
        description: "Client has been approved and installation invoice generated.",
      });
    },
    onError: (error) => {
      console.error('Approval error:', error);
      toast({
        title: "Approval Failed",
        description: "Failed to approve client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectClient = useMutation({
    mutationFn: async ({ clientId, reason }: { clientId: string; reason: string }) => {
      // Update client status
      const { error: clientError } = await supabase
        .from('clients')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: profile?.id,
          rejected_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Update workflow status
      const { error: workflowError } = await supabase
        .from('client_workflow_status')
        .update({
          current_stage: 'rejected',
          stage_data: { rejection_reason: reason },
          assigned_to: profile?.id,
          notes: reason,
          completed_at: new Date().toISOString()
        })
        .eq('client_id', clientId);

      if (workflowError) throw workflowError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-workflow'] });
      toast({
        title: "Client Rejected",
        description: "Client application has been rejected and sent back to sales.",
      });
    },
    onError: (error) => {
      console.error('Rejection error:', error);
      toast({
        title: "Rejection Failed",
        description: "Failed to reject client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const assignEquipment = useMutation({
    mutationFn: async ({ clientId, equipmentId }: { clientId: string; equipmentId: string }) => {
      const { error } = await supabase
        .from('client_equipment_assignments')
        .insert({
          client_id: clientId,
          equipment_id: equipmentId,
          assigned_by: profile?.id,
          isp_company_id: profile?.isp_company_id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-workflow'] });
      toast({
        title: "Equipment Assigned",
        description: "Equipment has been successfully assigned to client.",
      });
    },
  });

  return {
    workflowItems,
    isLoading,
    approveClient: approveClient.mutateAsync,
    rejectClient: rejectClient.mutateAsync,
    assignEquipment: assignEquipment.mutateAsync,
    isProcessing: approveClient.isPending || rejectClient.isPending || assignEquipment.isPending,
  };
};

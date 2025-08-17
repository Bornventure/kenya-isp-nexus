
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useInstallationInvoices } from '@/hooks/useInstallationInvoices';

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
  const { createInstallationInvoice } = useInstallationInvoices();

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

  const approveClient = useMutation({
    mutationFn: async ({ clientId, equipmentId, notes }: { 
      clientId: string; 
      equipmentId: string; 
      notes: string; 
    }) => {
      // Update client status to pending_approval first
      const { error: clientUpdateError } = await supabase
        .from('clients')
        .update({ status: 'approved' })
        .eq('id', clientId);

      if (clientUpdateError) throw clientUpdateError;

      // Insert into client_workflow_status
      const { error: workflowError } = await supabase
        .from('client_workflow_status')
        .insert({
          client_id: clientId,
          current_stage: 'approved',
          stage_data: { equipment_id: equipmentId },
          assigned_to: profile?.id,
          notes: notes,
          isp_company_id: profile?.isp_company_id
        });

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

      // Generate installation invoice if available
      try {
        if (createInstallationInvoice) {
          const invoiceResult = await createInstallationInvoice({
            client_id: clientId,
            equipment_details: { equipment_id: equipmentId },
            notes: 'Installation invoice generated after approval'
          });
          return { success: true, invoiceId: invoiceResult?.id };
        }
      } catch (invoiceError) {
        console.warn('Invoice creation failed:', invoiceError);
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-workflow'] });
      toast({
        title: "Client Approved",
        description: "Client has been approved successfully.",
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
        .update({ status: 'pending', rejection_reason: reason })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Insert workflow status
      const { error: workflowError } = await supabase
        .from('client_workflow_status')
        .insert({
          client_id: clientId,
          current_stage: 'rejected',
          stage_data: { rejection_reason: reason },
          assigned_to: profile?.id,
          notes: reason,
          isp_company_id: profile?.isp_company_id
        });

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

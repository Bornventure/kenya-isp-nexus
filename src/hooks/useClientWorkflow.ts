
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { WorkflowStage as ClientWorkflowStage } from '@/types/client';

// Rename the local interface to avoid conflict
export interface WorkflowStageData {
  id: string;
  client_id: string;
  current_stage: string;
  stage_data: any;
  assigned_to?: string;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useClientWorkflow = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingClients = [], isLoading } = useQuery({
    queryKey: ['pending-clients', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (name, monthly_rate),
          client_workflow_status (*)
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .in('status', ['pending', 'approved'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000,
  });

  const approveClient = useMutation({
    mutationFn: async ({ clientId, notes }: { clientId: string; notes?: string }) => {
      const { error } = await supabase.rpc('update_client_workflow_status', {
        p_client_id: clientId,
        p_stage: 'approved',
        p_assigned_to: profile?.id,
        p_notes: notes
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Client Approved",
        description: "Client has been approved and can now be assigned equipment.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve client",
        variant: "destructive",
      });
    },
  });

  const rejectClient = useMutation({
    mutationFn: async ({ clientId, reason }: { clientId: string; reason: string }) => {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: profile?.id,
          rejected_at: new Date().toISOString()
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      const { error: statusError } = await supabase.rpc('update_client_workflow_status', {
        p_client_id: clientId,
        p_stage: 'rejected',
        p_assigned_to: profile?.id,
        p_notes: reason
      });

      if (statusError) throw statusError;
    },
    onSuccess: () => {
      toast({
        title: "Client Rejected",
        description: "Client has been rejected and sent back to sales.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject client",
        variant: "destructive",
      });
    },
  });

  const assignEquipment = useMutation({
    mutationFn: async ({ 
      clientId, 
      equipmentIds, 
      notes 
    }: { 
      clientId: string; 
      equipmentIds: string[]; 
      notes?: string 
    }) => {
      // Update client status
      const { error: clientError } = await supabase
        .from('clients')
        .update({ 
          status: 'approved'
        })
        .eq('id', clientId);

      if (clientError) throw clientError;

      // Update workflow status
      const { error: statusError } = await supabase.rpc('update_client_workflow_status', {
        p_client_id: clientId,
        p_stage: 'equipment_assigned',
        p_assigned_to: profile?.id,
        p_notes: notes,
        p_stage_data: { equipment_ids: equipmentIds }
      });

      if (statusError) throw statusError;

      // Create equipment assignments
      for (const equipmentId of equipmentIds) {
        const { error: assignError } = await supabase
          .from('client_equipment_assignments')
          .insert({
            client_id: clientId,
            equipment_id: equipmentId,
            assigned_by: profile?.id,
            installation_notes: notes,
            isp_company_id: profile?.isp_company_id
          });

        if (assignError) throw assignError;
      }
    },
    onSuccess: () => {
      toast({
        title: "Equipment Assigned",
        description: "Equipment has been assigned to the client.",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-clients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to assign equipment",
        variant: "destructive",
      });
    },
  });

  return {
    pendingClients,
    isLoading,
    approveClient: approveClient.mutate,
    rejectClient: rejectClient.mutate,
    assignEquipment: assignEquipment.mutate,
    isApproving: approveClient.isPending,
    isRejecting: rejectClient.isPending,
    isAssigningEquipment: assignEquipment.isPending,
  };
};

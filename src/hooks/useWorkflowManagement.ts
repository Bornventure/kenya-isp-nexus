
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowStage {
  id: string;
  client_id: string;
  current_stage: string;
  stage_data: any;
  assigned_to?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const useWorkflowManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workflowStages = [], isLoading } = useQuery({
    queryKey: ['workflow-stages', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('client_workflow_status')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone,
            status
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkflowStage[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateWorkflowStage = useMutation({
    mutationFn: async ({
      clientId,
      stage,
      stageData = {},
      assignedTo,
      notes
    }: {
      clientId: string;
      stage: string;
      stageData?: any;
      assignedTo?: string;
      notes?: string;
    }) => {
      const { error } = await supabase.rpc('update_client_workflow_status', {
        p_client_id: clientId,
        p_stage: stage,
        p_stage_data: stageData,
        p_assigned_to: assignedTo,
        p_notes: notes
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-stages'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Workflow Updated",
        description: `Client moved to ${variables.stage} stage successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update workflow stage.",
        variant: "destructive",
      });
    },
  });

  const getClientsInStage = useCallback((stage: string) => {
    return workflowStages.filter(w => w.current_stage === stage);
  }, [workflowStages]);

  const getClientWorkflowHistory = useCallback((clientId: string) => {
    return workflowStages.filter(w => w.client_id === clientId);
  }, [workflowStages]);

  return {
    workflowStages,
    isLoading,
    updateWorkflowStage: updateWorkflowStage.mutate,
    isUpdatingWorkflow: updateWorkflowStage.isPending,
    getClientsInStage,
    getClientWorkflowHistory,
  };
};

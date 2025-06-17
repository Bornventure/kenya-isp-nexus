
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowAction {
  type: 'escalate' | 'auto_assign' | 'sla_check' | 'close_resolved';
  ticket_id: string;
  parameters?: Record<string, any>;
}

export const useTicketWorkflow = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const executeWorkflowAction = useMutation({
    mutationFn: async (action: WorkflowAction) => {
      const { data, error } = await supabase.functions.invoke('ticket-workflow', {
        body: action,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-assignments', variables.ticket_id] });
      
      toast({
        title: "Workflow Action Completed",
        description: `${variables.type} action executed successfully`,
      });
    },
    onError: (error, variables) => {
      toast({
        title: "Workflow Action Failed",
        description: `Failed to execute ${variables.type} action`,
        variant: "destructive",
      });
      console.error('Workflow action error:', error);
    },
  });

  const escalateTicket = (ticket_id: string, escalation_reason: string) => {
    executeWorkflowAction.mutate({
      type: 'escalate',
      ticket_id,
      parameters: { reason: escalation_reason }
    });
  };

  const autoAssignTicket = (ticket_id: string, department_id: string) => {
    executeWorkflowAction.mutate({
      type: 'auto_assign',
      ticket_id,
      parameters: { department_id }
    });
  };

  return { executeWorkflowAction, escalateTicket, autoAssignTicket };
};

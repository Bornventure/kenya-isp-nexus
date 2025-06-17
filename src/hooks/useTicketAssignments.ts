
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketAssignment {
  id: string;
  ticket_id: string;
  assigned_from?: string;
  assigned_to?: string;
  department_id?: string;
  assignment_reason?: string;
  assigned_at: string;
  completed_at?: string;
  status: string;
  notes?: string;
  isp_company_id?: string;
  assigned_to_profile?: {
    first_name: string;
    last_name: string;
  };
  assigned_from_profile?: {
    first_name: string;
    last_name: string;
  };
  departments?: {
    name: string;
  };
}

export const useTicketAssignments = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticket-assignments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_assignments')
        .select(`
          *,
          assigned_to_profile:profiles!ticket_assignments_assigned_to_fkey (
            first_name,
            last_name
          ),
          assigned_from_profile:profiles!ticket_assignments_assigned_from_fkey (
            first_name,
            last_name
          ),
          departments (
            name
          )
        `)
        .eq('ticket_id', ticketId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as TicketAssignment[];
    },
    enabled: !!ticketId,
  });
};

export const useTicketAssignmentMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const assignTicket = useMutation({
    mutationFn: async (assignment: Omit<TicketAssignment, 'id' | 'assigned_at' | 'assigned_to_profile' | 'assigned_from_profile' | 'departments'>) => {
      const { data, error } = await supabase
        .from('ticket_assignments')
        .insert(assignment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-assignments', data.ticket_id] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: "Success",
        description: "Ticket assigned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
      console.error('Error assigning ticket:', error);
    },
  });

  return { assignTicket };
};

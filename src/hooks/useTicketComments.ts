
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  is_internal: boolean;
  is_resolution: boolean;
  created_at: string;
  updated_at: string;
  isp_company_id?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export const useTicketComments = (ticketId: string) => {
  return useQuery({
    queryKey: ['ticket-comments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TicketComment[];
    },
    enabled: !!ticketId,
  });
};

export const useTicketCommentMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const addComment = useMutation({
    mutationFn: async (comment: Omit<TicketComment, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-comments', data.ticket_id] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
      console.error('Error adding comment:', error);
    },
  });

  return { addComment };
};

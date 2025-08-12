
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NetworkSession } from '@/types/network';

export const useRadiusSessions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeSessions = [], isLoading } = useQuery({
    queryKey: ['radius-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('network_sessions')
        .select(`
          *,
          clients!inner(name, email)
        `)
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data as NetworkSession[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: allSessions = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-radius-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('network_sessions')
        .select(`
          *,
          clients!inner(name, email)
        `)
        .order('start_time', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as NetworkSession[];
    },
  });

  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('network_sessions')
        .update({ 
          status: 'disconnected',
          last_update: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['all-radius-sessions'] });
      toast({
        title: "Session Terminated",
        description: "User session has been terminated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Terminate Session",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  return {
    activeSessions,
    allSessions,
    isLoading,
    isLoadingAll,
    terminateSession: terminateSessionMutation.mutateAsync,
    isTerminating: terminateSessionMutation.isPending,
  };
};

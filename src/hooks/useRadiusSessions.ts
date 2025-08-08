
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface RadiusSession {
  id: string;
  client_id?: string;
  username: string;
  session_id: string;
  nas_ip_address?: string;
  start_time: string;
  end_time?: string;
  bytes_in: number;
  bytes_out: number;
  status: 'active' | 'terminated';
  isp_company_id: string;
}

export const useRadiusSessions = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['radius-sessions', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];
      
      const { data, error } = await supabase
        .from('radius_sessions' as any)
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) {
        console.error('Error fetching RADIUS sessions:', error);
        return [];
      }

      return (data || []) as unknown as RadiusSession[];
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const disconnectSession = useMutation({
    mutationFn: async (username: string) => {
      // End all active sessions in database
      const { error } = await supabase
        .from('radius_sessions' as any)
        .update({
          status: 'terminated',
          end_time: new Date().toISOString()
        })
        .eq('username', username)
        .eq('status', 'active');

      if (error) throw error;
      return username;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      toast({
        title: "Success",
        description: "Session disconnected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to disconnect session",
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    refetch,
    disconnectSession: disconnectSession.mutate,
    isDisconnecting: disconnectSession.isPending,
  };
};

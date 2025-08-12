
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RadiusSession {
  id: string;
  client_id?: string;
  username: string;
  session_id: string;
  ip_address?: string;
  nas_ip_address?: string;
  start_time: string;
  bytes_in: number;
  bytes_out: number;
  status: 'active' | 'disconnected';
  equipment_id?: string;
  last_update: string;
  isp_company_id: string;
  created_at: string;
}

export const useRadiusSessions = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['radius-sessions', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('network_sessions')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('start_time', { ascending: false });

      if (error) throw error;
      return (data || []) as RadiusSession[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const disconnectSession = useMutation({
    mutationFn: async (username: string) => {
      const { error } = await supabase
        .from('network_sessions')
        .update({ 
          status: 'disconnected',
          last_update: new Date().toISOString()
        })
        .eq('username', username)
        .eq('status', 'active');

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      toast({
        title: "Session Disconnected",
        description: "Network session has been disconnected.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      console.error('Error disconnecting session:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect session. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    disconnectSession: disconnectSession.mutateAsync,
  };
};

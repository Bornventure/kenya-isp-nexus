
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NetworkEvent {
  id: string;
  client_id: string | null;
  equipment_id: string | null;
  event_type: string;
  event_data: any;
  triggered_by: string | null;
  success: boolean;
  error_message: string | null;
  isp_company_id: string;
  created_at: string;
  clients?: { name: string };
  equipment?: { type: string; brand: string; model: string };
}

export const useNetworkEvents = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['network-events', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('network_events')
        .select(`
          *,
          clients (name),
          equipment (type, brand, model)
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as NetworkEvent[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const logEventMutation = useMutation({
    mutationFn: async (eventData: {
      client_id?: string;
      equipment_id?: string;
      event_type: string;
      event_data?: any;
      triggered_by?: string;
      success?: boolean;
      error_message?: string;
    }) => {
      const { data, error } = await supabase
        .from('network_events')
        .insert({
          ...eventData,
          isp_company_id: profile?.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['network-events'] });
    },
  });

  return {
    events,
    isLoading,
    logEvent: logEventMutation.mutate,
    isLogging: logEventMutation.isPending,
  };
};

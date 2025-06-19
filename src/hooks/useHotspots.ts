
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Hotspot {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'active' | 'inactive' | 'maintenance';
  bandwidth_limit: number;
  max_concurrent_users: number;
  coverage_radius: number;
  ssid: string;
  password?: string;
  mac_address?: string;
  ip_address?: string;
  hardware_details?: any;
  installation_date?: string;
  last_maintenance_date?: string;
  is_active: boolean;
  created_at: string;
  isp_company_id: string;
  updated_at: string;
}

export interface HotspotSession {
  id: string;
  hotspot_id: string;
  client_id: string | null;
  mac_address: string;
  ip_address?: string;
  session_status: 'active' | 'inactive' | 'expired';
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  data_used_mb: number | null;
  bandwidth_used_mbps: number | null;
  session_type: 'client' | 'guest' | 'voucher';
  voucher_code: string | null;
  created_at: string;
  clients: {
    name: string;
    phone: string;
  } | null;
  hotspots: {
    name: string;
    location: string;
  };
}

export interface HotspotAnalytics {
  id: string;
  hotspot_id: string;
  date: string;
  total_sessions: number;
  unique_users: number;
  total_data_mb: number;
  avg_session_duration: number;
  peak_concurrent_users: number;
  revenue_generated: number;
  created_at: string;
  hotspots?: {
    name: string;
    location: string;
  };
}

export const useHotspots = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hotspots', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotspots')
        .select('*')
        .eq('isp_company_id', profile?.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Hotspot[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useHotspotSessions = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hotspot-sessions', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotspot_sessions')
        .select(`
          *,
          hotspots (
            name,
            location
          )
        `)
        .eq('hotspots.isp_company_id', profile?.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data as any[]).map(session => ({
        ...session,
        clients: session.client_id ? { name: 'Unknown Client', phone: 'N/A' } : null
      })) as HotspotSession[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useHotspotAnalytics = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hotspot-analytics', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hotspot_analytics')
        .select(`
          *,
          hotspots!inner (
            name,
            location
          )
        `)
        .eq('hotspots.isp_company_id', profile?.isp_company_id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as HotspotAnalytics[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useHotspotMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('hotspot_sessions')
        .update({ 
          session_status: 'expired',
          end_time: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-sessions'] });
      toast({
        title: "Success",
        description: "Session terminated successfully",
      });
    },
    onError: (error) => {
      console.error('Error terminating session:', error);
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
    }
  });

  const deleteHotspot = useMutation({
    mutationFn: async (hotspotId: string) => {
      const { error } = await supabase
        .from('hotspots')
        .delete()
        .eq('id', hotspotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
      toast({
        title: "Success",
        description: "Hotspot deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting hotspot:', error);
      toast({
        title: "Error",
        description: "Failed to delete hotspot",
        variant: "destructive",
      });
    }
  });

  return {
    terminateSession,
    deleteHotspot
  };
};

export const useCreateHotspot = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (hotspotData: Omit<Hotspot, 'id' | 'created_at' | 'isp_company_id' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hotspots')
        .insert({
          ...hotspotData,
          isp_company_id: profile?.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
      toast({
        title: "Success",
        description: "Hotspot created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating hotspot:', error);
      toast({
        title: "Error",
        description: "Failed to create hotspot",
        variant: "destructive",
      });
    }
  });
};

export const useUpdateHotspot = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Hotspot> }) => {
      const { data, error } = await supabase
        .from('hotspots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspots'] });
      toast({
        title: "Success",
        description: "Hotspot updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating hotspot:', error);
      toast({
        title: "Error",
        description: "Failed to update hotspot",
        variant: "destructive",
      });
    }
  });
};

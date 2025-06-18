import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Hotspot {
  id: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  status: 'active' | 'inactive' | 'maintenance';
  hardware_details?: any;
  ip_address?: string;
  mac_address?: string;
  ssid: string;
  password?: string;
  bandwidth_limit: number;
  max_concurrent_users: number;
  coverage_radius: number;
  installation_date?: string;
  last_maintenance_date?: string;
  is_active: boolean;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface HotspotSession {
  id: string;
  hotspot_id: string;
  client_id?: string;
  mac_address: string;
  device_fingerprint?: string;
  session_type: 'client' | 'guest' | 'voucher';
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  data_used_mb: number;
  bandwidth_used_mbps: number;
  session_status: 'active' | 'expired' | 'terminated';
  ip_address?: string;
  user_agent?: string;
  payment_reference?: string;
  voucher_code?: string;
  hotspots?: { name: string; location: string };
  clients?: { name: string; phone: string } | null;
}

export interface HotspotAnalytics {
  id: string;
  hotspot_id: string;
  date: string;
  total_sessions: number;
  unique_users: number;
  total_data_used_gb: number;
  peak_concurrent_users: number;
  avg_session_duration_minutes: number;
  revenue_generated: number;
  uptime_percentage: number;
  bandwidth_utilization_percentage: number;
  guest_sessions: number;
  client_sessions: number;
  voucher_sessions: number;
  hotspots?: { name: string; location: string };
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

export const useHotspotSessions = (hotspotId?: string, limit: number = 50) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hotspot-sessions', profile?.isp_company_id, hotspotId],
    queryFn: async () => {
      let query = supabase
        .from('hotspot_sessions')
        .select(`
          *,
          hotspots!inner(name, location),
          clients(name, phone)
        `)
        .eq('isp_company_id', profile?.isp_company_id)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (hotspotId) {
        query = query.eq('hotspot_id', hotspotId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(session => ({
        ...session,
        clients: session.clients || null
      })) as HotspotSession[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useHotspotAnalytics = (hotspotId?: string, days: number = 30) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['hotspot-analytics', profile?.isp_company_id, hotspotId, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let query = supabase
        .from('hotspot_analytics')
        .select(`
          *,
          hotspots!inner(name, location)
        `)
        .eq('isp_company_id', profile?.isp_company_id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (hotspotId) {
        query = query.eq('hotspot_id', hotspotId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HotspotAnalytics[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useHotspotMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { profile } = useAuth();

  const createHotspot = useMutation({
    mutationFn: async (hotspotData: Partial<Hotspot>) => {
      const { data, error } = await supabase
        .from('hotspots')
        .insert({
          name: hotspotData.name || '',
          location: hotspotData.location || '',
          ssid: hotspotData.ssid || '',
          bandwidth_limit: hotspotData.bandwidth_limit || 10,
          max_concurrent_users: hotspotData.max_concurrent_users || 50,
          coverage_radius: hotspotData.coverage_radius || 100,
          status: hotspotData.status || 'active',
          isp_company_id: profile?.isp_company_id,
          latitude: hotspotData.latitude,
          longitude: hotspotData.longitude,
          hardware_details: hotspotData.hardware_details,
          ip_address: hotspotData.ip_address,
          mac_address: hotspotData.mac_address,
          password: hotspotData.password,
          installation_date: hotspotData.installation_date,
          last_maintenance_date: hotspotData.last_maintenance_date,
          is_active: hotspotData.is_active ?? true,
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
      toast({
        title: "Error",
        description: "Failed to create hotspot",
        variant: "destructive",
      });
      console.error('Error creating hotspot:', error);
    },
  });

  const updateHotspot = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Hotspot> }) => {
      const { data, error } = await supabase
        .from('hotspots')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
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
      toast({
        title: "Error",
        description: "Failed to update hotspot",
        variant: "destructive",
      });
      console.error('Error updating hotspot:', error);
    },
  });

  const deleteHotspot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hotspots')
        .delete()
        .eq('id', id);

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
      toast({
        title: "Error",
        description: "Failed to delete hotspot",
        variant: "destructive",
      });
      console.error('Error deleting hotspot:', error);
    },
  });

  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('hotspot_sessions')
        .update({
          session_status: 'terminated',
          end_time: new Date().toISOString(),
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
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive",
      });
      console.error('Error terminating session:', error);
    },
  });

  return {
    createHotspot,
    updateHotspot,
    deleteHotspot,
    terminateSession,
  };
};

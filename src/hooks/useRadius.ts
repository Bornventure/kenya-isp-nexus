
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RadiusServer {
  id: string;
  name: string;
  server_address: string;
  auth_port: number;
  accounting_port: number;
  shared_secret: string;
  timeout_seconds: number;
  is_enabled: boolean;
  is_primary: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface RadiusGroup {
  id: string;
  name: string;
  description: string;
  upload_limit_mbps: number;
  download_limit_mbps: number;
  session_timeout_seconds?: number;
  idle_timeout_seconds?: number;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface NASClient {
  id: string;
  name: string;
  shortname: string;
  type: string;
  nas_ip_address: string;
  secret: string;
  ports: number;
  community: string;
  description?: string;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useRadiusServers = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['radius-servers', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_servers')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RadiusServer[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useRadiusGroups = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['radius-groups', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_groups')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RadiusGroup[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useNASClients = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nasClients = [], isLoading } = useQuery({
    queryKey: ['nas-clients', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('nas_clients')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as NASClient[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createNASClient = useMutation({
    mutationFn: async (clientData: Omit<NASClient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('nas_clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Client Created",
        description: "NAS client has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating NAS client:', error);
      toast({
        title: "Error",
        description: "Failed to create NAS client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateNASClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<NASClient> }) => {
      const { data, error } = await supabase
        .from('nas_clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Client Updated",
        description: "NAS client has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating NAS client:', error);
      toast({
        title: "Error",
        description: "Failed to update NAS client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteNASClient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('nas_clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Client Deleted",
        description: "NAS client has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting NAS client:', error);
      toast({
        title: "Error",
        description: "Failed to delete NAS client. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    data: nasClients,
    isLoading,
    createNASClient,
    updateNASClient,
    deleteNASClient,
  };
};

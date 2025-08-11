
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RadiusServer {
  id: string;
  name: string;
  server_address: string;
  auth_port: number;
  accounting_port: number;
  shared_secret: string;
  timeout_seconds: number;
  retry_attempts: number;
  is_enabled: boolean;
  is_primary: boolean;
  isp_company_id: string;
}

export interface RadiusGroup {
  id: string;
  name: string;
  description?: string;
  upload_limit_mbps: number;
  download_limit_mbps: number;
  session_timeout_seconds?: number;
  idle_timeout_seconds?: number;
  is_active: boolean;
  isp_company_id: string;
}

export interface RadiusUser {
  id: string;
  client_id?: string;
  username: string;
  password: string;
  group_name?: string;
  max_upload: string;
  max_download: string;
  expiration?: string;
  is_active: boolean;
  isp_company_id: string;
}

export interface NASClient {
  id: string;
  name: string;
  shortname: string;
  type: string;
  ports: number;
  secret: string;
  server?: string;
  community: string;
  description?: string;
  nas_ip_address: string;
  is_active: boolean;
  isp_company_id: string;
}

export const useRadiusServers = () => {
  return useQuery({
    queryKey: ['radius-servers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radius_servers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RadiusServer[];
    },
  });
};

export const useRadiusGroups = () => {
  return useQuery({
    queryKey: ['radius-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radius_groups')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data as RadiusGroup[];
    },
  });
};

export const useRadiusUsers = () => {
  return useQuery({
    queryKey: ['radius-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radius_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RadiusUser[];
    },
  });
};

export const useNASClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['nas-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nas_clients')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as NASClient[];
    },
  });

  const createNASClient = useMutation({
    mutationFn: async (nasClient: Omit<NASClient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('nas_clients')
        .insert(nasClient)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Client Added",
        description: "Network Access Server client has been configured successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add NAS client: " + error.message,
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
        description: "Network Access Server client has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update NAS client: " + error.message,
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Client Deleted",
        description: "Network Access Server client has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete NAS client: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    ...query,
    createNASClient,
    updateNASClient,
    deleteNASClient,
  };
};

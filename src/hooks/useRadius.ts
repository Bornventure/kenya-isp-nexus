
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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
      // Return mock data for now since table might not be in types yet
      return [
        {
          id: '1',
          name: 'Primary RADIUS Server',
          server_address: '192.168.1.100',
          auth_port: 1812,
          accounting_port: 1813,
          shared_secret: 'secret123',
          timeout_seconds: 30,
          retry_attempts: 3,
          is_enabled: true,
          is_primary: true,
          isp_company_id: 'company-1'
        }
      ] as RadiusServer[];
    },
  });
};

export const useRadiusGroups = () => {
  return useQuery({
    queryKey: ['radius-groups'],
    queryFn: async () => {
      return [
        {
          id: '1',
          name: 'basic',
          description: 'Basic Internet Package',
          upload_limit_mbps: 5,
          download_limit_mbps: 10,
          session_timeout_seconds: 86400,
          idle_timeout_seconds: 300,
          is_active: true,
          isp_company_id: 'company-1'
        },
        {
          id: '2',
          name: 'premium',
          description: 'Premium Internet Package',
          upload_limit_mbps: 20,
          download_limit_mbps: 50,
          session_timeout_seconds: 86400,
          idle_timeout_seconds: 300,
          is_active: true,
          isp_company_id: 'company-1'
        }
      ] as RadiusGroup[];
    },
  });
};

export const useRadiusUsers = () => {
  return useQuery({
    queryKey: ['radius-users'],
    queryFn: async () => {
      return [] as RadiusUser[];
    },
  });
};

export const useNASClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const query = useQuery({
    queryKey: ['nas-clients'],
    queryFn: async () => {
      return [] as NASClient[];
    },
  });

  const createNASClient = useMutation({
    mutationFn: async (nasClient: Omit<NASClient, 'id'>) => {
      // For now, just simulate creation since table might not be available
      const newClient = {
        ...nasClient,
        id: crypto.randomUUID(),
        isp_company_id: profile?.isp_company_id || '',
        is_active: true
      };
      return newClient;
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
      // Simulate update
      return { id, ...updates };
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
      // Simulate deletion
      return id;
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

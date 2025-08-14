
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useNASClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: nasClients = [], isLoading } = useQuery({
    queryKey: ['nas-clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nas_clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as NASClient[];
    },
  });

  const createNASClientMutation = useMutation({
    mutationFn: async (nasData: Omit<NASClient, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      const { data, error } = await supabase
        .from('nas_clients')
        .insert(nasData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nas-clients'] });
      toast({
        title: "NAS Client Created",
        description: "New NAS client has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create NAS Client",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const deleteNASClientMutation = useMutation({
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
        description: "NAS client has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete NAS Client",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  return {
    nasClients,
    isLoading,
    createNASClient: createNASClientMutation.mutateAsync,
    deleteNASClient: deleteNASClientMutation.mutateAsync,
    isCreating: createNASClientMutation.isPending,
    isDeleting: deleteNASClientMutation.isPending,
  };
};

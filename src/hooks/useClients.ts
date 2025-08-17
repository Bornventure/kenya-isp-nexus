import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Client, transformDatabaseClient } from '@/types/client';

export const useClients = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            speed,
            monthly_rate,
            setup_fee,
            description,
            is_active,
            isp_company_id,
            created_at,
            updated_at
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database response to match Client interface
      return data.map(transformDatabaseClient) as Client[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const addClient = useMutation({
    mutationFn: async (newClient: Omit<Client, 'id'>) => {
      const { data, error } = await supabase
        .from('clients')
        .insert([newClient])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', profile?.isp_company_id] });
      toast({
        title: "Success",
        description: "Client added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', profile?.isp_company_id] });
      toast({
        title: "Success",
        description: "Client updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients', profile?.isp_company_id] });
      toast({
        title: "Success",
        description: "Client deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    addClient: addClient.mutateAsync,
    updateClient: updateClient.mutateAsync,
    deleteClient: deleteClient.mutateAsync,
  };
};

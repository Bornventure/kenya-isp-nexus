
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Client } from '@/types/client';

// Export DatabaseClient as an alias for backward compatibility
export type DatabaseClient = Client;

export const useClients = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['clients', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      // Transform data to match Client interface
      return (data || []).map(item => ({
        ...item,
        // Add legacy camelCase properties for backwards compatibility
        clientType: item.client_type,
        connectionType: item.connection_type,
        monthlyRate: item.monthly_rate,
        idNumber: item.id_number,
        kraPinNumber: item.kra_pin_number,
        mpesaNumber: item.mpesa_number,
        installationDate: item.installation_date
      })) as Client[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createClient = useMutation({
    mutationFn: async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          ...clientData,
          isp_company_id: profile.isp_company_id,
          submitted_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Created",
        description: "New client has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateClient = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Updated",
        description: "Client has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Use the dedicated client deletion hook for proper financial record preservation
  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      // This is a placeholder - the actual deletion should use useClientDeletion hook
      throw new Error('Use useClientDeletion hook for proper client deletion with financial record preservation');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Please use the proper deletion method to preserve financial records.",
        variant: "destructive",
      });
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClient.mutate,
    updateClient: updateClient.mutate,
    deleteClient: deleteClient.mutate, // Note: This should not be used directly
    isCreating: createClient.isPending,
    isUpdating: updateClient.isPending,
    isDeletingClient: deleteClient.isPending,
  };
};

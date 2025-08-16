
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseClient } from '@/types/database';

export const useClients = () => {
  const queryClient = useQueryClient();

  const {
    data: clients = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async (): Promise<DatabaseClient[]> => {
      console.log('Fetching clients...');
      const { data, error } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            monthly_rate,
            speed,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      console.log('Clients fetched:', data?.length);
      
      // Transform the data to match DatabaseClient interface
      const transformedData: DatabaseClient[] = (data || []).map(client => ({
        ...client,
        notes: client.notes || null,
        rejection_reason: client.rejection_reason || null,
        rejected_at: client.rejected_at || null,
        rejected_by: client.rejected_by || null,
        client_type: client.client_type as 'individual' | 'business' | 'corporate' | 'government',
        connection_type: client.connection_type as 'fiber' | 'wireless' | 'satellite' | 'dsl'
      }));

      return transformedData;
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating client with data:', clientData);
      
      const insertData = {
        ...clientData,
        notes: clientData.notes || null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null
      };

      const { data, error } = await supabase
        .from('clients')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      console.log('Client created successfully:', data);
      return {
        ...data,
        notes: data.notes || null,
        rejection_reason: data.rejection_reason || null,
        rejected_at: data.rejected_at || null,
        rejected_by: data.rejected_by || null
      } as DatabaseClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DatabaseClient> }) => {
      console.log('Updating client:', id, updates);
      
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      console.log('Client updated successfully:', data);
      return {
        ...data,
        notes: data.notes || null,
        rejection_reason: data.rejection_reason || null,
        rejected_at: data.rejected_at || null,
        rejected_by: data.rejected_by || null
      } as DatabaseClient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting client:', id);
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      console.log('Client deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
    updateClient: updateClientMutation.mutateAsync,
    deleteClient: deleteClientMutation.mutateAsync,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
};

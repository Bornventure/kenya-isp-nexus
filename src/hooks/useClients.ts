
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DatabaseClient } from '@/types/database';

// Export the interface so other components can use it
export type { DatabaseClient };

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
        connection_type: client.connection_type as 'fiber' | 'wireless' | 'satellite' | 'dsl',
        status: client.status as 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved',
        latitude: client.latitude || null,
        longitude: client.longitude || null,
        service_packages: client.service_packages || null,
        service_activated_at: client.service_activated_at || null,
        installation_status: client.installation_status || 'pending',
        submitted_by: client.submitted_by || null
      }));

      return transformedData;
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>) => {
      console.log('Creating client with data:', clientData);
      
      const insertData = {
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        county: clientData.county,
        sub_county: clientData.sub_county,
        id_number: clientData.id_number,
        kra_pin_number: clientData.kra_pin_number,
        mpesa_number: clientData.mpesa_number,
        client_type: clientData.client_type,
        connection_type: clientData.connection_type,
        status: clientData.status,
        monthly_rate: clientData.monthly_rate,
        installation_date: clientData.installation_date,
        subscription_start_date: clientData.subscription_start_date,
        subscription_end_date: clientData.subscription_end_date,
        subscription_type: clientData.subscription_type,
        balance: clientData.balance,
        wallet_balance: clientData.wallet_balance,
        service_package_id: clientData.service_package_id,
        isp_company_id: clientData.isp_company_id,
        approved_at: clientData.approved_at,
        approved_by: clientData.approved_by,
        notes: clientData.notes || null,
        rejection_reason: null,
        rejected_at: null,
        rejected_by: null,
        latitude: clientData.latitude || null,
        longitude: clientData.longitude || null,
        installation_status: clientData.installation_status || 'pending',
        submitted_by: clientData.submitted_by || null,
        service_activated_at: clientData.service_activated_at || null,
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
        rejected_by: data.rejected_by || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        service_activated_at: data.service_activated_at || null,
        installation_status: data.installation_status || 'pending',
        submitted_by: data.submitted_by || null
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
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          address: updates.address,
          county: updates.county,
          sub_county: updates.sub_county,
          id_number: updates.id_number,
          kra_pin_number: updates.kra_pin_number,
          mpesa_number: updates.mpesa_number,
          client_type: updates.client_type,
          connection_type: updates.connection_type,
          status: updates.status,
          monthly_rate: updates.monthly_rate,
          installation_date: updates.installation_date,
          subscription_start_date: updates.subscription_start_date,
          subscription_end_date: updates.subscription_end_date,
          subscription_type: updates.subscription_type,
          balance: updates.balance,
          wallet_balance: updates.wallet_balance,
          service_package_id: updates.service_package_id,
          isp_company_id: updates.isp_company_id,
          approved_at: updates.approved_at,
          approved_by: updates.approved_by,
          notes: updates.notes,
          rejection_reason: updates.rejection_reason,
          rejected_at: updates.rejected_at,
          rejected_by: updates.rejected_by,
          latitude: updates.latitude,
          longitude: updates.longitude,
          installation_status: updates.installation_status,
          submitted_by: updates.submitted_by,
          service_activated_at: updates.service_activated_at,
        })
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
        rejected_by: data.rejected_by || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        service_activated_at: data.service_activated_at || null,
        installation_status: data.installation_status || 'pending',
        submitted_by: data.submitted_by || null
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

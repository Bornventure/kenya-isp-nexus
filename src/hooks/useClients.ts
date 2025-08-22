
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

      return (data || []) as Client[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createClient = useMutation({
    mutationFn: async (clientData: Partial<Client>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      // Extract only database-compatible fields
      const dbClientData = {
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
        monthly_rate: clientData.monthly_rate,
        service_package_id: clientData.service_package_id,
        latitude: clientData.latitude,
        longitude: clientData.longitude,
        status: 'pending' as const, // Use explicit type assertion for valid status
        balance: clientData.balance || 0,
        wallet_balance: clientData.wallet_balance || 0,
        is_active: clientData.is_active || false,
        installation_date: clientData.installation_date,
        installation_status: clientData.installation_status || 'pending',
        submitted_by: profile.id,
        isp_company_id: profile.isp_company_id,
        notes: clientData.notes,
      };

      const { data, error } = await supabase
        .from('clients')
        .insert(dbClientData)
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
      // Extract only database-compatible fields for updates
      const dbUpdates = {
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
        monthly_rate: updates.monthly_rate,
        service_package_id: updates.service_package_id,
        latitude: updates.latitude,
        longitude: updates.longitude,
        status: updates.status as 'pending' | 'approved' | 'active' | 'suspended' | 'disconnected' | 'rejected', // Type assertion for valid status values
        balance: updates.balance,
        wallet_balance: updates.wallet_balance,
        is_active: updates.is_active,
        installation_date: updates.installation_date,
        installation_status: updates.installation_status,
        notes: updates.notes,
        rejection_reason: updates.rejection_reason,
        rejected_by: updates.rejected_by,
        rejected_at: updates.rejected_at,
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(dbUpdates).forEach(key => {
        if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
          delete dbUpdates[key as keyof typeof dbUpdates];
        }
      });

      const { data, error } = await supabase
        .from('clients')
        .update(dbUpdates)
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

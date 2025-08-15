import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  county: string;
  sub_county: string;
  id_number: string;
  kra_pin_number?: string;
  mpesa_number?: string;
  client_type: 'individual' | 'business';
  connection_type: 'fiber' | 'wireless' | 'satellite';
  status: 'pending' | 'approved' | 'active' | 'suspended' | 'cancelled';
  monthly_rate: number;
  balance?: number;
  wallet_balance?: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
  installation_date?: string;
  installation_status?: string;
  service_package_id?: string;
  latitude?: number;
  longitude?: number;
  isp_company_id?: string;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  installation_completed_by?: string;
  installation_completed_at?: string;
  service_activated_at?: string;
  subscription_type?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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

  const deleteClient = useMutation({
    mutationFn: async (clientId: string) => {
      if (profile?.role !== 'super_admin' && profile?.role !== 'isp_admin') {
        throw new Error('Only administrators can delete clients');
      }

      console.log('Deleting client:', clientId);

      // Instead of deleting financial records, we'll unlink the client from them
      // and delete only operational data that doesn't need to be preserved
      // All assigned equipment should return to decommissioned inventory

      const promises = [
        // Unlink client from inventory items and set status to decommissioned
        supabase.from('inventory_items')
          .update({ 
            assigned_customer_id: null,
            status: 'Decommissioned',
            assignment_date: null
          })
          .eq('assigned_customer_id', clientId),
        
        // Delete client equipment assignments
        supabase.from('client_equipment').delete().eq('client_id', clientId),
        
        // Delete equipment assignments
        supabase.from('equipment_assignments').delete().eq('client_id', clientId),
        
        // Update invoices to remove client reference but keep for financial records
        supabase.from('invoices').update({ client_id: null }).eq('client_id', clientId),
        
        // Update installation invoices to remove client reference but keep for financial records
        supabase.from('installation_invoices').update({ client_id: null }).eq('client_id', clientId),
        
        // Keep wallet transactions and family bank payments for audit trail - just unlink client
        supabase.from('wallet_transactions').update({ client_id: null }).eq('client_id', clientId),
        supabase.from('family_bank_payments').update({ client_id: null }).eq('client_id', clientId),
        
        // Delete hotspot sessions (operational data)
        supabase.from('hotspot_sessions').delete().eq('client_id', clientId),
        
        // Delete client service assignments
        supabase.from('client_service_assignments').delete().eq('client_id', clientId),
        
        // Delete bandwidth statistics (operational data)
        supabase.from('bandwidth_statistics').delete().eq('client_id', clientId),
        
        // Delete data usage (operational data)
        supabase.from('data_usage').delete().eq('client_id', clientId),

        // Delete client hotspot access
        supabase.from('client_hotspot_access').delete().eq('client_id', clientId),

        // Update equipment to unlink from client and set to available
        supabase.from('equipment')
          .update({ 
            client_id: null,
            status: 'available'
          })
          .eq('client_id', clientId),
      ];

      // Execute all deletions/updates
      const results = await Promise.allSettled(promises);
      
      // Check for errors in related data cleanup
      const errors = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, index }) => `Step ${index + 1}: ${(result as PromiseRejectedResult).reason}`);

      if (errors.length > 0) {
        console.warn('Some related data cleanup failed:', errors);
      }

      // Finally delete the client
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }

      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Client Deleted Successfully",
        description: "Client profile has been deleted, equipment returned to inventory, and financial records preserved for audit purposes.",
      });
      console.log('Client deletion completed for:', clientId);
    },
    onError: (error, clientId) => {
      console.error('Error deleting client:', clientId, error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete client. Please try again.',
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
    deleteClient: deleteClient.mutate,
    isCreating: createClient.isPending,
    isUpdating: updateClient.isPending,
    isDeletingClient: deleteClient.isPending,
  };
};

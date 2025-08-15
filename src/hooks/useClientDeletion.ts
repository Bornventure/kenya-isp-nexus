import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useClientDeletion = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      if (profile?.role !== 'super_admin' && profile?.role !== 'isp_admin') {
        throw new Error('Only administrators can delete clients');
      }

      console.log('Deleting client:', clientId);

      // Instead of deleting financial records, we'll unlink the client from them
      // and delete only operational data that doesn't need to be preserved

      const promises = [
        // Unlink client from inventory items (don't delete the items, just unassign)
        supabase.from('inventory_items').update({ assigned_customer_id: null }).eq('assigned_customer_id', clientId),
        
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

        // Update equipment to unlink from client
        supabase.from('equipment').update({ client_id: null }).eq('client_id', clientId),
      ];

      // Execute all deletions/updates
      const results = await Promise.allSettled(promises);
      
      // Check for errors in related data deletion
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
      queryClient.invalidateQueries({ queryKey: ['client'] });
      toast({
        title: "Client Deleted Successfully",
        description: "Client profile has been deleted while preserving financial records for audit purposes.",
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

  const deleteClient = (clientId: string) => {
    console.log('Delete client requested for:', clientId);
    deleteClientMutation.mutate(clientId);
  };

  return {
    deleteClient,
    isDeletingClient: deleteClientMutation.isPending,
  };
};

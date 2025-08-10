
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

      // Delete all related data first
      const promises = [
        // Delete client equipment assignments
        supabase.from('client_equipment').delete().eq('client_id', clientId),
        // Delete equipment assignments
        supabase.from('equipment_assignments').delete().eq('client_id', clientId),
        // Delete invoices
        supabase.from('invoices').delete().eq('client_id', clientId),
        // Delete installation invoices
        supabase.from('installation_invoices').delete().eq('client_id', clientId),
        // Delete wallet transactions
        supabase.from('wallet_transactions').delete().eq('client_id', clientId),
        // Delete family bank payments
        supabase.from('family_bank_payments').delete().eq('client_id', clientId),
        // Delete hotspot sessions
        supabase.from('hotspot_sessions').delete().eq('client_id', clientId),
        // Delete client service assignments
        supabase.from('client_service_assignments').delete().eq('client_id', clientId),
        // Delete bandwidth statistics
        supabase.from('bandwidth_statistics').delete().eq('client_id', clientId),
        // Delete data usage
        supabase.from('data_usage').delete().eq('client_id', clientId),
      ];

      // Execute all deletions
      const results = await Promise.allSettled(promises);
      
      // Check for errors in related data deletion
      const errors = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, index }) => `Step ${index + 1}: ${(result as PromiseRejectedResult).reason}`);

      if (errors.length > 0) {
        console.warn('Some related data deletion failed:', errors);
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
        description: "Client and all associated data have been permanently deleted.",
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

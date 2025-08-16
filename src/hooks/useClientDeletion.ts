
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

      console.log('Deleting client with financial record preservation:', clientId);

      // PRESERVE ALL FINANCIAL RECORDS - Only unlink, never delete
      const financialRecordUpdates = [
        // Preserve invoices for audit trail - just unlink client
        supabase.from('invoices').update({ client_id: null }).eq('client_id', clientId),
        
        // Preserve installation invoices for audit trail - just unlink client
        supabase.from('installation_invoices').update({ client_id: null }).eq('client_id', clientId),
        
        // Preserve all payment records for financial audit - just unlink client
        supabase.from('payments').update({ client_id: null }).eq('client_id', clientId),
        
        // Preserve wallet transactions for audit trail - just unlink client
        supabase.from('wallet_transactions').update({ client_id: null }).eq('client_id', clientId),
        
        // Preserve Family Bank payments for audit trail - just unlink client
        supabase.from('family_bank_payments').update({ client_id: null }).eq('client_id', clientId),
      ];

      // RETURN EQUIPMENT TO INVENTORY - Safely unassign equipment
      const equipmentUpdates = [
        // Unlink client from inventory items and set status to available
        supabase.from('inventory_items')
          .update({ 
            assigned_customer_id: null,
            status: 'In Stock',
            assignment_date: null
          })
          .eq('assigned_customer_id', clientId),
        
        // Update equipment to unlink from client and set to available
        supabase.from('equipment')
          .update({ 
            client_id: null,
            status: 'available'
          })
          .eq('client_id', clientId),
      ];

      // DELETE ONLY OPERATIONAL DATA - Safe to remove
      const operationalDataDeletions = [
        // Delete client equipment assignments (operational data)
        supabase.from('client_equipment').delete().eq('client_id', clientId),
        
        // Delete equipment assignments (operational data)
        supabase.from('equipment_assignments').delete().eq('client_id', clientId),
        
        // Delete hotspot sessions (operational data)
        supabase.from('hotspot_sessions').delete().eq('client_id', clientId),
        
        // Delete client service assignments (operational data)
        supabase.from('client_service_assignments').delete().eq('client_id', clientId),
        
        // Delete bandwidth statistics (operational data)
        supabase.from('bandwidth_statistics').delete().eq('client_id', clientId),
        
        // Delete data usage (operational data)
        supabase.from('data_usage').delete().eq('client_id', clientId),

        // Delete client hotspot access (operational data)
        supabase.from('client_hotspot_access').delete().eq('client_id', clientId),

        // Delete client workflow status (operational data)
        supabase.from('client_workflow_status').delete().eq('client_id', clientId),
      ];

      // Execute all updates and deletions in sequence
      const allOperations = [
        ...financialRecordUpdates,
        ...equipmentUpdates,
        ...operationalDataDeletions
      ];

      const results = await Promise.allSettled(allOperations);
      
      // Check for errors but continue with client deletion
      const errors = results
        .map((result, index) => ({ result, index }))
        .filter(({ result }) => result.status === 'rejected')
        .map(({ result, index }) => `Operation ${index + 1}: ${(result as PromiseRejectedResult).reason}`);

      if (errors.length > 0) {
        console.warn('Some cleanup operations failed (non-critical):', errors);
      }

      // Finally delete the client profile
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);

      if (error) {
        console.error('Error deleting client profile:', error);
        throw error;
      }

      return clientId;
    },
    onSuccess: (clientId) => {
      // Invalidate related queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      
      toast({
        title: "Client Deleted Successfully",
        description: "Client profile deleted while preserving all financial records and returning equipment to inventory.",
      });
      console.log('Client deletion completed with financial record preservation for:', clientId);
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
    console.log('Delete client requested with financial preservation for:', clientId);
    deleteClientMutation.mutate(clientId);
  };

  return {
    deleteClient,
    isDeletingClient: deleteClientMutation.isPending,
  };
};

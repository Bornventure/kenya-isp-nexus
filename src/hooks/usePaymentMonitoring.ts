
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkflowOrchestration } from './useWorkflowOrchestration';

export const usePaymentMonitoring = () => {
  const { activateClientService } = useWorkflowOrchestration();

  const checkPaymentStatus = useCallback(async () => {
    try {
      // Check for paid installation invoices
      const { data: paidInvoices } = await supabase
        .from('installation_invoices')
        .select(`
          *,
          clients(*)
        `)
        .eq('status', 'paid')
        .is('distributed_at', null);

      for (const invoice of paidInvoices || []) {
        if (invoice.clients?.status === 'approved') {
          // Activate the client service
          await activateClientService(invoice.client_id);
          
          // Mark invoice as distributed
          await supabase
            .from('installation_invoices')
            .update({
              distributed_at: new Date().toISOString(),
              status: 'completed'
            })
            .eq('id', invoice.id);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  }, [activateClientService]);

  // Monitor payments every 30 seconds
  useEffect(() => {
    const interval = setInterval(checkPaymentStatus, 30000);
    
    // Initial check
    checkPaymentStatus();
    
    return () => clearInterval(interval);
  }, [checkPaymentStatus]);

  return { checkPaymentStatus };
};


import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkflowOrchestration } from './useWorkflowOrchestration';

export const usePaymentMonitoring = () => {
  const { activateClientService } = useWorkflowOrchestration();

  const checkPaymentStatus = useCallback(async () => {
    try {
      // Check for paid installation invoices that haven't been processed
      const { data: paidInvoices } = await supabase
        .from('installation_invoices')
        .select(`
          *,
          clients(
            id,
            name,
            status,
            service_packages:service_package_id(*)
          )
        `)
        .eq('status', 'paid')
        .is('distributed_at', null);

      for (const invoice of paidInvoices || []) {
        if (invoice.clients?.status === 'approved') {
          console.log(`Processing paid invoice for client: ${invoice.clients.name}`);
          
          // Activate the client service
          await activateClientService(invoice.client_id);
          
          // Mark invoice as distributed/completed
          await supabase
            .from('installation_invoices')
            .update({
              distributed_at: new Date().toISOString(),
              status: 'completed'
            })
            .eq('id', invoice.id);

          console.log(`Client ${invoice.clients.name} service activated after payment`);
        }
      }

      // Check for Family Bank payments that might need to be linked to invoices
      const { data: familyBankPayments } = await supabase
        .from('family_bank_payments')
        .select('*')
        .eq('status', 'verified')
        .is('invoice_number', null);

      // Try to match Family Bank payments to installation invoices by phone number
      for (const payment of familyBankPayments || []) {
        const { data: matchingInvoice } = await supabase
          .from('installation_invoices')
          .select(`
            *,
            clients(phone)
          `)
          .eq('status', 'pending')
          .eq('total_amount', payment.trans_amount);

        const phoneMatch = matchingInvoice?.find(inv => 
          inv.clients?.phone === payment.msisdn
        );

        if (phoneMatch) {
          // Link the payment to the invoice and mark as paid
          await supabase
            .from('installation_invoices')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_method: 'family_bank',
              payment_reference: payment.trans_id
            })
            .eq('id', phoneMatch.id);

          await supabase
            .from('family_bank_payments')
            .update({
              invoice_number: phoneMatch.invoice_number
            })
            .eq('id', payment.id);

          console.log(`Linked Family Bank payment ${payment.trans_id} to invoice ${phoneMatch.invoice_number}`);
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

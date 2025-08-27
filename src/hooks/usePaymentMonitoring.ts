
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
            service_packages(*)
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

      // Check for M-Pesa payments that might need to be linked to invoices
      const { data: mpesaPayments } = await supabase
        .from('mpesa_payments')
        .select('*')
        .eq('status', 'completed')
        .is('linked_invoice_id', null);

      // Try to match M-Pesa payments to installation invoices by phone number
      for (const payment of mpesaPayments || []) {
        const { data: matchingInvoice } = await supabase
          .from('installation_invoices')
          .select(`
            *,
            clients(phone)
          `)
          .eq('status', 'pending')
          .eq('total_amount', payment.amount);

        const phoneMatch = matchingInvoice?.find(inv => 
          inv.clients?.phone === payment.phone_number
        );

        if (phoneMatch) {
          // Link the payment to the invoice and mark as paid
          await supabase
            .from('installation_invoices')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              payment_method: 'mpesa',
              payment_reference: payment.mpesa_receipt_number
            })
            .eq('id', phoneMatch.id);

          await supabase
            .from('mpesa_payments')
            .update({
              linked_invoice_id: phoneMatch.id
            })
            .eq('id', payment.id);

          console.log(`Linked M-Pesa payment ${payment.mpesa_receipt_number} to invoice ${phoneMatch.invoice_number}`);
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

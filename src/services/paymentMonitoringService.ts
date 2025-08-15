
import { supabase } from '@/integrations/supabase/client';
import { clientActivationService } from './clientActivationService';
import { smartRenewalService } from './smartRenewalService';

interface PaymentEvent {
  client_id: string;
  amount: number;
  payment_method: string;
  reference_number: string;
  transaction_type: 'installation' | 'subscription' | 'wallet_topup';
}

class PaymentMonitoringService {
  private intervalId: NodeJS.Timeout | null = null;
  private isMonitoring = false;

  start(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting payment monitoring service...');
    
    // Monitor payments every 30 seconds
    this.intervalId = setInterval(() => {
      this.processRecentPayments();
    }, 30000);
    
    // Initial check
    this.processRecentPayments();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('Payment monitoring service stopped');
  }

  private async processRecentPayments(): Promise<void> {
    try {
      // Check for recent payments in the last 5 minutes
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      // Check M-Pesa payments
      const { data: mpesaPayments, error: mpesaError } = await supabase
        .from('mpesa_payments')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .eq('status', 'verified');

      if (mpesaError) {
        console.error('Error fetching M-Pesa payments:', mpesaError);
        return;
      }

      // Check Family Bank payments
      const { data: familyBankPayments, error: familyBankError } = await supabase
        .from('family_bank_payments')
        .select('*')
        .gte('created_at', fiveMinutesAgo)
        .eq('status', 'received');

      if (familyBankError) {
        console.error('Error fetching Family Bank payments:', familyBankError);
        return;
      }

      // Process M-Pesa payments
      for (const payment of mpesaPayments || []) {
        await this.processPayment({
          client_id: payment.client_id,
          amount: payment.amount,
          payment_method: 'mpesa',
          reference_number: payment.mpesa_receipt_number,
          transaction_type: this.determineTransactionType(payment),
        });
      }

      // Process Family Bank payments
      for (const payment of familyBankPayments || []) {
        await this.processPayment({
          client_id: payment.client_id,
          amount: payment.trans_amount,
          payment_method: 'family_bank',
          reference_number: payment.trans_id,
          transaction_type: this.determineTransactionType(payment),
        });
      }

    } catch (error) {
      console.error('Payment monitoring error:', error);
    }
  }

  private determineTransactionType(payment: any): 'installation' | 'subscription' | 'wallet_topup' {
    // Check if this is an installation payment
    if (payment.bill_ref_number && payment.bill_ref_number.startsWith('TRK-')) {
      return 'installation';
    }
    
    // For now, default to wallet top-up (most common case)
    return 'wallet_topup';
  }

  private async processPayment(payment: PaymentEvent): Promise<void> {
    console.log('Processing payment:', payment);

    try {
      switch (payment.transaction_type) {
        case 'installation':
          await this.processInstallationPayment(payment);
          break;
        case 'wallet_topup':
          await this.processWalletTopup(payment);
          break;
        case 'subscription':
          await this.processSubscriptionPayment(payment);
          break;
      }
    } catch (error) {
      console.error(`Error processing ${payment.transaction_type} payment:`, error);
    }
  }

  private async processInstallationPayment(payment: PaymentEvent): Promise<void> {
    try {
      // Find the installation invoice
      const { data: invoice, error } = await supabase
        .from('installation_invoices')
        .select(`
          *,
          clients (*)
        `)
        .eq('client_id', payment.client_id)
        .eq('status', 'pending')
        .single();

      if (error || !invoice) {
        console.log('No pending installation invoice found for client:', payment.client_id);
        return;
      }

      // Mark invoice as paid
      await supabase
        .from('installation_invoices')
        .update({
          status: 'paid',
          payment_method: payment.payment_method,
          payment_reference: payment.reference_number,
          paid_at: new Date().toISOString(),
        })
        .eq('id', invoice.id);

      // Activate client service
      const activationData = {
        client_id: payment.client_id,
        service_package_id: invoice.clients.service_package_id,
        monthly_rate: invoice.clients.monthly_rate,
        connection_type: invoice.clients.connection_type,
        client_data: invoice.clients,
      };

      const activationResult = await clientActivationService.activateClient(activationData);

      if (activationResult.success) {
        // Update workflow status
        await supabase.rpc('update_client_workflow_status', {
          p_client_id: payment.client_id,
          p_stage: 'service_active',
          p_stage_data: {
            activation_date: new Date().toISOString(),
            payment_reference: payment.reference_number,
          },
          p_notes: 'Service activated after installation payment confirmation',
        });

        console.log(`Client ${payment.client_id} service activated successfully`);
      }

    } catch (error) {
      console.error('Installation payment processing error:', error);
    }
  }

  private async processWalletTopup(payment: PaymentEvent): Promise<void> {
    try {
      // Add to client wallet
      const { error } = await supabase
        .from('clients')
        .update({
          wallet_balance: supabase.sql.literal(`wallet_balance + ${payment.amount}`),
        })
        .eq('id', payment.client_id);

      if (error) throw error;

      // Record wallet transaction
      await supabase
        .from('wallet_transactions')
        .insert({
          client_id: payment.client_id,
          transaction_type: 'credit',
          amount: payment.amount,
          description: `Wallet top-up via ${payment.payment_method}`,
          reference_number: payment.reference_number,
        });

      // Check if client can now afford subscription renewal
      const analysis = await smartRenewalService.analyzeClientWallet(payment.client_id);
      if (analysis && analysis.canAffordRenewal) {
        const renewalAction = await smartRenewalService.processSmartRenewal(analysis);
        console.log(`Smart renewal processed for client ${payment.client_id}:`, renewalAction);
      }

      console.log(`Wallet topped up for client ${payment.client_id}: KES ${payment.amount}`);

    } catch (error) {
      console.error('Wallet top-up processing error:', error);
    }
  }

  private async processSubscriptionPayment(payment: PaymentEvent): Promise<void> {
    try {
      // This would handle direct subscription payments
      // For now, we primarily use wallet-based renewals
      console.log('Direct subscription payment processed:', payment);
    } catch (error) {
      console.error('Subscription payment processing error:', error);
    }
  }
}

export const paymentMonitoringService = new PaymentMonitoringService();

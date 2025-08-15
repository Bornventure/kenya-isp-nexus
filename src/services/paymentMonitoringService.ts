
import { supabase } from '@/integrations/supabase/client';

interface PaymentMonitoringRule {
  client_id: string;
  rule_type: string;
  threshold_amount?: number;
  threshold_days?: number;
  is_active: boolean;
}

class PaymentMonitoringService {
  private checkInterval: NodeJS.Timeout | null = null;

  startMonitoring(): void {
    if (this.checkInterval) return;

    console.log('Starting payment monitoring service...');
    
    this.checkInterval = setInterval(() => {
      this.performChecks();
    }, 60000 * 60); // Check every hour

    // Initial check
    this.performChecks();
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    console.log('Payment monitoring service stopped');
  }

  private async performChecks(): Promise<void> {
    try {
      await this.checkOverduePayments();
      await this.checkLowBalances();
    } catch (error) {
      console.error('Payment monitoring check failed:', error);
    }
  }

  private async checkOverduePayments(): Promise<void> {
    try {
      // Check for clients with overdue invoices
      const { data: overdueInvoices, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());

      if (error) {
        console.error('Error fetching overdue invoices:', error);
        return;
      }

      for (const invoice of overdueInvoices || []) {
        await this.handleOverduePayment(invoice);
      }
    } catch (error) {
      console.error('Error checking overdue payments:', error);
    }
  }

  private async checkLowBalances(): Promise<void> {
    try {
      // Check for clients with low wallet balances
      const { data: lowBalanceClients, error } = await supabase
        .from('clients')
        .select('*')
        .lt('wallet_balance', 100); // Less than 100 KES

      if (error) {
        console.error('Error fetching low balance clients:', error);
        return;
      }

      for (const client of lowBalanceClients || []) {
        await this.handleLowBalance(client);
      }
    } catch (error) {
      console.error('Error checking low balances:', error);
    }
  }

  private async handleOverduePayment(invoice: any): Promise<void> {
    console.log(`Processing overdue payment for invoice ${invoice.invoice_number}`);
    
    try {
      // Send notification
      await supabase.functions.invoke('send-auto-notifications', {
        body: {
          client_id: invoice.client_id,
          type: 'overdue_payment',
          data: {
            invoice_number: invoice.invoice_number,
            amount: invoice.total_amount,
            due_date: invoice.due_date,
          }
        }
      });

      // Update audit log
      await supabase
        .from('audit_logs')
        .insert({
          action: 'overdue_payment_notification',
          resource: 'invoice',
          resource_id: invoice.id,
          user_id: null,
          changes: {
            invoice_number: invoice.invoice_number,
            amount: invoice.total_amount,
          } as any,
        });

    } catch (error) {
      console.error('Error handling overdue payment:', error);
    }
  }

  private async handleLowBalance(client: any): Promise<void> {
    console.log(`Processing low balance notification for client ${client.name}`);
    
    try {
      // Send low balance notification
      await supabase.functions.invoke('send-auto-notifications', {
        body: {
          client_id: client.id,
          type: 'low_balance',
          data: {
            client_name: client.name,
            current_balance: client.wallet_balance,
            recommended_topup: 500,
          }
        }
      });

    } catch (error) {
      console.error('Error handling low balance:', error);
    }
  }

  async setupMonitoringRules(clientId: string, rules: PaymentMonitoringRule[]): Promise<void> {
    try {
      // Log monitoring rules setup in audit_logs since payment_monitoring_rules table doesn't exist
      console.log(`Setting up monitoring rules for client ${clientId}:`, rules);
      
      await supabase
        .from('audit_logs')
        .insert({
          action: 'setup_payment_monitoring',
          resource: 'client',
          resource_id: clientId,
          changes: { rules } as any,
        });

    } catch (error) {
      console.error('Error setting up monitoring rules:', error);
      throw error;
    }
  }

  async getPaymentHistory(clientId: string, limit: number = 10): Promise<any[]> {
    try {
      // Get payment history from invoices and family bank payments
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (invoicesError) {
        console.error('Error fetching payment history:', invoicesError);
        return [];
      }

      return invoices || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  async processPaymentReceived(paymentData: any): Promise<void> {
    try {
      console.log('Processing payment received:', paymentData);
      
      // Send payment confirmation
      await supabase.functions.invoke('send-auto-notifications', {
        body: {
          client_id: paymentData.client_id,
          type: 'payment_received',
          data: {
            amount: paymentData.amount,
            reference: paymentData.reference,
            timestamp: new Date().toISOString(),
          }
        }
      });

    } catch (error) {
      console.error('Error processing payment received:', error);
    }
  }
}

export const paymentMonitoringService = new PaymentMonitoringService();

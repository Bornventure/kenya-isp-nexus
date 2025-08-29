
import { supabase } from '@/integrations/supabase/client';
import { smsService } from '@/services/smsService';
import { clientActivationService } from '@/services/clientActivationService';

export interface PaymentActivationData {
  clientId: string;
  paymentId: string;
  amount: number;
  paymentMethod: 'mpesa' | 'family_bank' | 'cash' | 'bank_transfer';
  referenceNumber: string;
  mpesaReceiptNumber?: string;
}

export class PaymentActivationService {
  async processPaymentActivation(data: PaymentActivationData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting payment activation process for client:', data.clientId);

      // 1. Get client and invoice details
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (
            id,
            name,
            monthly_rate,
            setup_fee
          )
        `)
        .eq('id', data.clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // 2. Update installation invoice status to paid
      const { error: invoiceError } = await supabase
        .from('installation_invoices')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: data.paymentMethod,
          payment_reference: data.referenceNumber
        })
        .eq('client_id', data.clientId)
        .eq('status', 'pending');

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
        throw new Error('Failed to update invoice status');
      }

      // 3. Activate client account
      const activationResult = await clientActivationService.activateClient({
        clientId: data.clientId,
        servicePackageId: client.service_package_id || '',
        companyId: client.isp_company_id
      });

      if (!activationResult.success) {
        throw new Error(activationResult.message);
      }

      // 4. Update client status to active and set subscription dates
      const subscriptionEndDate = new Date();
      subscriptionEndDate.setDate(subscriptionEndDate.getDate() + 30); // 30 days from now

      const { error: statusError } = await supabase
        .from('clients')
        .update({
          status: 'active',
          service_activated_at: new Date().toISOString(),
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: subscriptionEndDate.toISOString(),
          installation_status: 'completed'
        })
        .eq('id', data.clientId);

      if (statusError) {
        console.error('Error updating client status:', statusError);
        throw new Error('Failed to update client status');
      }

      // 5. Generate client portal credentials
      const portalCredentials = await this.generateClientPortalCredentials(client);

      // 6. Send activation SMS with portal credentials
      await this.sendActivationNotifications(client, portalCredentials, data);

      // 7. Create initial network session record (for simulation)
      await this.createInitialNetworkSession(data.clientId, client.isp_company_id);

      console.log('Payment activation completed successfully for client:', client.name);

      return {
        success: true,
        message: `Client ${client.name} has been successfully activated. SMS notifications sent with portal access details.`
      };

    } catch (error) {
      console.error('Payment activation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment activation failed'
      };
    }
  }

  private async generateClientPortalCredentials(client: any) {
    // Generate temporary password for first login
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Create a temporary client record for portal authentication
    // In production, you might want to create a separate client_portal_auth table
    const clientAuthData = {
      client_id: client.id,
      temp_password: tempPassword,
      setup_required: true,
      email: client.email,
      created_at: new Date().toISOString()
    };

    console.log('Generated portal credentials for client:', client.id);

    return {
      email: client.email,
      temporaryPassword: tempPassword,
      portalUrl: `${window.location.origin}/client-portal`
    };
  }

  private async sendActivationNotifications(client: any, credentials: any, paymentData: PaymentActivationData) {
    const activationMessage = `Congratulations ${client.name}! Your internet service has been activated. Payment of KES ${paymentData.amount} received (Ref: ${paymentData.referenceNumber}). Access your client portal: ${credentials.portalUrl} Email: ${credentials.email} Temp Password: ${credentials.temporaryPassword} Change password on first login.`;

    // Send SMS using Celcomafrica
    await smsService.sendSMS(client.phone, activationMessage);

    // Also send welcome email if email exists
    if (client.email) {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: client.id,
          type: 'service_activation',
          data: {
            portalUrl: credentials.portalUrl,
            email: credentials.email,
            temporaryPassword: credentials.temporaryPassword,
            paymentAmount: paymentData.amount,
            paymentReference: paymentData.referenceNumber
          }
        }
      });
    }
  }

  private async createInitialNetworkSession(clientId: string, companyId: string) {
    // Create initial simulated session data that will be replaced by real RADIUS data
    const { error } = await supabase
      .from('active_sessions')
      .insert({
        client_id: clientId,
        username: `client_${clientId.substring(0, 8)}`,
        nas_ip_address: '192.168.1.1', // Simulated - will be replaced by real MikroTik data
        framed_ip_address: `10.0.0.${Math.floor(Math.random() * 254) + 1}`, // Simulated IP
        session_start: new Date().toISOString(),
        calling_station_id: 'SIMULATED_MAC',
        isp_company_id: companyId
      });

    if (error) {
      console.error('Error creating initial session:', error);
    }
  }
}

export const paymentActivationService = new PaymentActivationService();

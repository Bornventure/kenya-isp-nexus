import { supabase } from '@/integrations/supabase/client';
import { createRadiusUser, provisionClientOnMikroTik, updateClientProfile } from './clientOnboardingService';

export interface ClientActivationData {
  client_id: string;
  service_package_id?: string;
  monthly_rate: number;
  connection_type: string;
  client_data: any;
}

class ClientActivationService {
  async activateClient(data: ClientActivationData): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Starting full client activation process...', data);

      // Step 1: Create RADIUS user
      const radiusUser = await createRadiusUser(data.client_data);
      console.log('RADIUS user created:', radiusUser.username);

      // Step 2: Provision MikroTik
      await provisionClientOnMikroTik({
        ...data.client_data,
        username: radiusUser.username,
        password: radiusUser.password,
      });
      console.log('MikroTik provisioning completed');

      // Step 3: Update client profile
      await updateClientProfile(data.client_id, {
        status: 'active',
        service_activated_at: new Date().toISOString(),
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      });

      // Step 4: Send welcome SMS
      await this.sendWelcomeSMS(data.client_data);

      // Step 5: Start network monitoring
      const { liveNetworkMonitoringService } = await import('./liveNetworkMonitoringService');
      liveNetworkMonitoringService.addClientToMonitoring(data.client_id);

      // Step 6: Initialize wallet monitoring
      await this.setupWalletMonitoring(data.client_id, data.monthly_rate);

      return {
        success: true,
        message: 'Client activated successfully with full automation'
      };

    } catch (error) {
      console.error('Client activation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Activation failed'
      };
    }
  }

  private async sendWelcomeSMS(clientData: any): Promise<void> {
    try {
      await supabase.functions.invoke('send-auto-notifications', {
        body: {
          client_id: clientData.id,
          trigger_event: 'account_created',
          data: {
            client_name: clientData.name,
            package_name: clientData.service_packages?.name || 'Internet Service',
          }
        }
      });
    } catch (error) {
      console.error('Welcome SMS failed:', error);
    }
  }

  private async setupWalletMonitoring(clientId: string, monthlyRate: number): Promise<void> {
    try {
      // Create wallet monitoring rules
      await supabase
        .from('wallet_monitoring_rules')
        .insert([
          {
            client_id: clientId,
            rule_type: 'low_balance',
            threshold_amount: monthlyRate,
            threshold_days: 3,
            is_active: true,
          },
          {
            client_id: clientId,
            rule_type: 'auto_renewal',
            threshold_amount: monthlyRate,
            threshold_days: 0,
            is_active: true,
          }
        ]);

      console.log(`Wallet monitoring rules created for client ${clientId}`);
    } catch (error) {
      console.error('Wallet monitoring setup failed:', error);
    }
  }
}

export const clientActivationService = new ClientActivationService();

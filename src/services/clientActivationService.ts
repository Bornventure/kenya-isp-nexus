import { supabase } from '@/integrations/supabase/client';

interface PaymentMonitoringRule {
  client_id: string;
  rule_type: string;
  threshold_amount?: number;
  threshold_days?: number;
  is_active: boolean;
}

export class ClientActivationService {
  async deactivateClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Starting client deactivation for ${clientId}`);

      // Update client status to disconnected
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          status: 'disconnected',
          is_active: false,
        })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating client status:', updateError);
        return false;
      }

      // Log deactivation
      await supabase
        .from('audit_logs')
        .insert({
          action: 'client_deactivated',
          resource: 'client',
          resource_id: clientId,
          changes: {
            status: 'disconnected',
            is_active: false,
          },
        });

      console.log(`Client ${clientId} deactivated successfully`);
      return true;

    } catch (error) {
      console.error('Error deactivating client:', error);
      return false;
    }
  }

  async activateClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Starting client activation for ${clientId}`);

      // Update client status to active
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          status: 'active',
          service_activated_at: new Date().toISOString(),
        })
        .eq('id', clientId);

      if (updateError) {
        console.error('Error updating client status:', updateError);
        return false;
      }

      // Set up payment monitoring rules (insert one at a time)
      const rules = [
        {
          client_id: clientId,
          rule_type: 'overdue_payment',
          threshold_amount: 0,
          threshold_days: 7,
          is_active: true,
        },
        {
          client_id: clientId,
          rule_type: 'low_balance',
          threshold_amount: 100,
          threshold_days: 0,
          is_active: true,
        }
      ];

      // Insert rules individually since batch insert is having issues
      for (const rule of rules) {
        const { error: ruleError } = await supabase
          .from('payment_monitoring_rules')
          .insert({
            ...rule,
            isp_company_id: await this.getCurrentUserCompanyId(),
          });

        if (ruleError) {
          console.error('Error inserting payment monitoring rule:', ruleError);
          // Continue with other rules even if one fails
        }
      }

      // Send activation notification
      await supabase.functions.invoke('send-auto-notifications', {
        body: {
          client_id: clientId,
          type: 'service_activated',
          data: {
            activation_date: new Date().toISOString(),
          }
        }
      });

      // Log activation
      await supabase
        .from('audit_logs')
        .insert({
          action: 'client_activated',
          resource: 'client',
          resource_id: clientId,
          changes: {
            status: 'active',
            activated_at: new Date().toISOString(),
          },
        });

      console.log(`Client ${clientId} activated successfully`);
      return true;

    } catch (error) {
      console.error('Error activating client:', error);
      return false;
    }
  }

  private async getCurrentUserCompanyId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('isp_company_id')
      .eq('id', user.id)
      .single();
    
    return profile?.isp_company_id || '';
  }
}

export const clientActivationService = new ClientActivationService();

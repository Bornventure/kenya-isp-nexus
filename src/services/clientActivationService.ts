
import { supabase } from '@/integrations/supabase/client';

export interface ClientActivationData {
  clientId: string;
  equipmentId?: string;
  activationNotes?: string;
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

  async activateClient(clientId: string): Promise<{ success: boolean; message?: string }> {
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
        return { success: false, message: 'Failed to update client status' };
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
      return { success: true, message: 'Client activated successfully' };

    } catch (error) {
      console.error('Error activating client:', error);
      return { success: false, message: 'Activation failed due to an error' };
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

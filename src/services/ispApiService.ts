
import { AuthService } from './api/authService';
import { supabase } from '@/integrations/supabase/client';

type ClientStatus = 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved';

export class ISPApiService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async createClient(clientData: any) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .insert(clientData)
        .select()
        .single();

      if (error) throw error;

      // Send SMS notification
      await this.authService.sendClientWelcomeSMS(data.phone, {
        name: data.name,
        package: clientData.package_name || 'Standard'
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating client:', error);
      return { success: false, error: error.message };
    }
  }

  async updateClientStatus(clientId: string, status: ClientStatus, reason?: string) {
    try {
      const { data, error } = await supabase
        .from('clients')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) throw error;

      // Send status change SMS
      await this.authService.sendClientStatusSMS(data.phone, {
        name: data.name,
        status,
        reason
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating client status:', error);
      return { success: false, error: error.message };
    }
  }
}

export const ispApiService = new ISPApiService();

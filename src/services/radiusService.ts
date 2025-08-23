
import { supabase } from '@/integrations/supabase/client';

export interface RadiusUser {
  id: string;
  username: string;
  password: string;
  profile: string;
  status: string;
  client_id?: string;
  isp_company_id: string;
  created_at?: string;
  updated_at?: string;
}

class RadiusService {
  async createUser(userData: Omit<RadiusUser, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .insert(userData);

      if (error) {
        console.error('Error creating RADIUS user:', error);
        return false;
      }

      console.log('RADIUS user created successfully');
      return true;
    } catch (error) {
      console.error('Error in RADIUS service:', error);
      return false;
    }
  }

  async createRadiusUser(clientId: string, companyId: string): Promise<boolean> {
    try {
      // Get client details first
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        console.error('Error fetching client:', clientError);
        return false;
      }

      const userData = {
        username: client.email || client.phone,
        password: this.generateSecurePassword(),
        profile: 'default',
        status: 'active',
        client_id: clientId,
        isp_company_id: companyId
      };

      return await this.createUser(userData);
    } catch (error) {
      console.error('Error creating RADIUS user:', error);
      return false;
    }
  }

  async updateUser(userId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating RADIUS user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating RADIUS user:', error);
      return false;
    }
  }

  async updateRadiusUser(userId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    return this.updateUser(userId, updates);
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Error deleting RADIUS user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting RADIUS user:', error);
      return false;
    }
  }

  async deleteRadiusUser(userId: string): Promise<boolean> {
    return this.deleteUser(userId);
  }

  async disconnectUser(username: string, companyId: string): Promise<boolean> {
    try {
      console.log(`Disconnecting RADIUS user: ${username}`);
      
      // Remove from active sessions
      const { error } = await supabase
        .from('active_sessions')
        .delete()
        .eq('username', username)
        .eq('isp_company_id', companyId);

      if (error) {
        console.error('Error disconnecting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return false;
    }
  }

  async getActiveSessions(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('isp_company_id', companyId);

      if (error) {
        console.error('Error fetching active sessions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  async logAccountingData(accountingData: {
    username: string;
    nas_ip_address: string;
    session_id: string;
    session_time: number;
    input_octets: number;
    output_octets: number;
    terminate_cause: string;
    client_id?: string;
    isp_company_id: string;
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_accounting')
        .insert(accountingData);

      if (error) {
        console.error('Error logging accounting data:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging accounting data:', error);
      return false;
    }
  }

  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export const radiusService = new RadiusService();


import { supabase } from '@/integrations/supabase/client';

export interface RadiusUser {
  id: string;
  client_id: string;
  username: string;
  password: string;
  group_name: string;
  max_upload: string;
  max_download: string;
  expiration?: string;
  is_active: boolean;
  isp_company_id?: string;
  created_at?: string;
  updated_at?: string;
}

class RadiusService {
  async createUser(userData: RadiusUser): Promise<boolean> {
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

  async createRadiusUser(clientId: string): Promise<boolean> {
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

      const userData: Partial<RadiusUser> = {
        client_id: clientId,
        username: client.email || client.phone,
        password: this.generateSecurePassword(),
        group_name: 'default',
        max_upload: '10M',
        max_download: '10M',
        is_active: true,
        isp_company_id: client.isp_company_id
      };

      return await this.createUser(userData as RadiusUser);
    } catch (error) {
      console.error('Error creating RADIUS user:', error);
      return false;
    }
  }

  async updateUser(clientId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .update(updates)
        .eq('client_id', clientId);

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

  async updateRadiusUser(clientId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    return this.updateUser(clientId, updates);
  }

  async deleteUser(clientId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .delete()
        .eq('client_id', clientId);

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

  async deleteRadiusUser(clientId: string): Promise<boolean> {
    return this.deleteUser(clientId);
  }

  async disconnectUser(username: string): Promise<boolean> {
    try {
      // In production, this would send actual disconnect command to RADIUS/NAS
      console.log(`Disconnecting RADIUS user: ${username}`);
      
      // Update any active sessions to disconnected
      await (supabase as any)
        .from('network_sessions')
        .update({ status: 'disconnected' })
        .eq('username', username)
        .eq('status', 'active');

      return true;
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return false;
    }
  }

  async getActiveSessions(): Promise<any[]> {
    try {
      const { data, error } = await (supabase as any)
        .from('network_sessions')
        .select('*')
        .eq('status', 'active');

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


import { supabase } from '@/integrations/supabase/client';
import { RadiusUser, RadiusAccountingRecord } from '@/types/radius';

interface ServiceResult {
  success: boolean;
  message: string;
  data?: any;
}

class RadiusService {
  async createUser(userData: {
    username: string;
    password: string;
    profile: string;
    status: string;
    client_id?: string;
    isp_company_id: string;
  }): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase
        .rpc('create_radius_user', {
          p_username: userData.username,
          p_password: userData.password,
          p_profile: userData.profile,
          p_status: userData.status,
          p_client_id: userData.client_id,
          p_company_id: userData.isp_company_id
        });

      if (error) {
        console.error('Error creating RADIUS user:', error);
        return {
          success: false,
          message: `Database error: ${error.message}`
        };
      }

      console.log('RADIUS user created successfully:', data);
      return {
        success: true,
        message: 'RADIUS user created successfully',
        data
      };
    } catch (error) {
      console.error('Error in RADIUS service:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async createRadiusUser(clientId: string, companyId: string): Promise<ServiceResult> {
    try {
      // Get client details first
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        console.error('Error fetching client:', clientError);
        return {
          success: false,
          message: 'Client not found'
        };
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
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateUser(userId: string, updates: Partial<RadiusUser>): Promise<ServiceResult> {
    try {
      const { data, error } = await supabase
        .rpc('update_radius_user', {
          p_user_id: userId,
          p_username: updates.username,
          p_password: updates.password,
          p_profile: updates.profile,
          p_status: updates.status,
          p_client_id: updates.client_id
        });

      if (error) {
        console.error('Error updating RADIUS user:', error);
        return {
          success: false,
          message: `Update failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'RADIUS user updated successfully',
        data
      };
    } catch (error) {
      console.error('Error updating RADIUS user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateRadiusUser(userId: string, updates: Partial<RadiusUser>): Promise<ServiceResult> {
    return this.updateUser(userId, updates);
  }

  async deleteUser(userId: string): Promise<ServiceResult> {
    try {
      const { error } = await supabase
        .rpc('delete_radius_user', {
          p_user_id: userId
        });

      if (error) {
        console.error('Error deleting RADIUS user:', error);
        return {
          success: false,
          message: `Delete failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'RADIUS user deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting RADIUS user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteRadiusUser(userId: string): Promise<ServiceResult> {
    return this.deleteUser(userId);
  }

  async disconnectUser(username: string, companyId: string): Promise<ServiceResult> {
    try {
      console.log(`Disconnecting RADIUS user: ${username}`);
      
      const { error } = await supabase
        .rpc('disconnect_user_sessions', {
          p_username: username,
          p_company_id: companyId
        });

      if (error) {
        console.error('Error disconnecting user:', error);
        return {
          success: false,
          message: `Disconnect failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: `User ${username} disconnected successfully`
      };
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getActiveSessions(companyId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_active_sessions_for_company', {
          company_id: companyId
        });

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
  }): Promise<ServiceResult> {
    try {
      const { error } = await supabase
        .rpc('log_radius_accounting', {
          p_username: accountingData.username,
          p_nas_ip: accountingData.nas_ip_address,
          p_session_id: accountingData.session_id,
          p_session_time: accountingData.session_time,
          p_input_octets: accountingData.input_octets,
          p_output_octets: accountingData.output_octets,
          p_terminate_cause: accountingData.terminate_cause,
          p_client_id: accountingData.client_id,
          p_company_id: accountingData.isp_company_id
        });

      if (error) {
        console.error('Error logging accounting data:', error);
        return {
          success: false,
          message: `Accounting log failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'Accounting data logged successfully'
      };
    } catch (error) {
      console.error('Error logging accounting data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
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

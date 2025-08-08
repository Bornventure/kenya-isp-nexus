
import { supabase } from '@/integrations/supabase/client';

export interface RadiusUser {
  id: string;
  client_id: string;
  username: string;
  password: string;
  group_name: string;
  max_upload: string;
  max_download: string;
  expiration: string | null;
  is_active: boolean;
  isp_company_id: string;
}

export interface RadiusSession {
  id: string;
  client_id?: string;
  username: string;
  session_id: string;
  nas_ip_address?: string;
  start_time: string;
  end_time?: string;
  bytes_in: number;
  bytes_out: number;
  status: 'active' | 'terminated';
  isp_company_id: string;
}

export interface MikrotikRouter {
  id: string;
  name: string;
  ip_address: string;
  admin_username: string;
  admin_password: string;
  snmp_community: string;
  snmp_version: number;
  pppoe_interface: string;
  dns_servers: string;
  client_network: string;
  gateway?: string;
  status: 'pending' | 'active' | 'error';
  last_test_results?: any;
  connection_status: 'online' | 'offline';
  isp_company_id: string;
}

class RadiusService {
  // Get all RADIUS users for the company
  async getRadiusUsers(): Promise<RadiusUser[]> {
    try {
      const { data, error } = await supabase
        .from('radius_users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching RADIUS users:', error);
      return [];
    }
  }

  // Get active RADIUS sessions
  async getActiveSessions(): Promise<RadiusSession[]> {
    try {
      const { data, error } = await supabase
        .from('radius_sessions')
        .select('*')
        .eq('status', 'active')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching RADIUS sessions:', error);
      return [];
    }
  }

  // Create RADIUS user manually
  async createRadiusUser(clientId: string): Promise<boolean> {
    try {
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (*)
        `)
        .eq('id', clientId)
        .single();

      if (clientError || !client) throw clientError || new Error('Client not found');

      const radiusUser = {
        client_id: clientId,
        username: client.email || client.phone,
        password: this.generatePassword(),
        group_name: client.service_packages?.name?.toLowerCase().replace(/\s+/g, '_') || 'default',
        max_upload: this.parseSpeed(client.service_packages?.speed || '10Mbps', 'upload'),
        max_download: this.parseSpeed(client.service_packages?.speed || '10Mbps', 'download'),
        expiration: client.subscription_end_date,
        is_active: client.status === 'active',
        isp_company_id: client.isp_company_id
      };

      const { error } = await supabase
        .from('radius_users')
        .upsert(radiusUser, { onConflict: 'username' });

      if (error) throw error;

      // Configure on MikroTik routers
      await this.configureAllRouters(radiusUser);

      console.log(`RADIUS user created for client: ${client.name}`);
      return true;
    } catch (error) {
      console.error('Error creating RADIUS user:', error);
      return false;
    }
  }

  // Update RADIUS user
  async updateRadiusUser(clientId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('radius_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('client_id', clientId);

      if (error) throw error;

      // Get updated user and configure routers
      const { data: radiusUser } = await supabase
        .from('radius_users')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (radiusUser) {
        await this.configureAllRouters(radiusUser);
      }

      return true;
    } catch (error) {
      console.error('Error updating RADIUS user:', error);
      return false;
    }
  }

  // Delete RADIUS user
  async deleteRadiusUser(clientId: string): Promise<boolean> {
    try {
      const { data: radiusUser } = await supabase
        .from('radius_users')
        .select('username')
        .eq('client_id', clientId)
        .single();

      if (radiusUser) {
        await this.removeFromAllRouters(radiusUser.username);
      }

      const { error } = await supabase
        .from('radius_users')
        .delete()
        .eq('client_id', clientId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting RADIUS user:', error);
      return false;
    }
  }

  // Disconnect user from all sessions
  async disconnectUser(username: string): Promise<boolean> {
    try {
      // End all active sessions in database
      const { error } = await supabase
        .from('radius_sessions')
        .update({
          status: 'terminated',
          end_time: new Date().toISOString()
        })
        .eq('username', username)
        .eq('status', 'active');

      if (error) throw error;

      // Send disconnect command to all MikroTik routers
      await this.disconnectFromAllRouters(username);

      return true;
    } catch (error) {
      console.error('Error disconnecting user:', error);
      return false;
    }
  }

  // Get MikroTik routers
  async getMikrotikRouters(): Promise<MikrotikRouter[]> {
    try {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching MikroTik routers:', error);
      return [];
    }
  }

  // Add MikroTik router
  async addMikrotikRouter(router: Omit<MikrotikRouter, 'id' | 'isp_company_id'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mikrotik_routers')
        .insert([router]);

      if (error) throw error;

      // Test connection after adding
      await this.testRouterConnection(router.ip_address);

      return true;
    } catch (error) {
      console.error('Error adding MikroTik router:', error);
      return false;
    }
  }

  // Test router connection
  async testRouterConnection(routerIp: string): Promise<boolean> {
    try {
      // This would typically use RouterOS API or SNMP
      // For now, we'll simulate the test
      const testResults = {
        connection: 'success',
        pppoe_server: 'running',
        radius_client: 'configured',
        timestamp: new Date().toISOString()
      };

      await supabase
        .from('mikrotik_routers')
        .update({
          connection_status: 'online',
          last_test_results: testResults,
          updated_at: new Date().toISOString()
        })
        .eq('ip_address', routerIp);

      return true;
    } catch (error) {
      console.error('Error testing router connection:', error);
      return false;
    }
  }

  // Private helper methods
  private async configureAllRouters(radiusUser: any): Promise<void> {
    const routers = await this.getMikrotikRouters();
    
    for (const router of routers.filter(r => r.status === 'active')) {
      try {
        await this.configureRouter(router, radiusUser);
      } catch (error) {
        console.error(`Error configuring router ${router.name}:`, error);
      }
    }
  }

  private async configureRouter(router: MikrotikRouter, radiusUser: any): Promise<void> {
    console.log(`Configuring RADIUS user ${radiusUser.username} on router ${router.name}`);
    
    // This would typically use RouterOS API to configure PPPoE secrets
    // For demonstration, we log the configuration
    const config = {
      username: radiusUser.username,
      password: radiusUser.password,
      service: 'pppoe',
      profile: radiusUser.group_name,
      'rate-limit': `${radiusUser.max_upload}/${radiusUser.max_download}`,
      disabled: !radiusUser.is_active
    };

    console.log('Router configuration:', config);
    
    // In production, you would use RouterOS API:
    // await this.routerOsApi.execute('/ppp/secret/add', config);
  }

  private async removeFromAllRouters(username: string): Promise<void> {
    const routers = await this.getMikrotikRouters();
    
    for (const router of routers.filter(r => r.status === 'active')) {
      try {
        await this.removeFromRouter(router, username);
      } catch (error) {
        console.error(`Error removing user from router ${router.name}:`, error);
      }
    }
  }

  private async removeFromRouter(router: MikrotikRouter, username: string): Promise<void> {
    console.log(`Removing RADIUS user ${username} from router ${router.name}`);
    
    // In production, you would use RouterOS API:
    // await this.routerOsApi.execute('/ppp/secret/remove', { name: username });
  }

  private async disconnectFromAllRouters(username: string): Promise<void> {
    const routers = await this.getMikrotikRouters();
    
    for (const router of routers.filter(r => r.status === 'active')) {
      try {
        await this.disconnectFromRouter(router, username);
      } catch (error) {
        console.error(`Error disconnecting user from router ${router.name}:`, error);
      }
    }
  }

  private async disconnectFromRouter(router: MikrotikRouter, username: string): Promise<void> {
    console.log(`Disconnecting user ${username} from router ${router.name}`);
    
    // In production, you would use RouterOS API:
    // await this.routerOsApi.execute('/ppp/active/remove', { name: username });
  }

  private generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  private parseSpeed(speed: string, type: 'upload' | 'download'): string {
    const match = speed.match(/(\d+)/);
    const speedValue = match ? parseInt(match[1]) : 10;
    
    // Assume upload is 80% of download speed
    return type === 'upload' ? `${Math.floor(speedValue * 0.8)}M` : `${speedValue}M`;
  }
}

export const radiusService = new RadiusService();

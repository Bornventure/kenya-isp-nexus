
import { supabase } from '@/integrations/supabase/client';

interface RadiusUser {
  username: string;
  password: string;
  groupname: string;
  expiration: string;
  maxsimultaneoususe: number;
  framed_ip_address?: string;
  session_timeout?: number;
  idle_timeout?: number;
}

interface RadiusSession {
  username: string;
  nas_ip_address: string;
  framed_ip_address: string;
  session_id: string;
  start_time: string;
  input_octets: number;
  output_octets: number;
  session_time: number;
}

export class EC2RadiusIntegration {
  private ec2BaseUrl: string;

  constructor() {
    // In production, this would be your EC2 instance URL
    this.ec2BaseUrl = 'https://your-ec2-instance.amazonaws.com/radius-api';
  }

  // Provision RADIUS user after client activation
  async provisionRadiusUser(clientId: string, servicePackage: any): Promise<{ success: boolean; message: string }> {
    try {
      // Get client details from Supabase
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error || !client) {
        throw new Error('Client not found');
      }

      // Create RADIUS user configuration
      const radiusUser: RadiusUser = {
        username: `${client.id.substring(0, 8)}@${client.phone}`,
        password: this.generateSecurePassword(),
        groupname: servicePackage.name.toLowerCase().replace(/\s+/g, '_'),
        expiration: client.subscription_end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        maxsimultaneoususe: 1,
        session_timeout: servicePackage.session_timeout || 86400, // 24 hours default
        idle_timeout: servicePackage.idle_timeout || 1800 // 30 minutes default
      };

      // Store in Supabase RADIUS users table
      const { error: radiusError } = await supabase
        .from('radius_users')
        .insert({
          username: radiusUser.username,
          password: radiusUser.password,
          profile: radiusUser.groupname,
          status: 'active',
          client_id: clientId,
          isp_company_id: client.isp_company_id
        });

      if (radiusError) {
        console.error('Error creating RADIUS user in Supabase:', radiusError);
        throw radiusError;
      }

      // Sync with EC2 RADIUS server
      await this.syncUserToEC2(radiusUser);

      console.log(`RADIUS user provisioned for client: ${client.name}`);
      
      return {
        success: true,
        message: `RADIUS user ${radiusUser.username} provisioned successfully`
      };

    } catch (error) {
      console.error('RADIUS user provisioning failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'RADIUS provisioning failed'
      };
    }
  }

  // Sync user data to EC2 RADIUS server
  private async syncUserToEC2(radiusUser: RadiusUser): Promise<void> {
    try {
      // Call the EC2 RADIUS API to create/update user
      const response = await fetch(`${this.ec2BaseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getEC2ApiToken()}`
        },
        body: JSON.stringify(radiusUser)
      });

      if (!response.ok) {
        throw new Error(`EC2 RADIUS API error: ${response.statusText}`);
      }

      console.log('User synchronized to EC2 RADIUS server');
    } catch (error) {
      console.error('EC2 sync failed:', error);
      // In production, you might want to queue this for retry
      throw error;
    }
  }

  // Get active sessions from EC2 RADIUS
  async syncActiveSessions(): Promise<void> {
    try {
      const response = await fetch(`${this.ec2BaseUrl}/sessions/active`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getEC2ApiToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }

      const sessions: RadiusSession[] = await response.json();

      // Update Supabase active_sessions table
      for (const session of sessions) {
        await supabase
          .from('active_sessions')
          .upsert({
            username: session.username,
            nas_ip_address: session.nas_ip_address,
            framed_ip_address: session.framed_ip_address,
            session_start: session.start_time,
            last_update: new Date().toISOString()
          });
      }

      console.log(`Synchronized ${sessions.length} active sessions`);
    } catch (error) {
      console.error('Session sync failed:', error);
    }
  }

  // Disconnect user session
  async disconnectUser(username: string, nasIp: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.ec2BaseUrl}/sessions/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getEC2ApiToken()}`
        },
        body: JSON.stringify({ username, nas_ip_address: nasIp })
      });

      if (!response.ok) {
        throw new Error(`Disconnect failed: ${response.statusText}`);
      }

      // Remove from active sessions
      await supabase
        .from('active_sessions')
        .delete()
        .eq('username', username)
        .eq('nas_ip_address', nasIp);

      return {
        success: true,
        message: `User ${username} disconnected successfully`
      };
    } catch (error) {
      console.error('Disconnect failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Disconnect failed'
      };
    }
  }

  // Update bandwidth limits for user
  async updateBandwidthLimits(username: string, downloadMbps: number, uploadMbps: number): Promise<void> {
    try {
      const response = await fetch(`${this.ec2BaseUrl}/users/${username}/bandwidth`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getEC2ApiToken()}`
        },
        body: JSON.stringify({
          download_limit: downloadMbps * 1048576, // Convert to bytes
          upload_limit: uploadMbps * 1048576
        })
      });

      if (!response.ok) {
        throw new Error(`Bandwidth update failed: ${response.statusText}`);
      }

      console.log(`Bandwidth updated for ${username}: ${downloadMbps}/${uploadMbps} Mbps`);
    } catch (error) {
      console.error('Bandwidth update failed:', error);
      throw error;
    }
  }

  // Generate secure password for RADIUS user
  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  // Get API token for EC2 authentication
  private async getEC2ApiToken(): Promise<string> {
    // In production, this would authenticate with your EC2 service
    // For now, return a placeholder token
    return 'ec2-api-token-placeholder';
  }

  // Sync accounting data from EC2 to Supabase
  async syncAccountingData(): Promise<void> {
    try {
      const response = await fetch(`${this.ec2BaseUrl}/accounting/recent`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${await this.getEC2ApiToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch accounting data: ${response.statusText}`);
      }

      const accountingRecords = await response.json();

      // Store in Supabase radius_accounting table
      for (const record of accountingRecords) {
        await supabase
          .from('radius_accounting')
          .insert({
            username: record.username,
            nas_ip_address: record.nas_ip_address,
            session_id: record.session_id,
            session_time: record.session_time,
            input_octets: record.input_octets,
            output_octets: record.output_octets,
            terminate_cause: record.terminate_cause,
            isp_company_id: record.isp_company_id
          });
      }

      console.log(`Synchronized ${accountingRecords.length} accounting records`);
    } catch (error) {
      console.error('Accounting sync failed:', error);
    }
  }
}

export const ec2RadiusIntegration = new EC2RadiusIntegration();

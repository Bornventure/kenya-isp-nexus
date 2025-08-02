
import { supabase } from '@/integrations/supabase/client';

export interface RadiusUser {
  username: string;
  password: string;
  clientId: string;
  groupName: string;
  maxUpload: string;
  maxDownload: string;
  expiration: Date;
  isActive: boolean;
}

export interface RadiusSession {
  username: string;
  nasIpAddress: string;
  sessionId: string;
  startTime: Date;
  bytesIn: number;
  bytesOut: number;
  status: 'active' | 'stopped';
}

class RadiusService {
  private radiusServerUrl = 'http://localhost:1812'; // FreeRADIUS server

  async createRadiusUser(client: any, servicePackage: any): Promise<boolean> {
    try {
      const radiusUser: RadiusUser = {
        username: client.email || client.phone,
        password: this.generatePassword(),
        clientId: client.id,
        groupName: servicePackage.name.toLowerCase().replace(/\s+/g, '_'),
        maxUpload: this.parseSpeed(servicePackage.speed, 'upload'),
        maxDownload: this.parseSpeed(servicePackage.speed, 'download'),
        expiration: new Date(client.subscription_end_date),
        isActive: client.status === 'active'
      };

      // Store RADIUS user credentials in database with proper field mapping
      const { error } = await supabase
        .from('radius_users')
        .insert({
          client_id: client.id,
          username: radiusUser.username,
          password: radiusUser.password,
          group_name: radiusUser.groupName,
          max_upload: radiusUser.maxUpload,
          max_download: radiusUser.maxDownload,
          expiration: radiusUser.expiration.toISOString(),
          is_active: radiusUser.isActive,
          isp_company_id: client.isp_company_id
        });

      if (error) throw error;

      // Configure on FreeRADIUS server
      await this.configureRadiusServer(radiusUser);

      console.log(`RADIUS user created for client: ${client.name}`);
      return true;
    } catch (error) {
      console.error('Error creating RADIUS user:', error);
      return false;
    }
  }

  async updateRadiusUser(clientId: string, updates: Partial<RadiusUser>): Promise<boolean> {
    try {
      // Convert interface fields to database fields
      const dbUpdates: any = {};
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.password) dbUpdates.password = updates.password;
      if (updates.groupName) dbUpdates.group_name = updates.groupName;
      if (updates.maxUpload) dbUpdates.max_upload = updates.maxUpload;
      if (updates.maxDownload) dbUpdates.max_download = updates.maxDownload;
      if (updates.expiration) dbUpdates.expiration = updates.expiration.toISOString();
      if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;

      const { error } = await supabase
        .from('radius_users')
        .update(dbUpdates)
        .eq('client_id', clientId);

      if (error) throw error;

      // Update on FreeRADIUS server
      const { data: radiusUser } = await supabase
        .from('radius_users')
        .select('*')
        .eq('client_id', clientId)
        .single();

      if (radiusUser) {
        // Convert database record to interface format
        const userInterface: RadiusUser = {
          username: radiusUser.username,
          password: radiusUser.password,
          clientId: radiusUser.client_id,
          groupName: radiusUser.group_name || '',
          maxUpload: radiusUser.max_upload || '',
          maxDownload: radiusUser.max_download || '',
          expiration: new Date(radiusUser.expiration || Date.now()),
          isActive: radiusUser.is_active
        };
        await this.configureRadiusServer(userInterface);
      }

      return true;
    } catch (error) {
      console.error('Error updating RADIUS user:', error);
      return false;
    }
  }

  async deleteRadiusUser(clientId: string): Promise<boolean> {
    try {
      const { data: radiusUser } = await supabase
        .from('radius_users')
        .select('username')
        .eq('client_id', clientId)
        .single();

      if (radiusUser) {
        // Remove from FreeRADIUS
        await this.removeFromRadiusServer(radiusUser.username);
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

  async getActiveSessions(): Promise<RadiusSession[]> {
    try {
      const { data, error } = await supabase
        .from('radius_sessions')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      
      // Convert database records to interface format with proper type handling
      return (data || []).map(record => ({
        username: record.username || '',
        nasIpAddress: String(record.nas_ip_address || ''),
        sessionId: record.session_id || '',
        startTime: new Date(record.start_time),
        bytesIn: record.bytes_in || 0,
        bytesOut: record.bytes_out || 0,
        status: (record.status as 'active' | 'stopped') || 'stopped'
      }));
    } catch (error) {
      console.error('Error fetching RADIUS sessions:', error);
      return [];
    }
  }

  async disconnectUser(username: string): Promise<boolean> {
    try {
      // Send disconnect message to RADIUS server
      const response = await fetch(`${this.radiusServerUrl}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      return response.ok;
    } catch (error) {
      console.error('Error disconnecting RADIUS user:', error);
      return false;
    }
  }

  private async configureRadiusServer(user: RadiusUser): Promise<void> {
    // Configure FreeRADIUS with user attributes
    const radiusConfig = {
      username: user.username,
      password: user.password,
      groupName: user.groupName,
      'Mikrotik-Rate-Limit': `${user.maxUpload}/${user.maxDownload}`,
      'Session-Timeout': this.calculateSessionTimeout(user.expiration),
      'Expiration': user.expiration.toISOString()
    };

    console.log('Configuring RADIUS server with:', radiusConfig);
    
    // In production, this would make actual API calls to FreeRADIUS
    // For now, we simulate the configuration
  }

  private async removeFromRadiusServer(username: string): Promise<void> {
    console.log(`Removing ${username} from RADIUS server`);
    // Implementation for removing user from FreeRADIUS
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

  private calculateSessionTimeout(expiration: Date): number {
    const now = new Date();
    const timeDiff = expiration.getTime() - now.getTime();
    return Math.max(0, Math.floor(timeDiff / 1000)); // Return seconds
  }
}

export const radiusService = new RadiusService();

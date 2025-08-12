
import { RouterOSClient } from 'routeros-client';
import { supabase } from '@/integrations/supabase/client';

export interface MikrotikConfig {
  host: string;
  user: string;
  password: string;
  port: number;
}

export interface PPPoEUser {
  username: string;
  password: string;
  profile: string;
}

export interface BandwidthLimit {
  maxDownload: string;
  maxUpload: string;
}

class MikrotikService {
  private config: MikrotikConfig | null = null;

  async getConfig(): Promise<MikrotikConfig> {
    if (this.config) return this.config;

    // Get config from Supabase secrets or environment
    const { data, error } = await supabase.functions.invoke('get-mikrotik-config');
    
    if (error || !data) {
      // Fallback to default config
      return {
        host: '192.168.100.2',
        user: 'admin',
        password: 'admin123',
        port: 8728
      };
    }

    this.config = data;
    return this.config;
  }

  async updateConfig(config: MikrotikConfig): Promise<void> {
    const { error } = await supabase.functions.invoke('update-mikrotik-config', {
      body: config
    });

    if (error) {
      throw new Error(`Failed to update MikroTik config: ${error.message}`);
    }

    this.config = config;
  }

  private async connectToMikrotik(): Promise<RouterOSClient> {
    const config = await this.getConfig();
    const conn = new RouterOSClient({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port
    });
    
    await conn.connect();
    return conn;
  }

  async testConnection(): Promise<{ success: boolean; error?: string; systemInfo?: any }> {
    try {
      const conn = await this.connectToMikrotik();
      
      try {
        // Get system identity to verify connection
        const identity = await conn.write('/system/identity/print');
        const interfaces = await conn.write('/interface/print');
        
        return {
          success: true,
          systemInfo: {
            identity: identity[0]?.name || 'Unknown',
            interfaceCount: interfaces.length,
            timestamp: new Date().toISOString()
          }
        };
      } finally {
        await conn.close();
      }
    } catch (error) {
      console.error('MikroTik connection test failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async addClient({ username, password, profile = 'default' }: PPPoEUser): Promise<void> {
    const conn = await this.connectToMikrotik();
    try {
      await conn.write('/ppp/secret/add', {
        name: username,
        password,
        service: 'pppoe',
        profile
      });
      console.log(`✅ Added client: ${username}`);
    } finally {
      await conn.close();
    }
  }

  async disconnectClient(username: string): Promise<void> {
    const conn = await this.connectToMikrotik();
    try {
      const active = await conn.write('/ppp/active/print', {
        '?name': username
      });
      for (const session of active) {
        await conn.write('/ppp/active/remove', {
          '.id': session['.id']
        });
      }
      console.log(`🚫 Disconnected client: ${username}`);
    } finally {
      await conn.close();
    }
  }

  async updateBandwidth(username: string, { maxDownload, maxUpload }: BandwidthLimit): Promise<void> {
    const conn = await this.connectToMikrotik();
    try {
      const queues = await conn.write('/queue/simple/print', {
        '?name': username
      });
      if (queues.length > 0) {
        await conn.write('/queue/simple/set', {
          '.id': queues[0]['.id'],
          'max-limit': `${maxDownload}M/${maxUpload}M`
        });
        console.log(`🔄 Updated bandwidth for ${username} to ${maxDownload}M/${maxUpload}M`);
      } else {
        // Create new queue if it doesn't exist
        await conn.write('/queue/simple/add', {
          name: username,
          target: `${username}@pppoe`,
          'max-limit': `${maxDownload}M/${maxUpload}M`
        });
        console.log(`➕ Created new queue for ${username}: ${maxDownload}M/${maxUpload}M`);
      }
    } finally {
      await conn.close();
    }
  }

  async listActiveClients(): Promise<any[]> {
    const conn = await this.connectToMikrotik();
    try {
      const active = await conn.write('/ppp/active/print');
      return active;
    } finally {
      await conn.close();
    }
  }

  async getInterfaces(): Promise<any[]> {
    const conn = await this.connectToMikrotik();
    try {
      const interfaces = await conn.write('/interface/print');
      return interfaces;
    } finally {
      await conn.close();
    }
  }

  async getSystemResources(): Promise<any> {
    const conn = await this.connectToMikrotik();
    try {
      const resources = await conn.write('/system/resource/print');
      return resources[0] || {};
    } finally {
      await conn.close();
    }
  }
}

export const mikrotikService = new MikrotikService();

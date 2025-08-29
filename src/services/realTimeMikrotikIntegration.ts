
import { supabase } from '@/integrations/supabase/client';

interface MikroTikDevice {
  id: string;
  name: string;
  ip_address: string;
  status: 'online' | 'offline' | 'error';
  uptime?: string;
  version?: string;
  board?: string;
}

interface MikroTikInterface {
  name: string;
  status: 'up' | 'down';
  rx_bytes: number;
  tx_bytes: number;
  rx_packets: number;
  tx_packets: number;
}

interface MikroTikClient {
  mac_address: string;
  ip_address: string;
  interface: string;
  uptime: string;
  rx_bytes: number;
  tx_bytes: number;
}

interface MikroTikResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export class RealTimeMikroTikIntegration {
  private baseUrl: string;
  private credentials: {
    username: string;
    password: string;
    port: number;
  };

  constructor() {
    this.baseUrl = 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1';
    this.credentials = {
      username: process.env.MIKROTIK_USER || 'admin',
      password: process.env.MIKROTIK_PASSWORD || '',
      port: parseInt(process.env.MIKROTIK_PORT || '8728'),
    };
  }

  async discoverDevices(companyId: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-discovery', {
        body: { 
          company_id: companyId,
          action: 'discover_devices'
        }
      });

      if (error) {
        return { success: false, message: `Discovery failed: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Devices discovered successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Device discovery error: ${errorMessage}`, error: errorMessage };
    }
  }

  async getDeviceInfo(deviceIp: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'get_device_info',
          device_ip: deviceIp,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to get device info: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Device information retrieved successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Device info error: ${errorMessage}`, error: errorMessage };
    }
  }

  async getInterfaceStats(deviceIp: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'get_interface_stats',
          device_ip: deviceIp,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to get interface stats: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Interface statistics retrieved successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Interface stats error: ${errorMessage}`, error: errorMessage };
    }
  }

  async getActiveClients(deviceIp: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'get_active_clients',
          device_ip: deviceIp,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to get active clients: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Active clients retrieved successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Active clients error: ${errorMessage}`, error: errorMessage };
    }
  }

  async disconnectClient(deviceIp: string, clientIp: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'disconnect_client',
          device_ip: deviceIp,
          client_ip: clientIp,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to disconnect client: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Client disconnected successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Client disconnect error: ${errorMessage}`, error: errorMessage };
    }
  }

  async blockClient(deviceIp: string, clientMac: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'block_client',
          device_ip: deviceIp,
          client_mac: clientMac,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to block client: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Client blocked successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Client block error: ${errorMessage}`, error: errorMessage };
    }
  }

  async unblockClient(deviceIp: string, clientMac: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'unblock_client',
          device_ip: deviceIp,
          client_mac: clientMac,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to unblock client: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Client unblocked successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Client unblock error: ${errorMessage}`, error: errorMessage };
    }
  }

  async createFirewallRule(deviceIp: string, rule: any): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'create_firewall_rule',
          device_ip: deviceIp,
          rule: rule,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to create firewall rule: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Firewall rule created successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Firewall rule error: ${errorMessage}`, error: errorMessage };
    }
  }

  async getBandwidthStats(deviceIp: string): Promise<MikroTikResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('mikrotik-management', {
        body: {
          action: 'get_bandwidth_stats',
          device_ip: deviceIp,
          credentials: this.credentials
        }
      });

      if (error) {
        return { success: false, message: `Failed to get bandwidth stats: ${error.message}`, error: error.message };
      }

      return { success: true, message: 'Bandwidth statistics retrieved successfully', data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Bandwidth stats error: ${errorMessage}`, error: errorMessage };
    }
  }

  async syncWithDatabase(companyId: string): Promise<MikroTikResponse> {
    try {
      const devicesResult = await this.discoverDevices(companyId);
      if (!devicesResult.success) {
        return devicesResult;
      }

      // Store discovered devices in database
      const devices = devicesResult.data || [];
      for (const device of devices) {
        await supabase
          .from('equipment')
          .upsert({
            ip_address: device.ip_address,
            type: 'Router',
            brand: 'MikroTik',
            model: device.board || 'Unknown',
            status: device.status === 'online' ? 'active' : 'inactive',
            firmware_version: device.version,
            auto_discovered: true,
            isp_company_id: companyId,
          });
      }

      return { success: true, message: 'Database sync completed successfully', data: { synced_devices: devices.length } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, message: `Database sync error: ${errorMessage}`, error: errorMessage };
    }
  }
}

export const mikrotikService = new RealTimeMikroTikIntegration();

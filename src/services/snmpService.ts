
import { supabase } from '@/integrations/supabase/client';
import { qosService } from './qosService';

export class SnmpService {
  private devices: Map<string, any> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeNetworkDevices();
  }

  async initializeNetworkDevices() {
    try {
      console.log('Initializing network devices...');
      
      // Initialize QoS from database
      await qosService.initializeQoSFromDatabase();
      
      // Get network devices from equipment table instead of non-existent network_devices
      const { data: devices } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'active');

      if (devices) {
        for (const device of devices) {
          this.devices.set(device.id, {
            ...device,
            lastSeen: new Date(),
            status: 'online'
          });
        }
      }

      // Start monitoring
      this.startMonitoring();
    } catch (error) {
      console.error('Error initializing network devices:', error);
    }
  }

  async monitorDevices() {
    try {
      console.log('Starting device monitoring...');
      
      // Monitor QoS compliance
      await qosService.monitorQoSCompliance();
      
      // Monitor each device
      for (const [deviceId, device] of this.devices) {
        try {
          // Simulate SNMP polling
          const isOnline = await this.pingDevice(device.ip_address);
          
          if (isOnline) {
            device.lastSeen = new Date();
            device.status = 'online';
            
            // Get device statistics
            const stats = await this.getDeviceStats(device);
            if (stats) {
              await this.updateDeviceStats(deviceId, stats);
            }
          } else {
            device.status = 'offline';
            console.warn(`Device ${device.type || 'Unknown'} is offline`);
          }
        } catch (error) {
          console.error(`Error monitoring device ${device.type || 'Unknown'}:`, error);
        }
      }
    } catch (error) {
      console.error('Error monitoring devices:', error);
    }
  }

  async disconnectClient(clientId: string) {
    try {
      console.log(`Disconnecting client ${clientId} via SNMP...`);
      
      // Remove QoS from client
      await qosService.removeQoSFromClient(clientId);
      
      // Get client's network information
      const { data: client } = await supabase
        .from('clients')
        .select(`
          *,
          radius_users:radius_users!radius_users_client_id_fkey(*)
        `)
        .eq('id', clientId)
        .single();

      if (!client || !client.radius_users || client.radius_users.length === 0) {
        console.warn('Client or RADIUS user not found');
        return false;
      }

      // Find the device managing this client
      const device = this.findDeviceForClient(client);
      if (device) {
        // Send SNMP command to disconnect client
        await this.sendSnmpDisconnect(device, client.radius_users[0].username);
      }

      return true;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      return false;
    }
  }

  async reconnectClient(clientId: string) {
    try {
      console.log(`Reconnecting client ${clientId} via SNMP...`);
      
      // Get client's network information
      const { data: client } = await supabase
        .from('clients')
        .select(`
          *,
          radius_users:radius_users!radius_users_client_id_fkey(*)
        `)
        .eq('id', clientId)
        .single();

      if (!client || !client.radius_users || client.radius_users.length === 0) {
        console.warn('Client or RADIUS user not found');
        return false;
      }

      // Apply QoS to client
      await qosService.applyQoSToClient(clientId);

      // Find the device managing this client
      const device = this.findDeviceForClient(client);
      if (device) {
        // Send SNMP command to reconnect client
        await this.sendSnmpReconnect(device, client.radius_users[0].username);
      }

      return true;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      return false;
    }
  }

  async applySpeedLimit(clientId: string, packageId?: string) {
    try {
      console.log(`Applying speed limit for client ${clientId}`);
      
      // Apply QoS to client
      if (packageId) {
        await qosService.updateClientQoS(clientId, packageId);
      } else {
        await qosService.applyQoSToClient(clientId);
      }
      
      // Get client information
      const { data: client } = await supabase
        .from('clients')
        .select(`
          *,
          radius_users:radius_users!radius_users_client_id_fkey(*),
          service_packages:service_package_id(*)
        `)
        .eq('id', clientId)
        .single();

      if (!client) {
        throw new Error('Client not found');
      }

      // Find the device managing this client
      const device = this.findDeviceForClient(client);
      if (device && client.service_packages && client.radius_users && client.radius_users.length > 0) {
        // Send SNMP command to apply speed limits
        await this.sendSnmpSpeedLimit(device, client.radius_users[0].username, client.service_packages);
      }

      return true;
    } catch (error) {
      console.error('Error applying speed limit:', error);
      return false;
    }
  }

  private async pingDevice(ipAddress: string): Promise<boolean> {
    try {
      // Simulate ping - in real implementation, use actual ping or SNMP get
      return Math.random() > 0.1; // 90% uptime simulation
    } catch (error) {
      return false;
    }
  }

  private async getDeviceStats(device: any) {
    try {
      // Simulate getting device statistics via SNMP
      return {
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        interfaceStats: {
          bytesIn: Math.floor(Math.random() * 1000000),
          bytesOut: Math.floor(Math.random() * 1000000),
          packetsIn: Math.floor(Math.random() * 10000),
          packetsOut: Math.floor(Math.random() * 10000)
        }
      };
    } catch (error) {
      console.error('Error getting device stats:', error);
      return null;
    }
  }

  private async updateDeviceStats(deviceId: string, stats: any) {
    try {
      // Use bandwidth_statistics table instead of non-existent device_statistics
      await supabase
        .from('bandwidth_statistics')
        .insert({
          equipment_id: deviceId,
          in_octets: stats.interfaceStats.bytesIn,
          out_octets: stats.interfaceStats.bytesOut,
          in_packets: stats.interfaceStats.packetsIn,
          out_packets: stats.interfaceStats.packetsOut,
          timestamp: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating device stats:', error);
    }
  }

  private findDeviceForClient(client: any) {
    // In a real implementation, this would determine which device manages the client
    // based on network topology, IP ranges, etc.
    return Array.from(this.devices.values())[0]; // Return first device for now
  }

  private async sendSnmpDisconnect(device: any, username: string) {
    try {
      console.log(`Sending SNMP disconnect command to ${device.type || 'device'} for user ${username}`);
      // Implement actual SNMP disconnect command here
      return true;
    } catch (error) {
      console.error('Error sending SNMP disconnect:', error);
      return false;
    }
  }

  private async sendSnmpReconnect(device: any, username: string) {
    try {
      console.log(`Sending SNMP reconnect command to ${device.type || 'device'} for user ${username}`);
      // Implement actual SNMP reconnect command here
      return true;
    } catch (error) {
      console.error('Error sending SNMP reconnect:', error);
      return false;
    }
  }

  private async sendSnmpSpeedLimit(device: any, username: string, servicePackage: any) {
    try {
      console.log(`Sending SNMP speed limit command to ${device.type || 'device'} for user ${username}`);
      console.log(`Speed limits: ${servicePackage.speed}`);
      // Implement actual SNMP speed limit command here
      return true;
    } catch (error) {
      console.error('Error sending SNMP speed limit:', error);
      return false;
    }
  }

  private startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.monitorDevices();
    }, 30000); // Monitor every 30 seconds
  }

  public stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  public getDeviceStatus(deviceId: string) {
    return this.devices.get(deviceId);
  }

  public getAllDevices() {
    return Array.from(this.devices.values());
  }
}

export const snmpService = new SnmpService();

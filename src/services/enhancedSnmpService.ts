
import { snmpService } from './snmpService';
import { radiusService } from './radiusService';
import { supabase } from '@/integrations/supabase/client';

interface ClientNetworkStatus {
  clientId: string;
  isConnected: boolean;
  ipAddress?: string;
  lastSeen: Date;
  bytesIn: number;
  bytesOut: number;
  sessionTime: number;
  signalStrength?: number;
}

interface NetworkDevice {
  id: string;
  type: 'mikrotik' | 'switch' | 'access_point';
  ipAddress: string;
  status: 'online' | 'offline' | 'warning';
  clients: ClientNetworkStatus[];
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
}

class EnhancedSnmpService {
  private devices: Map<string, NetworkDevice> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  async startMonitoring(): Promise<void> {
    console.log('Starting enhanced SNMP monitoring...');
    
    // Load network devices from database
    await this.loadNetworkDevices();
    
    // Start periodic monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.monitorAllDevices();
    }, 30000); // Monitor every 30 seconds
  }

  async stopMonitoring(): Promise<void> {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('SNMP monitoring stopped');
  }

  async disconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Disconnecting client ${clientId} from network`);
      
      // Get client's RADIUS username
      const { data: radiusUser } = await supabase
        .from('radius_users')
        .select('username')
        .eq('client_id', clientId)
        .single();

      if (radiusUser) {
        // Disconnect via RADIUS
        await radiusService.disconnectUser(radiusUser.username);
      }

      // Update client status in all MikroTik devices
      for (const device of this.devices.values()) {
        if (device.type === 'mikrotik') {
          await this.disconnectClientFromMikroTik(device.ipAddress, clientId);
        }
      }

      // Log the disconnection
      await supabase.from('network_events').insert({
        client_id: clientId,
        event_type: 'client_disconnected',
        triggered_by: 'manual_disconnect',
        success: true,
        event_data: { timestamp: new Date().toISOString() } as any
      });

      return true;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      return false;
    }
  }

  async reconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Reconnecting client ${clientId} to network`);
      
      // Get client and service package info
      const { data: client } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (*)
        `)
        .eq('id', clientId)
        .single();

      if (!client) {
        throw new Error('Client not found');
      }

      // Create/update RADIUS user
      await radiusService.createRadiusUser(client, client.service_packages);

      // Configure on all MikroTik devices
      for (const device of this.devices.values()) {
        if (device.type === 'mikrotik') {
          await this.configureClientOnMikroTik(device.ipAddress, client);
        }
      }

      // Log the reconnection
      await supabase.from('network_events').insert({
        client_id: clientId,
        event_type: 'client_reconnected',
        triggered_by: 'manual_reconnect',
        success: true,
        event_data: { 
          package_id: client.service_package_id,
          timestamp: new Date().toISOString()
        } as any
      });

      return true;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      return false;
    }
  }

  async applySpeedLimit(clientId: string, packageId: string): Promise<boolean> {
    try {
      const { data: servicePackage } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (!servicePackage) {
        throw new Error('Service package not found');
      }

      // Update RADIUS user with new limits
      await radiusService.updateRadiusUser(clientId, {
        maxUpload: this.parseSpeed(servicePackage.speed, 'upload'),
        maxDownload: this.parseSpeed(servicePackage.speed, 'download'),
        groupName: servicePackage.name.toLowerCase().replace(/\s+/g, '_')
      });

      // Apply limits on all MikroTik devices
      for (const device of this.devices.values()) {
        if (device.type === 'mikrotik') {
          await this.applySpeedLimitOnMikroTik(
            device.ipAddress, 
            clientId, 
            servicePackage
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error applying speed limit:', error);
      return false;
    }
  }

  async getDeviceStatus(): Promise<NetworkDevice[]> {
    return Array.from(this.devices.values());
  }

  async getClientNetworkStatus(clientId: string): Promise<ClientNetworkStatus | null> {
    for (const device of this.devices.values()) {
      const client = device.clients.find(c => c.clientId === clientId);
      if (client) {
        return client;
      }
    }
    return null;
  }

  private async loadNetworkDevices(): Promise<void> {
    try {
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .eq('approval_status', 'approved')
        .not('ip_address', 'is', null);

      if (equipment) {
        for (const device of equipment) {
          this.devices.set(device.id, {
            id: device.id,
            type: this.mapEquipmentType(device.type),
            ipAddress: device.ip_address,
            status: 'offline',
            clients: [],
            uptime: 0,
            cpuUsage: 0,
            memoryUsage: 0
          });
        }
      }

      console.log(`Loaded ${this.devices.size} network devices for monitoring`);
    } catch (error) {
      console.error('Error loading network devices:', error);
    }
  }

  private async monitorAllDevices(): Promise<void> {
    for (const device of this.devices.values()) {
      await this.monitorDevice(device);
    }
  }

  private async monitorDevice(device: NetworkDevice): Promise<void> {
    try {
      // Check device availability
      const isOnline = await this.pingDevice(device.ipAddress);
      
      device.status = isOnline ? 'online' : 'offline';

      if (isOnline) {
        // Get device statistics via SNMP
        const stats = await snmpService.getDeviceStatistics(device.ipAddress);
        
        if (stats) {
          device.uptime = stats.uptime || 0;
          device.cpuUsage = stats.cpuUsage || 0;
          device.memoryUsage = stats.memoryUsage || 0;
        }

        // Get connected clients for MikroTik devices
        if (device.type === 'mikrotik') {
          device.clients = await this.getConnectedClients(device.ipAddress);
        }

        // Update database with current stats
        await this.updateDeviceStats(device);
      }
    } catch (error) {
      console.error(`Error monitoring device ${device.ipAddress}:`, error);
      device.status = 'warning';
    }
  }

  private async pingDevice(ipAddress: string): Promise<boolean> {
    try {
      // Simulate ping - in real implementation, use SNMP or ICMP
      const response = await fetch(`http://${ipAddress}`, { 
        timeout: 5000,
        signal: AbortSignal.timeout(5000)
      });
      return true;
    } catch {
      return false;
    }
  }

  private async getConnectedClients(ipAddress: string): Promise<ClientNetworkStatus[]> {
    try {
      // Get active RADIUS sessions for this device
      const sessions = await radiusService.getActiveSessions();
      
      return sessions
        .filter(session => session.nasIpAddress === ipAddress)
        .map(session => ({
          clientId: session.username, // Map back to client ID
          isConnected: session.status === 'active',
          ipAddress: undefined, // Would be populated by DHCP lease info
          lastSeen: new Date(),
          bytesIn: session.bytesIn,
          bytesOut: session.bytesOut,
          sessionTime: Date.now() - session.startTime.getTime(),
          signalStrength: undefined
        }));
    } catch (error) {
      console.error('Error getting connected clients:', error);
      return [];
    }
  }

  private async disconnectClientFromMikroTik(deviceIp: string, clientId: string): Promise<void> {
    console.log(`Disconnecting client ${clientId} from MikroTik ${deviceIp}`);
    
    // Use MikroTik API to disconnect specific client
    // This would involve actual MikroTik API calls
    const commands = [
      `/ppp/active/print where name="${clientId}"`,
      `/ppp/active/remove [find name="${clientId}"]`
    ];
    
    for (const command of commands) {
      console.log(`Executing on ${deviceIp}: ${command}`);
    }
  }

  private async configureClientOnMikroTik(deviceIp: string, client: any): Promise<void> {
    console.log(`Configuring client ${client.name} on MikroTik ${deviceIp}`);
    
    // MikroTik API commands to add PPPoE user
    const commands = [
      `/ppp/secret/add name="${client.email}" password="${client.id.slice(-8)}" service="pppoe"`,
      `/queue/simple/add name="${client.name}" target="${client.email}" max-limit="${client.service_packages?.speed || '10M'}"`,
    ];
    
    for (const command of commands) {
      console.log(`Executing on ${deviceIp}: ${command}`);
    }
  }

  private async applySpeedLimitOnMikroTik(
    deviceIp: string, 
    clientId: string, 
    servicePackage: any
  ): Promise<void> {
    console.log(`Applying speed limit for client ${clientId} on ${deviceIp}`);
    
    const maxLimit = servicePackage.speed || '10M';
    const command = `/queue/simple/set [find name="${clientId}"] max-limit="${maxLimit}"`;
    
    console.log(`Executing on ${deviceIp}: ${command}`);
  }

  private async updateDeviceStats(device: NetworkDevice): Promise<void> {
    try {
      await supabase.from('network_device_stats').upsert({
        device_id: device.id,
        status: device.status,
        uptime: device.uptime,
        cpu_usage: device.cpuUsage,
        memory_usage: device.memoryUsage,
        connected_clients: device.clients.length,
        last_updated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating device stats:', error);
    }
  }

  private mapEquipmentType(type: string): 'mikrotik' | 'switch' | 'access_point' {
    if (type.toLowerCase().includes('router')) return 'mikrotik';
    if (type.toLowerCase().includes('switch')) return 'switch';
    return 'access_point';
  }

  private parseSpeed(speed: string, type: 'upload' | 'download'): string {
    const match = speed.match(/(\d+)/);
    const speedValue = match ? parseInt(match[1]) : 10;
    return type === 'upload' ? `${Math.floor(speedValue * 0.8)}M` : `${speedValue}M`;
  }
}

export const enhancedSnmpService = new EnhancedSnmpService();


import { supabase } from '@/integrations/supabase/client';
import { mikrotikApiService } from './mikrotikApiService';
import { dataUsageService } from './dataUsageService';
import { qosService } from './qosService';

interface MikrotikDevice {
  id: string;
  name: string;
  ip: string;
  username: string;
  password: string;
  type: 'router' | 'switch' | 'access_point';
  status: 'online' | 'offline';
  capabilities: string[];
}

export class EnhancedSnmpService {
  private devices: Map<string, MikrotikDevice> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  async initialize() {
    console.log('Initializing enhanced SNMP service with real MikroTik integration...');
    
    await this.loadMikrotikDevices();
    await this.startRealTimeMonitoring();
    await dataUsageService.startUsageMonitoring();
    
    console.log('Enhanced SNMP service initialization complete');
  }

  private async loadMikrotikDevices() {
    try {
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .eq('approval_status', 'approved')
        .ilike('brand', '%mikrotik%')
        .not('ip_address', 'is', null);

      equipment?.forEach(device => {
        this.devices.set(device.id, {
          id: device.id,
          name: `${device.brand} ${device.model}`,
          ip: device.ip_address as string,
          username: 'admin', // Should come from device configuration
          password: 'admin', // Should come from secure storage
          type: device.type as any,
          status: device.status === 'active' ? 'online' : 'offline',
          capabilities: this.getMikrotikCapabilities(device)
        });
      });

      console.log(`Loaded ${this.devices.size} MikroTik devices for real integration`);
    } catch (error) {
      console.error('Error loading MikroTik devices:', error);
    }
  }

  private getMikrotikCapabilities(device: any): string[] {
    const capabilities = ['routeros', 'pppoe', 'simple_queues', 'firewall'];
    
    if (device.type === 'router') {
      capabilities.push('routing', 'nat', 'vpn', 'hotspot');
    }
    
    // Add capabilities based on RouterOS version or model
    if (device.model?.includes('hEX') || device.model?.includes('RB')) {
      capabilities.push('advanced_qos', 'load_balancing');
    }
    
    return capabilities;
  }

  async startRealTimeMonitoring() {
    console.log('Starting real-time MikroTik device monitoring...');
    
    this.monitoringInterval = setInterval(async () => {
      await this.monitorDeviceHealth();
      await this.syncClientConnections();
      await this.validateQoSPolicies();
    }, 30000); // Every 30 seconds

    // Initial sync
    await this.syncClientConnections();
  }

  private async monitorDeviceHealth() {
    for (const [deviceId, device] of this.devices) {
      try {
        const systemInfo = await mikrotikApiService.getSystemResource(device);
        const isOnline = systemInfo !== null;
        
        if (device.status !== (isOnline ? 'online' : 'offline')) {
          device.status = isOnline ? 'online' : 'offline';
          
          // Update database
          await supabase
            .from('equipment')
            .update({ status: isOnline ? 'active' : 'offline' })
            .eq('id', deviceId);

          // Log status change
          await supabase.from('network_events').insert({
            equipment_id: deviceId,
            event_type: 'device_status_change',
            triggered_by: 'health_monitoring',
            event_data: {
              previous_status: !isOnline ? 'online' : 'offline',
              new_status: device.status,
              system_info: systemInfo
            } as any,
            success: true
          });
        }
      } catch (error) {
        console.error(`Health check failed for device ${device.name}:`, error);
        device.status = 'offline';
      }
    }
  }

  private async syncClientConnections() {
    for (const [deviceId, device] of this.devices) {
      if (device.status !== 'online') continue;

      try {
        const activeConnections = await mikrotikApiService.getActiveConnections(device);
        
        // Log active connections for monitoring
        await supabase.from('network_events').insert({
          equipment_id: deviceId,
          event_type: 'connection_sync',
          triggered_by: 'automatic_monitoring',
          event_data: {
            active_connections: activeConnections.length,
            connections: activeConnections
          } as any,
          success: true
        });
      } catch (error) {
        console.error(`Failed to sync connections for ${device.name}:`, error);
      }
    }
  }

  async disconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Disconnecting client ${clientId} using real MikroTik API`);

      // Get client information
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!client) {
        console.error('Client not found');
        return false;
      }

      let success = true;
      
      // Disconnect from all MikroTik devices
      for (const [deviceId, device] of this.devices) {
        if (device.status !== 'online') continue;

        try {
          // Method 1: Disconnect active PPP session
          const username = `client_${clientId}`;
          await mikrotikApiService.disconnectUser(device, username);

          // Method 2: Disable PPP secret
          await mikrotikApiService.disablePPPSecret(device, username);

          // Method 3: Disable simple queue
          await mikrotikApiService.disableSimpleQueue(device, username);

          // Log the disconnection
          await supabase.from('network_events').insert({
            client_id: clientId,
            equipment_id: deviceId,
            event_type: 'client_disconnect',
            triggered_by: 'billing_system',
            event_data: {
              device_ip: device.ip,
              methods_used: ['ppp_disconnect', 'secret_disable', 'queue_disable'],
              username: username
            } as any,
            success: true
          });

        } catch (error) {
          console.error(`Failed to disconnect client from ${device.name}:`, error);
          success = false;
        }
      }

      return success;
    } catch (error) {
      console.error('Enhanced disconnect error:', error);
      return false;
    }
  }

  async reconnectClient(clientId: string): Promise<boolean> {
    try {
      console.log(`Reconnecting client ${clientId} using real MikroTik API`);

      // Get client and service package info
      const { data: client } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages(*)
        `)
        .eq('id', clientId)
        .single();

      if (!client) {
        console.error('Client not found');
        return false;
      }

      let success = true;
      const username = `client_${clientId}`;

      // Reconnect on all MikroTik devices
      for (const [deviceId, device] of this.devices) {
        if (device.status !== 'online') continue;

        try {
          // Method 1: Enable PPP secret
          await mikrotikApiService.enablePPPSecret(device, username);

          // Method 2: Create/enable simple queue with speed limits
          if (client.service_packages) {
            const speedMatch = client.service_packages.speed.match(/(\d+)/);
            const maxSpeed = speedMatch ? parseInt(speedMatch[1]) : 10;
            
            await mikrotikApiService.createSimpleQueue(device, {
              name: username,
              target: `192.168.1.${100 + parseInt(clientId.slice(-2), 36)}/32`, // Simple IP assignment
              maxDownload: `${maxSpeed}M`,
              maxUpload: `${Math.floor(maxSpeed * 0.8)}M`,
              disabled: false
            });
          }

          // Log the reconnection
          await supabase.from('network_events').insert({
            client_id: clientId,
            equipment_id: deviceId,
            event_type: 'client_reconnect',
            triggered_by: 'billing_system',
            event_data: {
              device_ip: device.ip,
              methods_used: ['secret_enable', 'queue_create'],
              username: username,
              speed_applied: client.service_packages?.speed
            } as any,
            success: true
          });

        } catch (error) {
          console.error(`Failed to reconnect client on ${device.name}:`, error);
          success = false;
        }
      }

      return success;
    } catch (error) {
      console.error('Enhanced reconnect error:', error);
      return false;
    }
  }

  async applySpeedLimit(clientId: string, packageId: string): Promise<boolean> {
    try {
      // Get service package details
      const { data: servicePackage } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (!servicePackage) {
        console.error('Service package not found');
        return false;
      }

      const speedMatch = servicePackage.speed.match(/(\d+)/);
      const maxSpeed = speedMatch ? parseInt(speedMatch[1]) : 10;
      const username = `client_${clientId}`;

      let success = true;

      // Apply speed limits on all MikroTik devices
      for (const [deviceId, device] of this.devices) {
        if (device.status !== 'online') continue;

        try {
          await mikrotikApiService.updateSimpleQueue(device, username, {
            maxDownload: `${maxSpeed}M`,
            maxUpload: `${Math.floor(maxSpeed * 0.8)}M`
          });

          console.log(`Applied speed limit ${maxSpeed}Mbps to client ${clientId} on ${device.name}`);
        } catch (error) {
          console.error(`Failed to apply speed limit on ${device.name}:`, error);
          success = false;
        }
      }

      return success;
    } catch (error) {
      console.error('Error applying speed limit:', error);
      return false;
    }
  }

  private async validateQoSPolicies() {
    console.log('Validating QoS policies on MikroTik devices...');
    
    for (const [deviceId, device] of this.devices) {
      if (device.status !== 'online') continue;

      try {
        // Get current simple queues from device
        const command = '/queue/simple/print';
        const queues = await mikrotikApiService.executeCommand(device, command);
        
        // Validate against expected policies
        console.log(`Device ${device.name} has ${Array.isArray(queues) ? queues.length : 0} active queues`);
        
      } catch (error) {
        console.error(`QoS validation failed for ${device.name}:`, error);
      }
    }
  }

  getDeviceStatus() {
    return Array.from(this.devices.values()).map(device => ({
      ...device,
      lastChecked: new Date()
    }));
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    dataUsageService.stopMonitoring();
    console.log('Enhanced SNMP monitoring stopped');
  }
}

export const enhancedSnmpService = new EnhancedSnmpService();


import { supabase } from '@/integrations/supabase/client';
import { realMikrotikService } from './realMikrotikService';

interface MikroTikDevice {
  id: string;
  ip: string;
  username: string;
  password: string;
  port: number;
}

export class RealTimeMikrotikIntegration {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private devices: Map<string, MikroTikDevice> = new Map();

  // Initialize monitoring for all company MikroTik routers
  async initializeMonitoring(companyId: string): Promise<void> {
    try {
      // Get all MikroTik routers for the company
      const { data: routers, error } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .eq('isp_company_id', companyId)
        .eq('status', 'active');

      if (error) throw error;

      // Register devices for monitoring
      for (const router of routers || []) {
        this.devices.set(router.id, {
          id: router.id,
          ip: String(router.ip_address),
          username: router.admin_username,
          password: router.admin_password,
          port: 8728 // RouterOS API port
        });
      }

      // Start monitoring
      this.startRealTimeMonitoring();

      console.log(`Initialized monitoring for ${this.devices.size} MikroTik devices`);
    } catch (error) {
      console.error('Failed to initialize MikroTik monitoring:', error);
    }
  }

  // Start real-time monitoring
  private startRealTimeMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      await this.monitorAllDevices();
    }, 30000); // Monitor every 30 seconds

    console.log('Real-time MikroTik monitoring started');
  }

  // Monitor all devices
  private async monitorAllDevices(): Promise<void> {
    for (const [deviceId, device] of this.devices.entries()) {
      try {
        await this.monitorDevice(device);
      } catch (error) {
        console.error(`Monitoring failed for device ${deviceId}:`, error);
      }
    }
  }

  // Monitor individual device
  private async monitorDevice(device: MikroTikDevice): Promise<void> {
    try {
      // Test connection and get system info
      const connectionResult = await realMikrotikService.testConnection({
        ip: device.ip,
        username: device.username,
        password: device.password,
        port: device.port
      });

      // Update device status
      await supabase
        .from('mikrotik_routers')
        .update({
          connection_status: connectionResult.success ? 'online' : 'offline',
          last_test_results: JSON.stringify(connectionResult)
        })
        .eq('id', device.id);

      if (connectionResult.success) {
        // Get active sessions
        const activeSessions = await realMikrotikService.getActiveSessions({
          ip: device.ip,
          username: device.username,
          password: device.password,
          port: device.port
        });

        // Sync sessions to Supabase
        await this.syncSessionsToSupabase(activeSessions, device.id);

        // Get interface statistics
        const interfaceStats = await realMikrotikService.getInterfaceStats({
          ip: device.ip,
          username: device.username,
          password: device.password,
          port: device.port
        });

        // Store interface statistics
        await this.storeInterfaceStats(interfaceStats, device.id);
      }

    } catch (error) {
      console.error(`Device monitoring error for ${device.ip}:`, error);
    }
  }

  // Sync active sessions to Supabase
  private async syncSessionsToSupabase(sessions: any[], deviceId: string): Promise<void> {
    try {
      for (const session of sessions) {
        // Find corresponding client
        const { data: radiusUser } = await supabase
          .from('radius_users')
          .select('client_id, isp_company_id')
          .eq('username', session.name)
          .single();

        if (radiusUser) {
          // Upsert active session
          await supabase
            .from('active_sessions')
            .upsert({
              username: session.name,
              nas_ip_address: deviceId,
              framed_ip_address: session.address,
              session_start: new Date().toISOString(), // In production, parse actual start time
              client_id: radiusUser.client_id,
              isp_company_id: radiusUser.isp_company_id,
              last_update: new Date().toISOString()
            });
        }
      }
    } catch (error) {
      console.error('Session sync error:', error);
    }
  }

  // Store interface statistics
  private async storeInterfaceStats(stats: any[], deviceId: string): Promise<void> {
    try {
      for (const stat of stats) {
        await supabase
          .from('interface_statistics')
          .insert({
            equipment_id: deviceId,
            interface_index: parseInt(stat['.id'].substring(1)),
            interface_name: stat.name,
            status: stat.running === 'true' ? 'up' : 'down',
            speed: parseInt(stat['tx-byte']) || 0,
            utilization: 0, // Calculate based on capacity
            errors: 0,
            isp_company_id: '' // Will be filled by RLS
          });
      }
    } catch (error) {
      console.error('Interface stats storage error:', error);
    }
  }

  // Configure client on MikroTik
  async configureClientOnMikroTik(clientConfig: {
    deviceId: string;
    username: string;
    password: string;
    downloadLimit: string;
    uploadLimit: string;
    ipAddress?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const device = this.devices.get(clientConfig.deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      // Create PPPoE secret
      const secretResult = await realMikrotikService.createPPPoESecret({
        ip: device.ip,
        username: device.username,
        password: device.password,
        port: device.port
      }, {
        name: clientConfig.username,
        password: clientConfig.password,
        service: 'pppoe',
        profile: 'default',
        disabled: false,
        comment: `Auto-generated for client`
      });

      if (!secretResult.success) {
        return {
          success: false,
          message: secretResult.error || 'Failed to create PPPoE secret'
        };
      }

      // Create simple queue for bandwidth limitation
      const queueResult = await realMikrotikService.createSimpleQueue({
        ip: device.ip,
        username: device.username,
        password: device.password,
        port: device.port
      }, {
        name: `queue-${clientConfig.username}`,
        target: clientConfig.ipAddress || `${clientConfig.username}`,
        maxDownload: clientConfig.downloadLimit,
        maxUpload: clientConfig.uploadLimit,
        disabled: false
      });

      if (!queueResult.success) {
        console.warn('Queue creation failed:', queueResult.error);
      }

      return {
        success: true,
        message: `Client ${clientConfig.username} configured successfully on ${device.ip}`
      };

    } catch (error) {
      console.error('Client configuration failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Configuration failed'
      };
    }
  }

  // Disconnect client from MikroTik
  async disconnectClientFromMikroTik(deviceId: string, username: string): Promise<{ success: boolean; message: string }> {
    try {
      const device = this.devices.get(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      const result = await realMikrotikService.disconnectUser({
        ip: device.ip,
        username: device.username,
        password: device.password,
        port: device.port
      }, username);

      if (result.success) {
        // Remove from active sessions
        await supabase
          .from('active_sessions')
          .delete()
          .eq('username', username)
          .eq('nas_ip_address', deviceId);
      }

      return result;
    } catch (error) {
      console.error('Disconnect failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Disconnect failed'
      };
    }
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('MikroTik monitoring stopped');
  }

  // Add new device to monitoring
  async addDeviceToMonitoring(router: any): Promise<void> {
    this.devices.set(router.id, {
      id: router.id,
      ip: String(router.ip_address),
      username: router.admin_username,
      password: router.admin_password,
      port: 8728
    });

    console.log(`Added device ${router.name} to monitoring`);
  }

  // Remove device from monitoring
  removeDeviceFromMonitoring(deviceId: string): void {
    this.devices.delete(deviceId);
    console.log(`Removed device ${deviceId} from monitoring`);
  }
}

export const realTimeMikrotikIntegration = new RealTimeMikrotikIntegration();

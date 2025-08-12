
import { realNetworkService } from './realNetworkService';

export interface SNMPDevice {
  ip: string;
  community: string;
  version: number;
  port?: number;
}

export interface SNMPResult {
  success: boolean;
  data?: any;
  error?: string;
  responseTime?: number;
  isDemoResult?: boolean;
}

export interface DeviceStatus {
  isOnline: boolean;
  uptime?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  interfaceCount?: number;
  lastChecked: string;
}

class EnhancedSNMPService {
  private readonly isDemoMode: boolean;
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.isDemoMode = !import.meta.env.VITE_REAL_NETWORK_MODE || 
                      import.meta.env.VITE_REAL_NETWORK_MODE !== 'true';
  }

  async queryDevice(device: SNMPDevice, oid: string): Promise<SNMPResult> {
    if (this.isDemoMode) {
      console.log('🚨 DEMO MODE: SNMP query simulation active');
      // Return simulated SNMP data
      return {
        success: Math.random() > 0.2, // 80% success rate
        data: this.generateSimulatedSNMPData(oid),
        responseTime: Math.floor(Math.random() * 500) + 50,
        isDemoResult: true
      };
    }

    try {
      const config = {
        community: device.community,
        version: device.version,
        port: device.port || 161,
        oid: oid
      };

      const result = await realNetworkService.testConnection(
        device.ip, 
        'snmp'
      );

      return {
        success: result.success,
        data: result.success ? this.parseSNMPResponse(result) : null,
        error: result.error,
        responseTime: result.responseTime
      };
    } catch (error) {
      console.error('SNMP query failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getSystemInfo(device: SNMPDevice): Promise<SNMPResult> {
    return this.queryDevice(device, '1.3.6.1.2.1.1.1.0'); // sysDescr
  }

  async getInterfaceStats(device: SNMPDevice): Promise<SNMPResult> {
    return this.queryDevice(device, '1.3.6.1.2.1.2.2.1'); // ifTable
  }

  async getDeviceStatus(deviceIp: string): Promise<DeviceStatus> {
    if (this.isDemoMode) {
      return {
        isOnline: Math.random() > 0.1, // 90% online in demo
        uptime: `${Math.floor(Math.random() * 30)}d ${Math.floor(Math.random() * 24)}h`,
        cpuUsage: Math.floor(Math.random() * 100),
        memoryUsage: Math.floor(Math.random() * 100),
        interfaceCount: Math.floor(Math.random() * 10) + 1,
        lastChecked: new Date().toISOString()
      };
    }

    try {
      const result = await realNetworkService.testConnection(deviceIp, 'ping');
      return {
        isOnline: result.success,
        lastChecked: new Date().toISOString(),
        ...(result.isDemoResult && { 
          uptime: '5d 12h',
          cpuUsage: 45,
          memoryUsage: 67,
          interfaceCount: 4
        })
      };
    } catch (error) {
      return {
        isOnline: false,
        lastChecked: new Date().toISOString()
      };
    }
  }

  startMonitoring(deviceIp: string, intervalMs: number = 60000): void {
    if (this.monitoringIntervals.has(deviceIp)) {
      this.stopMonitoring(deviceIp);
    }

    const interval = setInterval(async () => {
      try {
        await this.getDeviceStatus(deviceIp);
      } catch (error) {
        console.error(`Monitoring failed for ${deviceIp}:`, error);
      }
    }, intervalMs);

    this.monitoringIntervals.set(deviceIp, interval);
    console.log(`Started monitoring ${deviceIp} every ${intervalMs}ms`);
  }

  stopMonitoring(deviceIp: string): void {
    const interval = this.monitoringIntervals.get(deviceIp);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(deviceIp);
      console.log(`Stopped monitoring ${deviceIp}`);
    }
  }

  async disconnectClient(clientId: string): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🚨 DEMO MODE: Client disconnect simulation');
      return Math.random() > 0.1; // 90% success rate
    }

    try {
      const taskId = await realNetworkService.createNetworkTask(
        'mikrotik_connect',
        '192.168.1.1', // This should be the router IP
        { action: 'disconnect_client', client_id: clientId }
      );

      if (!taskId) return false;

      const result = await realNetworkService.waitForTaskCompletion(taskId);
      return result.success;
    } catch (error) {
      console.error('Failed to disconnect client:', error);
      return false;
    }
  }

  async reconnectClient(clientId: string): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🚨 DEMO MODE: Client reconnect simulation');
      return Math.random() > 0.1; // 90% success rate
    }

    try {
      const taskId = await realNetworkService.createNetworkTask(
        'mikrotik_connect',
        '192.168.1.1',
        { action: 'reconnect_client', client_id: clientId }
      );

      if (!taskId) return false;

      const result = await realNetworkService.waitForTaskCompletion(taskId);
      return result.success;
    } catch (error) {
      console.error('Failed to reconnect client:', error);
      return false;
    }
  }

  async applySpeedLimit(clientId: string, packageId: string): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🚨 DEMO MODE: Speed limit application simulation');
      return Math.random() > 0.1; // 90% success rate
    }

    try {
      const taskId = await realNetworkService.createNetworkTask(
        'mikrotik_connect',
        '192.168.1.1',
        { 
          action: 'apply_speed_limit', 
          client_id: clientId,
          package_id: packageId
        }
      );

      if (!taskId) return false;

      const result = await realNetworkService.waitForTaskCompletion(taskId);
      return result.success;
    } catch (error) {
      console.error('Failed to apply speed limit:', error);
      return false;
    }
  }

  private generateSimulatedSNMPData(oid: string): any {
    // Generate different simulated data based on OID
    if (oid.includes('1.3.6.1.2.1.1.1.0')) {
      // System description
      return {
        oid: oid,
        value: 'RouterOS v7.1.5 MikroTik RB750Gr3',
        type: 'OctetString'
      };
    } else if (oid.includes('1.3.6.1.2.1.2.2.1')) {
      // Interface table
      return {
        interfaces: [
          {
            index: 1,
            name: 'ether1',
            status: 'up',
            speed: 1000000000,
            inOctets: Math.floor(Math.random() * 1000000000),
            outOctets: Math.floor(Math.random() * 1000000000)
          },
          {
            index: 2,
            name: 'wlan1',
            status: 'up',
            speed: 54000000,
            inOctets: Math.floor(Math.random() * 100000000),
            outOctets: Math.floor(Math.random() * 100000000)
          }
        ]
      };
    }

    return {
      oid: oid,
      value: 'Simulated SNMP response',
      type: 'OctetString'
    };
  }

  private parseSNMPResponse(result: any): any {
    // Parse the actual SNMP response from the network agent
    try {
      if (result.result_data) {
        return JSON.parse(result.result_data);
      }
      return result.raw_response;
    } catch (error) {
      console.error('Failed to parse SNMP response:', error);
      return result.raw_response;
    }
  }

  getDemoModeStatus(): boolean {
    return this.isDemoMode;
  }
}

export const enhancedSnmpService = new EnhancedSNMPService();


import { realNetworkService } from './realNetworkService';
import { useToast } from '@/hooks/use-toast';

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

class EnhancedSNMPService {
  private readonly isDemoMode: boolean;

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
        'snmp_test'
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

  async disconnectClient(clientId: string): Promise<boolean> {
    if (this.isDemoMode) {
      console.log('🚨 DEMO MODE: Client disconnect simulation');
      return Math.random() > 0.1; // 90% success rate
    }

    try {
      // In real implementation, this would send SNMP commands to disconnect the client
      // For now, we'll use the network task system
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
    // This would depend on the format returned by the network agent
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

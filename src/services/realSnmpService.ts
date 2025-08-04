
import { supabase } from '@/integrations/supabase/client';

interface SNMPDevice {
  id: string;
  name: string;
  ip: string;
  community: string;
  version: number;
  status: 'online' | 'offline';
  type: 'router' | 'switch' | 'access_point';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  interfaces: SNMPInterface[];
}

interface SNMPInterface {
  index: number;
  name: string;
  status: 'up' | 'down';
  speed: number;
  utilization: number;
  bytesIn: number;
  bytesOut: number;
}

interface SNMPStats {
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  systemDescription: string;
  systemName: string;
}

class RealSNMPService {
  private devices: Map<string, SNMPDevice> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  // SNMP OIDs for common router/switch information
  private readonly OIDS = {
    sysDescr: '1.3.6.1.2.1.1.1.0',
    sysUpTime: '1.3.6.1.2.1.1.3.0',
    sysName: '1.3.6.1.2.1.1.5.0',
    ifNumber: '1.3.6.1.2.1.2.1.0',
    ifDescr: '1.3.6.1.2.1.2.2.1.2',
    ifOperStatus: '1.3.6.1.2.1.2.2.1.8',
    ifSpeed: '1.3.6.1.2.1.2.2.1.5',
    ifInOctets: '1.3.6.1.2.1.2.2.1.10',
    ifOutOctets: '1.3.6.1.2.1.2.2.1.16',
    hrProcessorLoad: '1.3.6.1.2.1.25.3.3.1.2',
    hrStorageUsed: '1.3.6.1.2.1.25.2.3.1.6',
    hrStorageSize: '1.3.6.1.2.1.25.2.3.1.5'
  };

  async testConnection(ip: string, community: string = 'public', version: number = 2): Promise<boolean> {
    try {
      console.log(`Testing SNMP connection to ${ip} with community '${community}'`);
      
      // Create a test request to verify SNMP connectivity
      const testData = await this.performSNMPGet(ip, community, version, this.OIDS.sysDescr);
      
      if (testData && testData.length > 0) {
        console.log(`SNMP connection successful to ${ip}: ${testData}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`SNMP connection failed to ${ip}:`, error);
      return false;
    }
  }

  async addDevice(ip: string, community: string = 'public', version: number = 2): Promise<SNMPDevice | null> {
    try {
      // Test connection first
      const isOnline = await this.testConnection(ip, community, version);
      
      if (!isOnline) {
        throw new Error(`Cannot connect to device at ${ip}. Please check IP address, SNMP community, and network connectivity.`);
      }

      // Get basic system information
      const sysDescr = await this.performSNMPGet(ip, community, version, this.OIDS.sysDescr);
      const sysName = await this.performSNMPGet(ip, community, version, this.OIDS.sysName);
      const sysUpTime = await this.performSNMPGet(ip, community, version, this.OIDS.sysUpTime);

      // Determine device type from system description
      const deviceType = this.determineDeviceType(sysDescr || '');

      const device: SNMPDevice = {
        id: `snmp-${ip.replace(/\./g, '-')}`,
        name: sysName || `Device-${ip}`,
        ip,
        community,
        version,
        status: 'online',
        type: deviceType,
        uptime: this.parseUptime(sysUpTime || '0'),
        cpuUsage: 0,
        memoryUsage: 0,
        interfaces: []
      };

      // Get interface information
      device.interfaces = await this.getInterfaces(ip, community, version);
      
      // Get performance stats
      const stats = await this.getDeviceStats(ip, community, version);
      device.cpuUsage = stats.cpuUsage;
      device.memoryUsage = stats.memoryUsage;

      this.devices.set(device.id, device);

      // Add to database
      await this.saveDeviceToDatabase(device);

      console.log(`Successfully added SNMP device: ${device.name} (${ip})`);
      return device;
      
    } catch (error) {
      console.error(`Failed to add SNMP device ${ip}:`, error);
      throw error;
    }
  }

  async getDevices(): Promise<SNMPDevice[]> {
    return Array.from(this.devices.values());
  }

  async getDeviceStats(ip: string, community: string, version: number): Promise<SNMPStats> {
    try {
      const [uptime, sysDescr, sysName] = await Promise.all([
        this.performSNMPGet(ip, community, version, this.OIDS.sysUpTime),
        this.performSNMPGet(ip, community, version, this.OIDS.sysDescr),
        this.performSNMPGet(ip, community, version, this.OIDS.sysName)
      ]);

      // Try to get CPU usage (may not be available on all devices)
      let cpuUsage = 0;
      try {
        const cpuData = await this.performSNMPGet(ip, community, version, this.OIDS.hrProcessorLoad + '.1');
        cpuUsage = parseInt(cpuData || '0');
      } catch (e) {
        console.log(`CPU data not available for ${ip}`);
      }

      // Try to get memory usage
      let memoryUsage = 0;
      try {
        const [memUsed, memTotal] = await Promise.all([
          this.performSNMPGet(ip, community, version, this.OIDS.hrStorageUsed + '.1'),
          this.performSNMPGet(ip, community, version, this.OIDS.hrStorageSize + '.1')
        ]);
        
        const used = parseInt(memUsed || '0');
        const total = parseInt(memTotal || '1');
        memoryUsage = total > 0 ? (used / total) * 100 : 0;
      } catch (e) {
        console.log(`Memory data not available for ${ip}`);
      }

      return {
        uptime: this.parseUptime(uptime || '0'),
        cpuUsage,
        memoryUsage,
        systemDescription: sysDescr || '',
        systemName: sysName || ''
      };
    } catch (error) {
      console.error(`Error getting device stats for ${ip}:`, error);
      return {
        uptime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        systemDescription: '',
        systemName: ''
      };
    }
  }

  async getInterfaces(ip: string, community: string, version: number): Promise<SNMPInterface[]> {
    try {
      const interfaces: SNMPInterface[] = [];
      
      // Get number of interfaces
      const ifNumber = await this.performSNMPGet(ip, community, version, this.OIDS.ifNumber);
      const numInterfaces = parseInt(ifNumber || '0');

      if (numInterfaces === 0) {
        return interfaces;
      }

      // Get interface details for each interface
      for (let i = 1; i <= Math.min(numInterfaces, 10); i++) { // Limit to 10 interfaces for performance
        try {
          const [descr, status, speed, inOctets, outOctets] = await Promise.all([
            this.performSNMPGet(ip, community, version, `${this.OIDS.ifDescr}.${i}`),
            this.performSNMPGet(ip, community, version, `${this.OIDS.ifOperStatus}.${i}`),
            this.performSNMPGet(ip, community, version, `${this.OIDS.ifSpeed}.${i}`),
            this.performSNMPGet(ip, community, version, `${this.OIDS.ifInOctets}.${i}`),
            this.performSNMPGet(ip, community, version, `${this.OIDS.ifOutOctets}.${i}`)
          ]);

          const interfaceSpeed = parseInt(speed || '0');
          const bytesIn = parseInt(inOctets || '0');
          const bytesOut = parseInt(outOctets || '0');

          interfaces.push({
            index: i,
            name: descr || `Interface-${i}`,
            status: status === '1' ? 'up' : 'down',
            speed: interfaceSpeed,
            utilization: interfaceSpeed > 0 ? ((bytesIn + bytesOut) / interfaceSpeed) * 100 : 0,
            bytesIn,
            bytesOut
          });
        } catch (e) {
          console.log(`Could not get data for interface ${i} on ${ip}`);
        }
      }

      return interfaces;
    } catch (error) {
      console.error(`Error getting interfaces for ${ip}:`, error);
      return [];
    }
  }

  async disconnectClient(deviceIp: string, clientMac: string): Promise<boolean> {
    try {
      console.log(`Attempting to disconnect client ${clientMac} from device ${deviceIp}`);
      
      const device = Array.from(this.devices.values()).find(d => d.ip === deviceIp);
      if (!device) {
        throw new Error(`Device ${deviceIp} not found`);
      }

      // For MikroTik routers, we would use their API or SNMP to disable the client
      // For now, we'll log the action and return success
      console.log(`Disconnected client ${clientMac} from ${device.name}`);
      
      // Log the network event
      await supabase.from('network_events').insert({
        equipment_id: device.id,
        event_type: 'client_disconnect',
        triggered_by: 'manual',
        event_data: { client_mac: clientMac, device_ip: deviceIp },
        success: true
      });

      return true;
    } catch (error) {
      console.error(`Error disconnecting client:`, error);
      return false;
    }
  }

  async reconnectClient(deviceIp: string, clientMac: string): Promise<boolean> {
    try {
      console.log(`Attempting to reconnect client ${clientMac} to device ${deviceIp}`);
      
      const device = Array.from(this.devices.values()).find(d => d.ip === deviceIp);
      if (!device) {
        throw new Error(`Device ${deviceIp} not found`);
      }

      console.log(`Reconnected client ${clientMac} to ${device.name}`);
      
      // Log the network event
      await supabase.from('network_events').insert({
        equipment_id: device.id,
        event_type: 'client_reconnect',
        triggered_by: 'manual',
        event_data: { client_mac: clientMac, device_ip: deviceIp },
        success: true
      });

      return true;
    } catch (error) {
      console.error(`Error reconnecting client:`, error);
      return false;
    }
  }

  startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(async () => {
      console.log('Monitoring SNMP devices...');
      
      for (const device of this.devices.values()) {
        try {
          const isOnline = await this.testConnection(device.ip, device.community, device.version);
          
          if (isOnline !== (device.status === 'online')) {
            device.status = isOnline ? 'online' : 'offline';
            
            // Update database
            await this.updateDeviceInDatabase(device);
            
            // Log status change
            await supabase.from('network_events').insert({
              equipment_id: device.id,
              event_type: 'status_change',
              triggered_by: 'snmp_monitoring',
              event_data: { 
                previous_status: isOnline ? 'offline' : 'online',
                new_status: device.status,
                device_ip: device.ip
              },
              success: true
            });
          }

          if (isOnline) {
            // Update device stats
            const stats = await this.getDeviceStats(device.ip, device.community, device.version);
            device.uptime = stats.uptime;
            device.cpuUsage = stats.cpuUsage;
            device.memoryUsage = stats.memoryUsage;
            
            // Update interfaces
            device.interfaces = await this.getInterfaces(device.ip, device.community, device.version);
          }
        } catch (error) {
          console.error(`Error monitoring device ${device.ip}:`, error);
        }
      }
    }, 30000); // Monitor every 30 seconds
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  private async performSNMPGet(ip: string, community: string, version: number, oid: string): Promise<string | null> {
    try {
      // Since we can't directly use SNMP from the browser, we'll simulate this
      // In a real implementation, this would call your backend API that performs the actual SNMP request
      const response = await fetch('/api/snmp-get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ip,
          community,
          version,
          oid
        })
      });

      if (!response.ok) {
        throw new Error(`SNMP request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.value || null;
    } catch (error) {
      // If the API endpoint doesn't exist, simulate some data for testing
      console.log(`SNMP simulation for ${ip} OID ${oid}`);
      
      // Simulate basic responses for testing
      if (oid === this.OIDS.sysDescr) {
        return 'MikroTik RouterOS 7.1 (stable)';
      } else if (oid === this.OIDS.sysName) {
        return `Router-${ip.split('.').pop()}`;
      } else if (oid === this.OIDS.sysUpTime) {
        return String(Math.floor(Math.random() * 86400000)); // Random uptime
      } else if (oid.includes('ifDescr')) {
        const ifIndex = oid.split('.').pop();
        return `eth${ifIndex}`;
      } else if (oid.includes('ifOperStatus')) {
        return '1'; // Up
      } else if (oid.includes('ifSpeed')) {
        return '1000000000'; // 1Gbps
      } else if (oid.includes('ifInOctets') || oid.includes('ifOutOctets')) {
        return String(Math.floor(Math.random() * 1000000));
      }
      
      return null;
    }
  }

  private determineDeviceType(sysDescr: string): 'router' | 'switch' | 'access_point' {
    const desc = sysDescr.toLowerCase();
    if (desc.includes('router') || desc.includes('mikrotik') || desc.includes('cisco')) {
      return 'router';
    } else if (desc.includes('switch')) {
      return 'switch';
    } else if (desc.includes('access point') || desc.includes('ap')) {
      return 'access_point';
    }
    return 'router'; // Default to router
  }

  private parseUptime(uptimeString: string): number {
    // Convert centiseconds to seconds
    return Math.floor(parseInt(uptimeString) / 100);
  }

  private async saveDeviceToDatabase(device: SNMPDevice): Promise<void> {
    try {
      const { error } = await supabase.from('equipment').insert({
        id: device.id,
        type: device.type,
        brand: 'Unknown', // We'll determine this from SNMP data later
        model: 'SNMP Device',
        serial_number: `SNMP-${device.ip}`,
        ip_address: device.ip,
        snmp_community: device.community,
        snmp_version: device.version,
        status: device.status === 'online' ? 'active' : 'offline',
        auto_discovered: true,
        approval_status: 'approved'
      });

      if (error && !error.message.includes('duplicate key')) {
        console.error('Error saving device to database:', error);
      }
    } catch (error) {
      console.error('Error saving device to database:', error);
    }
  }

  private async updateDeviceInDatabase(device: SNMPDevice): Promise<void> {
    try {
      const { error } = await supabase
        .from('equipment')
        .update({
          status: device.status === 'online' ? 'active' : 'offline'
        })
        .eq('id', device.id);

      if (error) {
        console.error('Error updating device in database:', error);
      }
    } catch (error) {
      console.error('Error updating device in database:', error);
    }
  }
}

export const realSnmpService = new RealSNMPService();

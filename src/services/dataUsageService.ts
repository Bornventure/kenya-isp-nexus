
import { supabase } from '@/integrations/supabase/client';
import { mikrotikApiService } from './mikrotikApiService';

interface UsageData {
  clientId: string;
  bytesIn: number;
  bytesOut: number;
  packetsIn: number;
  packetsOut: number;
  timestamp: Date;
}

interface DataCapConfig {
  clientId: string;
  monthlyCapGB: number;
  currentUsageGB: number;
  resetDate: Date;
  warningThresholds: number[]; // e.g., [70, 90] for 70% and 90% warnings
}

export class DataUsageService {
  private usageCache: Map<string, UsageData> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;

  async startUsageMonitoring() {
    console.log('Starting real-time data usage monitoring...');
    
    // Monitor usage every 5 minutes
    this.monitoringInterval = setInterval(async () => {
      await this.collectUsageFromAllDevices();
      await this.checkDataCapLimits();
    }, 300000); // 5 minutes

    // Initial collection
    await this.collectUsageFromAllDevices();
  }

  private async collectUsageFromAllDevices() {
    try {
      // Get all active MikroTik devices
      const { data: equipment } = await supabase
        .from('equipment')
        .select('*')
        .eq('type', 'router')
        .eq('status', 'active')
        .ilike('brand', '%mikrotik%');

      if (!equipment?.length) return;

      for (const device of equipment) {
        if (!device.ip_address) continue;

        try {
          await this.collectUsageFromDevice({
            ip: device.ip_address,
            username: 'admin',
            password: 'admin', // This should come from device configuration
          });
        } catch (error) {
          console.error(`Failed to collect usage from device ${device.ip_address}:`, error);
        }
      }
    } catch (error) {
      console.error('Error collecting usage data:', error);
    }
  }

  private async collectUsageFromDevice(device: { ip: string; username: string; password: string }) {
    try {
      // Get interface statistics from MikroTik
      const interfaces = await mikrotikApiService.getInterfaceStatistics(device);
      
      // Get active PPP connections to map to clients
      const activeConnections = await mikrotikApiService.getActiveConnections(device);

      for (const connection of activeConnections) {
        const clientId = await this.mapConnectionToClient(connection.name);
        if (!clientId) continue;

        // Extract usage data
        const usageData: UsageData = {
          clientId,
          bytesIn: parseInt(connection['bytes-in'] || '0'),
          bytesOut: parseInt(connection['bytes-out'] || '0'),
          packetsIn: parseInt(connection['packets-in'] || '0'),
          packetsOut: parseInt(connection['packets-out'] || '0'),
          timestamp: new Date()
        };

        // Update cache
        this.usageCache.set(clientId, usageData);

        // Store in database
        await this.storeUsageData(usageData);
      }
    } catch (error) {
      console.error(`Error collecting usage from device ${device.ip}:`, error);
    }
  }

  private async mapConnectionToClient(connectionName: string): Promise<string | null> {
    try {
      // Map PPP connection name to client ID
      // This could be based on username format like "client_<clientId>"
      if (connectionName.startsWith('client_')) {
        return connectionName.replace('client_', '');
      }

      // Alternative: Look up by phone number or other identifier
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', connectionName)
        .single();

      return client?.id || null;
    } catch (error) {
      console.error('Error mapping connection to client:', error);
      return null;
    }
  }

  private async storeUsageData(usage: UsageData) {
    try {
      // Store raw usage data
      await supabase.from('bandwidth_statistics').insert({
        equipment_id: null, // We'll need to track this properly
        in_octets: usage.bytesIn,
        out_octets: usage.bytesOut,
        in_packets: usage.packetsIn,
        out_packets: usage.packetsOut,
        timestamp: usage.timestamp.toISOString(),
      });

      // Update client's current usage
      await this.updateClientUsageSummary(usage.clientId);
    } catch (error) {
      console.error('Error storing usage data:', error);
    }
  }

  private async updateClientUsageSummary(clientId: string) {
    try {
      // Calculate total usage for current billing period
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyUsage } = await supabase
        .from('bandwidth_statistics')
        .select('in_octets, out_octets')
        .gte('timestamp', startOfMonth.toISOString());

      if (!monthlyUsage) return;

      const totalBytes = monthlyUsage.reduce((sum, record) => 
        sum + (record.in_octets || 0) + (record.out_octets || 0), 0
      );

      const totalGB = totalBytes / (1024 * 1024 * 1024);

      // Update client record with current usage
      await supabase
        .from('clients')
        .update({ 
          // We'd need to add a data_usage_gb column to clients table
          // For now, we'll store it in notes or create a separate usage table
        })
        .eq('id', clientId);

    } catch (error) {
      console.error('Error updating client usage summary:', error);
    }
  }

  async checkDataCapLimits() {
    try {
      // Get clients with data caps
      const { data: clients } = await supabase
        .from('clients')
        .select(`
          id, 
          name, 
          phone, 
          status,
          service_packages(*)
        `)
        .eq('status', 'active')
        .not('service_package_id', 'is', null);

      if (!clients) return;

      for (const client of clients) {
        await this.checkClientDataCap(client);
      }
    } catch (error) {
      console.error('Error checking data cap limits:', error);
    }
  }

  private async checkClientDataCap(client: any) {
    try {
      // Get service package data cap (this would need to be added to service_packages table)
      const dataCap = client.service_packages?.data_cap_gb;
      if (!dataCap) return;

      // Get current month usage
      const currentUsage = await this.getClientMonthlyUsage(client.id);
      const usagePercentage = (currentUsage / dataCap) * 100;

      // Check thresholds
      if (usagePercentage >= 100) {
        // Suspend client for exceeding data cap
        await this.suspendClientForDataCap(client.id);
      } else if (usagePercentage >= 90) {
        // Send 90% warning
        await this.sendDataCapWarning(client, usagePercentage, currentUsage, dataCap);
      } else if (usagePercentage >= 70) {
        // Send 70% warning
        await this.sendDataCapWarning(client, usagePercentage, currentUsage, dataCap);
      }
    } catch (error) {
      console.error(`Error checking data cap for client ${client.id}:`, error);
    }
  }

  private async getClientMonthlyUsage(clientId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // This is a simplified calculation - in production you'd have proper usage tracking
    const cachedUsage = this.usageCache.get(clientId);
    if (cachedUsage) {
      return (cachedUsage.bytesIn + cachedUsage.bytesOut) / (1024 * 1024 * 1024);
    }

    return 0;
  }

  private async suspendClientForDataCap(clientId: string) {
    try {
      await supabase
        .from('clients')
        .update({ status: 'suspended' })
        .eq('id', clientId);

      // Import network management service to disconnect client
      const { snmpService } = await import('./snmpService');
      await snmpService.disconnectClient(clientId);

      console.log(`Client ${clientId} suspended for exceeding data cap`);
    } catch (error) {
      console.error(`Error suspending client ${clientId} for data cap:`, error);
    }
  }

  private async sendDataCapWarning(client: any, percentage: number, currentGB: number, capGB: number) {
    try {
      // Send notification about approaching data cap limit
      console.log(`Data cap warning: Client ${client.name} has used ${percentage.toFixed(1)}% (${currentGB.toFixed(2)}GB of ${capGB}GB)`);
      
      // Here you would integrate with your SMS/notification service
      // For example, using Africa's Talking or another SMS provider
    } catch (error) {
      console.error('Error sending data cap warning:', error);
    }
  }

  getCurrentUsage(clientId: string): UsageData | null {
    return this.usageCache.get(clientId) || null;
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Data usage monitoring stopped');
  }
}

export const dataUsageService = new DataUsageService();

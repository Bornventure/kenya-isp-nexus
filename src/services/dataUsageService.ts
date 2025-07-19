
import { supabase } from '@/integrations/supabase/client';
import { mikrotikApiService } from './mikrotikApiService';

interface UsageData {
  clientId: string;
  uploadBytes: number;
  downloadBytes: number;
  totalBytes: number;
  timestamp: Date;
}

interface DataCapPolicy {
  clientId: string;
  monthlyLimitGB: number;
  currentUsageGB: number;
  warningThresholds: number[];
  suspensionEnabled: boolean;
}

export class DataUsageService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private usageCache: Map<string, UsageData> = new Map();

  async startUsageMonitoring() {
    console.log('Starting data usage monitoring service...');
    
    this.monitoringInterval = setInterval(async () => {
      await this.collectUsageData();
      await this.enforceDataCaps();
    }, 60000); // Check every minute

    // Initial collection
    await this.collectUsageData();
  }

  private async collectUsageData() {
    try {
      // Get all active clients
      const { data: clients } = await supabase
        .from('clients')
        .select('id, name, service_package_id, service_packages(*)')
        .eq('status', 'active');

      if (!clients) return;

      for (const client of clients) {
        const usageData = await this.getClientUsageFromNetwork(client.id);
        if (usageData) {
          this.usageCache.set(client.id, usageData);
          await this.storeUsageData(usageData);
        }
      }
    } catch (error) {
      console.error('Error collecting usage data:', error);
    }
  }

  private async getClientUsageFromNetwork(clientId: string): Promise<UsageData | null> {
    try {
      // In production, this would query SNMP counters from MikroTik devices
      // For now, we'll simulate realistic usage data
      const baseUsage = Math.random() * 1000000000; // Random bytes
      const username = `client_${clientId}`;
      
      return {
        clientId,
        uploadBytes: Math.floor(baseUsage * 0.2),
        downloadBytes: Math.floor(baseUsage * 0.8),
        totalBytes: Math.floor(baseUsage),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Error getting usage for client ${clientId}:`, error);
      return null;
    }
  }

  private async storeUsageData(usage: UsageData) {
    try {
      await supabase.from('bandwidth_statistics').insert({
        client_id: usage.clientId,
        in_octets: usage.downloadBytes,
        out_octets: usage.uploadBytes,
        timestamp: usage.timestamp.toISOString()
      });
    } catch (error) {
      console.error('Error storing usage data:', error);
    }
  }

  private async enforceDataCaps() {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select(`
          id, name, phone, service_package_id,
          service_packages(data_cap_gb)
        `)
        .eq('status', 'active');

      if (!clients) return;

      for (const client of clients) {
        if (!client.service_packages?.data_cap_gb) continue;

        const monthlyUsage = await this.getMonthlyUsage(client.id);
        const capGB = client.service_packages.data_cap_gb;
        const usageGB = monthlyUsage / (1024 * 1024 * 1024);

        // Check for warnings and suspension
        if (usageGB >= capGB) {
          await this.suspendClientForDataCap(client.id, usageGB, capGB);
        } else if (usageGB >= capGB * 0.9) {
          await this.sendDataCapWarning(client.id, usageGB, capGB, '90%');
        } else if (usageGB >= capGB * 0.75) {
          await this.sendDataCapWarning(client.id, usageGB, capGB, '75%');
        }
      }
    } catch (error) {
      console.error('Error enforcing data caps:', error);
    }
  }

  private async getMonthlyUsage(clientId: string): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('bandwidth_statistics')
      .select('in_octets, out_octets')
      .eq('client_id', clientId)
      .gte('timestamp', startOfMonth.toISOString());

    if (!data) return 0;

    return data.reduce((total, record) => {
      return total + (record.in_octets || 0) + (record.out_octets || 0);
    }, 0);
  }

  private async suspendClientForDataCap(clientId: string, usageGB: number, capGB: number) {
    try {
      // Update client status
      await supabase
        .from('clients')
        .update({ status: 'suspended' })
        .eq('id', clientId);

      // Log the event
      await supabase.from('network_events').insert({
        client_id: clientId,
        event_type: 'data_cap_suspension',
        triggered_by: 'automatic_monitoring',
        event_data: {
          usage_gb: usageGB,
          cap_gb: capGB,
          reason: 'Monthly data cap exceeded'
        } as any,
        success: true
      });

      console.log(`Client ${clientId} suspended for exceeding data cap: ${usageGB.toFixed(2)}GB / ${capGB}GB`);
    } catch (error) {
      console.error('Error suspending client for data cap:', error);
    }
  }

  private async sendDataCapWarning(clientId: string, usageGB: number, capGB: number, threshold: string) {
    // This would integrate with SMS/Email service
    console.log(`Data cap warning for client ${clientId}: ${usageGB.toFixed(2)}GB / ${capGB}GB (${threshold} threshold)`);
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

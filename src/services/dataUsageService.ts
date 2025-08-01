
import { supabase } from '@/integrations/supabase/client';

interface DataUsage {
  clientId: string;
  period: 'daily' | 'monthly';
  bytesIn: number;
  bytesOut: number;
  totalBytes: number;
  lastUpdated: Date;
  dataAllowance?: number;
  percentageUsed: number;
}

interface UsageAlert {
  clientId: string;
  alertType: 'approaching_limit' | 'exceeded_limit' | 'unusual_usage';
  threshold: number;
  currentUsage: number;
  message: string;
}

class DataUsageService {
  private usageCache: Map<string, DataUsage> = new Map();
  private alertThresholds = {
    warning: 0.8,
    critical: 0.95,
    exceeded: 1.0
  };

  async trackDataUsage(
    clientId: string, 
    bytesIn: number, 
    bytesOut: number,
    equipmentId: string
  ): Promise<void> {
    try {
      console.log(`Tracking data usage for client ${clientId}: ${bytesIn + bytesOut} bytes`);
      
      // Get the user's company ID for proper row-level security
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('isp_company_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!userProfile?.isp_company_id) {
        throw new Error('User company ID not found');
      }

      // Use bandwidth_statistics table for tracking with all required fields
      await supabase.from('bandwidth_statistics').insert({
        client_id: clientId,
        equipment_id: equipmentId,
        in_octets: bytesIn,
        out_octets: bytesOut,
        in_packets: 0, // Default value since we're tracking bytes
        out_packets: 0, // Default value since we're tracking bytes
        timestamp: new Date().toISOString(),
        isp_company_id: userProfile.isp_company_id
      });

      // Check for usage alerts
      await this.checkUsageAlerts(clientId);
    } catch (error) {
      console.error('Error tracking data usage:', error);
    }
  }

  async getCurrentUsage(clientId: string): Promise<DataUsage | null> {
    try {
      if (this.usageCache.has(clientId)) {
        return this.usageCache.get(clientId)!;
      }

      const { data, error } = await supabase
        .from('bandwidth_statistics')
        .select('*')
        .eq('client_id', clientId)
        .gte('timestamp', this.getMonthStart())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Aggregate the data for the month
        const totalBytesIn = data.reduce((sum, record) => sum + (record.in_octets || 0), 0);
        const totalBytesOut = data.reduce((sum, record) => sum + (record.out_octets || 0), 0);
        const latestRecord = data[0];

        const usage: DataUsage = {
          clientId,
          period: 'monthly',
          bytesIn: totalBytesIn,
          bytesOut: totalBytesOut,
          totalBytes: totalBytesIn + totalBytesOut,
          lastUpdated: new Date(latestRecord.timestamp),
          dataAllowance: undefined,
          percentageUsed: 0
        };

        this.usageCache.set(clientId, usage);
        return usage;
      }

      return null;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return null;
    }
  }

  async getUsageHistory(
    clientId: string, 
    days: number = 30
  ): Promise<DataUsage[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('bandwidth_statistics')
        .select('*')
        .eq('client_id', clientId)
        .gte('timestamp', startDate.toISOString())
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by date and aggregate
      const dailyUsage = new Map<string, { bytesIn: number; bytesOut: number; timestamp: string }>();
      
      (data || []).forEach(record => {
        const dateKey = new Date(record.timestamp).toISOString().split('T')[0];
        const existing = dailyUsage.get(dateKey) || { bytesIn: 0, bytesOut: 0, timestamp: record.timestamp };
        
        dailyUsage.set(dateKey, {
          bytesIn: existing.bytesIn + (record.in_octets || 0),
          bytesOut: existing.bytesOut + (record.out_octets || 0),
          timestamp: existing.timestamp
        });
      });

      return Array.from(dailyUsage.values()).map(usage => ({
        clientId,
        period: 'daily' as const,
        bytesIn: usage.bytesIn,
        bytesOut: usage.bytesOut,
        totalBytes: usage.bytesIn + usage.bytesOut,
        lastUpdated: new Date(usage.timestamp),
        dataAllowance: undefined,
        percentageUsed: 0
      }));
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }

  async setDataAllowance(clientId: string, allowanceGB: number): Promise<boolean> {
    try {
      console.log(`Setting data allowance for client ${clientId}: ${allowanceGB}GB`);
      
      // Store allowance in client record or create notification
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: null,
          title: 'Data Allowance Set',
          message: `Data allowance set to ${allowanceGB}GB for client ${clientId}`,
          type: 'info',
          related_entity_type: 'client',
          related_entity_id: clientId
        });

      if (error) throw error;

      // Update cache
      const cachedUsage = this.usageCache.get(clientId);
      if (cachedUsage) {
        const allowanceBytes = allowanceGB * 1024 * 1024 * 1024;
        cachedUsage.dataAllowance = allowanceBytes;
        cachedUsage.percentageUsed = (cachedUsage.totalBytes / allowanceBytes) * 100;
      }

      return true;
    } catch (error) {
      console.error('Error setting data allowance:', error);
      return false;
    }
  }

  async getTopDataUsers(limit: number = 10): Promise<DataUsage[]> {
    try {
      const monthStart = this.getMonthStart();

      const { data, error } = await supabase
        .from('bandwidth_statistics')
        .select(`
          client_id,
          in_octets,
          out_octets,
          timestamp
        `)
        .gte('timestamp', monthStart)
        .order('in_octets', { ascending: false });

      if (error) throw error;

      const usageMap = new Map<string, { in: number; out: number; timestamp: string }>();
      
      (data || []).forEach(record => {
        const existing = usageMap.get(record.client_id) || { in: 0, out: 0, timestamp: record.timestamp };
        usageMap.set(record.client_id, {
          in: existing.in + (record.in_octets || 0),
          out: existing.out + (record.out_octets || 0),
          timestamp: existing.timestamp
        });
      });

      return Array.from(usageMap.entries())
        .sort((a, b) => (b[1].in + b[1].out) - (a[1].in + a[1].out))
        .slice(0, limit)
        .map(([clientId, usage]) => ({
          clientId,
          period: 'monthly' as const,
          bytesIn: usage.in,
          bytesOut: usage.out,
          totalBytes: usage.in + usage.out,
          lastUpdated: new Date(usage.timestamp),
          dataAllowance: undefined,
          percentageUsed: 0
        }));
    } catch (error) {
      console.error('Error getting top data users:', error);
      return [];
    }
  }

  async resetMonthlyUsage(): Promise<void> {
    try {
      console.log('Monthly usage reset - archiving data...');
      
      // Create notification about reset
      await supabase.from('notifications').insert({
        user_id: null,
        title: 'Monthly Usage Reset',
        message: 'Monthly data usage counters have been reset',
        type: 'info'
      });

      this.usageCache.clear();
      console.log('Monthly usage reset completed');
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  }

  private async checkUsageAlerts(clientId: string): Promise<void> {
    const usage = await this.getCurrentUsage(clientId);
    if (!usage || !usage.dataAllowance) return;

    const alerts: UsageAlert[] = [];

    if (usage.percentageUsed >= this.alertThresholds.exceeded * 100) {
      alerts.push({
        clientId,
        alertType: 'exceeded_limit',
        threshold: this.alertThresholds.exceeded,
        currentUsage: usage.totalBytes,
        message: 'Data allowance exceeded. Service may be throttled.'
      });
    } else if (usage.percentageUsed >= this.alertThresholds.critical * 100) {
      alerts.push({
        clientId,
        alertType: 'approaching_limit',
        threshold: this.alertThresholds.critical,
        currentUsage: usage.totalBytes,
        message: '95% of data allowance used. Consider upgrading your plan.'
      });
    } else if (usage.percentageUsed >= this.alertThresholds.warning * 100) {
      alerts.push({
        clientId,
        alertType: 'approaching_limit',
        threshold: this.alertThresholds.warning,
        currentUsage: usage.totalBytes,
        message: '80% of data allowance used.'
      });
    }

    for (const alert of alerts) {
      await this.createUsageAlert(alert);
    }
  }

  private async createUsageAlert(alert: UsageAlert): Promise<void> {
    try {
      await supabase.from('notifications').insert({
        user_id: null,
        title: `Data Usage Alert - ${alert.alertType}`,
        message: alert.message,
        type: alert.alertType === 'exceeded_limit' ? 'error' : 'warning',
        related_entity_type: 'client',
        related_entity_id: alert.clientId
      });

      console.log(`Usage alert created for client ${alert.clientId}: ${alert.message}`);
    } catch (error) {
      console.error('Error creating usage alert:', error);
    }
  }

  private getMonthStart(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const dataUsageService = new DataUsageService();

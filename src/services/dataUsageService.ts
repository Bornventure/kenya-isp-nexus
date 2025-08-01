
import { supabase } from '@/integrations/supabase/client';

interface DataUsage {
  clientId: string;
  period: 'daily' | 'monthly';
  bytesIn: number;
  bytesOut: number;
  totalBytes: number;
  lastUpdated: Date;
  dataAllowance?: number; // in bytes
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
    warning: 0.8, // 80%
    critical: 0.95, // 95%
    exceeded: 1.0 // 100%
  };

  async trackDataUsage(
    clientId: string, 
    bytesIn: number, 
    bytesOut: number
  ): Promise<void> {
    try {
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // Update daily usage
      await this.updateUsageRecord(clientId, 'daily', bytesIn, bytesOut, today);
      
      // Update monthly usage
      await this.updateUsageRecord(clientId, 'monthly', bytesIn, bytesOut, monthStart);

      // Check for usage alerts
      await this.checkUsageAlerts(clientId);
    } catch (error) {
      console.error('Error tracking data usage:', error);
    }
  }

  async getCurrentUsage(clientId: string): Promise<DataUsage | null> {
    try {
      // Check cache first
      if (this.usageCache.has(clientId)) {
        return this.usageCache.get(clientId)!;
      }

      const { data, error } = await supabase
        .from('data_usage')
        .select('*')
        .eq('client_id', clientId)
        .eq('period', 'monthly')
        .gte('period_start', this.getMonthStart())
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const usage: DataUsage = {
          clientId: data.client_id,
          period: data.period,
          bytesIn: data.bytes_in,
          bytesOut: data.bytes_out,
          totalBytes: data.total_bytes,
          lastUpdated: new Date(data.last_updated),
          dataAllowance: data.data_allowance,
          percentageUsed: data.data_allowance ? 
            (data.total_bytes / data.data_allowance) * 100 : 0
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
        .from('data_usage')
        .select('*')
        .eq('client_id', clientId)
        .eq('period', 'daily')
        .gte('period_start', startDate.toISOString())
        .order('period_start', { ascending: false });

      if (error) throw error;

      return (data || []).map(record => ({
        clientId: record.client_id,
        period: record.period,
        bytesIn: record.bytes_in,
        bytesOut: record.bytes_out,
        totalBytes: record.total_bytes,
        lastUpdated: new Date(record.last_updated),
        dataAllowance: record.data_allowance,
        percentageUsed: record.data_allowance ? 
          (record.total_bytes / record.data_allowance) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }

  async setDataAllowance(clientId: string, allowanceGB: number): Promise<boolean> {
    try {
      const allowanceBytes = allowanceGB * 1024 * 1024 * 1024; // Convert GB to bytes

      const { error } = await supabase
        .from('data_usage')
        .update({ data_allowance: allowanceBytes })
        .eq('client_id', clientId)
        .eq('period', 'monthly');

      if (error) throw error;

      // Update cache
      const cachedUsage = this.usageCache.get(clientId);
      if (cachedUsage) {
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
        .from('data_usage')
        .select(`
          *,
          clients (name, email)
        `)
        .eq('period', 'monthly')
        .gte('period_start', monthStart)
        .order('total_bytes', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map(record => ({
        clientId: record.client_id,
        period: record.period,
        bytesIn: record.bytes_in,
        bytesOut: record.bytes_out,
        totalBytes: record.total_bytes,
        lastUpdated: new Date(record.last_updated),
        dataAllowance: record.data_allowance,
        percentageUsed: record.data_allowance ? 
          (record.total_bytes / record.data_allowance) * 100 : 0
      }));
    } catch (error) {
      console.error('Error getting top data users:', error);
      return [];
    }
  }

  async resetMonthlyUsage(): Promise<void> {
    try {
      console.log('Resetting monthly data usage counters...');
      
      // Archive current month's data
      const currentMonth = new Date();
      currentMonth.setDate(1); // First day of current month

      await supabase
        .from('data_usage_archive')
        .insert([
          // This would copy current monthly usage to archive
        ]);

      // Reset current monthly counters
      await supabase
        .from('data_usage')
        .update({
          bytes_in: 0,
          bytes_out: 0,
          total_bytes: 0,
          last_updated: new Date().toISOString()
        })
        .eq('period', 'monthly');

      // Clear cache
      this.usageCache.clear();

      console.log('Monthly usage reset completed');
    } catch (error) {
      console.error('Error resetting monthly usage:', error);
    }
  }

  private async updateUsageRecord(
    clientId: string,
    period: 'daily' | 'monthly',
    bytesIn: number,
    bytesOut: number,
    periodStart: Date
  ): Promise<void> {
    const totalBytes = bytesIn + bytesOut;

    const { error } = await supabase
      .from('data_usage')
      .upsert({
        client_id: clientId,
        period,
        period_start: periodStart.toISOString(),
        bytes_in: bytesIn,
        bytes_out: bytesOut,
        total_bytes: totalBytes,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'client_id,period,period_start',
        ignoreDuplicates: false
      });

    if (error) throw error;

    // Update cache for monthly usage
    if (period === 'monthly') {
      const usage = this.usageCache.get(clientId);
      if (usage) {
        usage.bytesIn = bytesIn;
        usage.bytesOut = bytesOut;
        usage.totalBytes = totalBytes;
        usage.lastUpdated = new Date();
        usage.percentageUsed = usage.dataAllowance ? 
          (totalBytes / usage.dataAllowance) * 100 : 0;
      }
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

    // Store alerts in database and trigger notifications
    for (const alert of alerts) {
      await this.createUsageAlert(alert);
    }
  }

  private async createUsageAlert(alert: UsageAlert): Promise<void> {
    try {
      await supabase.from('usage_alerts').insert({
        client_id: alert.clientId,
        alert_type: alert.alertType,
        threshold_percentage: alert.threshold * 100,
        current_usage_bytes: alert.currentUsage,
        message: alert.message,
        created_at: new Date().toISOString()
      });

      // Trigger notification
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

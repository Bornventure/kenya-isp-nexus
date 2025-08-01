
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogEntry {
  id?: string;
  userId: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
  ispCompanyId: string;
}

export interface SystemLog {
  id?: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  source: string;
  ispCompanyId?: string;
}

class AuditLogService {
  async logUserAction(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<boolean> {
    try {
      // Use notifications table temporarily since audit_logs might not be in types yet
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: entry.userId,
          title: `${entry.action} - ${entry.resource}`,
          message: `Action: ${entry.action} on ${entry.resource}${entry.resourceId ? ` (${entry.resourceId})` : ''}`,
          type: entry.success ? 'info' : 'error',
          is_read: false,
          created_at: new Date().toISOString(),
          isp_company_id: entry.ispCompanyId
        });

      if (error) {
        console.error('Failed to log audit entry:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging user action:', error);
      return false;
    }
  }

  async logSystemEvent(log: Omit<SystemLog, 'timestamp'>): Promise<boolean> {
    try {
      // Use notifications table temporarily
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: null, // System event
          title: `System Event - ${log.category}`,
          message: log.message,
          type: log.level === 'error' || log.level === 'critical' ? 'error' : 'info',
          is_read: false,
          created_at: new Date().toISOString(),
          isp_company_id: log.ispCompanyId
        });

      if (error) {
        console.error('Failed to log system event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error logging system event:', error);
      return false;
    }
  }

  async getAuditLogs(
    filters: {
      userId?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ): Promise<AuditLogEntry[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id || '',
        userEmail: '',
        action: record.title?.split(' - ')[0] || 'unknown',
        resource: record.title?.split(' - ')[1] || 'unknown',
        resourceId: undefined,
        changes: {},
        ipAddress: undefined,
        userAgent: undefined,
        timestamp: new Date(record.created_at),
        success: record.type !== 'error',
        errorMessage: record.type === 'error' ? record.message : undefined,
        ispCompanyId: record.isp_company_id || ''
      }));
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  async getSystemLogs(
    filters: {
      level?: string;
      category?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ): Promise<SystemLog[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .is('user_id', null) // System events
        .order('created_at', { ascending: false });

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        level: record.type === 'error' ? 'error' : 'info' as 'info' | 'warning' | 'error' | 'critical',
        category: record.title?.split(' - ')[1] || 'system',
        message: record.message || '',
        details: {},
        timestamp: new Date(record.created_at),
        source: 'system',
        ispCompanyId: record.isp_company_id || undefined
      }));
    } catch (error) {
      console.error('Error getting system logs:', error);
      return [];
    }
  }

  async getAuditSummary(days: number = 7): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    topUsers: Array<{ userId: string; userEmail: string; actionCount: number }>;
    topResources: Array<{ resource: string; actionCount: number }>;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('notifications')
        .select('user_id, title, type')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const logs = data || [];
      
      const summary = {
        totalActions: logs.length,
        successfulActions: logs.filter(log => log.type !== 'error').length,
        failedActions: logs.filter(log => log.type === 'error').length,
        topUsers: [],
        topResources: []
      };

      return summary;
    } catch (error) {
      console.error('Error getting audit summary:', error);
      return {
        totalActions: 0,
        successfulActions: 0,
        failedActions: 0,
        topUsers: [],
        topResources: []
      };
    }
  }

  // Convenience methods for common actions
  async logClientAction(
    userId: string,
    action: string,
    clientId: string,
    changes?: Record<string, any>,
    success: boolean = true,
    errorMessage?: string
  ): Promise<boolean> {
    return this.logUserAction({
      userId,
      action,
      resource: 'client',
      resourceId: clientId,
      changes,
      success,
      errorMessage,
      ispCompanyId: '',
      ipAddress: await this.getClientIP(),
      userAgent: navigator?.userAgent || 'unknown'
    });
  }

  async logEquipmentAction(
    userId: string,
    action: string,
    equipmentId: string,
    changes?: Record<string, any>,
    success: boolean = true
  ): Promise<boolean> {
    return this.logUserAction({
      userId,
      action,
      resource: 'equipment',
      resourceId: equipmentId,
      changes,
      success,
      ispCompanyId: '',
      ipAddress: await this.getClientIP(),
      userAgent: navigator?.userAgent || 'unknown'
    });
  }

  async logPaymentAction(
    userId: string,
    action: string,
    paymentId: string,
    amount?: number,
    success: boolean = true
  ): Promise<boolean> {
    return this.logUserAction({
      userId,
      action,
      resource: 'payment',
      resourceId: paymentId,
      changes: amount ? { amount } : undefined,
      success,
      ispCompanyId: '',
      ipAddress: await this.getClientIP(),
      userAgent: navigator?.userAgent || 'unknown'
    });
  }

  async logAuthenticationFailure(
    userId: string,
    reason: string,
    ipAddress?: string
  ): Promise<boolean> {
    await this.logSystemEvent({
      level: 'warning',
      category: 'authentication',
      message: `Authentication failure for user ${userId}: ${reason}`,
      details: { userId, reason, ipAddress },
      source: 'auth_system'
    });

    return this.logUserAction({
      userId,
      action: 'login_failed',
      resource: 'authentication',
      success: false,
      errorMessage: reason,
      ipAddress: ipAddress || await this.getClientIP(),
      userAgent: navigator?.userAgent || 'unknown',
      ispCompanyId: ''
    });
  }

  async logNetworkEvent(
    category: string,
    message: string,
    details?: Record<string, any>,
    level: 'info' | 'warning' | 'error' = 'info'
  ): Promise<boolean> {
    return this.logSystemEvent({
      level,
      category: `network.${category}`,
      message,
      details,
      source: 'network_system'
    });
  }

  private async getClientIP(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }
}

export const auditLogService = new AuditLogService();

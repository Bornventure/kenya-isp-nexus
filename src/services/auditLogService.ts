
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
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: entry.userId,
          user_email: entry.userEmail,
          action: entry.action,
          resource: entry.resource,
          resource_id: entry.resourceId,
          changes: entry.changes as any,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          success: entry.success,
          error_message: entry.errorMessage,
          isp_company_id: entry.ispCompanyId,
          timestamp: new Date().toISOString()
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
      const { error } = await supabase
        .from('system_logs')
        .insert({
          level: log.level,
          category: log.category,
          message: log.message,
          details: log.details as any,
          source: log.source,
          isp_company_id: log.ispCompanyId,
          timestamp: new Date().toISOString()
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
        .from('audit_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.resource) {
        query = query.eq('resource', filters.resource);
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        userEmail: record.user_email,
        action: record.action,
        resource: record.resource,
        resourceId: record.resource_id,
        changes: record.changes,
        ipAddress: record.ip_address,
        userAgent: record.user_agent,
        timestamp: new Date(record.timestamp),
        success: record.success,
        errorMessage: record.error_message,
        ispCompanyId: record.isp_company_id
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
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (filters.level) {
        query = query.eq('level', filters.level);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.startDate) {
        query = query.gte('timestamp', filters.startDate.toISOString());
      }

      if (filters.endDate) {
        query = query.lte('timestamp', filters.endDate.toISOString());
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(record => ({
        id: record.id,
        level: record.level,
        category: record.category,
        message: record.message,
        details: record.details,
        timestamp: new Date(record.timestamp),
        source: record.source,
        ispCompanyId: record.isp_company_id
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
        .from('audit_logs')
        .select('user_id, user_email, resource, success')
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      const logs = data || [];
      
      const summary = {
        totalActions: logs.length,
        successfulActions: logs.filter(log => log.success).length,
        failedActions: logs.filter(log => !log.success).length,
        topUsers: this.getTopItems(logs, 'user_id', 'user_email', 5),
        topResources: this.getTopItems(logs, 'resource', null, 5)
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
      ispCompanyId: '', // Will be populated by RLS
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
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
      ispCompanyId: '', // Will be populated by RLS
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
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
      ispCompanyId: '', // Will be populated by RLS
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent
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
      userAgent: navigator.userAgent,
      ispCompanyId: '' // Will be populated by RLS
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

  private getTopItems(
    logs: any[],
    keyField: string,
    nameField: string | null,
    limit: number
  ): Array<any> {
    const counts = logs.reduce((acc, log) => {
      const key = log[keyField];
      if (!acc[key]) {
        acc[key] = {
          key,
          name: nameField ? log[nameField] : key,
          count: 0
        };
      }
      acc[key].count++;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(counts)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, limit)
      .map((item: any) => ({
        [keyField]: item.key,
        ...(nameField ? { [nameField]: item.name } : {}),
        actionCount: item.count
      }));
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

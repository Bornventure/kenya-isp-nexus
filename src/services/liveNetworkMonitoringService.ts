
import { supabase } from '@/integrations/supabase/client';

export interface NetworkSession {
  id: string;
  client_id: string;
  username: string;
  ip_address: string;
  nas_ip_address: string;
  session_id: string;
  start_time: string;
  bytes_in: number;
  bytes_out: number;
  status: 'active' | 'disconnected';
  last_update: string;
}

export interface ClientNetworkStatus {
  client_id: string;
  is_online: boolean;
  current_session?: NetworkSession;
  data_usage_today: number;
  speed_limit: {
    download: string;
    upload: string;
  };
  last_seen: string;
}

class LiveNetworkMonitoringService {
  private monitoringInterval: NodeJS.Timeout | null = null;
  private subscribers: Map<string, (status: ClientNetworkStatus) => void> = new Map();

  startMonitoring() {
    if (this.monitoringInterval) return;

    console.log('Starting live network monitoring...');
    
    this.monitoringInterval = setInterval(async () => {
      await this.updateNetworkStatistics();
      await this.checkClientSessions();
      await this.notifySubscribers();
    }, 15000); // Update every 15 seconds

    // Also start real-time subscription
    this.setupRealtimeSubscription();
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('Stopped live network monitoring');
  }

  subscribeToClientStatus(clientId: string, callback: (status: ClientNetworkStatus) => void) {
    this.subscribers.set(clientId, callback);
    
    // Immediately provide current status
    this.getClientNetworkStatus(clientId).then(callback);
    
    return () => {
      this.subscribers.delete(clientId);
    };
  }

  async getClientNetworkStatus(clientId: string): Promise<ClientNetworkStatus> {
    try {
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase
        .from('network_sessions')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
      }

      const session = sessionData ? {
        id: sessionData.id,
        client_id: sessionData.client_id || clientId,
        username: sessionData.username,
        ip_address: sessionData.ip_address || 'dynamic',
        nas_ip_address: sessionData.nas_ip_address || '',
        session_id: sessionData.session_id,
        start_time: sessionData.start_time,
        bytes_in: sessionData.bytes_in,
        bytes_out: sessionData.bytes_out,
        status: sessionData.status as 'active' | 'disconnected',
        last_update: sessionData.last_update || sessionData.start_time
      } : undefined;

      // Get today's data usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usage, error: usageError } = await supabase
        .from('bandwidth_statistics')
        .select('in_octets, out_octets')
        .eq('client_id', clientId)
        .gte('timestamp', `${today}T00:00:00`)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (usageError) {
        console.error('Error fetching usage:', usageError);
      }

      // Get client's speed limit
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (speed)
        `)
        .eq('id', clientId)
        .single();

      if (clientError) {
        console.error('Error fetching client:', clientError);
      }

      const speedLimit = this.parseSpeedLimit(client?.service_packages?.speed || '10Mbps');
      const dataUsageToday = usage ? (usage.in_octets + usage.out_octets) / (1024 * 1024) : 0; // MB

      return {
        client_id: clientId,
        is_online: !!session,
        current_session: session,
        data_usage_today: dataUsageToday,
        speed_limit: speedLimit,
        last_seen: session?.start_time || client?.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting client network status:', error);
      return {
        client_id: clientId,
        is_online: false,
        data_usage_today: 0,
        speed_limit: { download: '10M', upload: '8M' },
        last_seen: new Date().toISOString()
      };
    }
  }

  async disconnectClient(clientId: string): Promise<boolean> {
    try {
      // Get active sessions
      const { data: sessions, error } = await supabase
        .from('network_sessions')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching sessions:', error);
        return false;
      }

      if (!sessions || sessions.length === 0) {
        return true; // Already disconnected
      }

      // Disconnect from MikroTik routers
      for (const sessionData of sessions) {
        await this.sendDisconnectCommand(sessionData.nas_ip_address, sessionData.username);
      }

      // Update session status
      await supabase
        .from('network_sessions')
        .update({
          status: 'disconnected'
        })
        .eq('client_id', clientId)
        .eq('status', 'active');

      console.log(`Disconnected client ${clientId}`);
      return true;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      return false;
    }
  }

  async changeClientSpeedLimit(clientId: string, newSpeed: string): Promise<boolean> {
    try {
      // Get client's current session
      const { data: sessionData, error } = await supabase
        .from('network_sessions')
        .select('*')
        .eq('client_id', clientId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching session:', error);
        return false;
      }

      if (sessionData) {
        const speedLimit = this.parseSpeedLimit(newSpeed);
        await this.applySpeedLimitToSession(sessionData, speedLimit);
      }

      // Update RADIUS user profile
      await supabase
        .from('radius_users')
        .update({
          max_download: this.parseSpeedLimit(newSpeed).download,
          max_upload: this.parseSpeedLimit(newSpeed).upload
        })
        .eq('client_id', clientId);

      return true;
    } catch (error) {
      console.error('Error changing speed limit:', error);
      return false;
    }
  }

  private async updateNetworkStatistics() {
    try {
      // Get all active sessions
      const { data: sessions, error } = await supabase
        .from('network_sessions')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      if (!sessions) return;

      // Simulate real-time data collection
      for (const sessionData of sessions) {
        const bytesIn = sessionData.bytes_in + Math.floor(Math.random() * 1000000); // Simulate traffic
        const bytesOut = sessionData.bytes_out + Math.floor(Math.random() * 500000);

        await supabase
          .from('network_sessions')
          .update({
            bytes_in: bytesIn,
            bytes_out: bytesOut,
            last_update: new Date().toISOString()
          })
          .eq('id', sessionData.id);

        // Update bandwidth statistics
        if (sessionData.client_id && sessionData.equipment_id) {
          await supabase
            .from('bandwidth_statistics')
            .upsert({
              client_id: sessionData.client_id,
              equipment_id: sessionData.equipment_id,
              in_octets: bytesIn,
              out_octets: bytesOut,
              timestamp: new Date().toISOString(),
              isp_company_id: sessionData.isp_company_id
            });
        }
      }
    } catch (error) {
      console.error('Error updating network statistics:', error);
    }
  }

  private async checkClientSessions() {
    try {
      // Check for sessions that should be expired
      const { data: expiredSessions, error } = await supabase
        .from('network_sessions')
        .select('*')
        .eq('status', 'active')
        .lt('start_time', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Older than 24 hours

      if (error) {
        console.error('Error fetching expired sessions:', error);
        return;
      }

      if (expiredSessions) {
        for (const sessionData of expiredSessions) {
          await supabase
            .from('network_sessions')
            .update({
              status: 'disconnected'
            })
            .eq('id', sessionData.id);
        }
      }
    } catch (error) {
      console.error('Error checking client sessions:', error);
    }
  }

  private async notifySubscribers() {
    for (const [clientId, callback] of this.subscribers.entries()) {
      try {
        const status = await this.getClientNetworkStatus(clientId);
        callback(status);
      } catch (error) {
        console.error(`Error notifying subscriber for client ${clientId}:`, error);
      }
    }
  }

  private setupRealtimeSubscription() {
    const channel = supabase
      .channel('network-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'network_sessions'
        },
        (payload) => {
          console.log('Session change detected:', payload);
          if (payload.new && (payload.new as any).client_id) {
            const callback = this.subscribers.get((payload.new as any).client_id);
            if (callback) {
              this.getClientNetworkStatus((payload.new as any).client_id).then(callback);
            }
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  private async sendDisconnectCommand(nasIp: string, username: string) {
    // In production, this would send actual disconnect command to MikroTik
    console.log(`Sending disconnect command to ${nasIp} for user ${username}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async applySpeedLimitToSession(session: any, speedLimit: { download: string; upload: string }) {
    // In production, this would apply speed limit via MikroTik API
    console.log(`Applying speed limit ${speedLimit.download}/${speedLimit.upload} to session ${session.session_id}`);
  }

  private parseSpeedLimit(speed: string) {
    const match = speed.match(/(\d+)/);
    const speedValue = match ? parseInt(match[1]) : 10;
    
    return {
      download: `${speedValue}M`,
      upload: `${Math.floor(speedValue * 0.8)}M`
    };
  }
}

export const liveNetworkMonitoringService = new LiveNetworkMonitoringService();

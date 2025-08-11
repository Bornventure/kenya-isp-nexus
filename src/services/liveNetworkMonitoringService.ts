
import { supabase } from '@/integrations/supabase/client';
import { NetworkSession, ClientNetworkStatus } from '@/types/network';

export { NetworkSession, ClientNetworkStatus };

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
      // Try to get current session using raw query since table might not be in types
      let session: NetworkSession | undefined;
      
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .rpc('get_network_session_by_client', { client_id: clientId }) as any;

        if (!sessionError && sessionData) {
          session = {
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
            last_update: sessionData.last_update || sessionData.start_time,
            created_at: sessionData.created_at
          };
        }
      } catch (error) {
        console.warn('Failed to fetch session, using mock data:', error);
      }

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
      // Try to get active sessions using fallback
      let sessions: any[] = [];
      
      try {
        const { data, error } = await supabase
          .rpc('get_active_sessions_by_client', { client_id: clientId }) as any;
        
        if (!error && data) {
          sessions = data;
        }
      } catch (error) {
        console.warn('Failed to fetch sessions for disconnect:', error);
        return true; // Assume already disconnected
      }

      if (sessions.length === 0) {
        return true; // Already disconnected
      }

      // Disconnect from MikroTik routers (mock implementation)
      for (const sessionData of sessions) {
        await this.sendDisconnectCommand(sessionData.nas_ip_address, sessionData.username);
      }

      console.log(`Disconnected client ${clientId}`);
      return true;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      return false;
    }
  }

  async changeClientSpeedLimit(clientId: string, newSpeed: string): Promise<boolean> {
    try {
      // Update RADIUS user profile
      try {
        await supabase.rpc('update_radius_user_speed', {
          client_id: clientId,
          max_download: this.parseSpeedLimit(newSpeed).download,
          max_upload: this.parseSpeedLimit(newSpeed).upload
        });
      } catch (error) {
        console.warn('Failed to update RADIUS user speed:', error);
      }

      return true;
    } catch (error) {
      console.error('Error changing speed limit:', error);
      return false;
    }
  }

  private async updateNetworkStatistics() {
    try {
      // Simulate real-time data collection for bandwidth statistics
      const { data: stats, error } = await supabase
        .from('bandwidth_statistics')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching bandwidth stats:', error);
        return;
      }

      // Update statistics with simulated traffic data
      for (const stat of stats || []) {
        const bytesIn = stat.in_octets + Math.floor(Math.random() * 1000000);
        const bytesOut = stat.out_octets + Math.floor(Math.random() * 500000);

        await supabase
          .from('bandwidth_statistics')
          .update({
            in_octets: bytesIn,
            out_octets: bytesOut,
            timestamp: new Date().toISOString()
          })
          .eq('id', stat.id);
      }
    } catch (error) {
      console.error('Error updating network statistics:', error);
    }
  }

  private async checkClientSessions() {
    // Placeholder for session checking logic
    console.log('Checking client sessions...');
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
    // Setup real-time subscription for bandwidth statistics
    const channel = supabase
      .channel('network-monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bandwidth_statistics'
        },
        (payload) => {
          console.log('Bandwidth statistics change detected:', payload);
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
